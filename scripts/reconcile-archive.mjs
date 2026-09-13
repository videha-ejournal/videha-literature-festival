import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const archivePath = path.join(root, "dist", "data", "archive.json");
const archive = JSON.parse(await readFile(archivePath, "utf8"));

const preservedIssue = 448;
const exists = archive.archive.some(record => record.publication === "VIDEHA" && Number(record.issue) === preservedIssue);
if (!exists) {
  archive.archive.push({
    publication: "VIDEHA",
    issue: preservedIssue,
    version: null,
    title: "VIDEHA — Issue 448 / अंक ४४८",
    file: "",
    source: "https://videha-ejournal.github.io/videha-sadeha/Videha%20448.pdf",
    date: "",
    dateISO: "",
    year: 2026,
    preservationNote: "Preserved repository PDF added after the earlier archive manifest snapshot."
  });
}

archive.archive.sort((a, b) => {
  if (a.publication !== b.publication) return a.publication.localeCompare(b.publication);
  return Number(a.issue) - Number(b.issue) || Number(a.version || 0) - Number(b.version || 0);
});
archive.archiveMaxVideha = Math.max(...archive.archive.filter(x => x.publication === "VIDEHA").map(x => Number(x.issue) || 0));
archive.archiveSadehaDocuments = archive.archive.filter(x => x.publication === "SADEHA").length;
archive.archiveSadehaIssues = new Set(archive.archive.filter(x => x.publication === "SADEHA").map(x => x.issue)).size;
archive.preservedArchiveFiles = archive.archive.length;
archive.reconciliation = {
  generated: new Date().toISOString(),
  reason: "Repository corpus contains 448 Videha PDFs plus 38 Sadeha PDF files.",
  sourceRepository: "videha-ejournal/videha-sadeha"
};

await writeFile(archivePath, JSON.stringify(archive));
console.log(`Reconciled archive: ${archive.archiveMaxVideha} Videha issues + ${archive.archiveSadehaDocuments} Sadeha files = ${archive.archive.length} preserved PDFs.`);
