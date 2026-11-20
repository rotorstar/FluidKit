/** Local, read-only macOS diagnostics. Never escalates itself, kills others, reads args/env or controls a browser. */
import { execFile, spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { cpus, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { DEFAULT_LOAD_POLICY, LoadPolicySchema, LoadReportSchema, LoadSampleSchema, LoadWindowSchema, type LoadGpu, type LoadReport, type LoadSample } from '../packages/contracts/src/load';
import { M8TimingReportSchema } from '../packages/contracts/src/m8-timing';
import { assessLoadWindow, classifyProcesses, parseGpuRegistry, parseMemoryCsv, parseProcessSnapshot, parseSwapCounters, parseTopCpu, pressureLevel, type ProcessObservation } from '../packages/testing/src/load';

const sha = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const env = { PATH: '/usr/bin:/bin:/usr/sbin:/sbin', LC_ALL: 'C', TZ: 'UTC', NODE_ENV: 'production' as const };
const children = new Set<ChildProcess>();
const GPU_PLIST_FILTER = `import json, plistlib, re, sys
root = plistlib.loads(sys.stdin.buffer.read())
visited = 0
def select(node):
 global visited
 visited += 1
 if visited > 10000: raise ValueError('node bound')
 if not isinstance(node, dict): return {}
 out = {}
 value = node.get('IORegistryEntryID')
 if type(value) is int and value >= 0: out['IORegistryEntryID'] = str(value)
 stats = node.get('PerformanceStatistics')
 if isinstance(stats, dict): out['PerformanceStatistics'] = {k: stats[k] for k in ['Device Utilization %', 'Renderer Utilization %', 'Tiler Utilization %'] if type(stats.get(k)) in [int, float]}
 creator = node.get('IOUserClientCreator')
 match = re.match(r'^pid\\s*(\\d+),', creator) if isinstance(creator, str) else None
 if match: out['IOUserClientCreator'] = 'pid' + match.group(1) + ','
 usage = node.get('AppUsage')
 if isinstance(usage, list): out['AppUsage'] = [{'API': row.get('API', 'unknown')[:40], 'accumulatedGPUTime': str(row['accumulatedGPUTime'])} for row in usage if isinstance(row, dict) and type(row.get('accumulatedGPUTime')) is int and isinstance(row.get('API', 'unknown'), str)]
 children = node.get('IORegistryEntryChildren')
 if isinstance(children, list): out['IORegistryEntryChildren'] = [select(child) for child in children]
 return out
if not isinstance(root, list): raise ValueError('root array')
json.dump([select(node) for node in root], sys.stdout)
`;
async function command(file: string, args: readonly string[], input?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(file, [...args], { env, timeout: 2500, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' }, (error, stdout) => {
      children.delete(child);
      if (error) reject(new Error(`Read-only ${file.split('/').at(-1)} probe unavailable.`)); else resolve(stdout);
    });
    children.add(child);
    if (input !== undefined) child.stdin?.end(input);
  });
}
const unavailableGpu = (): LoadGpu => ({ source: 'ioreg-IOAccelerator-private', attribution: 'unavailable', counterUnit: 'unknown', adapters: [], clients: [], issues: ['GPU registry unavailable.'] });

