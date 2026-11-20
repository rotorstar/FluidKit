/**
 * node --import tsx scripts/m8-evidence.ts --out docs/qa/.../matrix
 *   [--assets knowledge/public/assets] [--bind observed-environment.json] eight-original-reports.json...
 * No browser use, source rewriting, image rendering or report mutation.
 */
import { M8QualificationSchema, M8_DIRECTIONS, M8_EFFECT_IDS, M8_PHASES } from '@fluidkit/contracts';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync, gunzipSync } from 'node:zlib';

const WIDTHS = [320, 390, 768, 1280] as const;
const BACKENDS = ['webgpu', 'webgl2'] as const;
const MAX_REPORT_BYTES = 128 * 1024 * 1024;
const sha = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
const caseKey = (item: { effect: string; source: string; target: string }) => `${item.effect}:${item.source}:${item.target}`;
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  return crc >>> 0;
});
const sorted = (values: readonly string[]) => [...values].sort();
const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

/** Decode the original bytes only; no image re-encoding. Chunk CRCs check archival integrity. */
export function readOriginalPng(image: string, width: number, height: number) {
  const prefix = 'data:image/png;base64,';
  if (!image.startsWith(prefix)) throw new Error('Expected an original PNG data URL.');
  const encoded = image.slice(prefix.length);
  const bytes = Buffer.from(encoded, 'base64');
  if (bytes.toString('base64') !== encoded || !bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) throw new Error('Invalid PNG bytes.');
  let offset = 8, header = false, data = false, ended = false;
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) throw new Error('Truncated PNG chunk.');
    const length = bytes.readUInt32BE(offset), end = offset + length + 12;
    if (end > bytes.length) throw new Error('Truncated PNG payload.');
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    let crc = 0xffffffff;
    for (let i = offset + 4; i < end - 4; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]!) & 255]!;
    }
    if (((crc ^ 0xffffffff) >>> 0) !== bytes.readUInt32BE(end - 4)) throw new Error('PNG chunk checksum mismatch.');
    if (!header) {
      if (type !== 'IHDR' || length !== 13 || bytes.readUInt32BE(offset + 8) !== width || bytes.readUInt32BE(offset + 12) !== height) throw new Error('PNG dimensions disagree with captured frame metadata.');
      header = true;
    } else if (type === 'IHDR') throw new Error('Duplicate PNG header.');
    if (type === 'IDAT') data = true;
    if (type === 'IEND') {
      if (length || end !== bytes.length) throw new Error('Invalid PNG ending.');
      ended = true;
    }
    offset = end;
  }
  if (!header || !data || !ended) throw new Error('Incomplete PNG.');
  return bytes;
}

export function summarizeM8Report(input: unknown) {
  const report = M8QualificationSchema.parse(input);
  let nativeMaxDeviation = 0, imageBytes = 0, nativeObservationCount = 0, textErrors = 0, textWarnings = 0;
  const cases = report.cases.map(item => {
    const plan = item.recording.plan;
    if (!plan) throw new Error('Matrix case is missing its resolved presentation plan.');
    const frames = item.samples.map(sample => {
      const png = readOriginalPng(sample.frame.image, sample.frame.pixelWidth, sample.frame.pixelHeight);
      imageBytes += png.length;
      for (const observation of sample.nativeTargets.observations) {
        nativeObservationCount++;
        if (observation.maxDeviation !== null) nativeMaxDeviation = Math.max(nativeMaxDeviation, observation.maxDeviation);
      }
      for (const issue of sample.textAudit.issues) {
        if (issue.severity === 'error') textErrors++; else textWarnings++;
      }
      return { id: sample.frame.id, phase: sample.frame.progress, pixelWidth: sample.frame.pixelWidth, pixelHeight: sample.frame.pixelHeight, bytes: png.length, sha256: sha(png) };
    });
    return { key: caseKey(item), effect: item.effect, source: item.source, target: item.target, revision: item.revision,
      recipe: plan.selected, parameters: plan.parameters, seed: plan.seed,
      frames, issues: item.issues };
  });
  return { buildId: report.buildId, generatedAt: report.generatedAt, backend: report.backend, browser: report.browser, surface: report.surface,
    dataVersion: report.dataVersion, dataSource: report.dataSource, moduleIds: sorted(report.moduleIds), selectedIds: sorted(report.selectedIds),
    result: report.result, issues: report.issues, cases, imageBytes, nativeObservationCount, nativeMaxDeviation, textErrors, textWarnings };
}
export type M8EvidenceSummary = ReturnType<typeof summarizeM8Report>;

