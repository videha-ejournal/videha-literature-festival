import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const remediationPath = path.join(dist, "accessibility", "archive-remediation.json");
const archivePath = path.join(dist, "data", "archive.json");
const manifestUrl = "https://github.com/videha-ejournal/videha-sadeha/releases/download/accessible-pdf-v1/accessible-pdf-manifest.json";
const releaseUrl = "https://github.com/videha-ejournal/videha-sadeha/releases/tag/accessible-pdf-v1";

const pad = (value, width) => String(Number(value)).padStart(width, "0");
const expectedSourcePath = record => {
  if (record.publication === "VIDEHA") return `Videha ${pad(record.issue, 3)}.pdf`;
  if (Number(record.issue) === 5 && Number(record.version) === 2) return "Sadeha 05 v2.pdf";
  if (Number(record.issue) === 5 && Number(record.version) === 1) return "Sadeha 05.pdf";
  return `Sadeha ${pad(record.issue, 2)}.pdf`;
};
const esc = (value = "") => String(value).replace(/[&<>'"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[ch]);

let pdfManifest = null;
try {
  const response = await fetch(manifestUrl, { headers: { "user-agent": "Videha-Festival-accessibility-evidence/1.0" }, signal: AbortSignal.timeout(30000) });
  if (response.ok) pdfManifest = await response.json();
} catch {}

const remediation = JSON.parse(await readFile(remediationPath, "utf8"));
const archive = JSON.parse(await readFile(archivePath, "utf8"));
const recordsByPath = new Map((pdfManifest?.records || []).map(record => [record.sourcePath, record]));
let validated = 0;
let reviewRequired = 0;
let unmatched = 0;

for (const record of remediation.records) {
  const sourcePath = expectedSourcePath(record);
  const evidence = recordsByPath.get(sourcePath);
  record.pdfUaEvidence = {
    sourcePath,
    sourceOriginalPreserved: true,
    derivativeMachineValidated: evidence?.status === "pdfua-validated",
    accessiblePdfUrl: evidence?.status === "pdfua-validated" ? evidence.accessiblePdfUrl : null,
    validation: evidence?.status === "pdfua-validated" ? evidence.validation : null,
    textMethod: evidence?.textMethod || null,
    ocrPages: evidence?.ocrPages || [],
    unrecoveredTextPages: evidence?.unrecoveredTextPages || [],
    removedExtractionArtifacts: evidence?.removedExtractionArtifacts || [],
    editorialTextVerification: evidence?.editorialTextVerification || "not-reviewed",
    humanReviewRequired: evidence?.humanReviewRequired ?? null,
    evidenceRelease: releaseUrl
  };
  if (record.pdfUaEvidence.derivativeMachineValidated) {
    validated += 1;
    record.remediationStatus = "pdfua-reading-derivative-machine-validated";
    record.alternativeStatus = "machine-validated-pdfua-reading-copy-and-accessible-html-record-available";
    record.note = "The historical source PDF remains unchanged. A separate PDF/UA-1 reading derivative passed automated pdfinfo, qpdf and veraPDF checks. OCR or extracted text is not described as editorially proofread unless a separate review record says so.";
    if (record.pdfUaEvidence.humanReviewRequired) reviewRequired += 1;

    const htmlPath = path.join(dist, "accessible-archive", record.slug, "index.html");
    try {
      let page = await readFile(htmlPath, "utf8");
      if (!page.includes("Accessible PDF/UA reading copy")) {
        const card = `<div class="a11y-status-card"><h2>Accessible PDF/UA reading copy</h2><p><span class="a11y-status verified">Machine-validated PDF/UA-1 derivative</span></p><p>This separate reading copy passed automated PDF tagging, qpdf integrity and veraPDF PDF/UA-1 checks. The historical source remains unchanged. OCR and extracted text are <strong>not</strong> represented as human-proofread unless an editorial review record explicitly says so.</p><p><a href="${esc(record.pdfUaEvidence.accessiblePdfUrl)}">Open accessible PDF/UA reading copy</a> · <a href="${releaseUrl}">Validation release and manifest</a></p></div>`;
        page = page.replace('<dl class="meta-list">', `${card}\n<dl class="meta-list">`);
        await writeFile(htmlPath, page);
      }
    } catch {}
  } else {
    unmatched += 1;
  }
}

remediation.summary.sourceTaggedPdfVerified = remediation.summary.taggedPdfVerified || 0;
remediation.summary.validatedPdfUaDerivatives = validated;
remediation.summary.pdfUaEvidenceMatched = validated;
remediation.summary.pdfUaEvidenceUnmatched = unmatched;
remediation.summary.humanReviewRequired = reviewRequired;
remediation.summary.pdfUaCorpusComplete = Boolean(pdfManifest?.complete) && validated === remediation.records.length;
remediation.pdfUaRelease = releaseUrl;
remediation.pdfUaManifestUrl = manifestUrl;
remediation.policy = "Historical source PDFs are preserved unchanged. Separate PDF/UA derivatives are labelled machine-validated only when the published remediation manifest records PDF/UA validation. OCR/editorial accuracy and manual assistive-technology review remain separate evidence states.";
await writeFile(remediationPath, JSON.stringify(remediation, null, 2));

const indexPath = path.join(dist, "accessible-archive", "index.html");
try {
  let index = await readFile(indexPath, "utf8");
  if (validated === remediation.records.length && validated > 0) {
    index = index
      .replace(/<span class="a11y-status pending">Tagging unverified<\/span>/g, '<span class="a11y-status verified">PDF/UA derivative validated</span>')
      .replace("These pages expose metadata, status and source navigation without falsely representing unverified PDF tagging as WCAG-conformant full text.", "Every preserved source remains unchanged; each listed file also has a separate machine-validated PDF/UA-1 reading derivative. OCR and extracted text are not represented as human-proofread without an editorial review record.")
      .replace("“Accessible record” means accessible navigation and metadata. It does not mean the underlying historical PDF has been tagged or that an editorially verified transcription has been completed.", "“PDF/UA derivative validated” refers to the separate accessible reading copy, not to alteration of the historical source. Editorial proofreading and manual assistive-technology verification remain separately recorded states.");
  }
  await writeFile(indexPath, index);
} catch {}

const evidenceRegister = {
  generated: new Date().toISOString(),
  archiveFiles: archive.archive.length,
  sourceRepositoryPdfCount: pdfManifest?.sourcePdfCount ?? null,
  manifestComplete: Boolean(pdfManifest?.complete),
  validatedPdfUaDerivatives: validated,
  unmatchedArchiveRecords: unmatched,
  humanReviewRequired: reviewRequired,
  release: releaseUrl,
  manifest: manifestUrl,
  claimBoundary: "Machine PDF/UA validation does not by itself certify OCR/editorial accuracy or human assistive-technology testing."
};
await writeFile(path.join(dist, "accessibility", "pdfua-evidence.json"), JSON.stringify(evidenceRegister, null, 2));
console.log(`PDF/UA evidence: ${validated}/${remediation.records.length} Festival archive records matched; ${unmatched} unmatched.`);
