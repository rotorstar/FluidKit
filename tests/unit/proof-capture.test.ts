import { describe, expect, it, vi } from 'vitest';
import { defineFlow, NativeProofSchema, type CapturedFrame, type NativeTargetAudit } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { captureNativeProof, proofSha256, validateNativeProof, type NativeProofPort } from '../../packages/testing/src/proof-capture';
import { presentedTargetBounds } from '../../apps/studio/lib/m8-native-targets';

// Explicit 1x1 PNG and port fixture. This suite asserts binding, not GPU output.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
function fixture() {
  const flow = defineFlow({ id: 'workspace-explorer', name: 'Binding fixture', initial: 'table', fields: [
    { id: 'query', initial: '' }, { id: 'note', initial: 'PRIVATE-NOTE', sensitive: true }, { id: 'sort', initial: 'name' }, { id: 'direction', initial: 'asc' }, { id: 'selected', initial: '' }, { id: 'group', initial: 'all' }, { id: 'selection', type: 'keys', initial: [] }, { id: 'inspectorOpen', type: 'boolean', initial: false },
  ], states: { table: { label: 'Table', nodes: [{ id: 'search', kind: 'input', binding: 'query', label: 'Search', x: 0, y: 0, width: 1, height: 1, anatomy: { componentId: 'search', part: 'control', behavior: 'textbox' } }], on: { refresh: { target: 'table' } } } } });
  const runtime = createFluidRuntime({ flow });
  const viewport = { browser: { width: 390, height: 800, dpr: 1 }, surface: { x: 10, y: 20, width: 1, height: 1 } };
  let scene = runtime.getScene({ width: viewport.surface.width, height: viewport.surface.height });
  let presentation = sampleTransitionClip(createTransitionClip({ source: scene, target: scene, plan: null, durationMs: 0, viewport: { width: viewport.surface.width, height: viewport.surface.height } }), 1);
  let metrics = { backend: 'webgpu' as const, frames: 2, phase: 'idle' as 'idle' | 'paused' | 'transitioning', progress: 1 };
  const frame: CapturedFrame = { schemaVersion: 1, id: 'frame-test-2', surfaceFrame: 2, capturedAt: '2026-11-13T13:00:00Z', renderTimeMs: 10, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, pixelWidth: 1, pixelHeight: 1, image: PNG, parts: scene.map(node => ({ id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part })), redaction: 'no-sensitive-parts', coverage: 'selected-frame' };
  const capture = vi.fn(async () => frame);
  const port: NativeProofPort = { runtime, captureFrame: capture, getPresentation: () => presentation, getMetrics: () => metrics, getRecording: () => null, getPresentationMode: () => 'live', viewport: () => structuredClone(viewport), isCurrent: () => true,
    inspectTargets(presented, current): NativeTargetAudit { const nodes = current.filter(n => ['button', 'checkbox', 'textbox'].includes(n.anatomy.behavior)); return { method: 'domrect-versus-presented-controls', toleranceCssPx: 1, expectedIds: nodes.map(n => n.id), issues: [], observations: nodes.map(node => {
      const expected = presentedTargetBounds(presented.nodes.find(n => n.id === node.id)!);
      return { id: node.id, componentId: node.anatomy.componentId, part: node.anatomy.part, matches: 1, actualComponentId: node.anatomy.componentId, actualPart: node.anatomy.part, expected, actual: expected, maxDeviation: 0, expectedChecked: null, actualChecked: null, inert: false, tabIndex: 0 };
    }) }; },
  };
  const context = { id: 'native-fixture', buildId: 'fluid-test', dataset: { version: '2026-11-13T12:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)' as const, moduleIds: ['core'], sha256: 'a'.repeat(64) } };
  return { runtime, port, capture, frame, viewport, context, get metrics() { return metrics; }, setMetrics(value: Partial<typeof metrics>) { metrics = { ...metrics, ...value }; }, refresh() { scene = runtime.getScene({ width: viewport.surface.width, height: viewport.surface.height }); presentation = sampleTransitionClip(createTransitionClip({ source: scene, target: scene, plan: null, durationMs: 0, viewport: { width: viewport.surface.width, height: viewport.surface.height } }), 1); }, changePresentation() { presentation = { ...presentation }; } };
}

