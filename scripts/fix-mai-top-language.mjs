import {readFile,writeFile} from 'node:fs/promises';
const file='dist/mai/index.html';
let html=await readFile(file,'utf8');
html=html.replace('href="https://videha-ejournal.github.io/videha-literature-festival/mai/" lang="mai"','href="https://videha-ejournal.github.io/videha-literature-festival/" lang="en"');
await writeFile(file,html);
