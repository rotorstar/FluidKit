/** Read-only comparison of original host timing and load files; writes a new assessment edition. */
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { LoadReportSchema, LoadWindowSchema, summarizeM8Timings } from '@fluidkit/contracts';
import { assessLoadWindow } from '../../packages/testing/src/load';
import { HostTimingReportSchema } from './timing';
const [timingPath, loadPath, outputPath] = process.argv.slice(2);
if (!timingPath || !loadPath || !outputPath) throw new Error('Usage: assess.ts <timing.json> <load.json> <new-output.json>');
const sha = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const timingBytes = await readFile(timingPath), loadBytes = await readFile(loadPath);
const timing = HostTimingReportSchema.parse(JSON.parse(timingBytes.toString())), load = LoadReportSchema.parse(JSON.parse(loadBytes.toString()));
const window = LoadWindowSchema.parse({ schemaVersion: 1, startedAt: timing.startedAt, endedAt: timing.endedAt, source: 'observed-benchmark-boundary', timingSha256: sha(timingBytes), buildId: timing.hostId });
const assessment = assessLoadWindow(load, window, timing.result);
const from = Date.parse(timing.startedAt), to = Date.parse(timing.endedAt);
const observations = load.samples.filter(sample => Date.parse(sample.observedAt) >= from && Date.parse(sample.intervalStartedAt ?? sample.observedAt) <= to);
const peakProcesses = observations.flatMap(sample => sample.cpu.processes.map(process => ({ observedAt: sample.observedAt, ...process }))).sort((a, b) => (b.cpuCorePct ?? 0) - (a.cpuCorePct ?? 0)).slice(0, 12);
const report = { schemaVersion: 1, createdAt: new Date().toISOString(), scope: 'Independent Vite/React host on one local hardware/browser configuration.',
  inputs: { timing: { path: resolve(timingPath), sha256: sha(timingBytes) }, load: { path: resolve(loadPath), sha256: sha(loadBytes) } },
  assessment, directions: timing.cases.map(item => ({ id: item.id, plan: item.plan, selectedIds: item.selectedIds, size: item.size, elapsedMs: item.elapsedMs,
    intervals: summarizeM8Timings(item.intervalsMs), frameIntervals: item.intervalsMs.length, idleExtraFrames: item.idleEndFrame - item.endFrame, idleDurationMs: item.idleDurationMs })),
  peakProcesses, observerCost: 'The collector and 25-ms QA polling have nonzero cost. No screenshot/canvas readback occurred in the measured direction windows.',
  sessionBoundary: 'Only this host UI was driven by this agent. Concurrent sibling browser/build/E2E activity was not stopped. Process names and PID ancestry do not identify another task or assign causality.',
  limitations: ['No target PID was guessed; non-target CPU includes the benchmark browser and unrelated work.', 'Private GPU counters have unknown units/coverage and cannot attribute individual tabs. No GPU utilization percentage or GPU execution time inferred.',
    'Warmup and measured run are single repetitions of six directions, at the recorded viewport/DPR and real dataset. No mobile, cross-device, CI repeatability, thermal or power-efficiency qualification.',
    'Observed rAF scheduler-budget failure is retained independently of contaminated or inconclusive load assessment. No threshold was relaxed.'] };
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ output: outputPath, budget: timing.result, load: assessment.result, validity: assessment.performanceValidity, metrics: assessment.metrics,
  directions: report.directions.map(row => ({ id: row.id, ...row.intervals, idleExtraFrames: row.idleExtraFrames })) }, null, 2));
