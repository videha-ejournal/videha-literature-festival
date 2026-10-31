import {readFile,writeFile} from 'node:fs/promises';
let app=await readFile('public/app.js','utf8');
app=app.replace('const covers = [...baseCovers, ...gajendraDesktopCovers];','const covers = [...baseCovers];');
app=app.replace('const assetRoot=location.pathname.includes("/mai/")?"../":""; $("#coverRail").innerHTML = covers.map', 'const assetRoot=location.pathname.includes("/mai/")?"../":""; const allCovers=[...covers,...extraGajendraCovers]; $("#coverRail").innerHTML = allCovers.map');
await writeFile('public/app.js',app);
let css=await readFile('public/styles.css','utf8');
css=css.replace('.utility button:nth-child(2),.utility button:nth-child(3){display:none}', '.utility{flex-wrap:wrap}.utility button{font-size:.68rem!important;width:auto!important;height:auto!important}.utility button:nth-child(2),.utility button:nth-child(3){display:inline-flex}');
css += '\n@media(max-width:700px){.utility{gap:5px}.utility button{padding:7px 8px!important;min-width:42px;min-height:42px}.cover-rail{grid-auto-columns:34vw}.cover-card img{max-height:260px;object-fit:contain}}\n';
await writeFile('public/styles.css',css);
