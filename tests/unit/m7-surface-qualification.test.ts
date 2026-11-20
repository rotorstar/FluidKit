// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CapturedFrameSchema, M7SurfaceQualificationSchema, TextAuditSchema, type SceneNode } from '@fluidkit/contracts';
import { captureTransitionSource, createTransitionClip, recordTransitionClip, sampleTransitionClip, type TransitionClip } from '@fluidkit/effects';
import type { SurfaceOptions } from '@fluidkit/webgpu';
import { redactSceneNode } from '../../packages/webgpu/src/privacy';
import { qualifyM7Surfaces } from '../../apps/studio/lib/m7-surface-qualification';

const mocked = vi.hoisted(() => ({ create: vi.fn(), leak: false, allowSensitiveCapture: false, leakLabel: false, fontFailureName: 'SurfaceFontError' }));
vi.mock('@fluidkit/webgpu', async original => ({ ...await original<typeof import('@fluidkit/webgpu')>(), createFluidSurface: mocked.create }));

// Contract orchestration only: real pure sampler, explicit fake device boundary.
// These tests are not browser/GPU evidence; Studio runs use createFluidSurface itself.
beforeEach(() => {
  mocked.create.mockReset(); mocked.leak = false; mocked.allowSensitiveCapture = false; mocked.leakLabel = false; mocked.fontFailureName = 'SurfaceFontError';
  Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  vi.stubGlobal('devicePixelRatio', 1);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 600, height: 340, x: 0, y: 0, top: 0, left: 0, right: 600, bottom: 340, toJSON() { return {}; } });
  URL.createObjectURL = vi.fn(() => 'blob:invalid-font-fixture'); URL.revokeObjectURL = vi.fn();
  mocked.create.mockImplementation(async (_canvas: HTMLCanvasElement, options: SurfaceOptions) => {
    const ledger = options.resourceLedger!, closeOwner = ledger.openOwner(), release = ledger.acquire('surface');
    const backend = options.backendMode === 'webgl2' ? 'webgl2' : 'webgpu';
    let disposed = false;
    const dispose = () => { if (disposed) return; disposed = true; release(); closeOwner(); if (mocked.leak) ledger.acquire('material'); };
    options.onInitializationStage?.({ stage: 'renderer-ready', backend });
    if (options.signal?.aborted) { dispose(); throw new DOMException('Aborted', 'AbortError'); }
    if (options.fontUrl.startsWith('blob:')) { dispose(); const error = new Error('Explicit unit failure'); error.name = mocked.fontFailureName; throw error; }
    options.onInitializationStage?.({ stage: 'fonts-ready', backend });
    let clip: TransitionClip | null = null, recording: TransitionClip | null = null, progress = 1, frames = 0;
    const presentation = () => clip ? sampleTransitionClip(clip, progress) : null;
    const capabilities = () => ({ backend, compute: backend === 'webgpu', typegpu: true, reducedMotion: false });
    return {
      dispose, getCapabilities: capabilities,
      setScene(next: SceneNode[], animate: boolean, durationMs = 0, plan: TransitionClip['plan'] = null) {
        const previous = presentation(), captured = animate && previous && previous.progress < 1 ? captureTransitionSource(previous) : null;
        clip = createTransitionClip({ source: captured?.source ?? previous?.nodes ?? [], sourceCheckpoint: captured?.sourceCheckpoint,
          target: next, plan, durationMs, viewport: { width: 600, height: 340 }, motionVersion: options.motionVersion ?? 2 });
        if (animate) recording = clip; progress = animate ? 0 : 1;
      },
      seek(value: number) { progress = value; },
      async inspectText() { frames++; return TextAuditSchema.parse({ scale: 1, viewport: { width: 600, height: 340 }, backend, progress, checkedNodes: 3, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] }); },
      getMetrics() { return { frames, effectId: clip?.plan?.selected?.id ?? null, progress, textBytes: 100 }; },
      getRecording() {
        if (!recording) return null;
        const redact = (node: SceneNode) => mocked.leakLabel ? { ...redactSceneNode(node), label: node.label } : redactSceneNode(node);
        return recordTransitionClip({ ...recording, source: recording.source.map(redact), target: recording.target.map(redact) }, 'm7-surface-fixture', [...recording.source, ...recording.target].some(node => node.sensitive));
      },
      async captureFrame() {
        if (!mocked.allowSensitiveCapture && clip && [...clip.source, ...clip.target].some(node => node.sensitive)) throw new Error('Sensitive Parts: Bildaufnahme nicht freigegeben.');
        return CapturedFrameSchema.parse({ schemaVersion: 1, id: 'explicit-unit-fixture', surfaceFrame: frames, capturedAt: new Date().toISOString(), renderTimeMs: 1, backend, progress,
          viewport: { width: 600, height: 340, dpr: 1 }, pixelWidth: 600, pixelHeight: 340, image: 'data:image/png;base64,AA==', parts: [], redaction: 'no-sensitive-parts', coverage: 'selected-frame' });
      },
      simulateDeviceLoss() { dispose(); const error = new Error('GPU-Gerät verloren: controlled fixture'); error.name = 'CapabilityError'; options.onError?.(error); },
    };
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.replaceChildren(); });
function config() { const host = document.createElement('div'); document.body.append(host); const controller = new AbortController(); return { host, buildId: 'unit-only', backend: 'webgpu-only' as const, cycles: 3 as const, signal: controller.signal, controller, onProgress: vi.fn() }; }