export function qualifyM8Matrix(reports: readonly M8EvidenceSummary[]) {
  const issues: string[] = [], comparisonIssues: string[] = [], seen = new Set<string>();
  const reference = reports[0];
  const expectedCases = M8_EFFECT_IDS.flatMap(effect => M8_DIRECTIONS.map(([source, target]) => `${effect}:${source}:${target}`)).sort();
  for (const report of reports) {
    const key = `${report.backend}:${report.browser.width}`;
    if (seen.has(key)) issues.push(`Duplicate backend/width: ${key}`);
    seen.add(key);
    if (!BACKENDS.includes(report.backend) || !WIDTHS.some(width => width === report.browser.width)) issues.push(`Unplanned backend/width: ${key}`);
    if (reference && report.buildId !== reference.buildId) issues.push(`Mixed build: ${key}`);
    if (reference && (!equal(report.moduleIds, reference.moduleIds) || !equal(report.selectedIds, reference.selectedIds) || report.dataSource !== reference.dataSource)) issues.push(`Dataset metadata or selection differs: ${key}`);
    if (!equal(report.cases.map(item => item.key).sort(), expectedCases)) issues.push(`Incomplete case coverage: ${key}`);
    if (report.cases.some(item => !equal(item.frames.map(frame => frame.phase), [...M8_PHASES]))) issues.push(`Incomplete phases: ${key}`);
    if (report.result !== 'passed') issues.push(`Original report is ${report.result}: ${key}`);
    for (const item of report.cases) {
      const baseline = reference?.cases.find(candidate => candidate.key === item.key);
      if (baseline && (!equal(item.recipe, baseline.recipe) || !equal(item.parameters, baseline.parameters))) issues.push(`Recipe/parameters differ: ${key}/${item.key}`);
      if (baseline && item.seed !== baseline.seed) comparisonIssues.push(`Resolved seed differs: ${key}/${item.key}`);
    }
  }
  const missing = BACKENDS.flatMap(backend => WIDTHS.map(width => `${backend}:${width}`)).filter(key => !seen.has(key));
  issues.push(...missing.map(key => `Missing backend/width: ${key}`));
  if (reports.length !== 8) issues.push(`Expected eight original reports, received ${reports.length}.`);
  return { result: issues.length ? 'incomplete-or-failed' as const : 'automated-checks-passed' as const, buildId: reference?.buildId ?? null,
    reports: reports.length, cases: reports.reduce((sum, report) => sum + report.cases.length, 0),
    checkpoints: reports.reduce((sum, report) => sum + report.cases.reduce((count, item) => count + item.frames.length, 0), 0),
    expectedReports: 8, expectedCases: 144, expectedCheckpoints: 720, missing, issues,
    maximumNativeDeviationCssPx: Math.max(0, ...reports.map(report => report.nativeMaxDeviation)),
    manualVisualReview: 'pending' as const, nativeJourneys: 'separate-evidence-required' as const,
    datasetCorrelation: 'module IDs, selected IDs and source metadata; no full dataset hash exists in this report version',
    dataVersions: [...new Set(reports.map(report => report.dataVersion))],
    sameSeedComparison: comparisonIssues.length ? 'not-qualified' as const : 'metadata-matches' as const, comparisonIssues,
  };
}

async function preserve(path: string, bytes: Uint8Array) {
  await mkdir(dirname(path), { recursive: true });
  try { await writeFile(path, bytes, { flag: 'wx' }); }
  catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error;
    if (!Buffer.from(await readFile(path)).equals(Buffer.from(bytes))) throw new Error(`Refusing to overwrite different evidence: ${path}`);
  }
}

