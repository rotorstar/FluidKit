// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { CapturedFrameSchema, EffectSettingsSchema, M7_DIRECTIONS, M8_DIRECTIONS, M8_EFFECT_IDS, M8_PHASES, M8QualificationSchema, NativeTargetAuditSchema, SceneNodeSchema, TextAuditSchema, VisualScenarioV3Schema } from '@fluidkit/contracts';
import { PresentationFrameSchema, resolveEffect } from '@fluidkit/effects';
import { inspectM8NativeTargets, presentedTargetBounds } from '../../apps/studio/lib/m8-native-targets';

const controls = ['alpha', 'beta'].map((key, index) => SceneNodeSchema.parse({ id: `${key}-selection`, kind: 'button', x: 20, y: 40 + index * 45, width: 24, height: 24,
  anatomy: { componentId: key, part: 'selection', behavior: 'checkbox' }, collection: { id: 'modules', itemId: key }, checked: true }));
controls.push(SceneNodeSchema.parse({ id: 'inspector-close', kind: 'button', x: 250, y: 10, width: 24, height: 24, onActivate: 'inspector.close', anatomy: { componentId: 'inspector', part: 'close', behavior: 'button' } }));

/** Synthetic schema fixture only: no GPU, native browser or visual review claim. */
function contractReport() {
  const cases = M8_EFFECT_IDS.flatMap(effect => M8_DIRECTIONS.map(([source, target]) => {
    const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: effect, version: '1.0.0' } }),
      capabilities: { backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false }, eventId: `matrix-${source}-${target}`, eventType: `view.${target}`,
      caseId: 'unit-fixture', sourceState: source, targetState: target, sourceRevision: 3, targetRevision: 4, baseDuration: 900, nodeCount: controls.length });
    return { effect, source, target, revision: 4, selectedIds: ['alpha', 'beta'], inspectorOpen: true, issues: [],
      setupEvents: [{ type: 'reset', revision: 1, accepted: true }, { type: 'collection.change', revision: 2, accepted: true }, { type: 'inspector.open', revision: 3, accepted: true }],
      recording: VisualScenarioV3Schema.parse({ schemaVersion: 3, source: controls, target: controls, viewport: { width: 300, height: 600 }, plan, durationMs: 900, caseId: 'unit-fixture', redacted: false }),
      samples: M8_PHASES.map((progress, index) => ({
        frame: CapturedFrameSchema.parse({ schemaVersion: 1, id: `${effect}-${source}-${target}-${index}`, surfaceFrame: index + 1,
          capturedAt: '2026-11-13T10:00:00Z', renderTimeMs: index, backend: 'webgpu', progress, viewport: { width: 300, height: 600, dpr: 1 },
          pixelWidth: 300, pixelHeight: 600, image: 'data:image/png;base64,AA==', parts: [], redaction: 'no-sensitive-parts', coverage: 'selected-frame' }),
        textAudit: TextAuditSchema.parse({ scale: 1, viewport: { width: 300, height: 600 }, backend: 'webgpu', progress, checkedNodes: 0, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] }),
        geometry: { progress, nodes: controls.map(({ id, x, y, width, height, rotation, opacity }) => ({ id, x, y, width, height, rotation, opacity })), lensPresent: false, particleCount: 0, shadowCount: 0 },
        nativeTargets: NativeTargetAuditSchema.parse({ method: 'domrect-versus-presented-controls', toleranceCssPx: 1, expectedIds: controls.map(node => node.id), issues: [], observations: controls.map(node => ({
          id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part, expected: presentedTargetBounds(node), actual: presentedTargetBounds(node), maxDeviation: 0,
          matches: 1, actualComponentId: node.anatomy.componentId, actualPart: node.anatomy.part,
          expectedChecked: node.anatomy.behavior === 'checkbox' ? true : null, actualChecked: node.anatomy.behavior === 'checkbox' ? true : null, inert: false, tabIndex: 0,
        })) }), selectedIds: ['alpha', 'beta'], inspectorOpen: true,
      })),
    };
  }));
  return M8QualificationSchema.parse({ schemaVersion: 1, milestone: 'M8', generatedAt: '2026-11-13T10:00:00Z', buildId: 'unit-only', dataVersion: 'unit-only', dataSource: 'explicit synthetic contract fixture', moduleIds: ['alpha', 'beta'], selectedIds: ['alpha', 'beta'],
    scope: 'core-collection-five-checkpoints-native-targets', backend: 'webgpu', browser: { width: 390, height: 800, dpr: 1 }, surface: { width: 300, height: 600, dpr: 1 }, cases, result: 'passed', issues: [], limitations: ['Synthetic contract fixture only.'] });
}

