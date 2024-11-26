import { spawn } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';

// TODO: node process never exits

var env = env ? env : (globalThis.Deno ? Deno.env : process.env);
var getEnv = (key) => env.get ? env.get(key) : env[key];
// console.log(env);
var cfgs = JSON.parse(getEnv("CFG"));
// var date = "";
// var dataDir = "", dataFilePath = "";

var placeholder_dot = `digraph{label="Content Not Available"}`;
var urlToMd = async url => await fetch(`https://r.jina.ai/${url}`).then(d => d.text()).then(s => s.split("Markdown Content:")[1]);
var mdToDot = async (md, cfg) => {
    var respDotJson = await fetch(cfg.base + '/chat/completions', {
        method: 'POST', headers: { Authorization: 'Bearer ' + cfg.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: cfg.model, messages: [
                { role: "system", content: "You are multilingual data visualization creator. You keep a mind of the layout in utf-8 mobile portrait view, avoiding text misalignment; You want to engage decent styles to satisfy audience. Use ``` to wrap generated data." },
                { role: "user", content: "Create a Graphviz DOT diagram to visualize the main idea of following content: \n" + md }
            ]
        })
    }).then(d => d.json());
    var ans = respDotJson?.choices?.[0]?.message?.content?.trim();
    if (!ans) { console.error(respDotJson); throw Error("Bad LLM API answer"); }
    ans = ans.match(/```.*?\n(.*?)```/s)?.[1];
    ans = await minifyDot(ans);
    if (!await validateDot(ans)) throw Error("Bad Dot data, from model: " + cfg.model);
    return ans;
}

var toTSV = data => {
    var columns = Object.keys(data);
    var output = columns.join("\t") + "\n";
    // Assuming all arrays in data have the same length
    // concat by lines
    for (let i = 0; i < data[columns[0]].length; i++) {
        output += columns.map(column => data[column][i]).join("\t") + "\n";
    }
    return output;
}

var parseNews = txt => {
    var hnData = {
        "title": [],
        "url": [],
        "points": [],
        "by": [],
        "hnId": [],
        "dot": [],
    };
    var items = txt.split("\n\n");
    for (const item of items) {
        if (item.trim() == "" || item.includes("<i>❤️ Sponsor the author</i>")) continue;
        const [line1, line2] = item.split("\n");
        // line1 
        // Extract the title and url
        const titleIdx = line1.indexOf("**[") + "**[".length;
        const [urlIdx, urlEndIdx] = [line1.lastIndexOf("]("), line1.lastIndexOf(")")];
        const [title, url] = [line1.substring(titleIdx, urlIdx).trim().replaceAll("\t", ""), line1.substring(urlIdx + 2, urlEndIdx)];

        // line2
        // Extract the points
        const pointsEndIdx = line2.indexOf(" points");
        const points = line2.substring(0, pointsEndIdx).trim();

        // Extract the user
        const userIdx = line2.indexOf("by [") + "by [".length;
        const userEndIdx = line2.indexOf("]");
        const user = line2.substring(userIdx, userEndIdx);

        // Extract the HNcommentsId
        const hnIdIdx = line2.indexOf("item?id=") + "item?id=".length;
        const hnId = line2.substring(hnIdIdx).slice(0, -1);

        if (url && title && points && user && hnId) {
            hnData.title.push(title);
            hnData.url.push(url);
            hnData.points.push(points);
            hnData.by.push(user);
            hnData.hnId.push(hnId);
        } else {
            console.error("something wrong \t", url, title, points, user, hnId);
        }
    }
    hnData.dot = new Array(hnData.by.length).fill(null);
    return hnData;
}

var validateDot = async (dotStr) => new Promise((resolve) => {
    var proc = spawn('nop', [], { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdin.write(dotStr); proc.stdin.end();
    var stderr = ''; proc.stderr?.on('data', data => { stderr += data.toString(); });
    proc.on('close', (code) => { resolve(code === 0 && !stderr); }); // Resolve to true if there's no error output
});

var minifyDot = async (dotStr) => new Promise((resolve) => {
    var proc = spawn('dot-minify', [], { stdio: ['pipe', 'pipe', 'pipe'] });
    proc.stdin.write(dotStr); proc.stdin.end();
    var stderr = ''; proc.stderr?.on('data', data => { stderr += data.toString(); });
    var out = ''; proc.stdout?.on('data', (data) => { out += data.toString(); });
    proc.on('close', (code) => { resolve(code === 0 && !stderr ? out.trim() : dotStr); });
});

var ghHN = async (gh_url) => await fetch(gh_url).then(d => d.json()).then(d => {
    var data = [];
    for (const e of d) {
        var date = e.title?.slice(-10);
        /*var _o = new Date(date);
        var dir = './data/' + _o.getFullYear() + '/' + (_o.getMonth()+1).toString().padStart(2, '0');*/
        var _s = date.split("-");
        var dir = './data/' + _s[0] + '/' + _s[1].padStart(2, '0');
        // console.log(dir); process.exit(0);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        var fpath = dir + '/' + date + '.tsv';
        if (fs.existsSync(fpath)) continue; // skip existing file
        data.push({ fpath, body: e.body });
    }
    return data;
});

var hnToDot = async (hnData) => {
    var promises = [];

    for (let i = 0; i < hnData.url.length; i++) {
        const url = hnData.url[i];
        const promise = urlToMd(url).then(async (md) => {
            // fault proof LLM API pool
            for (let j = 0; j < cfgs.length; j++) {
                if (cfgs[j].err >= 3) continue;
                try { return await mdToDot(md, cfgs[j]); } catch (e) {
                    cfgs[j].err = (cfgs[j].err || 0) + 1;
                    console.error("err LLM API id", j, "count", cfgs[j].err);
                    continue;
                }
            }
            return placeholder_dot;
        });
        promises.push(promise);
    }
    hnData.dot = await Promise.all(promises); // allow to change fn param attr val in JS
    return hnData;
}

var main = async (perPage = 1, page = 1) => { // HN to DOT TSV
    var gh_url = `https://api.github.com/repos/headllines/hackernews-daily/issues?per_page=${perPage}&page=${page}`;
    // old: var final_data = await ghHN(gh_url).then(parseNews).then(hnToDot);
    var fPaths = [];
    var ghHNdata = await ghHN(gh_url);
    for (const { fpath, body } of ghHNdata) {
        const final_data = await hnToDot(parseNews(body));
        fs.writeFileSync(fpath, toTSV(final_data));
        fPaths.push(fpath);
    }
    console.log("done. generated files:", fPaths.join(", "));
    process.exit(0);
    // old: fs.writeFileSync('./data/' + date + '.tsv', tsv_str);
}

if (import.meta.url === "file://" + process.argv[1]) {
    await main();
} else { console.log(import.meta.url); }

export { main };