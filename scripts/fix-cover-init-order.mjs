import {readFile,writeFile} from 'node:fs/promises';
const file='public/app.js';
let app=await readFile(file,'utf8');
app=app.replace('const covers = [...baseCovers, ...gajendraDesktopCovers, ...extraGajendraCovers];','const covers = [...baseCovers, ...gajendraDesktopCovers];');
await writeFile(file,app);
