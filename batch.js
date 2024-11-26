import process from 'node:process';

import { main } from './main.js';

// Get command line arguments, skipping the first two (node and script path)
const args = process.argv.slice(2);

// Parse arguments or use defaults
const perPage = args[0] ? parseInt(args[0], 10) : 1;
const page = args[1] ? parseInt(args[1], 10) : 1;

// Call the main function with the parsed arguments
console.log(JSON.stringify(process.argv), perPage.toString(), page.toString());
await main(perPage, page);