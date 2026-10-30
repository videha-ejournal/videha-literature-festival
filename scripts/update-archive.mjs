import { readFile, writeFile } from 'node:fs/promises';
import { archiveStats } from './archive.mjs';
const file = new URL('./sources/videha-archive-manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(file, 'utf8'));
async function get(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Videha-archive-sync', ...(process.env.GITHUB_TOKEN && url.startsWith('https://api.github.com/') ? {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`} : {}) }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
}
const rss = await (await get('https://www.videha.co.in/videha-rss.xml')).text();
const latest = rss.match(/<guid[^>]*>https:\/\/www\.videha\.co\.in\/index\.htm#issue-(\d+)-(\d{4}-\d{2}-\d{2})<\/guid>/);
if (!latest) throw new Error('RSS current-issue identity was not recognized; retaining manifest');
if (+latest[1] < manifest.currentIssue) throw new Error('Refusing current-issue regression');
manifest.currentIssue = +latest[1];
manifest.currentIssueDate = latest[2];
manifest.currentIssueUrl = 'https://www.videha.co.in/index.htm';
const repo = 'https://api.github.com/repos/videha-ejournal/videha-sadeha';
const metadata = await (await get(repo)).json();
const tree = await (await get(`${repo}/git/trees/${metadata.default_branch}?recursive=1`)).json();
if (tree.truncated || !tree.tree?.length) throw new Error('Incomplete archive repository tree');
for (const entry of tree.tree) {
  const match = entry.path.match(/^Videha (\d+)\.pdf$/i);
  if (!match || entry.type !== 'blob') continue;
  const issue = +match[1];
  if (manifest.archive.some(r => r.publication === 'VIDEHA' && r.issue === issue)) continue;
  // Only the file's existence is verified here; never infer a publication date.
  manifest.archive.push({publication:'VIDEHA',issue,version:null,title:`VIDEHA — Issue ${issue}`,source:`https://videha-ejournal.github.io/videha-sadeha/${encodeURIComponent(entry.path)}`,date:'',dateISO:'',year:null});
}
const stats = archiveStats(manifest);
manifest.archiveMaxVideha = stats.archiveMaxVideha;
manifest.archiveSadehaDocuments = stats.sadehaFiles;
const before = JSON.parse(await readFile(file, 'utf8'));
if (JSON.stringify(before) !== JSON.stringify(manifest)) {
  manifest.generated = new Date().toISOString();
  await writeFile(file, JSON.stringify(manifest));
}
console.log(`Current issue ${manifest.currentIssue}; ${stats.totalFiles} verified preserved files`);
