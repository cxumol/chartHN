/* credit to https://github.com/dohliam/dropin-minimal-css/raw/gh-pages/switcher.js */
var css_themes = "a11yana,almond,bahunya,bamboo,bare,base,basic,bolt,bonsai,brutalist,bullframe,caiuss,caramel,cardinal,centigram,centurion,chota,cirrus,clmaterial,codify,comet,concise,concrete,cutestrap,flat-ui,fluidity,furtive,gd,github-markdown,gutenberg,hack,hiq,holiday,html-starterkit,hyp,kathamo,koochak,kraken,kube,latex,lemon,lissom,lit,lotus,magick,markdown,marx,material,materialize,milligram,min,mini,minimal,minimal-stylesheet,missing-style,mobi,motherplate,mu,mui,mvp,neat,new,no-class,normalize,oh-my-css,ok,pandoc-scholar,paper,papier,pavilion,picnic,pico,preface,primer,propeller,pure,roble,sakura,sanitize,scooter,semantic-ui,shoelace,siimple,skeleton,skeleton-framework,skeleton-plus,snack,spcss,spectre,style,stylize,superstylin,tacit,tent,terminal,thao,tui,vanilla,vital,water,wing,writ,yamb,yorha,ads-gazette,ads-medium,ads-notebook,ads-tufte,attri-bright-light-green,attri-midnight-green,attri-dark-forest-green,attri-dark-fairy-pink,attri-light-fairy-pink,boot-cerulean,boot-cosmo,boot-cyborg,boot-darkly,boot-flatly,boot-journal,boot-lumen,boot-paper,boot-readable,boot-sandstone,boot-slate,boot-spacelab,boot-superhero,boot-yeti,md-air,md-modest,md-retro,md-splendor,w3c-chocolate,w3c-midnight,w3c-modernist,w3c-oldstyle,w3c-steely,w3c-swiss,w3c-traditional,w3c-ultramarine".split(',');

function switch_css(css) {
  window.css_link.href = "https://dohliam.github.io/dropin-minimal-css/min/" + css + ".min.css";
}

function on_css_load() {
  var bgColor = window.getComputedStyle(document.body).backgroundColor;
  if (bgColor.match(/^rgba\(.*\)/) ) bgColor = 'white';
  window.switcher.style.backgroundColor = bgColor;
}

function css_inline_switcher() {
  window.switcher = document.getElementById("css-switcher");
  var dropdown = '\n<lable for="switcher_dropdown">Select a theme: </lable><select name="switcher_dropdown" id="switcher_dropdown" accesskey="s" onchange="switch_css(this.value)">\n';
  for (const f of css_themes) {
    var selected = f==="base"?'selected':'';
    dropdown += `<option value="${f}" ${selected}>${f[0].toUpperCase()+f.slice(1)}</option>\n`;
  }
  dropdown += '</select>\n';
  window.switcher.innerHTML = dropdown;
}

function add_switcher() {
  var css_link = document.getElementsByTagName("link")[0];
  if (!css_link) {
    css_link = document.createElement('link');
    css_link.rel="stylesheet"; css_link.type="text/css";
    css_link.href="https://dohliam.github.io/dropin-minimal-css/min/base.min.css";
    document.head.appendChild(css_link);
  }
  window.css_link = css_link;

  var d = document.createElement('div');
  d.id='css-switcher';d.innerHTML='<div>&nbsp;</div>\n<script type="text/javascript">css_inline_switcher();</script>';
  document.body.prepend(d);
  document.body.style.paddingLeft = "24px";

  css_inline_switcher();

  css_link.onload = on_css_load;
}

add_switcher();
