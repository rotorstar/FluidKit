import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { stringify } from 'yaml';
import { ENGINEERING_TOPICS, PUBLIC_TOPICS, topicsForSource } from './config';
import { parseConcept } from './format';
import type { AcceptanceCriterion } from '../../packages/contracts/src/acceptance';

export const digest = (input: string | Uint8Array) => createHash('sha256').update(input).digest('hex');
export async function walk(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (['node_modules','dist','.next','generated','.git','coverage','qa'].includes(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walk(path)); else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}
export async function sourcePaths(root=process.cwd()) {
  const roots = (await Promise.all(['packages','apps/studio','scripts','tests','knowledge/editions'].map(path=>walk(join(root,path))))).flat().map(path=>relative(root,path)).filter(path=>!path.startsWith('apps/studio/public/knowledge/'));
  const documents=(await walk(join(root,'docs'))).map(path=>relative(root,path)).filter(path=>/\.(?:md|mmd|json)$/.test(path));
  return [...new Set([...roots.filter(path => /\.(?:ts|tsx|mjs|js|json|css|html)$/.test(path) && !path.endsWith('next-env.d.ts')), ...documents, 'README.md','package.json','package-lock.json','tsconfig.json','vitest.config.ts','eslint.config.mjs','design-quality.config.json','font-bake.config.json', 'docs/qa/2026-11-02-openai/verification.json','docs/qa/2026-11-02-openai/secret-boundary.json','docs/qa/2026-11-02-openai/brief-injection-v1.json','docs/qa/2026-11-02-openai/final-layout-matrix.json','docs/qa/2026-11-02-m6/lifecycle-100.json'])].sort();
}
function metadata(type: string, title: string, description: string, generatedAt: string) {
  return { type, title, description, audience: 'engineering', tags: ['reference','generated'], status: 'draft', generated: { by: 'process:fluidkit-knowledge-sync', at: generatedAt }, stale_after: '2026-12-02T00:00:00Z', sources: [{ id: 'implementation', resource: 'assets/source-inventory.json', title: 'SHA-gebundenes Quellinventar' }] };
}
/** Preserve every canonical group, including milestone, global and architecture gates. */
export function renderAcceptanceSections(criteria: readonly AcceptanceCriterion[], features: Readonly<Record<string, { feature: string }>>) {
  const groups = [...new Set([...Object.keys(features), ...criteria.map(item => item.task)])];
  return groups.map(id => `## ${id}: ${features[id]?.feature ?? id}\n\n` + criteria.filter(ac => ac.task === id).map(ac => `### ${ac.id} · ${ac.status}\n\n${ac.criterion}\n\n**Scope:** ${ac.scope}\n\n**Offen:** ${ac.remaining || 'Im bezeichneten Scope kein Restpunkt eingetragen.'}\n\n${ac.evidence.length ? ac.evidence.map(e => `- Nachweis: \`${e.path}\`, SHA-256 \`${e.sha256}\``).join('\n') : 'Kein Nachweis im Register.'}`).join('\n\n')).join('\n\n');
}
export async function syncKnowledge() {
  const epoch = process.env.SOURCE_DATE_EPOCH;
  if (epoch !== undefined && !/^\d+$/.test(epoch)) throw new Error('SOURCE_DATE_EPOCH must be a Unix timestamp in whole seconds.');
  const generatedAt = (epoch === undefined ? new Date() : new Date(Number(epoch) * 1000)).toISOString();
  const files = await sourcePaths();
  const entries = await Promise.all(files.map(async path => ({ path, sha256: digest(await readFile(path)), concepts: topicsForSource(path) })));
  let sourceCommit: string | null = null;
  if (existsSync('.git')) {
    const head = spawnSync('git', ['rev-parse','--quiet','--verify','HEAD'], { encoding: 'utf8' });
    if (head.error) throw head.error;
    if (head.status === 0) sourceCommit = head.stdout.trim();
    else if (head.status !== 1) throw new Error('Cannot read the current Git revision.');
  }
  const inventory = { schemaVersion: 1, generatedAt, sourceCommit, semantics: 'Working-tree source hashes are authoritative. Commit identifies the baseline; knowledge changes may be uncommitted.', files: entries };
  await writeFile('knowledge/engineering/assets/source-inventory.json', JSON.stringify(inventory,null,2)+'\n');
  const exports: { name: string; path: string; line: number; kind: string; declaration: string }[] = [];
  for (const entry of entries.filter(entry => /packages\/[^/]+\/src\/.*\.tsx?$/.test(entry.path))) {
    const text = await readFile(entry.path,'utf8'); const source = ts.createSourceFile(entry.path,text,ts.ScriptTarget.Latest,true);
    for (const statement of source.statements) {
      if (!ts.canHaveModifiers(statement) || !ts.getModifiers(statement)?.some(modifier => modifier.kind===ts.SyntaxKind.ExportKeyword)) continue;
      const position = source.getLineAndCharacterOfPosition(statement.getStart(source));
      if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) exports.push({ name: declaration.name.getText(source), path:entry.path,line:position.line+1,kind:'const',declaration:declaration.getText(source) });
      else if ((ts.isFunctionDeclaration(statement)||ts.isClassDeclaration(statement)||ts.isInterfaceDeclaration(statement)||ts.isTypeAliasDeclaration(statement)) && statement.name) {
        const declaration = ts.isFunctionDeclaration(statement) && statement.body ? statement.getText(source).slice(0,statement.body.getStart(source)-statement.getStart(source)).trim() : statement.getText(source);
        exports.push({ name:statement.name.text,path:entry.path,line:position.line+1,kind:ts.SyntaxKind[statement.kind],declaration });
      }
    }
  }
  const rows = exports.map(symbol => `| \`${symbol.name}\` | ${symbol.kind} | \`${symbol.path}:${symbol.line}\` |`).join('\n');
  const schemaSections = exports.filter(symbol => /Schema$/.test(symbol.name)).map(symbol => `## ${symbol.name}\n\nQuelle: \`${symbol.path}:${symbol.line}\`.\n\n\`\`\`typescript\n${symbol.declaration}\n\`\`\``).join('\n\n');
  const refBody = `# Export-Referenz\n\nAutomatisch aus den direkt exportierten Quelldeklarationen ermittelt. Ein Export in einer internen Datei ist nicht automatisch ein veröffentlichter Package-Entry. Die Packages verwenden derzeit private Workspace-/Source-Exports. Vollständige Feldverträge stehen in der [Schema-Referenz](schema-reference.md); Verhalten in [Core](core-runtime.md), [Renderer](rendering.md) und [Daten](data-actions.md).[^implementation]\n\n| Name | Deklaration | Quellposition |\n|---|---|---|\n${rows}\n\n## Paket-Einstiegspunkte\n\n`;
  const packages=[];
  for(const entry of await readdir('packages',{withFileTypes:true})) {if(!entry.isDirectory())continue;const path=`packages/${entry.name}/package.json`; const pkg=JSON.parse(await readFile(path,'utf8')) as {name:string;exports?:unknown};packages.push(`### ${pkg.name}\n\n\`\`\`json\n${JSON.stringify(pkg.exports??{},null,2)}\n\`\`\``); }
  const signatures=exports.filter(symbol=>symbol.kind!=='const').map(symbol=>`### ${symbol.name}\n\nQuelle: \`${symbol.path}:${symbol.line}\`.\n\n\`\`\`typescript\n${symbol.declaration}\n\`\`\``).join('\n\n');
  await writeFile('knowledge/engineering/api-reference.md','---\n'+stringify(metadata('API Reference','API-Exportreferenz','Sämtliche direkt exportierten Deklarationen und tatsächlichen Package-Einstiegspunkte.', generatedAt))+'---\n\n'+refBody+packages.join('\n\n')+'\n\n## Signaturen und Typverträge\n\nAus der AST gelesene Signaturen, Interfaces und Typableitungen. Inferenz bleibt Inferenz; Rückgabemethoden sind zusätzlich im jeweiligen Laufzeitkonzept beschrieben. Konstante Schemas stehen vollständig in der Schema-Referenz.\n\n'+signatures+'\n\n[^implementation]: Quellinventar mit SHA-256 je Datei.\n');
  await writeFile('knowledge/engineering/schema-reference.md','---\n'+stringify(metadata('Schema Reference','Ausführbare Datenverträge','Vollständige Zod-Schemadeklarationen aus dem aktuellen Quellstand.', generatedAt))+'---\n\n# Schema-Referenz\n\nDiese Deklarationen werden aus dem Code gelesen und nicht redaktionell nachgebildet. Verhalten und Invarianten erläutert [Verträge](contracts.md).[^implementation]\n\n'+schemaSections+'\n\n[^implementation]: Quellinventar mit SHA-256 je Datei.\n');
  const sourceBody = '# Quellabdeckung\n\nDas Inventar umfasst Runtime, Studio, Werkzeuge, Tests, Manifeste und kanonische Statusregister. Legacy-Prototyp, installierte Abhängigkeiten und generierte Builddateien sind keine aktive Implementierungsquelle. Ein Konzeptbezug beweist thematische Erschließung, keine vollständige Produktabnahme.[^implementation]\n\n| Quelldatei | SHA-256, gekürzt | Konzepte |\n|---|---|---|\n'+entries.map(entry=>`| \`${entry.path}\` | \`${entry.sha256.slice(0,16)}\` | ${entry.concepts.map(id=>`[${id}](${id}.md)`).join(', ')} |`).join('\n')+'\n\n[^implementation]: Vollständige Hashes im maschinenlesbaren Quellinventar.\n';
  await writeFile('knowledge/engineering/source-map.md','---\n'+stringify(metadata('Coverage Map','Quellen und Dokumentationsabdeckung','Jede aktive Quelldatei ist belegten Engineering-Konzepten zugeordnet.', generatedAt))+'---\n\n'+sourceBody);
  const features=JSON.parse(await readFile('docs/feature-status.json','utf8')) as Record<string,{feature:string;status:string;evidence:string;remaining:string}>;
  const tableCell=(text:string)=>text.replace(/\|/g,'\\|').replace(/\n/g,' ');
  const matrix='# Vollständige Feature-Matrix\n\nAus dem kanonischen Task-Register erzeugt. „Proof“ ist auf den dokumentierten Showcase begrenzt; „Teilweise“ und „Geplant“ erfüllen noch nicht alle Releasekriterien. Der detaillierte [AC-Abgleich](acceptance-reference.md) bleibt entscheidend.[^implementation]\n\n| Task | Feature | Status | Nachweis | Offen |\n|---|---|---|---|---|\n'+Object.entries(features).map(([id,row])=>`| ${id} | ${tableCell(row.feature)} | ${row.status} | ${tableCell(row.evidence)} | ${tableCell(row.remaining)} |`).join('\n');
  await writeFile('knowledge/engineering/feature-matrix.md','---\n'+stringify(metadata('Feature Matrix','Alle Features und offenen Arbeiten',`Vollständige ${Object.keys(features).length}-Task-Matrix mit Ist-Status, Nachweisen und Restumfang.`, generatedAt))+'---\n\n'+matrix+'\n\n[^implementation]: Kanonisches Task-Register im Quellinventar.\n');
  const ledger=JSON.parse(await readFile('docs/acceptance/ledger.json','utf8')) as {criteria:AcceptanceCriterion[]};
  const acs='# Sämtliche Acceptance Criteria\n\nDiese Referenz übernimmt jedes Kriterium aus dem kanonischen Register einschließlich Scope und Restarbeiten. Sie wertet nichts als erfüllt auf. SHA-256 bindet Nachweise an den dort geprüften Stand. Die Originalartefakte liegen im Repository; sie werden nicht als unkontrollierte Run-/Bilddaten in den portablen Kontext kopiert.[^implementation]\n\n'+renderAcceptanceSections(ledger.criteria,features);
  await writeFile('knowledge/engineering/acceptance-reference.md','---\n'+stringify(metadata('Acceptance Register','Alle Acceptance Criteria und Abweichungen',`${ledger.criteria.length} Kriterien mit tatsächlichem Status, Scope, Belegen und Restarbeiten.`, generatedAt))+'---\n\n'+acs+'\n\n[^implementation]: Kanonisches AC-Register und gebundene Nachweise im Quellinventar.\n');
  for(const [audience,topics]of [['engineering',ENGINEERING_TOPICS],['public',PUBLIC_TOPICS]] as const) {
    const links=[];
    for(const topic of topics){const doc=parseConcept(`${topic}.md`,await readFile(`knowledge/${audience}/${topic}.md`,'utf8'));links.push(`- [${doc.metadata.title}](${topic}.md) - ${doc.metadata.description}`);}
    await writeFile(`knowledge/${audience}/index.md`,`---\nokf_version: "0.2"\n---\n\n# FluidKit ${audience==='engineering'?'Engineering Knowledge':'Public — Bedienungsanleitung'}\n\n`+links.join('\n')+'\n');
  }
  await writeFile('knowledge/engineering/assets/api-inventory.json',JSON.stringify({schemaVersion:1,exports:exports.map(({declaration:_declaration,...symbol})=>symbol)},null,2)+'\n');
  console.info(JSON.stringify({sourceFiles:entries.length,exportedDeclarations:exports.length,schemas:exports.filter(symbol=>/Schema$/.test(symbol.name)).length}));
}
if(process.argv[1]?.endsWith('/sync.ts')) await syncKnowledge();