/** top's sample count is not elapsed time: sampling work adds to its -s delay. */
export function awaitTopCompletion(top: ChildProcess, durationMs: number, controls: { isAborted: () => boolean; terminateOwned: () => void }): Promise<string[]> {
  return new Promise(resolve => {
    let plannedStop = false, settled = false;
    const finish = (issues: string[]) => {
      if (settled) return;
      settled = true;
      clearTimeout(planned); clearTimeout(watchdog);
      top.removeListener('error', onError); top.removeListener('close', onClose);
      resolve(issues);
    };
    const onError = () => finish(['Top unavailable.']);
    const onClose = (code: number | null) => finish(code !== 0 && !plannedStop && !controls.isAborted() ? ['Top did not finish normally.'] : []);
    const planned = setTimeout(() => { plannedStop = true; top.kill('SIGTERM'); }, durationMs);
    const watchdog = setTimeout(() => { controls.terminateOwned(); finish(['Collector exceeded its bounded duration.']); }, durationMs + 10000);
    top.once('error', onError); top.once('close', onClose);
  });
}
export async function collectLoad(options: { out: string; seconds: number; baselineMs: number; afterMs: number; targetPids: number[]; toolingPids: number[]; powermetrics?: string }) {
  if (process.platform !== 'darwin') throw new Error('This collector is qualified only for the installed macOS interfaces.');
  if (!Number.isInteger(options.seconds) || options.seconds < 5 || options.seconds > 300) throw new Error('Duration must be5–300 seconds.');
  if ([...options.targetPids, ...options.toolingPids].some(pid => !Number.isInteger(pid) || pid <= 0) || options.targetPids.length > 32 || options.toolingPids.length > 32) throw new Error('Invalid explicit PID configuration.');
  const out = resolve(options.out), partial = `${out}.samples.jsonl`;
  try { await stat(out); throw new Error('Output already exists; original observations must not be overwritten.'); }
  catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error; }
  const policy = LoadPolicySchema.parse({ ...DEFAULT_LOAD_POLICY, baselineMs: options.baselineMs, afterMs: options.afterMs });
  const policySha256 = sha(JSON.stringify(policy));
  const directory = await mkdtemp(join(tmpdir(), 'fluid-load-')), memoryPath = join(directory, 'memory.csv');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(partial, `${JSON.stringify({ schemaVersion: 1, kind: 'load-policy-start', policy, policySha256, targetPids: options.targetPids, toolingPids: options.toolingPids })}\n`, { flag: 'wx', mode: 0o600 });
  const startedAt = new Date().toISOString(), logicalCpus = cpus().length, samples: LoadSample[] = [], issues: string[] = [];
  let previousProcesses: ProcessObservation[] = [], previous: LoadSample | undefined, busy = false, aborted = false, failed = false, baselineAnnounced = false;
  let pending = Promise.resolve();
  const stop = () => { aborted = true; for (const child of children) child.kill('SIGTERM'); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  console.info(JSON.stringify({ state: 'collecting', startedAt, policySha256, collectorPid: process.pid, baselineMs: policy.baselineMs, gpuQualification: 'diagnostic-only' }));
  async function take(cpu: ReturnType<typeof parseTopCpu>, initial: boolean) {
    const begin = performance.now(), errors: string[] = [];
    const results = await Promise.allSettled([
      command('/bin/ps', ['-A', '-o', 'pid=,ppid=,lstart=,time=,ucomm=']),
      command('/usr/bin/meminfo', ['--quiet', '--csv', memoryPath]).then(() => readFile(memoryPath, 'utf8')),
      command('/usr/bin/vm_stat', []), command('/usr/sbin/sysctl', ['-n', 'kern.memorystatus_vm_pressure_level']),
      command('/usr/sbin/ioreg', ['-a', '-r', '-c', 'IOAccelerator', '-l']).then(plist => command('/usr/bin/python3', ['-c', GPU_PLIST_FILTER], plist)),
    ]);
    const value = (index: number, label: string) => { const result = results[index]; if (result?.status === 'fulfilled') return result.value; errors.push(`${label} unavailable.`); return null; };
    const processText = value(0, 'Process accounting'), memoryText = value(1, 'Memory usage'), vmText = value(2, 'Swap counters'), pressureText = value(3, 'Memory pressure'), gpuText = value(4, 'GPU registry');
    const observedAt = new Date().toISOString(), monotonicMs = performance.now();
    const intervalMs = previous ? monotonicMs - previous.monotonicMs : null;
    let processes: ProcessObservation[] = [], gpu = unavailableGpu();
    const memory: LoadSample['memory'] = { source: 'meminfo-csv+vm_stat+sysctl', pressure: 'unknown', pressureRaw: null, totalBytes: null, freeBytes: null, compressedBytes: null, swapBytes: null, pageSize: null, swapinsPages: null, swapoutsPages: null };
    try { if (processText) processes = parseProcessSnapshot(processText); } catch { errors.push('Process accounting parse failed.'); }
    try { if (memoryText) Object.assign(memory, parseMemoryCsv(memoryText)); } catch { errors.push('Memory CSV parse failed.'); }
    try { if (vmText) Object.assign(memory, parseSwapCounters(vmText)); } catch { errors.push('Swap-counter parse failed.'); }
    if (pressureText) Object.assign(memory, pressureLevel(pressureText));
    try {
      if (gpuText) {
        // Preserve64-bit registry counters as decimal strings before JSON number parsing.
        const exact = gpuText.replace(/("(?:accumulatedGPUTime|IORegistryEntryID)"\s*:\s*)(\d+)/g, '$1"$2"');
        gpu = parseGpuRegistry(JSON.parse(exact) as unknown, previous?.gpu);
      }
    } catch { errors.push('GPU registry parse failed.'); }
    const classified = classifyProcesses(processes, previousProcesses, intervalMs, logicalCpus, { targets: options.targetPids, tooling: options.toolingPids, collectors: [process.pid] });
    const retained = classified.filter(row => (row.cpuCorePct ?? 0) > 0 || row.group === 'target' || row.group === 'collector' || row.group === 'declared-tooling').sort((a, b) => (b.cpuCorePct ?? 0) - (a.cpuCorePct ?? 0));
    const oldIds = new Set(previousProcesses.map(row => `${row.pid}:${row.startedAt}`)), newIds = new Set(processes.map(row => `${row.pid}:${row.startedAt}`));
    const sample = LoadSampleSchema.parse({ index: samples.length, observedAt, monotonicMs, collectionDurationMs: monotonicMs - begin, intervalStartedAt: previous?.observedAt ?? null, intervalMs,
      cpu: { source: 'top-delta+ps-cumulative', idlePct: initial ? null : cpu?.idlePct ?? null, userPct: initial ? null : cpu?.userPct ?? null, systemPct: initial ? null : cpu?.systemPct ?? null,
        observedProcessCount: processes.length, activeRowsOmitted: Math.max(0, retained.length - 256), newProcessCount: processes.filter(row => !oldIds.has(`${row.pid}:${row.startedAt}`)).length,
        exitedProcessCount: previousProcesses.filter(row => !newIds.has(`${row.pid}:${row.startedAt}`)).length, processes: retained.slice(0, 256) }, memory, gpu, issues: errors });
    samples.push(sample); previous = sample; previousProcesses = processes;
    await appendFile(partial, `${JSON.stringify(sample)}\n`);
    if (samples.length === 1) console.info(JSON.stringify({ state: 'first-sample', observedAt, cpuProcessCount: processes.length, gpuClients: gpu.clients.length, pressure: memory.pressure, issues: errors }));
    if (!baselineAnnounced && Date.parse(observedAt) - Date.parse(startedAt) >= policy.baselineMs + 2000) { baselineAnnounced = true; console.info(JSON.stringify({ state: 'baseline-observed-not-yet-qualified', observedAt, samples: samples.length })); }
  }
  let top: ChildProcess | undefined;
  try {
    top = spawn('/usr/bin/top', ['-l', String(options.seconds + 1), '-s', '1', '-n', '0', '-F', '-R', '-c', 'd'], { env, stdio: ['ignore', 'pipe', 'ignore'] });
    children.add(top);
    let buffer = '', ticks = 0;
    top.stdout?.setEncoding('utf8'); top.stdout?.on('data', (text: string) => {
      buffer += text;
      if (buffer.length > 65536) { issues.push('Top output exceeded parser bound.'); failed = true; top?.kill('SIGTERM'); return; }
      const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('CPU usage:')) continue;
        const initial = ticks++ === 0, cpu = parseTopCpu(line);
        if (busy) { if (issues.length < 30) issues.push('Skipped overlapping sample; collector latency is visible.'); continue; }
        if (samples.length >= 301) { failed = true; top?.kill('SIGTERM'); continue; }
        busy = true;
        pending = take(cpu, initial).catch(() => { failed = true; if (issues.length < 30) issues.push('Sample failed validation; raw output was not exported.'); }).finally(() => { busy = false; });
      }
    });
    const completionIssues = await awaitTopCompletion(top, options.seconds * 1000, { isAborted: () => aborted,
      terminateOwned: () => { for (const child of children) child.kill('SIGKILL'); } });
    if (completionIssues.length) { failed = true; issues.push(...completionIssues); }
    await pending;
  } finally {
    for (const child of children) child.kill('SIGTERM'); children.clear();
    process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
    await rm(directory, { recursive: true, force: true });
  }
  let optionalPowermetricsCapture: LoadReport['optionalPowermetricsCapture'] = null;
  if (options.powermetrics) {
    const info = await stat(options.powermetrics); if (info.size > 16 * 1024 * 1024) throw new Error('Optional capture exceeds its size bound.');
    const bytes = await readFile(options.powermetrics); optionalPowermetricsCapture = { sha256: sha(bytes), bytes: bytes.length, status: 'hash-bound-format-not-qualified' };
  }
  const report = LoadReportSchema.parse({ schemaVersion: 1, kind: 'local-load-observation', startedAt, endedAt: new Date().toISOString(), platform: 'darwin', logicalCpus, policy, policySha256,
    intervalSeconds: 1, requestedDurationSeconds: options.seconds, targetPids: options.targetPids, toolingPids: options.toolingPids, collectorPid: process.pid,
    status: aborted ? 'aborted' : failed ? 'failed' : 'finished', samples, issues: issues.slice(0, 30), gpuQualification: 'diagnostic-only-units-and-coverage-unqualified', optionalPowermetricsCapture,
    limitations: ['Private IORegistry fields are diagnostic. Raw GPU counter deltas have unknown units and are never converted to milliseconds or process utilization percentages.',
      'The first top CPU sample is discarded. ps CPU-time deltas are sampled intervals, not precise frame-level profiling.',
      'Short-lived processes between snapshots can escape per-process CPU accounting; process counts/churn and aggregate CPU remain visible.',
      'PID ancestry and short-name hints do not prove task ownership. A browser GPU process may serve multiple tabs.',
      'Probe observations are sequential within each bounded sample; timestamps/collection duration expose that skew.',
      'Only accounting names and numeric metrics are retained. No process arguments, environment, raw IORegistry or raw meminfo headers are exported.',
      'No GPU-attribution qualification is implemented in this diagnostic collector. An optional powermetrics capture is hash-bound only.'] });
  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  console.info(JSON.stringify({ state: 'finished-observation', out, samples: samples.length, status: report.status, sha256: sha(await readFile(out)), performanceValidity: 'not-qualified' }));
  return report;
}

