import { describe, expect, it } from 'vitest';
import { DEFAULT_LOAD_POLICY, LoadReportSchema, LoadSampleSchema, LoadWindowSchema } from '../../packages/contracts/src/load';
import { assessLoadWindow, classifyProcesses, cpuTimeMs, parseGpuRegistry, parseMemoryCsv, parseProcessSnapshot, parseSwapCounters, parseTopCpu, pressureLevel } from '../../packages/testing/src/load';

const timestamp = (seconds: number) => new Date(Date.UTC(2026, 10, 13, 12, 0, seconds)).toISOString();
function fixture() {
  return LoadReportSchema.parse({ schemaVersion: 1, kind: 'local-load-observation', startedAt: timestamp(0), endedAt: timestamp(30), platform: 'darwin', logicalCpus: 18,
    policy: DEFAULT_LOAD_POLICY, policySha256: '0'.repeat(64), intervalSeconds: 1, requestedDurationSeconds: 30, targetPids: [10], toolingPids: [], collectorPid: 20,
    status: 'finished', gpuQualification: 'diagnostic-only-units-and-coverage-unqualified', optionalPowermetricsCapture: null, issues: [], limitations: ['Synthetic classifier fixture; no actual process observation.'],
    samples: Array.from({ length: 31 }, (_, index) => LoadSampleSchema.parse({ index, observedAt: timestamp(index), monotonicMs: index * 1000, collectionDurationMs: 100,
      intervalStartedAt: index ? timestamp(index - 1) : null, intervalMs: index ? 1000 : null,
      cpu: { source: 'top-delta+ps-cumulative', idlePct: index ? 99 : null, userPct: index ? 1 : null, systemPct: index ? 0 : null, observedProcessCount: 2, activeRowsOmitted: 0, newProcessCount: 0, exitedProcessCount: 0, processes: [
        { pid: 10, ppid: 1, startedAt: timestamp(0), name: 'browser', cpuTotalMs: index * 10, cpuCorePct: 1, cpuMachinePct: 1 / 18, group: 'target', basis: 'explicit-pid' },
        { pid: 20, ppid: 1, startedAt: timestamp(0), name: 'node', cpuTotalMs: index * 10, cpuCorePct: 1, cpuMachinePct: 1 / 18, group: 'collector', basis: 'explicit-pid' },
      ] },
      memory: { source: 'meminfo-csv+vm_stat+sysctl', pressure: 'normal', pressureRaw: 1, totalBytes: 64e9, freeBytes: 2e9, compressedBytes: 15e9, swapBytes: 0, pageSize: 16384, swapinsPages: 0, swapoutsPages: 0 },
      gpu: { source: 'ioreg-IOAccelerator-private', attribution: 'diagnostic-only', counterUnit: 'unknown', adapters: [{ id: '100', deviceUtilizationPct: 0, rendererUtilizationPct: 0, tilerUtilizationPct: 0 }], clients: [], issues: [] }, issues: [],
    })),
  });
}
const window = () => LoadWindowSchema.parse({ schemaVersion: 1, startedAt: timestamp(10), endedAt: timestamp(20), source: 'observed-benchmark-boundary', timingSha256: '1'.repeat(64), buildId: 'synthetic-only' });

