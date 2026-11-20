import { LoadAssessmentSchema, LoadReportSchema, LoadWindowSchema, type LoadAssessment, type LoadGpu, type LoadProcess, type LoadSample } from '@fluidkit/contracts';

export type ProcessObservation = Pick<LoadProcess, 'pid' | 'ppid' | 'startedAt' | 'name' | 'cpuTotalMs'>;
export function shortProcessName(value: string) { return value.replace(/[\r\n\t/\\]/g, '_').slice(0, 64); }
export function cpuTimeMs(value: string): number | null {
  const match = value.match(/^(?:(\d+)-)?(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const seconds = Number(match[4]), minutes = Number(match[3]), hours = Number(match[2] ?? 0), days = Number(match[1] ?? 0);
  return [seconds, minutes, hours, days].every(Number.isFinite) && seconds < 60 && (!match[2] || minutes < 60) ? ((days * 24 + hours) * 3600 + minutes * 60 + seconds) * 1000 : null;
}
export function parseProcessSnapshot(text: string): ProcessObservation[] {
  const rows: ProcessObservation[] = [];
  for (const line of text.split('\n').filter(line => line.trim())) {
    const match = line.match(/^\s*(\d+)\s+(\d+)\s+([A-Za-z]{3}\s+[A-Za-z]{3}\s+\d+\s+\d{2}:\d{2}:\d{2}\s+\d{4})\s+([\d:.-]+)\s+(.+?)\s*$/);
    if (!match) throw new Error('Unexpected ps accounting row; no raw text exported.');
    // The collector sets TZ=UTC and LC_ALL=C for deterministic lstart output.
    const timestamp = Date.parse(`${match[3]} UTC`), cpu = cpuTimeMs(match[4]!);
    if (!Number.isFinite(timestamp) || cpu === null) throw new Error('Invalid ps accounting time.');
    rows.push({ pid: Number(match[1]), ppid: Number(match[2]), startedAt: new Date(timestamp).toISOString(), cpuTotalMs: cpu, name: shortProcessName(match[5]!) });
  }
  if (!rows.length || rows.length > 10000 || new Set(rows.map(row => row.pid)).size !== rows.length) throw new Error('Process snapshot is empty, duplicate or outside its bound.');
  return rows;
}
export function classifyProcesses(current: readonly ProcessObservation[], previous: readonly ProcessObservation[], intervalMs: number | null,
  logicalCpus: number, pids: { targets: readonly number[]; tooling: readonly number[]; collectors: readonly number[] }): LoadProcess[] {
  const now = new Map(current.map(item => [item.pid, item])), old = new Map(previous.map(item => [item.pid, item]));
  function membership(row: ProcessObservation, roots: readonly number[]) {
    if (roots.includes(row.pid)) return 'explicit-pid' as const;
    const seen = new Set<number>(); let parent = now.get(row.ppid);
    while (parent && !seen.has(parent.pid)) { seen.add(parent.pid); if (roots.includes(parent.pid)) return 'observed-ancestry' as const; parent = now.get(parent.ppid); }
    return null;
  }
  return current.map(row => {
    const before = old.get(row.pid); const same = before?.startedAt === row.startedAt && before.name === row.name;
    const delta = same && before && row.cpuTotalMs >= before.cpuTotalMs && intervalMs && intervalMs > 0 ? row.cpuTotalMs - before.cpuTotalMs : null;
    const collector = membership(row, pids.collectors), target = membership(row, pids.targets), tooling = membership(row, pids.tooling);
    const suspected = /^(node|npm|npx|vitest|esbuild|tsc|next|jest|swift|clang)(?:$|[ .-])/i.test(row.name);
    const group = collector ? 'collector' : target ? 'target' : tooling ? 'declared-tooling' : suspected ? 'suspected-tooling' : 'other';
    return { ...row, group, basis: collector ?? target ?? tooling ?? (suspected ? 'name-hint-only' : 'unclassified'),
      cpuCorePct: delta === null ? null : delta / intervalMs! * 100, cpuMachinePct: delta === null ? null : delta / intervalMs! / logicalCpus * 100 };
  });
}
export function parseTopCpu(line: string) {
  const match = line.match(/^CPU usage:\s*([\d.]+)% user,\s*([\d.]+)% sys,\s*([\d.]+)% idle\s*$/);
  if (!match) return null;
  const values = match.slice(1).map(Number);
  if (values.some(value => !Number.isFinite(value) || value < 0 || value > 100) || Math.abs(values.reduce((a, b) => a + b, 0) - 100) > 2) return null;
  return { userPct: values[0]!, systemPct: values[1]!, idlePct: values[2]! };
}
export function pressureLevel(raw: string) {
  const value = /^\d+$/.test(raw.trim()) ? Number(raw.trim()) : null;
  return { pressureRaw: value, pressure: value === 1 ? 'normal' as const : value === 2 ? 'warning' as const : value === 4 ? 'critical' as const : 'unknown' as const };
}
export function parseMemoryCsv(csv: string) {
  const [header, line] = csv.trim().split('\n'); if (!header || !line) throw new Error('Missing meminfo sample.');
  const keys = header.split(','), values = line.split(','); if (keys.length !== values.length) throw new Error('Invalid meminfo columns.');
  const get = (key: string) => { const value = Number(values[keys.indexOf(key)]); if (!Number.isFinite(value) || value < 0) throw new Error('Missing meminfo metric.'); return value; };
  return { totalBytes: get('total'), freeBytes: get('free'), compressedBytes: get('compressor'), swapBytes: get('swap') };
}
export function parseSwapCounters(text: string) {
  const pageSize = text.match(/page size of (\d+) bytes/), swapins = text.match(/^Swapins:\s*(\d+)\./m), swapouts = text.match(/^Swapouts:\s*(\d+)\./m);
  if (!pageSize || !swapins || !swapouts) throw new Error('Missing vm_stat swap counters.');
  return { pageSize: Number(pageSize[1]), swapinsPages: Number(swapins[1]), swapoutsPages: Number(swapouts[1]) };
}
export function parseGpuRegistry(input: unknown, previous?: LoadGpu): LoadGpu {
  const result: LoadGpu = { source: 'ioreg-IOAccelerator-private', attribution: 'diagnostic-only', counterUnit: 'unknown', adapters: [], clients: [], issues: [] };
  const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
  const counter = (value: unknown) => typeof value === 'string' && /^\d{1,30}$/.test(value) ? value : typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  const percent = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
  const aggregate = new Map<string, { id: string; pid: number; api: string; sum: bigint }>();
  const before = new Map(previous?.clients.map(client => [`${client.id}:${client.pid}:${client.api}`, client.accumulatedRaw]));
  let visited = 0;
  const walk = (input: unknown) => {
    if (++visited > 10000) throw new Error('GPU registry exceeds the bounded node count.');
    const node = record(input); if (!node) return;
    const id = counter(node.IORegistryEntryID), stats = record(node.PerformanceStatistics);
    if (id && stats) result.adapters.push({ id, deviceUtilizationPct: percent(stats['Device Utilization %']), rendererUtilizationPct: percent(stats['Renderer Utilization %']), tilerUtilizationPct: percent(stats['Tiler Utilization %']) });
    const creator = typeof node.IOUserClientCreator === 'string' ? node.IOUserClientCreator.match(/^pid\s*(\d+),/) : null;
    if (id && creator && Array.isArray(node.AppUsage)) for (const entry of node.AppUsage) {
      const usage = record(entry), raw = counter(usage?.accumulatedGPUTime), pid = Number(creator[1]);
      if (!usage || !raw || !Number.isSafeInteger(pid) || pid <= 0) continue;
      const api = typeof usage.API === 'string' ? shortProcessName(usage.API).slice(0, 40) : 'unknown';
      const key = `${id}:${pid}:${api}`, existing = aggregate.get(key);
      if (existing) existing.sum += BigInt(raw); else aggregate.set(key, { id, pid, api, sum: BigInt(raw) });
    }
    if (Array.isArray(node.IORegistryEntryChildren)) for (const child of node.IORegistryEntryChildren) walk(child);
  };
  if (!Array.isArray(input)) throw new Error('Expected IORegistry root array.');
  for (const root of input) walk(root);
  result.clients = [...aggregate.entries()].map(([key, item]) => {
    const old = before.get(key);
    return { id: item.id, pid: item.pid, api: item.api, accumulatedRaw: String(item.sum), deltaRaw: old !== undefined && item.sum >= BigInt(old) ? String(item.sum - BigInt(old)) : null };
  });
  if (!result.adapters.length) result.issues.push('No driver utilization fields observed.');
  if (!result.clients.length) result.issues.push('No per-client GPU counters observed.');
  if (result.adapters.length > 16 || result.clients.length > 2048) throw new Error('GPU observations exceed the report bound.');
  return result;
}

/** Diagnostic GPU counters intentionally cannot produce a load-controlled valid result. */
export function assessLoadWindow(reportInput: unknown, windowInput: unknown, performanceBudgetResult: LoadAssessment['performanceBudgetResult']): LoadAssessment {
  const report = LoadReportSchema.parse(reportInput), window = LoadWindowSchema.parse(windowInput);
  const start = Date.parse(window.startedAt), end = Date.parse(window.endedAt), policy = report.policy;
  const contamination = new Set<string>(), unknowns = new Set<string>();
  unknowns.add('GPU counter units and complete per-process attribution are not qualified; private IORegistry observations are diagnostic only.');
  if (!report.targetPids.length) unknowns.add('No benchmark target PIDs were declared.');
  unknowns.add('A browser process may serve other tabs; PID/ancestry does not prove isolated benchmark-tab ownership.');
  if (report.status !== 'finished' || report.issues.length) unknowns.add('Collector did not finish without gaps/errors.');
  const samples = report.samples.filter(sample => sample.intervalStartedAt && sample.intervalMs !== null);
  const baseline = samples.filter(sample => Date.parse(sample.observedAt) <= start && Date.parse(sample.observedAt) >= start - policy.baselineMs);
  const during = samples.filter(sample => Date.parse(sample.observedAt) >= start && Date.parse(sample.intervalStartedAt!) <= end);
  const span = samples.filter(sample => Date.parse(sample.observedAt) >= start - policy.baselineMs && Date.parse(sample.intervalStartedAt!) <= end + policy.afterMs);
  if (!span.length || Date.parse(span[0]!.intervalStartedAt!) > start - policy.baselineMs || Date.parse(span.at(-1)!.observedAt) < end + policy.afterMs) unknowns.add('Samples do not cover the required baseline, entire benchmark and after-window.');
  let previous: LoadSample | undefined;
  for (const sample of span) {
    if (sample.issues.length || sample.cpu.idlePct === null || sample.cpu.activeRowsOmitted) unknowns.add('At least one sample is incomplete.');
    if (sample.collectionDurationMs > policy.maxCollectionMs || sample.intervalMs! > policy.maxGapMs) unknowns.add('Collector delay or interval exceeds the declared coverage tolerance.');
    if (previous) {
      const wall = Date.parse(sample.observedAt) - Date.parse(previous.observedAt), mono = sample.monotonicMs - previous.monotonicMs;
      if (wall <= 0 || mono <= 0 || Math.abs(wall - mono) > 100 || Date.parse(sample.intervalStartedAt!) - Date.parse(previous.observedAt) > policy.maxGapMs) unknowns.add('Nonmonotonic clock or uncovered observation gap.');
    }
    previous = sample;
    if (sample.memory.pressure === 'unknown') unknowns.add('Memory pressure was not observed.');
    if (sample.memory.pressure === 'warning' || sample.memory.pressure === 'critical') contamination.add('Memory pressure exceeded normal.');
  }
  const idle = baseline.flatMap(sample => sample.cpu.idlePct === null ? [] : [sample.cpu.idlePct]);
  const minimumBaselineIdlePct = idle.length ? Math.min(...idle) : null;
  if (minimumBaselineIdlePct === null) unknowns.add('Baseline CPU idle was not observed.');
  else if (minimumBaselineIdlePct < policy.minimumBaselineIdlePct) contamination.add('Baseline total CPU busy exceeded policy.');
  const metrics = { minimumBaselineIdlePct, maximumOtherMachineCpuPct: 0, maximumOtherSingleCoreCpuPct: 0, maximumToolingCoreCpuPct: 0, maximumCollectorCoreCpuPct: 0,
    swapGrowthBytes: null as number | null, swapIoBytes: null as number | null, diagnosticOtherGpuActiveClients: 0 };
  for (const sample of during) {
    if (report.targetPids.some(pid => !sample.cpu.processes.some(process => process.pid === pid && process.group === 'target'))) unknowns.add('A declared benchmark target PID was not observed during the window.');
    const others = sample.cpu.processes.filter(process => !['target', 'collector'].includes(process.group));
    metrics.maximumOtherMachineCpuPct = Math.max(metrics.maximumOtherMachineCpuPct, others.reduce((n, p) => n + (p.cpuMachinePct ?? 0), 0));
    metrics.maximumOtherSingleCoreCpuPct = Math.max(metrics.maximumOtherSingleCoreCpuPct, ...others.map(p => p.cpuCorePct ?? 0));
    metrics.maximumToolingCoreCpuPct = Math.max(metrics.maximumToolingCoreCpuPct, ...others.filter(p => p.group.includes('tooling')).map(p => p.cpuCorePct ?? 0));
    metrics.maximumCollectorCoreCpuPct = Math.max(metrics.maximumCollectorCoreCpuPct, sample.cpu.processes.filter(p => p.group === 'collector').reduce((n, p) => n + (p.cpuCorePct ?? 0), 0));
    if (sample.cpu.processes.some(p => p.cpuCorePct === null && ['target', 'declared-tooling'].includes(p.group))) unknowns.add('Declared process has no continuous CPU interval, possibly new or reused PID.');
    const target = new Set(sample.cpu.processes.filter(p => p.group === 'target').map(p => p.pid));
    metrics.diagnosticOtherGpuActiveClients += sample.gpu.clients.filter(client => !target.has(client.pid) && client.deltaRaw !== null && BigInt(client.deltaRaw) > 0n).length;
  }
  if (metrics.maximumOtherMachineCpuPct > policy.maximumOtherMachineCpuPct || metrics.maximumOtherSingleCoreCpuPct > policy.maximumOtherSingleCoreCpuPct) contamination.add('Observed non-target CPU exceeded policy.');
  if (metrics.maximumToolingCoreCpuPct > policy.maximumToolingCoreCpuPct) contamination.add('Declared or suspected tooling CPU exceeded policy; name hints do not prove task ownership.');
  if (metrics.maximumCollectorCoreCpuPct > policy.maximumCollectorCoreCpuPct) contamination.add('The collector itself exceeded its CPU budget.');
  const first = span[0]?.memory, last = span.at(-1)?.memory;
  if (first && last && first.swapBytes !== null && span.every(sample => sample.memory.swapBytes !== null)) metrics.swapGrowthBytes = Math.max(0, ...span.map(sample => sample.memory.swapBytes! - first.swapBytes!));
  else unknowns.add('Swap occupancy delta is unavailable.');
  if (first && last && first.pageSize && first.pageSize === last.pageSize && first.swapinsPages !== null && last.swapinsPages !== null && first.swapoutsPages !== null && last.swapoutsPages !== null && last.swapinsPages >= first.swapinsPages && last.swapoutsPages >= first.swapoutsPages) metrics.swapIoBytes = ((last.swapinsPages - first.swapinsPages) + (last.swapoutsPages - first.swapoutsPages)) * first.pageSize;
  else unknowns.add('Swap I/O delta is unavailable or reset.');
  if ((metrics.swapGrowthBytes ?? 0) > policy.maximumSwapGrowthBytes || (metrics.swapIoBytes ?? 0) > policy.maximumSwapIoBytes) contamination.add('Swap occupancy or I/O exceeded policy; swap maintenance is included, not necessarily causal memory contention.');
  return LoadAssessmentSchema.parse({ schemaVersion: 1, kind: 'load-window-assessment', result: contamination.size ? 'contaminated' : 'inconclusive', performanceValidity: 'not-qualified', performanceBudgetResult, window,
    baselineSamples: baseline.length, benchmarkSamples: during.length, contamination: [...contamination], unknowns: [...unknowns], metrics });
}
