import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "public");
const out = path.join(root, "dist");
const archiveSource = path.join(root, "scripts", "sources", "videha-archive-manifest.json");
const pothiSource = path.join(root, "scripts", "sources", "pothi.htm");

await rm(out, { recursive: true, force: true });
await mkdir(path.join(source, "data"), { recursive: true });

const manifest = JSON.parse(await readFile(archiveSource, "utf8"));
const githubFile = (record) => {
  const pad = String(record.issue).padStart(3, "0");
  if (record.publication === "VIDEHA") return `Videha ${pad}.pdf`;
  if (record.issue === 5 && record.version === 2) return "Sadeha 05 v2.pdf";
  return `Sadeha ${pad.slice(-2)}.pdf`;
};
const githubArchive = manifest.archive.map((record) => {
  const file = githubFile(record);
  return { ...record, source: `https://videha-ejournal.github.io/videha-sadeha/${encodeURIComponent(file).replace(/%2F/g, "/")}` };
});
await writeFile(
  path.join(source, "data", "archive.json"),
  JSON.stringify({
    generated: manifest.generated,
    currentIssue: manifest.currentIssue,
    archiveMaxVideha: manifest.archiveMaxVideha,
    archiveSadehaDocuments: manifest.archiveSadehaDocuments,
    archive: githubArchive,
    hosts: manifest.hosts,
  }),
);

const decode = (value) => value
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, " ").trim();
const pothiHtml = await readFile(pothiSource, "utf8");
const pothi = [];
for (const match of pothiHtml.matchAll(/<div class="pothi-card">([\s\S]*?)(?=<div class="pothi-card">|<\/section>|$)/g)) {
  const card = match[1];
  const author = decode(card.match(/class="pothi-card-author"[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, " ") || "");
  const title = decode(card.match(/class="pothi-card-title"[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, " ") || "");
  const url = decode(card.match(/<a[^>]+href="([^"]+)"/)?.[1] || "https://www.videha.co.in/pothi.htm");
  if (title) pothi.push({ title, author, url });
}
const uniquePothi = [...new Map(pothi.map((item) => [`${item.author}|${item.title}`, item])).values()];
await writeFile(path.join(source, "data", "pothi.json"), JSON.stringify(uniquePothi));

await cp(source, out, { recursive: true });
await writeFile(path.join(out, ".nojekyll"), "");
console.log(`Built ${githubArchive.length} GitHub archive records and ${uniquePothi.length} Pothi records in ${out}`);
