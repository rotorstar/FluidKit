import { describe, expect, it, vi } from 'vitest';
import { defineFlow, SceneNodeSchema, type CapturedFrame, type TextAudit } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { WorkspaceDataSchema } from '@fluidkit/cases';
import { captureRehearsalFrame } from '../../apps/studio/lib/rehearsal-capture';
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
function fixture() {
  const node = SceneNodeSchema.parse({ id: 'one', kind: 'card', text: 'Public', anatomy: { componentId: 'one', part: 'root', behavior: 'presentation' }, width: 1, height: 1 });
  const runtime = createFluidRuntime({ flow: defineFlow({ id: 'case', name: 'Fixture', initial: 'ready', states: { ready: { label: 'Ready', nodes: [node], on: { refresh: { target: 'ready' } } } } }) });
  const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'fixture', capturedAt: '2026-11-20T10:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [] });
  const frame: CapturedFrame = { schemaVersion: 1, id: 'frame-one', surfaceFrame: 2, capturedAt: '2026-11-20T10:01:00Z', renderTimeMs: 0, backend: 'webgpu', progress: 1, viewport: { width: 1, height: 1, dpr: 1 }, image: PNG, pixelWidth: 1, pixelHeight: 1, parts: [{ id: 'one', componentId: 'one', part: 'root' }], redaction: 'no-sensitive-parts', coverage: 'selected-frame' };
  const metrics = { backend: 'webgpu' as const, fallbackReason: null, frames: 2, nodes: 1, geometries: 1, textBytes: 0, lastFrameMs: 0, phase: 'idle' as const, progress: 1, durationMs: 0, shader: 'typegpu-0.12.9' as const, effectId: null, effectPhase: 'settled' as const, canReplay: false, kernelCheck: null };
  const presentation = structuredClone(sampleTransitionClip(createTransitionClip({ source: [node], target: [node], plan: null, durationMs: 0, viewport: { width: 1, height: 1 } }), 1));
  const audit: TextAudit = { scale: 1, viewport: { width: 1, height: 1 }, backend: 'webgpu', progress: 1, checkedNodes: 1, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] };
  const controls = { getPresentationMode: (): 'live' | 'replay' => 'live', pause() {}, getMetrics: () => metrics, getRecording: () => null, getPresentation: () => presentation, captureFrame: vi.fn(async () => frame), inspectText: vi.fn(async () => audit) };
  const input = { runtime, controls, data, buildId: 'fixture-build', runId: 'fixture-run', beatId: null, viewport: () => ({ width: 1, height: 1 }), isCurrent: () => true };
  return { input, frame, controls, runtime, metrics, presentation };
}
describe('bound Rehearsal still provenance', () => {
  it('retains original bytes with live run, stable dataset and SHA-256 binding', async () => {
    const f = fixture(); try { const first = await captureRehearsalFrame(f.input); f.input.data.capturedAt = '2026-11-20T11:00:00Z'; const second = await captureRehearsalFrame(f.input); expect(first.frame.image).toBe(PNG); expect(first.frame.binding).toMatchObject({ runId: 'fixture-run', presentation: 'live', auditBinding: 'stable-paused-presentation' }); expect(first.frame.binding?.datasetHash).toBe(second.frame.binding?.datasetHash); expect(first.frame.binding?.imageSha256).toMatch(/^[a-f0-9]{64}$/); } finally { f.runtime.dispose(); }
  });
  it('rejects imported replay before reading pixels', async () => { const f = fixture(); f.controls.getPresentationMode = () => 'replay'; try { await expect(captureRehearsalFrame(f.input)).rejects.toThrow('Replay'); expect(f.controls.captureFrame).not.toHaveBeenCalled(); } finally { f.runtime.dispose(); } });
  it.each(['runtime', 'trace', 'seek', 'geometry', 'viewport', 'unmount', 'replay'] as const)('rejects %s change during capture', async change => {
    const f = fixture(); f.controls.captureFrame.mockImplementation(async () => {
      if (change === 'runtime') f.runtime.send('refresh');
      if (change === 'trace') f.runtime.send('unknown');
      if (change === 'seek') f.metrics.progress = .5;
      if (change === 'geometry') f.presentation.nodes[0]!.x += 1;
      if (change === 'viewport') f.input.viewport = () => ({ width: 2, height: 1 });
      if (change === 'unmount') f.input.isCurrent = () => false;
      if (change === 'replay') f.controls.getPresentationMode = () => 'replay';
      return f.frame;
    });
    try { await expect(captureRehearsalFrame(f.input)).rejects.toThrow(); } finally { f.runtime.dispose(); }
  });
  it('rejects sensitive presented content and mismatched text audit', async () => {
    const f = fixture(); try { f.presentation.nodes[0]!.sensitive = true; await expect(captureRehearsalFrame(f.input)).rejects.toThrow('Private'); expect(f.controls.captureFrame).not.toHaveBeenCalled(); f.presentation.nodes[0]!.sensitive = false; f.controls.inspectText.mockResolvedValue({ ...(await f.controls.inspectText()), progress: .5 }); await expect(captureRehearsalFrame(f.input)).rejects.toThrow('Präsentation'); } finally { f.runtime.dispose(); }
  });
});
