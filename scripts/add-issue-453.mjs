import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('./sources/videha-archive-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(path, 'utf8'));
const exists = manifest.archive.some(record => record.publication === 'VIDEHA' && record.issue === 453);
if (!exists) {
  manifest.archive.push({
    publication: 'VIDEHA',
    issue: 453,
    version: null,
    title: 'VIDEHA — Issue 453 / अंक ४५३',
    source: 'https://videha-ejournal.github.io/videha-sadeha/Videha%20453.pdf',
    date: '०१ नवम्बर २०२६',
    dateISO: '2026-11-01',
    year: 2026
  });
}
manifest.archive.sort((a, b) => a.publication.localeCompare(b.publication) || Number(a.issue) - Number(b.issue) || Number(a.version || 0) - Number(b.version || 0));
manifest.currentIssue = 453;
manifest.currentIssueDate = '2026-11-01';
manifest.currentIssueUrl = 'https://www.videha.co.in/index.htm';
manifest.archiveMaxVideha = 453;
manifest.generated = new Date().toISOString();
await writeFile(path, JSON.stringify(manifest));
console.log('Added verified Videha Issue 453 to the authoritative manifest.');
