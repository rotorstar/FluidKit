import { describe, expect, it, vi } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { WorkspaceDataSchema, createArchitectureReviewFlow } from '@fluidkit/cases';
import { SceneNodeSchema, type CapturedFrame, type NativeTargetAudit, type TextAudit } from '@fluidkit/contracts';
import { createTransitionClip, sampleTransitionClip, normalizeVisualScenario } from '@fluidkit/effects';
import { createResourceLedger, type SurfaceMetrics, type SurfacePlaybackControls } from '@fluidkit/webgpu';
import { captureFlowProof, FlowProofSchema } from '../../apps/studio/lib/flow-proof';
import { presentedTargetBounds } from '../../apps/studio/lib/m8-native-targets';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
// Explicit one-pixel port fixture: binding, rejection and privacy, never a GPU visual proof.
function fixture() {
  const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'fixture', capturedAt: '2026-11-14T06:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [{ id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 1, lines: 1, dependencies: [], internal: [] }] });
  const node = SceneNodeSchema.parse({ id: 'review.start', kind: 'button', text: 'Start', anatomy: { componentId: 'review', part: 'start', behavior: 'button' }, onActivate: 'review.begin', width: 1, height: 1 });
  const runtime = createFluidRuntime({ flow: createArchitectureReviewFlow(data, 'core'), projections: { 'architecture-review': () => [node] } });
  const presentation = sampleTransitionClip(createTransitionClip({ source: [node], target: [node], plan: null, durationMs: 0, viewport: { width: 1, height: 1 } }), 1);
  const metrics: SurfaceMetrics = { backend: 'webgpu', fallbackReason: null, frames: 2, nodes: 1, geometries: 1, textBytes: 0, lastFrameMs: 0, phase: 'idle', progress: 1, durationMs: 0, shader: 'typegpu-0.12.9', effectId: null, effectPhase: 'settled', canReplay: false, kernelCheck: null };
  const frame: CapturedFrame = { schemaVersion: 1, id: 'fixture-frame', surfaceFrame: 2, capturedAt: '2026-11-14T06:01:00Z', renderTimeMs: 0, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, image: PNG, pixelWidth: 1, pixelHeight: 1, parts: [{ id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part }], redaction: 'no-sensitive-parts', coverage: 'selected-frame' };
  const audit: TextAudit = { scale: 1, viewport: { width: 1, height: 1 }, backend: 'webgpu', progress: 1, checkedNodes: 1, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] };
  const capture = vi.fn(async () => frame), inspect = vi.fn(async () => audit);
  const controls: SurfacePlaybackControls = { getPresentationMode: () => 'live', getMetrics: () => metrics, getPresentation: () => presentation, getRecording: () => null, getResources: () => createResourceLedger().snapshot(), getFrameTimings: () => [], pause() {}, play() {}, seek() {}, replay() {}, importRecording() {}, restoreLive() {}, captureFrame: capture, inspectText: inspect, async verifyKernels() { throw new Error('No GPU'); } };
  const target = presentedTargetBounds(node), targets: NativeTargetAudit = { method: 'domrect-versus-presented-controls', toleranceCssPx: 1, expectedIds: [node.id], issues: [], observations: [{ id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part, matches: 1, actualComponentId: node.anatomy.componentId, actualPart: node.anatomy.part, expected: target, actual: target, maxDeviation: 0, expectedChecked: null, actualChecked: null, inert: false, tabIndex: 0 }] };
  const port = { isCurrent: () => true, viewport: () => ({ width: 1, height: 1 }), inspectTargets: () => targets };
  return { runtime, controls, node, presentation, metrics, frame, capture, inspect, port, context: { data, moduleId: 'core', buildId: 'fixture-build' } };
}
describe('Flow-specific original-frame evidence', () => {
  it('exports registered metadata only, exact original pixels and honest scope without Workspace fields', async () => {
    const f = fixture(); f.runtime.send('private-event', { secret: 'PRIVATE-PAYLOAD' });
    try {
      const proof = await captureFlowProof(f.runtime, f.controls, f.context, f.port);
      expect(proof.frame.image).toBe(PNG); expect(proof.snapshot).toEqual({ flowId: 'architecture-review', state: 'scope', inspectedNode: 'scope', revision: 0 });
      expect(proof.trace[0]!.eventType).toBe('redacted-event'); expect(JSON.stringify(proof)).not.toMatch(/private-event|PRIVATE-PAYLOAD|Unknown event/);
      expect(proof.appearance).toEqual(f.runtime.getVisualState().settings.theme); expect(proof.inputProvenance).toBe('not-observed-by-exporter'); expect(FlowProofSchema.safeParse(proof).success).toBe(true);
    } finally { f.runtime.dispose(); }
  });
  it.each(['snapshot', 'trace', 'seek', 'replay', 'viewport', 'unmount', 'frame'] as const)('rejects %s changes during asynchronous capture', async change => {
    const f = fixture();
    f.capture.mockImplementation(async () => {
      if (change === 'snapshot') f.runtime.send('inspect.review');
      if (change === 'trace') f.runtime.send('unknown');
      if (change === 'seek') f.metrics.progress = .5;
      if (change === 'replay') f.controls.getPresentationMode = () => 'replay';
      if (change === 'viewport') f.port.viewport = () => ({ width: 2, height: 1 });
      if (change === 'unmount') f.port.isCurrent = () => false;
      if (change === 'frame') f.metrics.frames = 3;
      return f.frame;
    });
    try { await expect(captureFlowProof(f.runtime, f.controls, f.context, f.port)).rejects.toThrow(); } finally { f.runtime.dispose(); }
  });
  it('blocks moving, replayed and sensitive source frames before canvas access', async () => {
    const f = fixture();
    try {
      f.metrics.phase = 'transitioning'; await expect(captureFlowProof(f.runtime, f.controls, f.context, f.port)).rejects.toThrow();
      f.metrics.phase = 'idle'; f.controls.getPresentationMode = () => 'replay'; await expect(captureFlowProof(f.runtime, f.controls, f.context, f.port)).rejects.toThrow();
      f.controls.getPresentationMode = () => 'live'; f.controls.getRecording = () => normalizeVisualScenario({ schemaVersion: 2, caseId: 'foreign', viewport: { width: 1, height: 1 }, source: [{ ...f.node, sensitive: true, text: 'PRIVATE' }], target: [f.node], plan: null, durationMs: 100, redacted: false });
      await expect(captureFlowProof(f.runtime, f.controls, f.context, f.port)).rejects.toThrow(/Private/); expect(f.capture).not.toHaveBeenCalled();
    } finally { f.runtime.dispose(); }
  });
  it('rejects a text-inspection checkpoint different from its captured frame', async () => {
    const f = fixture(); f.inspect.mockResolvedValue({ scale: 1, viewport: { width: 1, height: 1 }, backend: 'webgpu', progress: .25, checkedNodes: 0, hiddenDuringMotion: 0, boxes: [], issues: [], textStyles: [] });
    try { await expect(captureFlowProof(f.runtime, f.controls, f.context, f.port)).rejects.toThrow(/Frame/); } finally { f.runtime.dispose(); }
  });
});
