export function archiveStats(manifest) {
  const records = manifest.archive;
  const keys = records.map(r => `${r.publication}:${r.issue}:${r.version || 1}`);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate archive issue/version');
  if (!Number.isInteger(manifest.currentIssue) || !/^\d{4}-\d{2}-\d{2}$/.test(manifest.currentIssueDate || '')) throw new Error('Current issue number and ISO date are required');
  const videha = records.filter(r => r.publication === 'VIDEHA');
  const sadeha = records.filter(r => r.publication === 'SADEHA');
  const numbers = [...new Set(videha.map(r => r.issue))].sort((a,b) => a-b);
  return { videhaIssues: numbers.length, videhaFiles: videha.length, archiveMaxVideha: Math.max(0,...numbers),
    videhaRange: numbers.every((n,i) => n === i+1) ? `1–${numbers.at(-1)}` : numbers.join(', '),
    sadehaIssues: new Set(sadeha.map(r => r.issue)).size, sadehaFiles: sadeha.length, totalFiles: records.length };
}
