// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { createArchitectureReviewFlow, WorkspaceDataSchema } from '@fluidkit/cases';
import { createResourceLedger, type SurfacePlaybackControls } from '@fluidkit/webgpu';
import { FlowProofExport } from '../../apps/studio/components/flow-proof-export';

const capture = vi.hoisted(() => vi.fn());
vi.mock('../../apps/studio/lib/flow-proof', () => ({ captureFlowProof: capture }));
const createUrl = vi.fn(), revokeUrl = vi.fn();
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); createUrl.mockReset().mockReturnValue('blob:new-flow'); revokeUrl.mockReset(); capture.mockReset(); vi.stubGlobal('URL', class extends URL { static override createObjectURL = createUrl; static override revokeObjectURL = revokeUrl; }); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = ''; });
const controls: SurfacePlaybackControls = { getPresentationMode: () => 'live', getMetrics: () => null, getPresentation: () => null, getRecording: () => null, getResources: () => createResourceLedger().snapshot(), getFrameTimings: () => [], pause() {}, play() {}, seek() {}, replay() {}, importRecording() {}, restoreLive() {}, async captureFrame() { throw new Error('No GPU'); }, async inspectText() { throw new Error('No GPU'); }, async verifyKernels() { throw new Error('No GPU'); } };
// Transport-only fixture; renderer/capture integrity is qualified in the helper suite.
it('releases stale busy ownership after controls replacement and ignores the old asynchronous result', async () => {
  const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'fixture', capturedAt: '2026-11-14T06:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [{ id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 1, lines: 1, dependencies: [], internal: [] }] });
  const runtime = createFluidRuntime({ flow: createArchitectureReviewFlow(data), projections: { 'architecture-review': () => [] } });
  const host = document.createElement('section'); host.innerHTML = '<div class="fluid-surface"><canvas></canvas></div><div data-export></div>'; document.body.append(host);
  const root = createRoot(host.querySelector('[data-export]')!), surfaceHost = { current: host };
  const proof = { frame: { backend: 'webgpu' }, snapshot: { revision: 0 }, textAudit: { issues: [] }, nativeTargets: { issues: [] } };
  let finishOld: ((value: typeof proof) => void) | undefined;
  capture.mockImplementationOnce(() => new Promise<typeof proof>(resolve => { finishOld = resolve; })).mockResolvedValue(proof);
  try {
    await act(async () => root.render(createElement(FlowProofExport, { runtime, controls, data, moduleId: 'core', buildId: 'fixture', surfaceHost })));
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(host.querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
    await act(async () => root.render(createElement(FlowProofExport, { runtime, controls: { ...controls }, data, moduleId: 'core', buildId: 'fixture', surfaceHost })));
    expect(host.querySelector<HTMLButtonElement>('button')!.disabled).toBe(false);
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(createUrl).toHaveBeenCalledOnce(); expect(host.querySelector('a[download]')).not.toBeNull();
    await act(async () => finishOld!(proof));
    expect(createUrl).toHaveBeenCalledOnce(); expect(host.querySelector<HTMLButtonElement>('button')!.disabled).toBe(false);
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
  expect(revokeUrl).toHaveBeenCalledWith('blob:new-flow');
});
