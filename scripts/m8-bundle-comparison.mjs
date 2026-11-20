import { build, version as esbuildVersion } from 'esbuild';
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Isolated public-API comparison, not a Next application bundle measurement.
// No install, package mutation, browser execution or persisted vendor bundle.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const qa = resolve(root, 'docs/qa/2026-11-13-m8');
const sha = content => createHash('sha256').update(content).digest('hex');
const read = path => readFile(resolve(root, path));
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const config = {
  bundle: true, minify: true, treeShaking: true, platform: 'browser', format: 'esm', target: 'es2022',
  jsx: 'automatic', jsxImportSource: 'react', define: { 'process.env.NODE_ENV': '"production"' },
  mainFields: ['browser', 'module', 'main'], conditions: ['browser', 'import', 'default'],
  external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
  legalComments: 'eof', sourcemap: false, charset: 'utf8', metafile: true, write: false, logLevel: 'silent',
};
const controls = {
  tabs: ['TabsSample'], select: ['SelectSample'], dialog: ['DialogSample'],
  combined: ['TabsSample', 'SelectSample', 'DialogSample'],
};
const common = `export const VIEWS = [
  { value: 'table', label: 'Tabelle' }, { value: 'cards', label: 'Karten' },
  { value: 'map', label: 'Map' }, { value: 'detail', label: 'Detail' },
];
export const GROUPS = [
  { value: 'all', label: 'Alle Ebenen' }, { value: 'Kernel', label: 'Kernel' },
  { value: 'Adapter', label: 'Adapter' }, { value: 'Tooling', label: 'Tooling' },
];
export type Props = {
  view: string; group: string; dialogOpen: boolean; hasSelection: boolean;
  changeView(value: unknown): boolean; changeGroup(value: unknown): boolean;
  onDialogOpenChange(open: boolean, reason: string): void;
};
export function Inspector({ view, group }: Props) {
  return <dl><div><dt>Ansicht</dt><dd>{view}</dd></div><div><dt>Ebene</dt><dd>{group}</dd></div></dl>;
}
`;
const sources = {
  'common.tsx': common,
  'ui-sdk.tsx': `import { Tabs, TabsList, TabsTab, TabsPanel } from '@ui-sdk/react/tabs';
import { Select, SelectLabel, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@ui-sdk/react/select';
import { Dialog, DialogTrigger, DialogBackdrop, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@ui-sdk/react/dialog';
import { VIEWS, GROUPS, Inspector, type Props } from './common';
export function TabsSample(props: Props) {
  return <Tabs value={props.view} activation="automatic" onValueChange={(value, details) => { if (!props.changeView(value)) details.cancel(); }}>
    <TabsList aria-label="Workspace-Ansicht">{VIEWS.map(view => <TabsTab key={view.value} value={view.value} disabled={view.value === 'detail' && !props.hasSelection}>{view.label}</TabsTab>)}</TabsList>
    {VIEWS.map(view => <TabsPanel key={view.value} value={view.value}>{view.label}</TabsPanel>)}
  </Tabs>;
}
export function SelectSample(props: Props) {
  return <Select value={props.group} items={GROUPS} onValueChange={(value, details) => { if (!props.changeGroup(value)) details.cancel(); }}>
    <SelectLabel>Modulebene</SelectLabel><SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent sideOffset={6}>{GROUPS.map(group => <SelectItem key={group.value} value={group.value}>{group.label}</SelectItem>)}</SelectContent>
  </Select>;
}
export function DialogSample(props: Props) {
  return <Dialog open={props.dialogOpen} onOpenChange={(open, details) => props.onDialogOpenChange(open, details.reason)}>
    <DialogTrigger>Kontext prüfen</DialogTrigger><DialogBackdrop />
    <DialogContent finalFocus="trigger"><DialogTitle>Derselbe Workspace-Zustand.</DialogTitle>
      <DialogDescription>Die Werte kommen direkt aus Fluid.</DialogDescription><Inspector {...props} /><DialogClose>Zurück zur Arbeitsfläche</DialogClose>
    </DialogContent>
  </Dialog>;
}
`,
  'base-ui.tsx': `import { Tabs } from '@base-ui/react/tabs';
import { Select } from '@base-ui/react/select';
import { Dialog } from '@base-ui/react/dialog';
import { VIEWS, GROUPS, Inspector, type Props } from './common';
export function TabsSample(props: Props) {
  return <Tabs.Root value={props.view} onValueChange={(value, details) => { if (!props.changeView(value)) details.cancel(); }}>
    <Tabs.List activateOnFocus aria-label="Workspace-Ansicht">{VIEWS.map(view => <Tabs.Tab key={view.value} value={view.value} disabled={view.value === 'detail' && !props.hasSelection}>{view.label}</Tabs.Tab>)}</Tabs.List>
    {VIEWS.map(view => <Tabs.Panel key={view.value} value={view.value}>{view.label}</Tabs.Panel>)}
  </Tabs.Root>;
}
export function SelectSample(props: Props) {
  return <Select.Root value={props.group} items={GROUPS} onValueChange={(value, details) => { if (!props.changeGroup(value)) details.cancel(); }}>
    <Select.Label>Modulebene</Select.Label><Select.Trigger><Select.Value /></Select.Trigger>
    <Select.Portal><Select.Positioner sideOffset={6}><Select.Popup>{GROUPS.map(group => <Select.Item key={group.value} value={group.value}><Select.ItemText>{group.label}</Select.ItemText></Select.Item>)}</Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root>;
}
export function DialogSample(props: Props) {
  return <Dialog.Root open={props.dialogOpen} onOpenChange={(open, details) => props.onDialogOpenChange(open, details.reason)}>
    <Dialog.Trigger>Kontext prüfen</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop />
      <Dialog.Popup><Dialog.Title>Derselbe Workspace-Zustand.</Dialog.Title>
        <Dialog.Description>Die Werte kommen direkt aus Fluid.</Dialog.Description><Inspector {...props} /><Dialog.Close>Zurück zur Arbeitsfläche</Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
`,
};

