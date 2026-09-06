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
const githubCatalogue = JSON.parse(await readFile(path.join(source, "data", "github-library.json"), "utf8"));
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const langAttr = (value = "") => /[\u0900-\u097F]/.test(value) ? ' lang="mai-Deva"' : "";
const byTitle = [...uniquePothi.map((item) => ({ ...item, source: "Videha Pothi" })), ...githubCatalogue.map((item) => ({ ...item, author: "", source: "GitHub edition" }))]
  .sort((a, b) => a.title.localeCompare(b.title, ["mai", "hi", "en"], { sensitivity: "base", numeric: true }));
const byAuthor = [...uniquePothi].sort((a, b) => (a.author || "Author not stated").localeCompare(b.author || "Author not stated", ["mai", "hi", "en"], { sensitivity: "base" }) || a.title.localeCompare(b.title, ["mai", "hi", "en"], { sensitivity: "base", numeric: true }));
let previousAuthor = "";
const authorwiseHtml = byAuthor.map((item) => {
  const author = item.author || "Author not stated in source catalogue";
  const heading = author !== previousAuthor ? `<h3${langAttr(author)}>${escapeHtml(author)}</h3>` : "";
  previousAuthor = author;
  return `${heading}<p><a href="${escapeHtml(item.url)}"${langAttr(item.title)}>${escapeHtml(item.title)}</a></p>`;
}).join("");
const bookwiseHtml = byTitle.map((item) => `<li><a href="${escapeHtml(item.url)}"${langAttr(item.title)}>${escapeHtml(item.title)}</a><span>${escapeHtml(item.source)}${item.author ? ` · ${escapeHtml(item.author)}` : ""}</span></li>`).join("");
const catalogueHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Static bookwise and authorwise index of all verified Videha Pothi and GitHub publication records."><title>Complete static catalogue · Videha Literature Festival</title><link rel="stylesheet" href="styles.css"><style>main{max-width:1200px;margin:auto;padding:48px 22px 100px}.catalogue-nav{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.catalogue-nav a{font-weight:700;color:var(--leaf)}details{margin:24px 0;padding:20px;border:1px solid var(--line);background:var(--cream)}summary{cursor:pointer;font:700 1.5rem "Source Serif 4",serif}ol{columns:2;column-gap:34px;padding-left:24px}li{break-inside:avoid;margin:0 0 12px}li a{display:block;font-weight:700}li span{display:block;color:var(--muted);font-size:.76rem}.author-index h3{margin:30px 0 8px;padding-bottom:6px;border-bottom:2px solid var(--gold);color:var(--leaf)}.author-index p{margin:5px 0}@media(max-width:700px){ol{columns:1}}</style></head><body><main><p class="eyebrow">VIDEHA LITERATURE FESTIVAL</p><h1>Complete static publication catalogue</h1><p>${uniquePothi.length.toLocaleString("en-IN")} verified Videha Pothi records and ${githubCatalogue.length.toLocaleString("en-IN")} verified GitHub book and study editions. This page requires no JavaScript.</p><nav class="catalogue-nav"><a href="index.html#books">← Return to the festival</a><a href="#bookwise">Bookwise index</a><a href="#authorwise">Authorwise index</a></nav><details id="bookwise" open><summary>Bookwise · ${byTitle.length.toLocaleString("en-IN")} records</summary><ol>${bookwiseHtml}</ol></details><details id="authorwise"><summary>Authorwise · Videha Pothi</summary><div class="author-index">${authorwiseHtml}</div><p>GitHub filenames do not consistently encode authors, so those ${githubCatalogue.length.toLocaleString("en-IN")} editions remain in the bookwise index rather than receiving inferred attributions.</p></details></main></body></html>`;
await writeFile(path.join(out, "catalogue.html"), catalogueHtml);
await writeFile(path.join(out, ".nojekyll"), "");
console.log(`Built ${githubArchive.length} GitHub archive records, ${uniquePothi.length} Pothi records, ${githubCatalogue.length} GitHub editions, and a static catalogue in ${out}`);
