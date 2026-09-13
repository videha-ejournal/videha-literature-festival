import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const accessibility = path.join(dist, "accessibility");
const transcripts = path.join(accessibility, "transcripts");
const drafts = path.join(transcripts, "drafts");
const base = "https://videha-ejournal.github.io/videha-literature-festival/";
const releaseBase = "https://github.com/videha-ejournal/videha-literature-festival/releases/download/criticism-transcripts-v1/";
const manifestUrl = `${releaseBase}criticism-transcript-manifest.json`;
const esc = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);
const fmt = seconds => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
};
const fetchJson = async url => {
  const response = await fetch(url, { headers: { "user-agent": "Videha-Festival-transcript-integrator/1.1" }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};
const shell = (title, body, canonical) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Machine-generated transcript draft with source provenance and review status."><title>${esc(title)} · Videha Literature Festival</title><link rel="canonical" href="${esc(canonical)}"><link rel="stylesheet" href="${base}styles.css"><link rel="stylesheet" href="${base}accessibility-completion.css"><style>main{max-width:900px;margin:auto;padding:40px 22px 90px}.crumbs{display:flex;gap:.5rem;flex-wrap:wrap}.warning{padding:18px;border:2px solid currentColor;margin:24px 0}.meta{display:grid;grid-template-columns:180px 1fr;gap:.45rem 1rem}.meta dt{font-weight:700}.meta dd{margin:0}.segments{list-style:none;padding:0}.segments li{display:grid;grid-template-columns:7rem 1fr;gap:1rem;padding:.65rem 0;border-bottom:1px solid #ddd}.time{font-variant-numeric:tabular-nums;font-weight:700}@media(max-width:620px){.meta{grid-template-columns:1fr}.segments li{grid-template-columns:1fr}}</style></head><body><main id="main">${body}</main></body></html>`;

await mkdir(drafts, { recursive: true });
let register = { generated: new Date().toISOString(), verifiedCount: 0, transcripts: [] };
try { register = JSON.parse(await readFile(path.join(accessibility, "transcript-register.json"), "utf8")); } catch {}

let manifest;
try {
  manifest = await fetchJson(manifestUrl);
} catch (error) {
  register.asr = { status: "release-manifest-not-yet-available", complete: false, humanVerified: false, editorialReview: "not-reviewed", error: String(error.message || error) };
  await writeFile(path.join(accessibility, "transcript-register.json"), JSON.stringify(register, null, 2));
  console.log("ASR transcript manifest not yet available; retaining verified-transcript-only pages.");
  process.exit(0);
}

register.asr = {
  status: manifest.status,
  complete: Boolean(manifest.complete),
  expectedCanonicalRecordings: Number(manifest.expectedCanonicalRecordings || 0),
  processedRecords: Number(manifest.processedRecords || 0),
  coveredRecords: Number(manifest.coveredRecords || 0),
  statusCounts: manifest.statusCounts || {},
  humanVerified: false,
  editorialReview: "not-reviewed",
  releaseUrl: manifest.releaseUrl,
  claimBoundary: manifest.claimBoundary
};
await writeFile(path.join(accessibility, "transcript-register.json"), JSON.stringify(register, null, 2));

if (!manifest.complete) {
  console.log(`ASR corpus incomplete: ${register.asr.processedRecords}/${register.asr.expectedCanonicalRecordings}; not publishing draft pages as a complete corpus.`);
  process.exit(0);
}

const records = [];
for (const part of manifest.parts || []) {
  const url = part.url || `${releaseBase}${part.asset}`;
  const data = await fetchJson(url);
  for (const record of data.records || []) records.push(record);
}
const expected = Number(manifest.expectedCanonicalRecordings || 0);
if (records.length !== expected) throw new Error(`Transcript data mismatch: ${records.length}/${expected}`);

const rows = [];
for (const record of records) {
  const id = String(record.id || "");
  if (!id) continue;
  const title = record.logicalSource || record.mediaName || id;
  const canonical = `${base}accessibility/transcripts/drafts/${encodeURIComponent(id)}/`;
  const noSpeech = record.status === "no-speech-detected";
  const segments = (record.segments || []).map(segment => `<li><span class="time">${esc(fmt(segment.start))}–${esc(fmt(segment.end))}</span><span lang="mai-Deva">${esc(segment.text)}</span></li>`).join("");
  const warning = noSpeech
    ? `<div class="warning"><strong>No speech text was detected by the machine pass.</strong> This is still an unreviewed machine result, not a human determination that the recording contains no speech. Consult the source recording.</div>`
    : `<div class="warning"><strong>Not an editorially verified transcript.</strong> This text was generated automatically from the preserved recording and may contain recognition, language-detection, spelling, segmentation or name errors. Consult the source recording for authoritative content.</div>`;
  const body = `<nav class="crumbs" aria-label="Breadcrumb"><a href="${base}">Festival</a><span aria-hidden="true">›</span><a href="${base}accessibility/">Accessibility</a><span aria-hidden="true">›</span><a href="${base}accessibility/transcripts/">Transcripts</a><span aria-hidden="true">›</span><span aria-current="page">Machine aid</span></nav><p class="eyebrow">MACHINE ASR ACCESSIBILITY AID</p><h1>${esc(title)}</h1>${warning}<dl class="meta"><dt>Collection</dt><dd>Part ${esc(record.part)} · ${esc(record.collectionTitle || record.collectionIdentifier)}</dd><dt>Status</dt><dd>${esc(record.status)}</dd><dt>Human verified</dt><dd>No</dd><dt>Editorial review</dt><dd>${esc(record.editorialReview || "not-reviewed")}</dd><dt>ASR model</dt><dd>${esc(record.asrModel || "")}</dd><dt>Detected language</dt><dd>${esc(record.detectedLanguage || "unknown")} ${record.languageProbability != null ? `(${esc(record.languageProbability)})` : ""}</dd><dt>Duration</dt><dd>${esc(fmt(record.durationSeconds))}</dd><dt>Source</dt><dd><a href="${esc(record.mediaUrl)}">Open preserved recording</a></dd></dl><h2>Timestamped machine output</h2><ol class="segments">${segments || `<li><span>No speech text was emitted by the ASR pass.</span></li>`}</ol>${record.plainText ? `<h2>Plain text</h2><p lang="mai-Deva">${esc(record.plainText)}</p>` : ""}<p><a href="${base}accessibility/transcripts/">← Transcript index</a></p>`;
  const dir = path.join(drafts, id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), shell(title, body, canonical));
  const label = noSpeech ? "No speech detected · not reviewed" : "ASR draft · not reviewed";
  rows.push(`<tr><td>Part ${esc(record.part)}</td><td><a href="${canonical}">${esc(title)}</a></td><td>${esc(record.detectedLanguage || "unknown")}</td><td><span class="a11y-status pending">${label}</span></td><td><a href="${esc(record.mediaUrl)}">Source recording</a></td></tr>`);
}

const verified = Array.isArray(register.transcripts) ? register.transcripts : [];
const verifiedRows = verified.map(item => `<li><a href="${base}accessibility/transcripts/${esc(item.slug)}/">${esc(item.title)}</a></li>`).join("");
const index = shell("Transcript index", `<nav class="crumbs" aria-label="Breadcrumb"><a href="${base}">Festival</a><span aria-hidden="true">›</span><a href="${base}accessibility/">Accessibility</a><span aria-hidden="true">›</span><span aria-current="page">Transcripts</span></nav><p class="eyebrow">TRANSCRIPT ACCESS</p><h1>Transcripts and machine accessibility aids</h1><p><strong>${verified.length} editorially verified transcript${verified.length === 1 ? "" : "s"}</strong> are stored in the repository.</p><div class="warning"><strong>${records.length} machine ASR accessibility records are available separately.</strong> Spoken-text records are machine drafts; a “no speech detected” record means only that the ASR pass emitted no speech text. None of these records is a publisher caption or a human/editorially verified transcript.</div>${verified.length ? `<h2>Editorially verified transcripts</h2><ul>${verifiedRows}</ul>` : ""}<h2>Machine ASR corpus</h2><p>Coverage: ${records.length} of ${expected} canonical recordings across the twelve Videha Discussion & Criticism collections.</p><table class="a11y-table"><caption>Machine transcript/accessibility register</caption><thead><tr><th>Collection</th><th>Recording</th><th>Detected language</th><th>Review status</th><th>Source</th></tr></thead><tbody>${rows.join("")}</tbody></table><p><a href="${esc(manifest.releaseUrl)}">Open machine-readable transcript release</a> · <a href="${base}accessibility/transcript-register.json">Transcript status register (JSON)</a></p>`, `${base}accessibility/transcripts/`);
await writeFile(path.join(transcripts, "index.html"), index);
register.asr.publishedDraftPages = rows.length;
await writeFile(path.join(accessibility, "transcript-register.json"), JSON.stringify(register, null, 2));
console.log(`Published ${rows.length} provenance-labelled ASR accessibility pages; ${verified.length} editorially verified transcripts remain separately labelled.`);
