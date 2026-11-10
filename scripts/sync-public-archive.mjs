import { readFile, writeFile } from 'node:fs/promises';
import { archiveStats } from './archive.mjs';

const sourcePath = new URL('./sources/videha-archive-manifest.json', import.meta.url);
const publicPath = new URL('../public/data/archive.json', import.meta.url);
const manifest = JSON.parse(await readFile(sourcePath, 'utf8'));
manifest.stats = archiveStats(manifest);
await writeFile(publicPath, JSON.stringify(manifest));
console.log(`Synchronized public archive: ${manifest.stats.videhaIssues} Videha issues, ${manifest.stats.totalFiles} preserved files.`);
