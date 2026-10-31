import {readFile,writeFile} from 'node:fs/promises';
const file='public/app.js';
let app=await readFile(file,'utf8');
app=app.replace(/<img src="assets\/\$\{encodeURI\(extraGajendraCovers\[index % extraGajendraCovers\.length\]\[0\]\)\}" alt="\$\{escapeHTML\(book\.title\)\} cover" loading="lazy">/,'');
await writeFile(file,app);