export async function assembleM8Evidence(options: { files: readonly string[]; out: string; assets?: string; bindings?: readonly string[] }) {
  if (!options.files.length || options.files.length > 8) throw new Error('Supply one to eight original reports; only all eight can qualify the matrix.');
  const summaries: M8EvidenceSummary[] = [], archives = [], images = [];
  const out = resolve(options.out), assetDirectory = options.assets ? resolve(options.assets) : null;
  for (const input of options.files) {
    const originalPath = resolve(input);
    if ((await stat(originalPath)).size > MAX_REPORT_BYTES) throw new Error('Original report exceeds the bounded archive size.');
    const bytes = await readFile(originalPath), originalHash = sha(bytes);
    const raw: unknown = JSON.parse(bytes.toString('utf8'));
    const report = M8QualificationSchema.parse(raw), summary = summarizeM8Report(report);
    const gzip = gzipSync(bytes, { level: 9 });
    if (sha(gunzipSync(gzip)) !== originalHash) throw new Error('Gzip roundtrip altered the source report.');
    const filename = `${report.backend}-${report.browser.width}-${originalHash.slice(0, 12)}.json.gz`;
    await preserve(resolve(out, filename), gzip);
    archives.push({ originalPath, originalBytes: bytes.length, originalSha256: originalHash, archive: filename, archiveBytes: gzip.length, archiveSha256: sha(gzip) });
    summaries.push(summary);
    // Select real endpoint states, plus an actual midpoint for each new recipe. Keep original PNG bytes.
    if (assetDirectory && report.result === 'passed' && report.backend === 'webgpu' && [390, 1280].includes(report.browser.width)) {
      const requests = [
        { effect: 'silk-cascade', source: 'table', target: 'cards', phase: 0, label: 'table' },
        { effect: 'silk-cascade', source: 'table', target: 'cards', phase: 1, label: 'cards' },
        { effect: 'particle-weave', source: 'cards', target: 'map', phase: 1, label: 'map' },
        ...M8_EFFECT_IDS.map(effect => ({ effect, source: 'table', target: 'cards', phase: .5, label: `${effect}-midpoint` })),
      ];
      for (const request of requests) {
        const item = report.cases.find(item => item.effect === request.effect && item.source === request.source && item.target === request.target);
        const sample = item?.samples.find(sample => sample.frame.progress === request.phase);
        if (!item || !sample) throw new Error('Representative checkpoint is missing.');
        const png = readOriginalPng(sample.frame.image, sample.frame.pixelWidth, sample.frame.pixelHeight);
        const name = `m8-${request.label}-${report.browser.width}-${report.buildId.replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 60)}.png`;
        await preserve(resolve(assetDirectory, name), png);
        images.push({ path: relative(process.cwd(), resolve(assetDirectory, name)), sha256: sha(png), sourceSha256: originalHash, buildId: report.buildId,
          backend: report.backend, browser: report.browser, surface: report.surface, case: caseKey(item), phase: request.phase, frameId: sample.frame.id,
          pixelWidth: sample.frame.pixelWidth, pixelHeight: sample.frame.pixelHeight, transformation: 'none-original-png-bytes', review: 'not-yet-visually-reviewed' });
      }
    }
  }
  const bindings = [];
  for (const path of options.bindings ?? []) { const bytes = await readFile(path); bindings.push({ path: resolve(path), sha256: sha(bytes), bytes: bytes.length, interpretation: 'External supplied evidence; content is not independently validated by this matrix assembler.' }); }
  const summary = { schemaVersion: 1, kind: 'm8-matrix-evidence-assembly', recordedAt: new Date().toISOString(), qualification: qualifyM8Matrix(summaries),
    script: { path: relative(process.cwd(), fileURLToPath(import.meta.url)), sha256: sha(await readFile(fileURLToPath(import.meta.url))) },
    archives, reports: summaries, representativeImages: images, bindings,
    limitations: ['Original downloads are read only; gzip archives preserve their exact bytes.', 'Five checkpoints per transition are not a complete temporal recording.',
      'Canonical schema and PNG chunk integrity do not constitute a manual visual review.', 'DOMRect measurements and programmatic setup events are not native input journeys.',
      'This matrix format has no hardware identifier or full dataset payload hash. Bind separately observed evidence when available.'] };
  const resultBytes = Buffer.from(`${JSON.stringify(summary, null, 2)}\n`);
  const resultPath = resolve(out, `assembly-${sha(resultBytes).slice(0, 12)}.json`);
  await preserve(resultPath, resultBytes);
  return { resultPath, summary };
}

async function main(args: readonly string[]) {
  const files: string[] = [], bindings: string[] = []; let out: string | undefined, assets: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const value = args[index]!;
    if (['--out', '--assets', '--bind'].includes(value)) {
      const target = args[++index]; if (!target || target.startsWith('--')) throw new Error(`Missing value for ${value}`);
      if (value === '--out') out = target; else if (value === '--assets') assets = target; else bindings.push(target);
    } else if (value.startsWith('--')) throw new Error(`Unknown option: ${value}`); else files.push(value);
  }
  if (!out) throw new Error('Usage: node --import tsx scripts/m8-evidence.ts --out directory [--assets directory] [--bind evidence.json] original-report.json...');
  const result = await assembleM8Evidence({ files, out, assets, bindings });
  console.log(JSON.stringify({ path: result.resultPath, ...result.summary.qualification }, null, 2));
  if (result.summary.qualification.result !== 'automated-checks-passed') process.exitCode = 2;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Evidence assembly failed.'); process.exitCode = 1; });
}
