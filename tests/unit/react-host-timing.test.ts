import { describe, expect, it } from 'vitest';
import { DEFAULT_EFFECT_SETTINGS } from '@fluidkit/contracts';
import { resolveEffect } from '@fluidkit/effects';
import { HostTimingReportSchema, type HostTimingReport } from '../../scripts/react-host/timing';
function fixture(): HostTimingReport {
  const directions = ['row-card', 'card-row', 'card-compare', 'compare-card', 'atlas-split', 'atlas-merge'];
  const make = (phase: string) => directions.map((id, index) => ({ id,
    plan: resolveEffect({ settings: DEFAULT_EFFECT_SETTINGS, capabilities: { backend: 'webgpu', typegpu: true, compute: false, reducedMotion: false }, eventId: `r6-${phase}-${id}`, eventType: 'view.cards',
      caseId: 'workspace-explorer', sourceState: 'table', targetState: 'cards', sourceRevision: index, targetRevision: index + 1, baseDuration: 1100, nodeCount: 50 }),
    startedAt: '2026-11-20T00:00:00Z', endedAt: '2026-11-20T00:00:03Z', intervalsMs: Array.from({ length: 60 }, () => 16), elapsedMs: 1100,
    startFrame: 100 * index, endFrame: 100 * index + 61, idleEndFrame: 100 * index + 61, idleDurationMs: 1001, selectedIds: ['core', 'webgpu'], size: { width: 1080, height: 1000, pixelWidth: 2160, pixelHeight: 2000 } }));
  return { schemaVersion: 1, scope: 'r6-independent-host-structural-scheduler', hostId: 'explicit-unit-fixture', dataSha256: 'a'.repeat(64), startedAt: '2026-11-20T00:00:00Z', endedAt: '2026-11-20T00:01:00Z', userAgent: 'unit-fixture', backend: 'webgpu',
    viewport: { width: 1280, height: 900, dpr: 2 }, pollMs: 25, p95BudgetMs: 16.7, idleBudgetMs: 1000, warmup: make('warmup'), cases: make('measure'), issues: [], result: 'passed', limitations: ['No actual browser or performance evidence.'] };
}
describe('independent React host timing evidence', () => {
  it('preserves all six warmed measured directions and raw intervals', () => { expect(HostTimingReportSchema.parse(fixture()).cases).toHaveLength(6); });
  it('cannot label a missing, interrupted or duplicated direction as passed', () => {
    for (const mutate of [(r: HostTimingReport) => { r.cases.pop(); }, (r: HostTimingReport) => { r.issues.push('Visibility changed'); }, (r: HostTimingReport) => { r.cases[1] = r.cases[0]!; }]) {
      const report = fixture(); mutate(report); expect(HostTimingReportSchema.safeParse(report).success).toBe(false);
    }
    const report = fixture(); report.cases.pop(); report.result = 'inconclusive'; expect(HostTimingReportSchema.safeParse(report).success).toBe(true);
  });
  it('requires failed status for a genuine budget or idle-frame breach', () => {
    for (const mutate of [(r: HostTimingReport) => { r.cases[0]!.intervalsMs.fill(16.8); }, (r: HostTimingReport) => { r.cases[0]!.idleEndFrame++; }]) {
      const report = fixture(); mutate(report); expect(HostTimingReportSchema.safeParse(report).success).toBe(false); report.result = 'failed'; expect(HostTimingReportSchema.safeParse(report).success).toBe(true);
    }
  });
  it('rejects fabricated frame count, backend, event identity or shortened idle', () => {
    for (const mutate of [(r: HostTimingReport) => { r.cases[0]!.endFrame = 10; }, (r: HostTimingReport) => { r.cases[0]!.plan.capabilities.backend = 'webgl2'; },
      (r: HostTimingReport) => { r.cases[0]!.plan.eventId = 'unrelated'; }, (r: HostTimingReport) => { r.cases[0]!.idleDurationMs = 999; }]) {
      const report = fixture(); mutate(report); expect(HostTimingReportSchema.safeParse(report).success).toBe(false);
    }
  });
});
