import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateAcceptanceLedger } from './acceptance-validation';
import { acceptanceSources } from './acceptance-source';

const root = process.cwd();
const sources = await acceptanceSources(root);
const ledger = await validateAcceptanceLedger(JSON.parse(await readFile('docs/acceptance/ledger.json', 'utf8')), sources, path => readFile(resolve(root, path)));
const labels = { verified: 'Nachgewiesen im Scope', implemented: 'Implementiert, Nachweis offen', partial: 'Teilweise', open: 'Offen', external: 'Externer Nachweis nötig' };
const counts = Object.fromEntries(Object.keys(labels).map(status => [status, ledger.criteria.filter(item => item.status === status).length]));
const lines = ['# Abgleichsmatrix aller Acceptance Criteria', '', `Stand: ${ledger.updatedAt}. ${ledger.criteria.length} Kriterien aus dem kanonischen Plan, M1–M9, M11, R1–R6, UI-Prüfliste und Anbieter-/Simulationsvertrag.`, '', '**Gesamtplan vollständig erfüllt: Nein.** Ein Proof und ein bestandener Teilcheck sind keine vollständige Produktabnahme. Statuswerte beziehen sich auf den ausdrücklich angegebenen Scope; übergreifende Gates bleiben zusätzlich maßgeblich.', '', ...Object.entries(counts).map(([status, count]) => `- ${labels[status as keyof typeof labels]}: ${count}`), '', '[Maschinenlesbares Register](acceptance/ledger.json) · [Grundlagenplan](milestones/m5-plan.md) · [M6-Rehearsalvertrag](milestones/m6-plan.md) · [M7-Effektvertrag](milestones/m7-plan.md) · [M8-Komponentenvertrag](milestones/m8-plan.md) · [M9-Ansichten und Farbwelten](milestones/m9-plan.md) · [M11-Sprachprofile](milestones/m11-multilingual-plan.md) · [R1–R6](milestones/structural-transitions.md)', ''];
lines.push('## Task-Überblick', '', 'Die Zahlen bezeichnen einzelne Kriterien im dokumentierten Scope, keinen pauschalen Fertigstellungsgrad.', '', '| Task | Im Scope belegt | Teilweise | Offen / unverifiziert / extern |', '|---|---:|---:|---:|');
for (const task of [...new Set(ledger.criteria.map(item => item.task))].filter(task => /^T\d{2}$/.test(task)).sort()) {
  const items = ledger.criteria.filter(item => item.task === task);
  lines.push(`| [${task}](#${task.toLowerCase()}) | ${items.filter(item => item.status === 'verified').length}/${items.length} | ${items.filter(item => item.status === 'partial').length} | ${items.filter(item => ['open', 'implemented', 'external'].includes(item.status)).length} |`);
}
lines.push('');
for (const task of [...new Set(ledger.criteria.map(item => item.task))]) {
  const items = ledger.criteria.filter(item => item.task === task);
  lines.push(`## ${task}`, '', `Nachgewiesen im Scope: ${items.filter(item => item.status === 'verified').length}/${items.length}.`, '', '| AC | Kriterium | Status / Scope | Nachweis | Offen / nächste Abnahme |', '|---|---|---|---|---|');
  for (const item of items) lines.push(`| ${item.id} | ${item.criterion.replaceAll('|', '\\|')} | ${labels[item.status]} · ${item.scope} | ${item.evidence.map(evidence => `[${evidence.kind}: ${evidence.path}](${evidence.path.startsWith('docs/') ? evidence.path.slice(5) : `../${evidence.path}`})`).join(', ') || '—'} | ${item.remaining.replaceAll('|', '\\|') || 'Im genannten Scope belegt'} |`);
  lines.push('');
}
if (process.argv.includes('--write')) await writeFile('docs/acceptance-matrix.md', lines.join('\n'));
console.info(`AC matrix checked: ${ledger.criteria.length} canonical criteria; ${JSON.stringify(counts)}. Full-plan completion: ${ledger.criteria.every(item => item.status === 'verified')}.`);
if (process.argv.includes('--require-complete') && ledger.criteria.some(item => item.status !== 'verified')) {
  console.error(`Release blocked: ${ledger.criteria.filter(item => item.status !== 'verified').length} acceptance criteria remain unverified. Consistency checks do not constitute a product release.`);
  process.exitCode = 1;
}
