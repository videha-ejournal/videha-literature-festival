import {readFile,writeFile} from 'node:fs/promises';
const file='public/app.js';
let app=await readFile(file,'utf8');
if(!app.endsWith('init();\n')) app+='\ninit();\n';
await writeFile(file,app);