describe('bound native proof export', () => {
  it('binds a real Core snapshot, metadata trace, measured targets and original PNG without native-input claims', async () => {
    const f = fixture();
    f.runtime.send('unknown-private-event', { private: 'PRIVATE-PAYLOAD' }, 'user', 'keyboard');
    const proof = await captureNativeProof(f.port, f.context);
    expect(proof.inputProvenance).toBe('not-observed-by-exporter');
    expect(proof.trace[0]).toMatchObject({ eventType: 'redacted-event', applicationReportedReason: 'keyboard' });
    expect(proof.snapshot.redactedFieldIds).toEqual(['query', 'note']);
    expect(JSON.stringify(proof)).not.toMatch(/PRIVATE-NOTE|PRIVATE-PAYLOAD|unknown-private-event|Unknown event/);
    expect(proof.frame.image).toBe(PNG);
    expect(await validateNativeProof(proof)).toEqual(proof);
    expect(f.runtime.getSnapshot().revision).toBe(0);
    f.runtime.dispose();
  });
  it('keeps v1 archives readable and versions M9 presentation fields explicitly', async () => {
    const f = fixture();
    const proof = await captureNativeProof(f.port, f.context);
    expect(proof.schemaVersion).toBe(2);
    expect(proof.appearance?.preset).toBe('blue');
    expect(NativeProofSchema.safeParse({ ...proof, appearance: undefined, schemaVersion: 1 }).success).toBe(true);
    expect(NativeProofSchema.safeParse({ ...proof, schemaVersion: 1 }).success).toBe(false);
    const extended = { ...proof, snapshot: { ...proof.snapshot, state: 'compare', fields: { ...proof.snapshot.fields, compareDifferences: true, atlasMetric: 'files', atlasGroup: 'Kernel' } } };
    expect(NativeProofSchema.safeParse(extended).success).toBe(true);
    expect(NativeProofSchema.safeParse({ ...extended, schemaVersion: 1 }).success).toBe(false);
    expect(NativeProofSchema.safeParse({ ...extended, snapshot: { ...extended.snapshot, fields: { ...extended.snapshot.fields, atlasMetric: 'quality' } } }).success).toBe(false);
    f.runtime.dispose();
  });
  it.each(['snapshot', 'trace', 'interaction', 'visual', 'viewport', 'unmount', 'frame', 'seek', 'replay'] as const)('rejects %s changing during capture', async change => {
    const f = fixture();
    f.capture.mockImplementation(async () => {
      if (change === 'snapshot') f.runtime.send('field.change', { fieldId: 'query', value: 'private' });
      if (change === 'trace') f.runtime.send('invalid');
      if (change === 'interaction') f.runtime.setInteraction({ focusedId: 'search' });
      if (change === 'visual') f.runtime.configureEffects({ ...f.runtime.getVisualState().settings, seed: 99 });
      if (change === 'viewport') f.viewport.browser.width++;
      if (change === 'unmount') f.port.isCurrent = () => false;
      if (change === 'frame') f.setMetrics({ frames: 3 });
      if (change === 'seek') { f.frame.progress = .5; f.setMetrics({ progress: .5 }); }
      if (change === 'replay') f.port.getPresentationMode = () => 'replay';
      return f.frame;
    });
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow();
    f.runtime.dispose();
  });
  it('refuses moving capture and permits an explicitly paused checkpoint', async () => {
    const f = fixture(); f.setMetrics({ phase: 'transitioning' });
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/pausieren/);
    expect(f.capture).not.toHaveBeenCalled();
    f.setMetrics({ phase: 'paused' }); expect((await captureNativeProof(f.port, f.context)).metrics.phase).toBe('paused'); f.runtime.dispose();
  });
  it.each(['null-plan', 'same-state-revision'] as const)('never binds imported %s replay to the live dataset', async kind => {
    const f = fixture();
    if (kind === 'same-state-revision') { expect(f.runtime.send('refresh').accepted).toBe(true); f.refresh(); }
    const node = f.runtime.getScene({ width: 1, height: 1 })[0]!;
    f.port.getRecording = () => ({ schemaVersion: 2, caseId: 'workspace-explorer', viewport: { width: 1, height: 1 }, source: [{ ...node, binding: undefined, text: 'Foreign recording' }], target: [node], plan: kind === 'null-plan' ? null : f.runtime.getVisualState().current, durationMs: 100, redacted: false });
    if (kind === 'same-state-revision') expect(f.port.getRecording()?.plan).toMatchObject({ targetState: f.runtime.getSnapshot().state, targetRevision: f.runtime.getSnapshot().revision });
    f.port.getPresentationMode = () => 'replay';
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/Live-Ansicht/);
    expect(f.capture).not.toHaveBeenCalled(); f.runtime.dispose();
  });
  it('refuses free query pixels and sensitive outgoing parts before reading the canvas', async () => {
    const f = fixture(); f.runtime.send('field.change', { fieldId: 'query', value: 'PRIVATE-SEARCH' }); f.refresh();
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/Suchtext/); expect(f.capture).not.toHaveBeenCalled();
    f.runtime.send('field.change', { fieldId: 'query', value: '' }); f.refresh();
    const node = f.runtime.getScene({ width: f.viewport.surface.width, height: f.viewport.surface.height })[0]!;
    f.port.getRecording = () => ({ schemaVersion: 2, caseId: 'test', viewport: { width: 1, height: 1 }, source: [{ ...node, sensitive: true, text: '[redacted]' }], target: [node], plan: null, durationMs: 100, redacted: true });
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/private Inhalte/); expect(f.capture).not.toHaveBeenCalled(); f.runtime.dispose();
  });
  it('rejects a presentation changed inside the target measurement', async () => {
    const f = fixture(), original = f.port.inspectTargets;
    f.port.inspectTargets = (frame, scene) => { const audit = original(frame, scene); f.changePresentation(); return audit; };
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/Geometriemessung/); f.runtime.dispose();
  });
  it.each(['backend', 'counter', 'progress', 'viewport', 'selection', 'target-geometry', 'part', 'trace'] as const)('rejects falsified %s binding', async change => {
    const f = fixture(), proof = await captureNativeProof(f.port, f.context);
    if (change === 'backend') proof.metrics.backend = 'webgl2';
    if (change === 'counter') proof.metrics.frames++;
    if (change === 'progress') proof.geometry.progress = .5;
    if (change === 'viewport') proof.viewport.surface.width++;
    if (change === 'selection') proof.snapshot.fields.selection = ['missing'];
    if (change === 'target-geometry') proof.nativeTargets.observations[0]!.expected.x++;
    if (change === 'part') proof.frame.parts[0]!.componentId = 'unrelated';
    if (change === 'trace') proof.trace.push({ sequence: 1, timestamp: 1, kind: 'accepted', revision: 1, state: 'table', eventType: 'refresh', applicationReportedReason: null });
    expect(NativeProofSchema.safeParse(proof).success).toBe(false); f.runtime.dispose();
  });
  it('verifies PNG byte digest and actual IHDR dimensions independently of metadata', async () => {
    const f = fixture(), proof = await captureNativeProof(f.port, f.context);
    proof.imageSha256 = await proofSha256('not-the-image');
    await expect(validateNativeProof(proof)).rejects.toThrow(/Digest/);
    f.frame.pixelWidth = 2;
    await expect(captureNativeProof(f.port, f.context)).rejects.toThrow(/PNG-Abmessungen/); f.runtime.dispose();
  });
  it('bounds fractional-CSS image quantization without changing the native target tolerance', async () => {
    const f = fixture(), proof = await captureNativeProof(f.port, f.context);
    proof.viewport.surface.width = proof.frame.viewport.width = 281.25;
    proof.viewport.surface.height = proof.frame.viewport.height = 1980;
    proof.frame.pixelWidth = 281; proof.frame.pixelHeight = 1980;
    proof.frame.viewport.dpr = 281 / 281.25;
    expect(Math.abs(proof.frame.pixelHeight - proof.frame.viewport.height * proof.frame.viewport.dpr)).toBeGreaterThan(1);
    expect(NativeProofSchema.safeParse(proof).success).toBe(true);
    expect(proof.nativeTargets.toleranceCssPx).toBe(1);
    proof.frame.pixelHeight += 10;
    expect(NativeProofSchema.safeParse(proof).success).toBe(false); f.runtime.dispose();
  });
});