describe('bounded local load interpretation', () => {
  it('cannot qualify a quiet CPU or even a passed frame budget without qualified GPU attribution', () => {
    const assessment = assessLoadWindow(fixture(), window(), 'passed');
    expect(assessment.result).toBe('inconclusive'); expect(assessment.performanceValidity).toBe('not-qualified');
    expect(assessment.performanceBudgetResult).toBe('passed'); expect(assessment.contamination).toEqual([]);
    expect(assessment.unknowns.some(issue => issue.includes('GPU counter units'))).toBe(true);
  });
  it.each(['cpu', 'tooling', 'observer', 'pressure', 'swap'] as const)('reports known %s policy breaches separately from unknown GPU attribution', kind => {
    const report = fixture(), sample = report.samples[15]!;
    if (kind === 'cpu' || kind === 'tooling') sample.cpu.processes.push({ pid: 30, ppid: 1, startedAt: timestamp(0), name: kind === 'tooling' ? 'node' : 'other', cpuTotalMs: 1000, cpuCorePct: 120, cpuMachinePct: 120 / 18,
      group: kind === 'tooling' ? 'suspected-tooling' : 'other', basis: kind === 'tooling' ? 'name-hint-only' : 'unclassified' });
    if (kind === 'observer') sample.cpu.processes[1]!.cpuCorePct = 30;
    if (kind === 'pressure') sample.memory.pressure = 'warning';
    if (kind === 'swap') for (const item of report.samples.slice(15)) item.memory.swapoutsPages = 10;
    const assessment = assessLoadWindow(report, window(), 'failed');
    expect(assessment.result).toBe('contaminated'); expect(assessment.contamination.length).toBeGreaterThan(0);
    expect(assessment.performanceBudgetResult).toBe('failed'); expect(assessment.unknowns.length).toBeGreaterThan(0);
  });
  it.each(['baseline', 'gap', 'clock', 'slow-probe', 'missing-pressure'] as const)('keeps missing or invalid %s observation inconclusive', kind => {
    const report = fixture();
    if (kind === 'baseline') report.samples = report.samples.slice(5);
    if (kind === 'gap') report.samples.splice(12, 4);
    if (kind === 'clock') report.samples[15]!.monotonicMs -= 200;
    if (kind === 'slow-probe') report.samples[15]!.collectionDurationMs = 2000;
    if (kind === 'missing-pressure') report.samples[15]!.memory.pressure = 'unknown';
    expect(assessLoadWindow(report, window(), 'failed').unknowns.length).toBeGreaterThan(2);
  });
  it('does not hide temporary swap growth or an absent declared target', () => {
    const report = fixture(); report.samples[15]!.memory.swapBytes = 16384;
    expect(assessLoadWindow(report, window(), 'failed').metrics.swapGrowthBytes).toBe(16384);
    report.targetPids = [999];
    expect(assessLoadWindow(report, window(), 'failed').unknowns.some(issue => issue.includes('target PID'))).toBe(true);
  });
  it('rejects raw argument/environment fields and preserves sensitive originals outside the report', () => {
    const report = fixture(); Object.assign(report.samples[0]!.cpu.processes[0]!, { args: 'secret', env: { KEY: 'secret' } });
    expect(LoadReportSchema.safeParse(report).success).toBe(false);
    expect(parseMemoryCsv('datetime,free,compressor,swap,total,Kernel 0xPRIVATE\nnow,10,20,0,100,999')).toEqual({ totalBytes: 100, freeBytes: 10, compressedBytes: 20, swapBytes: 0 });
  });
  it('uses interval CPU-time deltas, handles PID reuse, and does not turn node name hints into known ownership', () => {
    const before = parseProcessSnapshot('  30 1 Fri Nov 13 11:00:00 2026 0:01.00 node\n  31 30 Fri Nov 13 11:00:00 2026 0:02.00 worker');
    const current = before.map(row => ({ ...row, cpuTotalMs: row.cpuTotalMs + 1000 }));
    const unrelated = classifyProcesses(current, before, 1000, 18, { targets: [], tooling: [], collectors: [] });
    expect(unrelated[0]).toMatchObject({ cpuCorePct: 100, cpuMachinePct: 100 / 18, group: 'suspected-tooling', basis: 'name-hint-only' });
    const owned = classifyProcesses(current, before, 1000, 18, { targets: [30], tooling: [], collectors: [] });
    expect(owned[1]).toMatchObject({ group: 'target', basis: 'observed-ancestry' });
    current[0]!.startedAt = timestamp(10);
    expect(classifyProcesses(current, before, 1000, 18, { targets: [30], tooling: [], collectors: [] })[0]!.cpuCorePct).toBeNull();
    expect(cpuTimeMs('604:05.98')).toBe(36245980); expect(cpuTimeMs('1-02:03:04.50')).toBe(93784500);
  });
  it('keeps GPU accounting in unknown-unit raw counters, discards unrelated registry fields and never invents process utilization', () => {
    const input = [{ IORegistryEntryID: '1', PerformanceStatistics: { 'Device Utilization %': 20 }, IORegistryEntryChildren: [{ IORegistryEntryID: '2', IOUserClientCreator: 'pid30,secret arguments',
      secret: 'never exported', AppUsage: [{ API: 'Metal', accumulatedGPUTime: '9007199254740993000' }] }] }];
    const before = parseGpuRegistry(input); input[0]!.IORegistryEntryChildren[0]!.AppUsage[0]!.accumulatedGPUTime = '9007199254740993010';
    const after = parseGpuRegistry(input, before);
    expect(after.clients[0]!.deltaRaw).toBe('10'); expect(after.counterUnit).toBe('unknown'); expect(after.attribution).toBe('diagnostic-only');
    expect(JSON.stringify(after)).not.toContain('secret'); expect(after.adapters[0]!.rendererUtilizationPct).toBeNull();
  });
  it('aggregates repeated GPU API counters per client before comparing; reorder is irrelevant and decreases reset the delta', () => {
    const make = (values: string[]) => [{ IORegistryEntryID: '10', IOUserClientCreator: 'pid30,owner', AppUsage: values.map(value => ({ API: 'Metal', accumulatedGPUTime: value })) }];
    const first = parseGpuRegistry(make(['100', '900']));
    expect(first.clients).toHaveLength(1); expect(first.clients[0]!.accumulatedRaw).toBe('1000');
    const unchanged = parseGpuRegistry(make(['900', '100']), first); expect(unchanged.clients[0]!.deltaRaw).toBe('0');
    const advanced = parseGpuRegistry(make(['910', '101']), first); expect(advanced.clients[0]!.deltaRaw).toBe('11');
    const reset = parseGpuRegistry(make(['1', '9']), first); expect(reset.clients[0]!.deltaRaw).toBeNull();
  });
  it('parses documented aggregate CPU, memory-pressure userspace masks and swap I/O counters without guessing', () => {
    expect(parseTopCpu('CPU usage: 21.66% user, 7.9% sys, 71.24% idle')).toEqual({ userPct: 21.66, systemPct: 7.9, idlePct: 71.24 });
    expect(parseTopCpu('CPU usage: unavailable')).toBeNull(); expect(pressureLevel('1')).toEqual({ pressure: 'normal', pressureRaw: 1 });
    expect(pressureLevel('3').pressure).toBe('unknown');
    expect(parseSwapCounters('page size of 16384 bytes\nSwapins: 16.\nSwapouts: 17.')).toEqual({ pageSize: 16384, swapinsPages: 16, swapoutsPages: 17 });
  });
});