async function digestFile(path) { const contents = await read(path); return { path, sha256: sha(contents), bytes: contents.length }; }
function packageName(path) {
  const match = path.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return match?.[1] ?? null;
}
function compileSamples(files) {
  const program = ts.createProgram(files, {
    noEmit: true, strict: true, skipLibCheck: true, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2023, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, esModuleInterop: true,
    types: ['react', 'react-dom'],
  });
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length) throw new Error(ts.formatDiagnostics(diagnostics, {
    getCanonicalFileName: path => path, getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
}
async function measure(entry, expectedExports, label, directory) {
  const result = await build({ ...config, absWorkingDir: root, entryPoints: [resolve(root, entry)], outfile: resolve(directory, `${label}.js`) });
  const outputs = result.outputFiles.map(output => {
    const gzip = gzipSync(output.contents, { level: 9 });
    return { file: relative(root, output.path), bytes: output.contents.length, gzipBytes: gzip.length, sha256: sha(output.contents), gzipSha256: sha(gzip) };
  });
  const jsOutputs = Object.entries(result.metafile.outputs).filter(([path]) => path.endsWith('.js'));
  assert.equal(jsOutputs.length, 1, 'Expected one ESM JS output');
  assert.deepEqual([...jsOutputs[0][1].exports].sort(), [...expectedExports].sort(), 'Entry exports changed');
  const externalImports = [...new Set(Object.values(result.metafile.outputs).flatMap(output => output.imports.filter(input => input.external).map(input => input.path)))].sort();
  assert(externalImports.every(path => /^(react|react-dom)(\/|$)/.test(path)), 'Unexpected external dependency would hide bundle cost');
  const retained = Object.values(result.metafile.outputs).flatMap(output => Object.entries(output.inputs).filter(([, item]) => item.bytesInOutput > 0));
  const contributions = new Map();
  for (const [path, input] of retained) {
    const name = packageName(path) ?? '(sample adapter)';
    const current = contributions.get(name) ?? { name, bytesInOutput: 0, files: new Set() };
    current.bytesInOutput += input.bytesInOutput; current.files.add(path); contributions.set(name, current);
  }
  const packages = [...contributions.values()].map(value => ({ name: value.name, bytesInOutput: value.bytesInOutput, moduleCount: value.files.size })).sort((a, b) => b.bytesInOutput - a.bytesInOutput);
  assert(packages.some(value => value.name.startsWith('@ui-sdk/') || value.name === '@base-ui/react'), 'Candidate was incorrectly removed');
  const inputSources = await Promise.all(Object.keys(result.metafile.inputs).sort().map(digestFile));
  return { entry, expectedExports, outputs, rawBytes: outputs.reduce((sum, value) => sum + value.bytes, 0), gzipBytes: outputs.reduce((sum, value) => sum + value.gzipBytes, 0), externalImports,
    parsedModuleCount: inputSources.length, retainedModuleCount: new Set(retained.map(([path]) => path)).size,
    packages, warnings: result.warnings.map(warning => warning.text), inputSources, metafile: result.metafile };
}

const verify = process.argv[2] === '--verify';
if (process.argv.length > (verify ? 4 : 2)) throw new Error('Usage: node scripts/m8-bundle-comparison.mjs [--verify report.json]');
if (verify) {
  const file = resolve(root, process.argv[3] ?? 'docs/qa/2026-11-13-m8/bundle-comparison.json');
  const report = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(report.schemaVersion, 1); assert.deepEqual(report.buildConfig, config);
  assert.equal(report.tools.esbuild, esbuildVersion); assert.equal(report.tools.typescript, ts.version);
  assert.equal(report.cases.length, 8);
  assert.equal(new Set(report.cases.map(value => value.id)).size, 8);
  const manifests = [report.sourceLock, report.measurementScript, report.scriptArchive, report.configArchive,
    ...Object.values(report.versions).map(value => value.manifest), ...report.entrySources,
    ...report.cases.flatMap(value => [value.metafile, ...value.inputSources])];
  for (const item of new Map(manifests.map(item => [item.path, item])).values()) assert.equal(sha(await read(item.path)), item.sha256, `Changed input: ${item.path}`);
  compileSamples(report.entrySources.filter(item => item.path.endsWith('.tsx')).map(item => resolve(root, item.path)));
  for (const value of report.cases) {
    const next = await measure(value.entry, value.expectedExports, value.id, resolve(root, report.runDirectory, 'artifacts'));
    assert.deepEqual(next.outputs, value.outputs, `Bundle or gzip changed: ${value.id}`);
    for (const field of ['rawBytes', 'gzipBytes', 'packages', 'externalImports', 'parsedModuleCount', 'retainedModuleCount']) {
      assert.deepEqual(next[field], value[field], `Derived measurement changed: ${value.id}.${field}`);
    }
  }
  console.log(`Verified ${report.cases.length} paired bundles, output/gzip hashes and recorded inputs.`);
} else {
  const createdAt = new Date().toISOString();
  const measurementScript = await digestFile(relative(root, fileURLToPath(import.meta.url)));
  const sourceLock = await digestFile('package-lock.json');
  const runId = `${createdAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-${measurementScript.sha256.slice(0, 8)}`;
  const runDirectory = resolve(qa, 'bundle-runs', runId), inputs = resolve(runDirectory, 'inputs');
  await mkdir(inputs, { recursive: true });
  await writeFile(resolve(runDirectory, 'measurement-script.mjs'), await read(measurementScript.path));
  await writeFile(resolve(runDirectory, 'config.json'), json(config));
  for (const [path, source] of Object.entries(sources)) await writeFile(resolve(inputs, path), source);
  const entrySources = await Promise.all(Object.keys(sources).map(path => digestFile(relative(root, resolve(inputs, path)))));
  compileSamples(entrySources.map(item => resolve(root, item.path)));
  const cases = [];
  for (const library of ['ui-sdk', 'base-ui']) for (const [primitive, exports] of Object.entries(controls)) {
    const id = `${library}-${primitive}`, entry = relative(root, resolve(inputs, `${id}.tsx`));
    await writeFile(resolve(root, entry), `export { ${exports.join(', ')} } from './${library}';\n`);
    entrySources.push(await digestFile(entry));
    const measured = await measure(entry, exports, id, resolve(runDirectory, 'artifacts'));
    const metafile = relative(root, resolve(runDirectory, `${id}.meta.json`));
    await writeFile(resolve(root, metafile), json(measured.metafile));
    cases.push({ id, library, primitive, ...measured, metafile: await digestFile(metafile) });
  }
  assert.equal(sha(await read('package-lock.json')), sourceLock.sha256, 'Lockfile changed during measurement');
  const versions = {};
  for (const name of ['@ui-sdk/core', '@ui-sdk/react', '@base-ui/react', 'react', 'react-dom']) {
    const path = `node_modules/${name}/package.json`, manifest = JSON.parse(await readFile(resolve(root, path), 'utf8'));
    versions[name] = { version: manifest.version, manifest: await digestFile(path), peerDependencies: manifest.peerDependencies ?? {} };
  }
  const pairedDelta = Object.keys(controls).map(primitive => {
    const candidate = cases.find(item => item.library === 'ui-sdk' && item.primitive === primitive), baseline = cases.find(item => item.library === 'base-ui' && item.primitive === primitive);
    return { primitive, rawBytesUiSdkMinusBaseUi: candidate.rawBytes - baseline.rawBytes, gzipBytesUiSdkMinusBaseUi: candidate.gzipBytes - baseline.gzipBytes };
  });
  const report = {
    schemaVersion: 1, kind: 'isolated-public-react-primitives', createdAt, runDirectory: relative(root, runDirectory),
    referenceApplicationSource: await digestFile('apps/studio/components/behavior-comparison.tsx'),
    gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    sourceLock, measurementScript, entrySources,
    scriptArchive: await digestFile(relative(root, resolve(runDirectory, 'measurement-script.mjs'))),
    configArchive: await digestFile(relative(root, resolve(runDirectory, 'config.json'))),
    tools: { esbuild: esbuildVersion, typescript: ts.version, node: process.version, platform: process.platform, arch: process.arch, gzip: { level: 9, mode: 'per output asset; sum gzipBytes' } },
    versions, buildConfig: config,
    scope: { primitives: ['tabs', 'select', 'dialog'], shared: 'Identical controlled props, labels, options, disabled detail tab, automatic tabs and inspector content; each library uses its documented public parts.',
      excludes: ['React and React DOM peers', 'Fluid Core and WebGPU', 'Application CSS and CSS Modules', 'Next.js and application chunking', 'Runtime speed and accessibility qualification'],
      includes: ['Needed library-specific React parts and adapter markup', 'Retained transitive JavaScript dependencies', 'Library legal comments; library CSS if imported'],
      individualTotalsAreAdditive: false, inputBytesAreTransferBytes: false, vendorOutputsPersisted: false,
    },
    applicationDelta: { status: 'not-measured', reason: 'No paired Next.js production builds were made. Shared React chunks, current dual-library route, CSS, application dependencies and framework tree-shaking affect the real app delta.' },
    validation: { typescriptSamples: 'passed', expectedPublicExports: 'passed', externalImportAllowlist: 'passed', sourceLockStable: 'passed', replayCommand: `node scripts/m8-bundle-comparison.mjs --verify ${relative(root, resolve(runDirectory, 'report.json'))}` },
    cases, pairedDelta,
  };
  await writeFile(resolve(runDirectory, 'report.json'), json(report));
  await writeFile(resolve(qa, 'bundle-comparison.json'), json(report));
  const rows = Object.keys(controls).map(primitive => {
    const sdk = cases.find(item => item.library === 'ui-sdk' && item.primitive === primitive), base = cases.find(item => item.library === 'base-ui' && item.primitive === primitive);
    return `| ${primitive} | ${sdk.rawBytes.toLocaleString('en-US')} / ${sdk.gzipBytes.toLocaleString('en-US')} | ${base.rawBytes.toLocaleString('en-US')} / ${base.gzipBytes.toLocaleString('en-US')} | ${(sdk.gzipBytes - base.gzipBytes).toLocaleString('en-US')} |`;
  });
  const reportText = `# M8 / T62: isolierter Bundlevergleich\n\nMessung: ${createdAt}. UI SDK ${versions['@ui-sdk/react'].version}, Base UI ${versions['@base-ui/react'].version}.\n\nGemessen wurden öffentliche React-Adapter für Tabs, Select und Dialog: identische kontrollierte Props, Daten, Disabled-Tab, automatische Tab-Aktivierung und identischer Dialoginhalt. Die erforderlichen Parts unterscheiden sich gemäß öffentlicher API; Base UI benötigt beispielsweise ausdrückliche Portal-/Positioner-Parts. Die archivierten TypeScript-Beispiele wurden vor der Messung mit den installierten Paketen geprüft.\n\n| Entry | UI SDK: JS / gzip Bytes | Base UI: JS / gzip Bytes | gzip-Delta UI SDK − Base UI |\n|---|---:|---:|---:|\n${rows.join('\n')}\n\nAlle Entries verwenden exakt dieselbe esbuild-Konfiguration (ESM, Browser, ES2022, Production, Minify, Tree-Shaking, Legal Comments am Ende, keine Sourcemaps). React und React DOM einschließlich Subpaths bleiben bei beiden extern. Gemessen wird die tatsächlich erzeugte Ausgabe, gzip Level 9 je Ausgabe. Die Einzelwerte dürfen wegen gemeinsam genutzter Module nicht addiert werden. Retained- und Parsed-Module sind im JSON getrennt ausgewiesen. Die Ausgaben werden im Speicher gemessen; ihre Pfade im JSON sind logische Buildziele. Vendor-Bundles werden nicht archiviert, ihre Ausgabe- und gzip-Hashes dagegen vollständig.\n\nDie Werte enthalten Bibliothekscode, notwendige transitive Dependencies und den jeweiligen kleinen Adapter. Gemeinsame Styles und Fluid-/GPU-Code sind ausgeschlossen. Der Vergleich belegt weder Laufzeitgeschwindigkeit noch bessere Bedienbarkeit. Es wurde keine installierte Version geändert.\n\n**Das Next.js-Anwendungsdelta ist nicht gemessen.** Die tatsächliche Studio-Route enthält aktuell beide Kandidaten. Ihre gemeinsamen Chunks, React, CSS und Frameworkoptimierung erlauben keine direkte Übertragung dieser Bytes auf die Anwendung. Ein realer Austausch benötigt zwei identische Production-Builds mit jeweils genau einem Adapter.\n\nProvenienz: [versionierter Run](${relative(qa, runDirectory)}/report.json), [Konfiguration](${relative(qa, runDirectory)}/config.json), [Messdaten](bundle-comparison.json). Entry-Quellen, alle gebündelten Input-Hashes, Paketversionen, Lockfile, Script und esbuild-Metafiles sind aufgezeichnet. Hersteller-/App-Quellstand wird nicht allein durch einen Git-HEAD behauptet; der Arbeitsbaum wird über die tatsächlich gemessenen Hashes gebunden.\n\nReproduktion: \`${report.validation.replayCommand}\`. Diese Prüfung vergleicht Eingabe-, Ausgabe- und gzip-Hashes; sie installiert nichts.\n\nMethodenquellen: [esbuild Metafile](https://esbuild.github.io/api/#metafile), [externe Dependencies](https://esbuild.github.io/api/#external), [Tree Shaking](https://esbuild.github.io/api/#tree-shaking).\n`;
  await writeFile(resolve(qa, 'bundle-comparison.md'), reportText);
  console.log(json({ report: relative(root, resolve(qa, 'bundle-comparison.json')), cases: cases.map(({ id, rawBytes, gzipBytes }) => ({ id, rawBytes, gzipBytes })), pairedDelta, verify: report.validation.replayCommand }));
}
