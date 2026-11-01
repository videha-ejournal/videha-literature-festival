import {readFile,writeFile} from 'node:fs/promises';
const file='dist/mai/index.html';
let html=await readFile(file,'utf8');
html=html.replace('href="https://videha-ejournal.github.io/videha-literature-festival/mai/" lang="mai"','href="https://videha-ejournal.github.io/videha-literature-festival/" lang="en"');
html=html.replace('<a id="languageSwitch" class="language-link" href="../" lang="mai">मैथिली · Maithili</a>','<a id="languageSwitch" class="language-link" href="../" lang="en">English · अंग्रेजी</a>');
await writeFile(file,html);