async function main(args: readonly string[]) {
  const mode = args[0], values = new Map<string, string[]>();
  for (let index = 1; index < args.length; index += 2) { const key = args[index], value = args[index + 1]; if (!key?.startsWith('--') || !value || value.startsWith('--')) throw new Error('Use explicit --option value pairs.'); values.set(key, [...values.get(key) ?? [], value]); }
  const get = (key: string) => values.get(key)?.[0];
  const need = (key: string) => { const value = get(key); if (!value) throw new Error(`Missing ${key}.`); return value; };
  const out = need('--out');
  if (mode === 'collect') return collectLoad({ out, seconds: Number(get('--seconds') ?? 180), baselineMs: Number(get('--baseline-ms') ?? 30000), afterMs: Number(get('--after-ms') ?? 10000),
    targetPids: (values.get('--target-pid') ?? []).map(Number), toolingPids: (values.get('--tooling-pid') ?? []).map(Number), powermetrics: get('--powermetrics') });
  if (mode !== 'assess') throw new Error('Use collect or assess.');
  const loadBytes = await readFile(need('--load')), timingBytes = await readFile(need('--timing'));
  const window = LoadWindowSchema.parse(JSON.parse(await readFile(need('--window'), 'utf8')) as unknown);
  const timing = M8TimingReportSchema.parse(JSON.parse(timingBytes.toString('utf8')) as unknown);
  if (window.timingSha256 !== sha(timingBytes) || window.buildId !== timing.buildId) throw new Error('Observed window does not bind the actual timing report.');
  if (Date.parse(timing.generatedAt) < Date.parse(window.startedAt) || Date.parse(timing.generatedAt) > Date.parse(window.endedAt)) throw new Error('Timing completion lies outside the observed benchmark window.');
  const report = LoadReportSchema.parse(JSON.parse(loadBytes.toString('utf8')) as unknown);
  if (report.policySha256 !== sha(JSON.stringify(report.policy))) throw new Error('Load policy hash changed.');
  const assessment = assessLoadWindow(report, window, timing.result);
  await mkdir(dirname(resolve(out)), { recursive: true });
  await writeFile(out, `${JSON.stringify({ ...assessment, provenance: { loadSha256: sha(loadBytes), timingSha256: sha(timingBytes), policySha256: report.policySha256 } }, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  console.info(JSON.stringify({ out, result: assessment.result, contamination: assessment.contamination, unknowns: assessment.unknowns }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(() => { console.error('Load collection/assessment failed. No valid performance claim was produced; preserve any partial observation.'); process.exitCode = 1; });
