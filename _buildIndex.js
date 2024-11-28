import process from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

const TSV_FILE_REGEX = /(\d{4})\/(\d{2})\/(\d{4}-\d{2}-\d{2})\.tsv/;

const daysInMonths = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
];

const isLeapYear = year => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

const formatDate = (year, month, day) => `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

function buildIndexJson(dataPath = 'data') {
    try {
        const filePaths = getAllTsvFiles(dataPath);
        const { years, months, days } = processFilePaths(filePaths);
        const indexData = {
            description:
                "This data structure organizes data availability by date. 'yyyy' indicates all days of that year have data. 'yyyy-mm' indicates all days of that month have data. 'yyyy-mm-dd' stores specific, discrete dates.",
            data: {
                years: Array.from(years).sort(),
                months: Array.from(months).sort(),
                days: Array.from(days).sort(),
            },
        };
        fs.writeFileSync('data/index.json', JSON.stringify(indexData, null, 0));
    } catch (error) {
        console.error('Error building index json:', error);
    }
}

function getAllTsvFiles(dataPath) {
    const filePaths = [];
    function traverseDir(dirPath) {
        try {
            const items = fs.readdirSync(dirPath);
            for (const item of items) {
                const itemPath = path.resolve(dirPath, item);
                const stat = fs.statSync(itemPath);
                if (stat.isDirectory()) {
                    traverseDir(itemPath);
                } else if (stat.isFile() && item.endsWith('.tsv')) {
                    filePaths.push(itemPath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dirPath}:`, error);
        }
    }
    traverseDir(dataPath);
    return filePaths;
}

function processFilePaths(filePaths) {
    const allDates = new Set();
    const yearMonthDayMap = {};

    for (const filePath of filePaths) {
        const match = filePath.match(TSV_FILE_REGEX);
        if (match) {
            const year = parseInt(match[1]), month = parseInt(match[2]), day = parseInt(match[3].split('-')[2]);
            allDates.add(formatDate(year, month, day));
            yearMonthDayMap[year] = yearMonthDayMap[year] || {};
            yearMonthDayMap[year][month] = yearMonthDayMap[year][month] || new Set();
            yearMonthDayMap[year][month].add(day);
        }
    }

    const years = new Set(), months = new Set(), days = new Set();

    for (const year in yearMonthDayMap) {
        let isFullYear = true;
        for (const month in yearMonthDayMap[year]) {
            let isFullMonth = true;
            const maxDay = month == 2 && isLeapYear(year) ? 29 : daysInMonths[month - 1];

            if (yearMonthDayMap[year][month].size !== maxDay) {
                isFullMonth = false;
                for (const day of yearMonthDayMap[year][month]) {
                    days.add(formatDate(year, month, day))
                }
            } else {
                months.add(formatDate(year, month, 1).slice(0, 7));
            }
            isFullYear = isFullYear && isFullMonth;
        }
        if (isFullYear) {
            years.add(parseInt(year));
            for (const month in yearMonthDayMap[year]) {
                months.delete(formatDate(year, month, 1).slice(0, 7));
            }
        }
    }

    for (const day of allDates) {
        const year = parseInt(day.split('-')[0]);
        if (!years.has(year) && !months.has(day.slice(0, 7))) {
            days.add(day)
        }
    }

    return { years, months, days };
}

if (import.meta.url === "file://" + process.argv[1]) {
    buildIndexJson();
} else { console.log(import.meta.url); }

export { buildIndexJson };