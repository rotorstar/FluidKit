import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const normalize = (value: string) => value.trim().replace(/\s+/g, ' ');
export const sourceHash = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
export async function acceptanceSources(root: string) {
  const result = new Map<string, { task: string; source: string; criterion: string; sourceHash: string }>();
  function add(id: string, task: string, source: string, text: string) {
    const criterion = normalize(text);
    if (result.has(id)) throw new Error(`Duplicate canonical AC ${id}`);
    result.set(id, { task, source, criterion, sourceHash: sourceHash(criterion) });
  }
  const file = 'docs/implementation-plan.md';
  const plan = await readFile(join(root, file), 'utf8');
  for (const line of plan.split('\n')) {
    const task = /^\| (?:\*\*)?(T\d{2})\b/.exec(line)?.[1];
    if (!task) continue;
    const text = line.trim().replace(/^\||\|$/g, '').split('|').at(-1)!;
    text.split(';').filter(value => value.trim()).forEach((criterion, index) => add(`${task}-AC${String(index + 1).padStart(2, '0')}`, task, file, criterion.trim().replace(/\.$/, '')));
  }
  function section(heading: string, end?: string) {
    const value = plan.split(heading)[1];
    if (value === undefined) throw new Error(`Missing canonical section ${heading}`);
    return end ? value.split(end)[0]! : value;
  }
  function bulletItems(text: string) { return [...text.matchAll(/^- ([\s\S]*?)(?=\n- |\n#{1,4} |\n\n|(?![\s\S]))/gm)].map(match => normalize(match[1]!)); }
  const tests = section('### 8.1 Verbindliche Testszenarien', '### 8.2');
  tests.split('\n').filter(line => line.startsWith('| ') && !line.startsWith('| Bereich')).forEach((line, index) => {
    const cells = line.slice(1, -1).split('|').map(value => value.trim());
    add(`GLOBAL-TEST-${String(index + 1).padStart(2, '0')}`, 'GLOBAL', file, `${cells[0]}: ${cells.at(-1)}`);
  });
  const coverage = tests.split('\n').find(line => line.startsWith('Coverage dient'));
  if (!coverage) throw new Error('Missing canonical coverage gate');
  add('GLOBAL-COVERAGE-01', 'GLOBAL', file, coverage);
  for (const [prefix, heading, end] of [['BUDGET', '### 8.2', '### 8.3'], ['DOD', '### 8.4', undefined]] as const) {
    bulletItems(section(heading, end)).forEach((text, index) => add(`GLOBAL-${prefix}-${String(index + 1).padStart(2, '0')}`, 'GLOBAL', file, text));
  }
  [...section('### 8.3', '### 8.4').matchAll(/^\d+\. (.*)$/gm)].forEach((match, index) => add(`GLOBAL-RELEASE-${String(index + 1).padStart(2, '0')}`, 'GLOBAL', file, match[1]!));
  const rollout = section('### 8.3', '### 8.4').split('\n').find(line => line.startsWith('KI-Policies werden'));
  if (!rollout) throw new Error('Missing canonical policy rollout gate');
  add('GLOBAL-ROLLOUT-01', 'GLOBAL', file, rollout);
  for (const [prefix, heading, end] of [['AUTH', '### 5.3', '### 5.4'], ['RENDER', '### 5.4', '### 5.5'], ['STORAGE', '### 5.5', '### 5.6'], ['URL', '### 5.6', '## 6.']] as const) {
    const text = section(heading, end);
    const items = prefix === 'AUTH' ? [...text.matchAll(/^\d+\. (.*)$/gm)].map(match => match[1]!) : bulletItems(text);
    items.forEach((value, index) => add(`ARCH-${prefix}-${String(index + 1).padStart(2, '0')}`, 'ARCH', file, value));
  }
  const contracts = section('### 5.2 Öffentliche Schnittstellen', '### 5.3');
  contracts.split('\n').filter(line => /^\| `/.test(line)).forEach((line, index) => add(`ARCH-API-${String(index + 1).padStart(2, '0')}`, 'ARCH', file, line.slice(1, -1).split('|').map(value => value.trim()).join(': ')));
  const cases = section('#### Verbindliches Case-Set', '### Wave 5');
  cases.split('\n').filter(line => /^\| \*\*/.test(line)).forEach((line, index) => add(`CASE-${String(index + 1).padStart(2, '0')}`, 'CASES', file, line.slice(1, -1).split('|').map(value => value.trim()).join(' / ')));
  for (const prefix of ['M2', 'M3', 'M4']) {
    const source = `docs/milestones/${prefix.toLowerCase()}-plan.md`;
    const text = await readFile(join(root, source), 'utf8');
    const items = prefix === 'M2' ? text.split('\n').filter(line => /^\| M2-\d/.test(line)).map(line => line.slice(1, -1).split('|').at(-1)!)
      : prefix === 'M3' ? bulletItems(text.split('## Abnahme')[1]!)
      : text.split('## Tasks und Acceptance Criteria')[1]!.split('## Flows')[0]!.split(/\n\d+\. /).filter(value => value.trim());
    items.forEach((value, index) => add(`${prefix}-AC${String(index + 1).padStart(2, '0')}`, prefix, source, value));
  }
  for (const [prefix, source, start, end] of [
    ['M1', 'docs/milestones/m1.md', '## Enthalten', '## Automatisiert'],
    ['M5', 'docs/milestones/m5-plan.md', '## Abgleich', '## Umsetzungsreihenfolge'],
    ['M6', 'docs/milestones/m6-plan.md', '## Abnahme', '## Neue geplante Verträge'],
    ['M7', 'docs/milestones/m7-plan.md', '## Abnahme', '## Prüfablauf und Nachweise'],
  ] as const) {
    const text = (await readFile(join(root, source), 'utf8')).split(start)[1]!.split(end)[0]!;
    bulletItems(text).forEach((value, index) => add(`${prefix}-AC${String(index + 1).padStart(2, '0')}`, prefix, source, value));
  }
  const localeSource = 'docs/milestones/m11-multilingual-plan.md';
  const localePlan = await readFile(join(root,localeSource),'utf8');
  const localeRows = [...localePlan.matchAll(/^\| \*\*(M11-\d{2})\*\* \| [^|]+ \| ([^|\n]+) \|$/gm)];
  if(localeRows.length!==8)throw new Error('Eight M11 tasks with canonical acceptance criteria required');
  for(const match of localeRows)add(`${match[1]}-AC`,match[1]!,localeSource,match[2]!);
  const structuralSource = 'docs/milestones/structural-transitions.md';
  const structural = await readFile(join(root, structuralSource), 'utf8');
  for (const match of structural.matchAll(/^\| (R[1-6]-AC\d{2}) \| (T\d{2}) \| (.+) \|$/gm)) add(match[1]!, match[2]!, structuralSource, match[3]!);
  const providerSource = 'docs/research/provider-apis.md';
  const providerAcceptance = (await readFile(join(root, providerSource), 'utf8')).split('## Abnahme')[1]!.split('\n## ')[0]!;
  [...providerAcceptance.matchAll(/^\d+\. ([\s\S]*?)(?=\n\d+\. |(?![\s\S]))/gm)].forEach((match, index) => add(`PROVIDER-AC${String(index + 1).padStart(2, '0')}`, 'PROVIDER', providerSource, match[1]!));
  const uiSource = 'docs/qa/ui-checklist.md';
  const ui = await readFile(join(root, uiSource), 'utf8');
  bulletItems(ui.split('## Checkliste')[1]!.split('## Kombinierter Lauf')[0]!).forEach((value, index) => add(`UI-CHECK-${String(index + 1).padStart(2, '0')}`, 'UI', uiSource, value.replace(/^\[ \] /, '')));
  for (const [prefix, text] of [
    ['TASK', ui.split('## Aktuelle Tasks und Acceptance Criteria')[1]!.split('## Testmatrix')[0]!],
    ['RUN', ui.split('## Kombinierter Lauf ab M4')[1]!.split('[M4-Abnahmevertrag]')[0]!],
  ] as const) [...text.matchAll(/^\d+\. ([\s\S]*?)(?=\n\d+\. |(?![\s\S]))/gm)].forEach((match, index) => add(`UI-${prefix}-${String(index + 1).padStart(2, '0')}`, 'UI', uiSource, match[1]!));
  add('UI-MATRIX-01', 'UI', uiSource, ui.split('## Testmatrix für diesen Durchlauf')[1]!.split('## Recherche')[0]!);
  return result;
}
