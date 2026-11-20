import { z } from 'zod';

const Percent = z.number().min(0).max(100);
const Nonnegative = z.number().finite().nonnegative();
const Counter = z.string().regex(/^\d{1,30}$/);
const Pid = z.number().int().positive();
const ShortName = z.string().max(64).regex(/^[^/\\\r\n\t]*$/);
export const LoadPolicySchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1).max(80),
  baselineMs: z.number().int().min(5000).max(60000), afterMs: z.number().int().min(1000).max(30000),
  maxGapMs: z.number().int().min(1000).max(10000), maxCollectionMs: z.number().int().min(100).max(5000),
  minimumBaselineIdlePct: Percent, maximumOtherMachineCpuPct: Percent,
  maximumOtherSingleCoreCpuPct: Nonnegative, maximumToolingCoreCpuPct: Nonnegative, maximumCollectorCoreCpuPct: Nonnegative,
  maximumSwapGrowthBytes: Nonnegative, maximumSwapIoBytes: Nonnegative,
});
/** Project policy, not an Apple measurement-accuracy guarantee. Frozen before collection. */
export const DEFAULT_LOAD_POLICY = LoadPolicySchema.parse({ schemaVersion: 1, id: 'm8-local-load-1', baselineMs: 10000, afterMs: 1000,
  maxGapMs: 2500, maxCollectionMs: 1500, minimumBaselineIdlePct: 90, maximumOtherMachineCpuPct: 5,
  maximumOtherSingleCoreCpuPct: 50, maximumToolingCoreCpuPct: 10, maximumCollectorCoreCpuPct: 10,
  maximumSwapGrowthBytes: 0, maximumSwapIoBytes: 0 });
export type LoadPolicy = z.infer<typeof LoadPolicySchema>;
export const LoadProcessSchema = z.strictObject({
  pid: Pid, ppid: z.number().int().nonnegative(), startedAt: z.iso.datetime(), name: ShortName,
  cpuTotalMs: Nonnegative, cpuCorePct: Nonnegative.nullable(), cpuMachinePct: Nonnegative.nullable(),
  group: z.enum(['target', 'collector', 'declared-tooling', 'suspected-tooling', 'other']),
  basis: z.enum(['explicit-pid', 'observed-ancestry', 'name-hint-only', 'unclassified']),
});
export type LoadProcess = z.infer<typeof LoadProcessSchema>;
export const LoadGpuSchema = z.strictObject({
  source: z.literal('ioreg-IOAccelerator-private'), attribution: z.enum(['diagnostic-only', 'unavailable']),
  counterUnit: z.literal('unknown'),
  adapters: z.array(z.strictObject({ id: Counter, deviceUtilizationPct: Percent.nullable(), rendererUtilizationPct: Percent.nullable(), tilerUtilizationPct: Percent.nullable() })).max(16),
  clients: z.array(z.strictObject({ id: Counter, pid: Pid, api: z.string().max(40), accumulatedRaw: Counter, deltaRaw: Counter.nullable() })).max(2048),
  issues: z.array(z.string().max(200)).max(20),
});
export type LoadGpu = z.infer<typeof LoadGpuSchema>;
export const LoadMemorySchema = z.strictObject({
  source: z.literal('meminfo-csv+vm_stat+sysctl'), pressure: z.enum(['normal', 'warning', 'critical', 'unknown']), pressureRaw: z.number().int().nullable(),
  totalBytes: Nonnegative.nullable(), freeBytes: Nonnegative.nullable(), compressedBytes: Nonnegative.nullable(), swapBytes: Nonnegative.nullable(),
  pageSize: z.number().int().positive().nullable(), swapinsPages: Nonnegative.nullable(), swapoutsPages: Nonnegative.nullable(),
});
export const LoadSampleSchema = z.strictObject({
  index: z.number().int().nonnegative(), observedAt: z.iso.datetime(), monotonicMs: Nonnegative, collectionDurationMs: Nonnegative,
  intervalStartedAt: z.iso.datetime().nullable(), intervalMs: Nonnegative.nullable(),
  cpu: z.strictObject({ source: z.literal('top-delta+ps-cumulative'), idlePct: Percent.nullable(), userPct: Percent.nullable(), systemPct: Percent.nullable(),
    observedProcessCount: z.number().int().nonnegative(), activeRowsOmitted: z.number().int().nonnegative(),
    newProcessCount: z.number().int().nonnegative(), exitedProcessCount: z.number().int().nonnegative(),
    processes: z.array(LoadProcessSchema).max(256) }),
  memory: LoadMemorySchema, gpu: LoadGpuSchema, issues: z.array(z.string().max(200)).max(30),
});
export type LoadSample = z.infer<typeof LoadSampleSchema>;
export const LoadReportSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('local-load-observation'), startedAt: z.iso.datetime(), endedAt: z.iso.datetime(),
  platform: z.literal('darwin'), logicalCpus: z.number().int().positive().max(1024),
  policy: LoadPolicySchema, policySha256: z.string().regex(/^[a-f0-9]{64}$/),
  intervalSeconds: z.number().min(1).max(5), requestedDurationSeconds: z.number().min(5).max(300),
  targetPids: z.array(Pid).max(32), toolingPids: z.array(Pid).max(32), collectorPid: Pid,
  status: z.enum(['finished', 'aborted', 'failed']), samples: z.array(LoadSampleSchema).max(301), issues: z.array(z.string().max(200)).max(30),
  gpuQualification: z.literal('diagnostic-only-units-and-coverage-unqualified'),
  optionalPowermetricsCapture: z.strictObject({ sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().nonnegative(), status: z.literal('hash-bound-format-not-qualified') }).nullable(),
  limitations: z.array(z.string()).min(1),
});
export type LoadReport = z.infer<typeof LoadReportSchema>;
export const LoadWindowSchema = z.strictObject({
  schemaVersion: z.literal(1), startedAt: z.iso.datetime(), endedAt: z.iso.datetime(),
  source: z.literal('observed-benchmark-boundary'), timingSha256: z.string().regex(/^[a-f0-9]{64}$/), buildId: z.string().min(1),
}).refine(window => Date.parse(window.endedAt) > Date.parse(window.startedAt), 'Benchmark window must advance.');
export type LoadWindow = z.infer<typeof LoadWindowSchema>;
export const LoadAssessmentSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('load-window-assessment'),
  result: z.enum(['contaminated', 'inconclusive']),
  performanceValidity: z.literal('not-qualified'), performanceBudgetResult: z.enum(['passed', 'failed', 'inconclusive']),
  window: LoadWindowSchema, baselineSamples: z.number().int().nonnegative(), benchmarkSamples: z.number().int().nonnegative(),
  contamination: z.array(z.string()), unknowns: z.array(z.string()),
  metrics: z.strictObject({ minimumBaselineIdlePct: Percent.nullable(), maximumOtherMachineCpuPct: Nonnegative,
    maximumOtherSingleCoreCpuPct: Nonnegative, maximumToolingCoreCpuPct: Nonnegative, maximumCollectorCoreCpuPct: Nonnegative,
    swapGrowthBytes: Nonnegative.nullable(), swapIoBytes: Nonnegative.nullable(), diagnosticOtherGpuActiveClients: z.number().int().nonnegative() }),
});
export type LoadAssessment = z.infer<typeof LoadAssessmentSchema>;