describe('M7 Surface qualification orchestration', () => {
  it.each(['webgpu-only', 'webgl2'] as const)('requires every effect, fault and privacy case on %s', async backend => {
    const report = await qualifyM7Surfaces({ ...config(), backend });
    expect(report.result, JSON.stringify(report.cases.map(item => ({ id: item.id, detail: item.detail })))).toBe('passed'); expect(report.cases).toHaveLength(8);
    expect(report.cases.filter(item => item.kind === 'cycle').every(item => item.observedEffects.length === 3 && item.progressAtDispose === .5)).toBe(true);
    expect(report.cases.find(item => item.kind === 'privacy')?.privacyAttempts).toHaveLength(13);
    expect(JSON.stringify(report)).not.toContain('SYNTHETIC-SENSITIVE-M7-5842');
    expect(M7SurfaceQualificationSchema.safeParse({ ...report, cases: report.cases.slice(1) }).success).toBe(false);
    expect(M7SurfaceQualificationSchema.safeParse({ ...report, aborted: true }).success).toBe(false);
  });
  it('reports a resource leak as failed and stops repeating mounts', async () => {
    mocked.leak = true; const report = await qualifyM7Surfaces(config());
    expect(report.result).toBe('failed'); expect(report.cases).toHaveLength(1); expect(report.cases[0]?.afterDispose.live.material).toBe(1);
  });
  it.each(['allowSensitiveCapture', 'leakLabel'] as const)('fails closed when %s violates the privacy boundary', async defect => {
    mocked[defect] = true; const report = await qualifyM7Surfaces(config());
    expect(report.result).toBe('failed'); expect(report.cases.find(item => item.kind === 'privacy')?.result).toBe('failed');
    expect(JSON.stringify(report)).not.toContain('SYNTHETIC-SENSITIVE-M7-5842');
  });
  it('keeps cancellation and hidden tabs inconclusive with empty resources', async () => {
    const options = config(); options.onProgress.mockImplementation(() => options.controller.abort());
    const cancelled = await qualifyM7Surfaces(options);
    expect(cancelled.aborted).toBe(true); expect(cancelled.result).toBe('inconclusive');
    expect(cancelled.cases.every(item => item.afterDispose.owners === 0)).toBe(true);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    const hidden = await qualifyM7Surfaces(config());
    expect(hidden.result).toBe('inconclusive'); expect(hidden.cases).toHaveLength(1);
  });
  it.each(['TimeoutError', 'AbortError', 'Error'])('does not mistake %s for the expected font parse/load rejection', async name => {
    mocked.fontFailureName = name;
    const report = await qualifyM7Surfaces(config());
    expect(report.cases.find(item => item.kind === 'invalid-font')?.result).toBe('failed');
    expect(report.result).toBe('failed');
  });
});