describe('M8 qualification report', () => {
  it('keeps historical M7 detail directions separate and declares 18 new collection cases', () => {
    expect(M7_DIRECTIONS).toContainEqual(['cards', 'detail']);
    expect(M8_DIRECTIONS).toContainEqual(['map', 'table']);
    expect(M8_DIRECTIONS.flatMap(direction => direction)).not.toContain('detail');
    const report = contractReport(); expect(report.cases).toHaveLength(18); expect(report.cases.flatMap(item => item.samples)).toHaveLength(90);
  });
  it.each(['selection', 'inspector', 'unknown-module', 'missing-native', 'native-drift', 'native-checked', 'native-identity', 'duplicate-native', 'fake-delta', 'fake-expected', 'missing-setup', 'late-setup', 'viewport', 'backend', 'phase', 'plan', 'missing-frame', 'duplicate-case', 'reused-frame', 'endpoint-residue', 'endpoint-geometry'] as const)('rejects false success with %s', kind => {
    const report = contractReport(), item = report.cases[0]!, sample = item.samples[0]!, native = sample.nativeTargets.observations[0]!;
    switch (kind) {
      case 'selection': sample.selectedIds = ['alpha', 'other']; break;
      case 'inspector': Object.assign(sample, { inspectorOpen: false }); break;
      case 'unknown-module': report.moduleIds = ['alpha', 'other']; break;
      case 'missing-native': sample.nativeTargets.expectedIds.shift(); sample.nativeTargets.observations.shift(); break;
      case 'native-drift': native.actual!.x += 1.01; native.maxDeviation = 1.01; break;
      case 'native-checked': native.actualChecked = false; break;
      case 'native-identity': native.actualPart = 'other'; break;
      case 'duplicate-native': native.matches = 2; break;
      case 'fake-delta': native.actual!.x += 5; break;
      case 'fake-expected': native.actual!.x += 5; native.expected.x += 5; break;
      case 'missing-setup': item.setupEvents[1]!.type = 'unrelated'; break;
      case 'late-setup': item.setupEvents[1]!.revision = item.revision; break;
      case 'viewport': sample.frame.viewport.width++; break;
      case 'backend': sample.frame.backend = 'webgl2'; break;
      case 'phase': sample.frame.progress = .1; break;
      case 'plan': item.recording.plan!.targetRevision++; break;
      case 'missing-frame': item.samples.pop(); break;
      case 'duplicate-case': report.cases[1] = item; break;
      case 'reused-frame': item.samples[1]!.frame.id = sample.frame.id; break;
      case 'endpoint-residue': sample.geometry.particleCount = 1; break;
      case 'endpoint-geometry': item.recording.source[0]!.x += 10; break;
    }
    expect(M8QualificationSchema.safeParse(report).success).toBe(false);
  });
  it('accepts one CSS pixel boundary and retains failed native measurements without claiming success', () => {
    const report = contractReport(), target = report.cases[0]!.samples[0]!.nativeTargets.observations[0]!;
    target.actual!.x += 1; target.maxDeviation = 1; expect(M8QualificationSchema.safeParse(report).success).toBe(true);
    target.actual!.x++; target.maxDeviation = 2; report.result = 'failed'; expect(M8QualificationSchema.safeParse(report).success).toBe(true);
  });
});

function rect(x: number, y: number, width: number, height: number): DOMRect {
  return { x, y, left: x, top: y, right: x + width, bottom: y + height, width, height, toJSON: () => ({ x, y, width, height }) };
}
it('measures native bounds relative to the real canvas origin and detects missing/unchecked targets', () => {
  const root = document.createElement('div'), canvas = document.createElement('canvas'); root.append(canvas); document.body.append(root);
  canvas.getBoundingClientRect = () => rect(100, 200, 300, 600);
  const node = controls[0]!;
  const input = document.createElement('input'); input.type = 'checkbox'; input.checked = true; input.dataset.fluidNode = node.id; root.append(input);
  input.dataset.component = node.anatomy.componentId; input.dataset.part = node.anatomy.part;
  input.getBoundingClientRect = () => rect(120, 240, 24, 24);
  const frame = PresentationFrameSchema.parse({ progress: .5, nodes: [node], nodeStates: [], lens: null, particles: [] });
  try {
    const result = inspectM8NativeTargets(root, frame, [node]); expect(result.issues).toEqual([]); expect(result.observations[0]!.maxDeviation).toBe(0);
    input.checked = false; expect(inspectM8NativeTargets(root, frame, [node]).issues).toContain(`${node.id}: native Auswahl stimmt nicht mit Core überein.`);
    input.remove(); const missing = inspectM8NativeTargets(root, frame, [node]); expect(missing.issues).toContain(`${node.id}: natives Ziel fehlt.`); expect(missing.observations[0]!.actual).toBeNull();
  } finally { root.remove(); }
});
it('uses centre-rotated DOM bounds rather than comparing a transformed DOMRect with the unrotated box', () => {
  const rotated = presentedTargetBounds({ x: 10, y: 20, width: 100, height: 40, rotation: Math.PI / 2 });
  expect(rotated.x).toBeCloseTo(40); expect(rotated.y).toBeCloseTo(-10); expect(rotated.width).toBeCloseTo(40); expect(rotated.height).toBeCloseTo(100);
  expect(presentedTargetBounds({ x: 10, y: 20, width: 100, height: 40, rotation: 0 })).toEqual({ x: 10, y: 20, width: 100, height: 40 });
});
