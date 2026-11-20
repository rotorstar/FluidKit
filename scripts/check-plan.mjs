import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const plan = await readFile('docs/implementation-plan.md', 'utf8');
const definitions = [...plan.matchAll(/^\| (?:\*\*)?(T\d\d)\b/gm)].map(match => match[1]);
const lastTask = Math.max(...definitions.map(id => Number(id.slice(1))));
assert(lastTask >= 65, 'M8 behavior, layout, Studio and agent-authoring tasks must be included');
assert.equal(definitions.length, lastTask, 'Every task must have exactly one definition');
assert.equal(new Set(definitions).size, definitions.length, 'Duplicate task definitions');
for (let i = 1; i <= lastTask; i++) assert(definitions.includes(`T${String(i).padStart(2, '0')}`));
for (const decision of [...JSON.parse(await readFile('docs/decisions/base-ui-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/showcase-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/typegpu-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/stageshow-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/m7-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/m7-followup-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/ui-sdk-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/m9-scores.json', 'utf8')), ...JSON.parse(await readFile('docs/decisions/structural-scores.json','utf8'))]) {
  assert.equal(decision.weights.reduce((sum, weight) => sum + weight, 0), 100);
  const scores = {};
  for (const option of Object.keys(decision.ratings)) {
    scores[option] = decision.ratings[option].reduce((sum, rating, i) => sum + rating * decision.weights[i], 0) / 5;
    assert.equal(scores[option], decision.scores[option], `${decision.id}/${option}`);
  }
  assert(!decision.excluded?.includes(decision.winner), `Excluded winner ${decision.id}`);
  const eligible = Object.entries(scores).filter(([option]) => !decision.excluded?.includes(option)).map(([,score]) => score);
  assert.equal(scores[decision.winner], Math.max(...eligible));
  const document = decision.document ? await readFile(decision.document, 'utf8') : plan;
  const row = document.split('\n').find(line => line.startsWith(`| ${decision.id} `));
  assert(row, `Missing ${decision.id}`);
  for (const value of Object.values(scores)) assert(row.includes(String(value)), `Score mismatch ${decision.id}/${value}`);
}
for (const name of ['contracts', 'core', 'webgpu']) {
  const manifest = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
  assert(!manifest.dependencies?.['@base-ui/react'], `${name} must remain independent of Base UI`);
}
const featureTasks = Object.keys(JSON.parse(await readFile('docs/feature-status.json', 'utf8')));
assert.deepEqual(featureTasks.sort(), [...definitions].sort(), 'Feature matrix and plan must reference the same tasks');
const m8 = await readFile('docs/milestones/m8-plan.md', 'utf8');
const m8Criteria = new Map([...m8.matchAll(/^- \*\*(T\d{2}-AC\d{2}):\*\* (.+)$/gm)].map(match => [match[1], match[2].trim().replace(/\s+/g, ' ').replace(/\.$/, '')]));
assert.equal(m8Criteria.size, 41, 'M8 must explain the same 41 new canonical criteria without a duplicate milestone series');
for (let taskNumber = 59; taskNumber <= 65; taskNumber++) {
  const task = `T${taskNumber}`;
  const row = plan.split('\n').find(line => line.startsWith(`| ${task} `));
  assert(row, `Missing canonical M8 task ${task}`);
  const criteria = row.trim().replace(/^\||\|$/g, '').split('|').at(-1).split(';').filter(value => value.trim());
  criteria.forEach((criterion, index) => assert.equal(m8Criteria.get(`${task}-AC${String(index + 1).padStart(2, '0')}`), criterion.trim().replace(/\s+/g, ' ').replace(/\.$/, ''), `M8 detail drift: ${task}`));
}
const m9 = await readFile('docs/milestones/m9-plan.md', 'utf8');
const m9Criteria = new Map([...m9.matchAll(/^- \*\*(T\d{2}-AC\d{2}):\*\* (.+)$/gm)].map(match => [match[1], match[2].trim().replace(/\s+/g, ' ').replace(/\.$/, '')]));
assert.equal(m9Criteria.size, 21);
for (let n = 66; n <= 69; n++) {
  const task = 'T' + n;
  const row = plan.split('\n').find(line => line.startsWith('| ' + task + ' '));
  assert(row, 'Missing M9 task ' + task);
  row.trim().replace(/^\||\|$/g, '').split('|').at(-1).split(';').filter(value => value.trim()).forEach((value, i) =>
    assert.equal(m9Criteria.get(task + '-AC' + String(i + 1).padStart(2, '0')), value.trim().replace(/\s+/g, ' ').replace(/\.$/, ''), 'M9 criterion drift'));
}
assert(plan.includes('Erster Milestone M1'));
assert(plan.includes('ResolvedEffectPlan'));
assert(plan.includes('Effektphasen als Fachstates'));
assert(plan.includes('Replay würfelt nicht neu'));
assert(plan.includes('WebGPU ist der Standard. WebGL2 ist als Three.js-Fallback erlaubt'));
assert(!plan.includes('Kein `webgl`-/`webgl2`-Kontext wird angefordert'));
assert(!plan.includes('Vorschau bleibt WebGPU-only'));
assert(plan.includes('kein Rollenableiten aus visueller Form'));
assert(plan.includes('TypeScript | 5.8.3 | 5.6.3 | 6.0.3'));
const multilingual = JSON.parse(await readFile('docs/decisions/m11-language-scores.json','utf8'));
assert.equal(multilingual.status,'adopted');
assert.equal(multilingual.weights.reduce((sum,n)=>sum+n,0),100);
assert.deepEqual(multilingual.decisions.map(row=>row.id).sort(), ['ARCH',...Array.from({length:8},(_,i)=>`M11-0${i+1}`)]);
for(const decision of multilingual.decisions){
  assert.deepEqual(Object.keys(decision.options).sort(),['A','B','H']);
  for(const option of Object.values(decision.options)){
    assert.equal(option.ratings.length,multilingual.weights.length);
    assert(option.ratings.every(n=>Number.isInteger(n)&&n>=1&&n<=5));
    assert.equal(option.score,option.ratings.reduce((sum,r,i)=>sum+r*multilingual.weights[i],0)/5);
  }
  assert.equal(decision.options[decision.winner].score,Math.max(...Object.values(decision.options).map(option=>option.score)));
}
const rootManifest = JSON.parse(await readFile('package.json', 'utf8'));
assert.equal(rootManifest.devDependencies['@enmera/ai-design-check'], '0.9.0');
for (const name of ['contracts', 'core', 'webgpu', 'react']) {
  const manifest = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
  assert(!manifest.dependencies?.['@enmera/ai-design-check'], 'The design checker must remain build tooling');
}
assert(plan.includes('QualityReport'));
for (const contract of ['StoryDefinition','ThemeDefinition','PresentationProjection','FrameCaptureManifest','RehearsalReport','AIReviewBundle','AIReviewFinding']) assert(plan.includes(contract));
assert(plan.includes('inconclusive'));
assert(plan.includes('AI-Kritik'));
for (const name of ['contracts','core','webgpu','react']) {
  const manifest = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
  assert(!manifest.dependencies?.stageshow, 'The DOM illustration kit must not become a Fluid renderer dependency');
}
const structuralPlan = await readFile('docs/milestones/structural-transitions.md', 'utf8');
const structuralRows = [...structuralPlan.matchAll(/^\| (R[1-6]-AC\d\d) \| (T\d\d) \| (.+) \|$/gm)];
const acceptance = JSON.parse(await readFile('docs/acceptance/ledger.json', 'utf8'));
assert.equal(structuralRows.length, 13);
for (const [, id, task, criterion] of structuralRows) {
  assert(definitions.includes(task));
  assert(acceptance.criteria.some(item => item.id === id && item.task === task && item.criterion === criterion));
}
console.info(`Plan v2.6 consistent: ${definitions.length} unique tasks, reproducible option scores, 41 M8, 21 M9 and 13 structural criteria, eight M11 task decisions and feature matrix, explicit visual gates and dependency boundaries.`);
