import { describe, expect, it } from 'vitest';
import { CapturedFrameSchema, EffectSettingsSchema, M7_DIRECTIONS, M7_EFFECT_IDS, M7_PHASES, SceneNodeSchema, TextAuditSchema, VisualScenarioV3Schema, WorkspaceQualificationSchema } from '@fluidkit/contracts';
import { resolveEffect } from '@fluidkit/effects';
import { checkpointComplete, endpointIssues } from '../../packages/testing/src/workspace-qualification';

/** Contract-only fixture: these synthetic bytes do not represent a GPU capture. */
function completeContractReport() {
  const node = SceneNodeSchema.parse({ id: 'a', kind: 'card', anatomy: { componentId: 'a', part: 'root', behavior: 'presentation' } });
  const cases = M7_EFFECT_IDS.flatMap(effect => M7_DIRECTIONS.map(([source, target]) => {
    const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: effect, version: '1.0.0' } }),
      capabilities: { backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false }, eventId: `matrix-${source}-${target}`, eventType: `view.${target}`,
      caseId: 'unit-fixture', sourceState: source, targetState: target, sourceRevision: 1, targetRevision: 2, baseDuration: 900, nodeCount: 1 });
    return { effect, source, target, revision: 2, issues: [],
      recording: VisualScenarioV3Schema.parse({ schemaVersion: 3, source: [node], target: [node], viewport: { width: 300, height: 600 }, plan, durationMs: 900, caseId: 'unit-fixture', redacted: false }),
      samples: M7_PHASES.map((progress, index) => ({
        frame: CapturedFrameSchema.parse({ schemaVersion: 1, id: `${effect}-${source}-${target}-${index}`, surfaceFrame: index + 1,
          capturedAt: '2026-11-04T03:00:00Z', renderTimeMs: index, backend: 'webgpu', progress, viewport: { width: 300, height: 600, dpr: 1 },
          pixelWidth: 300, pixelHeight: 600, image: 'data:image/png;base64,AA==', parts: [], redaction: 'no-sensitive-parts', coverage: 'selected-frame' }),
        textAudit: TextAuditSchema.parse({ scale: 1, viewport: { width: 300, height: 600 }, backend: 'webgpu', progress, checkedNodes: 1, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] }),
        geometry: { progress, nodes: [{ id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, rotation: node.rotation, opacity: node.opacity }], lensPresent: false, particleCount: 0, shadowCount: 0 },
      })),
    };
  }));
  return WorkspaceQualificationSchema.parse({ schemaVersion: 1, generatedAt: '2026-11-04T03:00:00Z', buildId: 'unit-only', dataVersion: 'unit-only',
    scope: 'core-events-five-checkpoints', backend: 'webgpu', browser: { width: 390, height: 800, dpr: 1 }, cases, result: 'passed', issues: [], limitations: ['Contract fixture only.'] });
}

describe('M7 qualification evidence', () => {
  it('cannot report success for an empty or duplicate matrix', () => {
    const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), buildId: 'test', dataVersion: 'test', scope: 'core-events-five-checkpoints', backend: 'webgpu', browser: { width: 390, height: 800, dpr: 1 }, cases: [], result: 'passed', issues: [], limitations: [] };
    expect(WorkspaceQualificationSchema.safeParse(report).success).toBe(false);
    expect(WorkspaceQualificationSchema.safeParse({ ...report, result: 'inconclusive' }).success).toBe(true);
  });
  it('covers each required edge in both directions for all three effects', () => {
    expect(new Set(M7_DIRECTIONS.flatMap(([a, b]) => M7_EFFECT_IDS.map(effect => `${effect}:${a}:${b}`))).size).toBe(18);
    for (const [a, b] of M7_DIRECTIONS) expect(M7_DIRECTIONS.some(([c, d]) => a === d && b === c)).toBe(true);
    expect(checkpointComplete([0, .25, .5, .75, 1])).toBe(true);
    expect(checkpointComplete([0, .25, .5, .5, 1])).toBe(false);
  });
  it('detects stale geometry, ghost nodes and effect residues independently', () => {
    const node = SceneNodeSchema.parse({ id: 'a', kind: 'card', anatomy: { componentId: 'a', part: 'root', behavior: 'presentation' } });
    const geometry = { progress: 1, nodes: [node], lensPresent: false, particleCount: 0, shadowCount: 0 };
    expect(endpointIssues(geometry, [node], 'target')).toEqual([]);
    expect(endpointIssues({ ...geometry, nodes: [{ ...node, x: 15 }, { ...node, id: 'ghost' }], particleCount: 1 }, [node], 'target')).toHaveLength(3);
  });
  it('accepts a complete report only with correlated plans, revisions and 90 checkpoints', () => {
    const report = completeContractReport();
    expect(report.cases).toHaveLength(18); expect(report.cases.flatMap(item => item.samples)).toHaveLength(90);
  });
  it.each(['recipe', 'source', 'target', 'revision', 'no-plan', 'text-backend', 'text-viewport', 'frame-backend', 'phase', 'missing-frame', 'duplicate-case'] as const)('rejects a false passing report with mismatched %s', kind => {
    const report = completeContractReport(), item = report.cases[0]!, sample = item.samples[0]!;
    switch (kind) {
      case 'recipe': item.recording.plan!.selected!.id = 'fluid-morph'; break;
      case 'source': item.recording.plan!.sourceState = 'different-source'; break;
      case 'target': item.recording.plan!.targetState = 'different-target'; break;
      case 'revision': item.recording.plan!.targetRevision++; break;
      case 'no-plan': item.recording.plan = null; break;
      case 'text-backend': sample.textAudit.backend = 'webgl2'; break;
      case 'text-viewport': sample.textAudit.viewport.width += 2; break;
      case 'frame-backend': sample.frame.backend = 'webgl2'; break;
      case 'phase': sample.frame.progress = .01; break;
      case 'missing-frame': item.samples.pop(); break;
      case 'duplicate-case': report.cases[1] = item; break;
    }
    expect(WorkspaceQualificationSchema.safeParse(report).success).toBe(false);
  });
});
