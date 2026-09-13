import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "dist", "accessibility");
const outDir = path.join(dir, "completion");
await mkdir(outDir, { recursive: true });
const readJson = async name => { try { return JSON.parse(await readFile(path.join(dir, name), "utf8")); } catch { return null; } };
const pdf = await readJson("pdfua-evidence.json");
const transcript = await readJson("transcript-register.json");
const archive = await readJson("archive-remediation.json");
const esc = (v = "") => String(v).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[c]);
const base = "https://videha-ejournal.github.io/videha-literature-festival/";
const pdfComplete = Boolean(pdf?.manifestComplete) && Number(pdf?.validatedPdfUaDerivatives || 0) === Number(pdf?.archiveFiles || 0) && Number(pdf?.archiveFiles || 0) > 0;
const asrComplete = Boolean(transcript?.asr?.complete) && Number(transcript?.asr?.processedRecords || 0) === Number(transcript?.asr?.expectedCanonicalRecordings || 0) && Number(transcript?.asr?.expectedCanonicalRecordings || 0) > 0;
const verifiedTranscripts = Number(transcript?.verifiedCount || 0);
const status = {
  generated: new Date().toISOString(),
  technicalAutomationComplete: pdfComplete && asrComplete,
  pdf: {
    archiveFiles: Number(pdf?.archiveFiles || archive?.summary?.total || 0),
    machineValidatedPdfUaDerivatives: Number(pdf?.validatedPdfUaDerivatives || 0),
    corpusComplete: pdfComplete,
    humanReviewRequired: Number(pdf?.humanReviewRequired || archive?.summary?.humanReviewRequired || 0),
    sourceOriginalsPreserved: true
  },
  transcripts: {
    canonicalRecordings: Number(transcript?.asr?.expectedCanonicalRecordings || 0),
    asrProcessed: Number(transcript?.asr?.processedRecords || 0),
    asrCorpusComplete: asrComplete,
    publishedAsrDraftPages: Number(transcript?.asr?.publishedDraftPages || 0),
    editoriallyVerifiedTranscripts: verifiedTranscripts,
    humanVerifiedAsrDrafts: false
  },
  manualVerification: {
    wcagAssistiveTechnologyCertificationComplete: false,
    pdfEditorialProofreadingComplete: false,
    transcriptEditorialProofreadingComplete: verifiedTranscripts > 0 && asrComplete && verifiedTranscripts === Number(transcript?.asr?.expectedCanonicalRecordings || 0),
    note: "Human/editorial states are never inferred from automation. They change only when actual review evidence is recorded."
  },
  claimBoundary: "Technical automation completion means the reproducible PDF/UA and ASR pipelines have processed their entire source corpora. It does not mean OCR/transcript text has been human proofread or that manual assistive-technology testing has been completed."
};
await writeFile(path.join(dir, "completion-status.json"), JSON.stringify(status, null, 2));
const badge = (ok, yes, no) => `<span class="a11y-status ${ok ? "verified" : "pending"}">${esc(ok ? yes : no)}</span>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Auditable completion status for Videha archive PDF remediation, transcript drafts and human accessibility review."><title>Accessibility completion status · Videha Literature Festival</title><link rel="canonical" href="${base}accessibility/completion/"><link rel="stylesheet" href="${base}styles.css"><link rel="stylesheet" href="${base}accessibility-completion.css"><style>main{max-width:950px;margin:auto;padding:42px 22px 90px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.card{padding:20px;border:1px solid #ccc}.metric{font-size:1.7rem;font-weight:800}.boundary{margin-top:28px;padding:18px;border:2px solid currentColor}</style></head><body><main id="main"><p><a href="${base}accessibility/">← Accessibility</a></p><p class="eyebrow">EVIDENCE-BASED STATUS</p><h1>Accessibility completion dashboard</h1><p>This page separates reproducible machine processing from genuine human editorial and assistive-technology verification.</p><div class="grid"><section class="card"><h2>Historical PDFs</h2><p>${badge(pdfComplete,"Corpus machine-validated","Processing / validation incomplete")}</p><p class="metric">${status.pdf.machineValidatedPdfUaDerivatives} / ${status.pdf.archiveFiles}</p><p>Separate PDF/UA reading derivatives with originals preserved unchanged.</p><p><a href="${base}accessible-archive/">Archive remediation register</a></p></section><section class="card"><h2>Recording transcripts</h2><p>${badge(asrComplete,"ASR corpus processed","ASR corpus incomplete")}</p><p class="metric">${status.transcripts.asrProcessed} / ${status.transcripts.canonicalRecordings || "—"}</p><p>Machine ASR drafts. Editorially verified transcripts: <strong>${verifiedTranscripts}</strong>.</p><p><a href="${base}accessibility/transcripts/">Transcript index</a></p></section><section class="card"><h2>Human verification</h2><p>${badge(false,"Human verification complete","Human review remains separate")}</p><p>Manual screen-reader/AT testing, OCR proofreading and transcript proofreading are not inferred from machine validation.</p><p><a href="${base}accessibility/manual-audit/">Manual audit protocol</a></p></section></div><div class="boundary"><strong>Claim boundary:</strong> ${esc(status.claimBoundary)}</div><p><a href="${base}accessibility/completion-status.json">Machine-readable completion status (JSON)</a></p></main></body></html>`;
await writeFile(path.join(outDir, "index.html"), html);
try {
  const indexPath = path.join(dir, "index.html");
  let index = await readFile(indexPath, "utf8");
  if (!index.includes("accessibility/completion/")) {
    index = index.replace("</main>", `<section class="a11y-status-card"><h2>Completion dashboard</h2><p><a href="${base}accessibility/completion/">Open evidence-based accessibility completion status</a>. Machine processing, editorial review and manual assistive-technology verification are reported as separate states.</p></section></main>`);
    await writeFile(indexPath, index);
  }
} catch {}
console.log(`Accessibility completion: PDF ${status.pdf.machineValidatedPdfUaDerivatives}/${status.pdf.archiveFiles}; ASR ${status.transcripts.asrProcessed}/${status.transcripts.canonicalRecordings || 0}; technical complete=${status.technicalAutomationComplete}.`);
