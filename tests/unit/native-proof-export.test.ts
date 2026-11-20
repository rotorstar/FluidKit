// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { defineFlow } from '@fluidkit/contracts';
import { WorkspaceDataSchema } from '@fluidkit/cases';
import { createResourceLedger, type SurfaceMetrics, type SurfacePlaybackControls } from '@fluidkit/webgpu';
import { NativeProofExport } from '../../apps/studio/components/native-proof-export';

const capture = vi.hoisted(() => vi.fn());
// Transport/lifecycle qualification only. The actual capture/validation helper
// has separate Core-backed tests; this fixture is not GPU or native input proof.
vi.mock('@fluidkit/testing/proof-capture', () => ({ captureNativeProof: capture, proofSha256: async () => 'a'.repeat(64) }));
const cleanups: (() => Promise<void>)[] = [];
const createUrl = vi.fn(), revokeUrl = vi.fn();
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  createUrl.mockReset().mockImplementation(() => `blob:proof-${createUrl.mock.calls.length}`); revokeUrl.mockReset(); capture.mockReset();
  vi.stubGlobal('URL', class extends URL { static override createObjectURL = createUrl; static override revokeObjectURL = revokeUrl; });
});
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
async function mount() {
  const runtime = createFluidRuntime({ flow: defineFlow({ id: 'transport', name: 'Transport fixture', initial: 'table', fields: [], states: { table: { label: 'Table', nodes: [], on: { refresh: { target: 'table' } } } } }) });
  const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'fixture', capturedAt: '2026-11-13T13:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [{ id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 1, lines: 1, dependencies: [], internal: [] }] });
  let metrics: SurfaceMetrics = { backend: 'webgpu', fallbackReason: null, frames: 1, nodes: 0, geometries: 1, textBytes: 0, lastFrameMs: 0, phase: 'idle', progress: 1, durationMs: 0, shader: 'typegpu-0.12.9', effectId: null, effectPhase: 'settled', canReplay: false, kernelCheck: null };
  const controls: SurfacePlaybackControls = { getPresentationMode: () => 'live', getMetrics: () => metrics, getPresentation: () => null, getRecording: () => null, getResources: () => createResourceLedger().snapshot(), getFrameTimings: () => [],
    pause() {}, play() {}, seek() {}, replay() {}, importRecording() {}, restoreLive() {},
    async captureFrame() { throw new Error('No GPU capture in UI fixture'); }, async inspectText() { throw new Error('No GPU inspection'); }, async verifyKernels() { throw new Error('No GPU kernel'); },
  };
  const host = document.createElement('div'); host.className = 'showcase-shell';
  host.innerHTML = '<div class="fluid-surface"><canvas></canvas></div><div data-ui-root></div>'; document.body.append(host);
  host.querySelector('canvas')!.getBoundingClientRect = () => ({ x: 0, y: 0, width: 1, height: 1, top: 0, left: 0, right: 1, bottom: 1, toJSON: () => ({}) });
  const report = { id: 'native-test', frame: { backend: 'webgpu', surfaceFrame: 1, progress: 1 }, snapshot: { revision: 0 }, nativeTargets: { issues: [] }, viewport: { surface: { width: 1, height: 1 }, browser: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio } } };
  capture.mockResolvedValue(report);
  const root = createRoot(host.querySelector('[data-ui-root]')!);
  await act(async () => root.render(createElement(NativeProofExport, { controls, runtime, data, buildId: 'fluid-test' })));
  const cleanup = async () => { await act(async () => root.unmount()); host.remove(); runtime.dispose(); };
  cleanups.push(cleanup);
  return { host, runtime, report, controls, setMetrics(next: Partial<SurfaceMetrics>) { metrics = { ...metrics, ...next }; }, cleanup };
}
async function prepare(host: HTMLElement) { await act(async () => host.querySelector<HTMLButtonElement>('button')!.click()); }
describe('explicit native-proof file download', () => {
  it('prepares a local Blob and requires a separate user download without claiming saved-file success', async () => {
    const f = await mount(), automaticClick = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    await prepare(f.host);
    expect(createUrl).toHaveBeenCalledOnce(); expect(createUrl.mock.calls[0]![0]).toBeInstanceOf(Blob);
    expect(automaticClick).not.toHaveBeenCalled();
    const link = f.host.querySelector<HTMLAnchorElement>('a[download]')!;
    expect(link.href).toBe('blob:proof-1'); expect(link.download).toBe('fluid-native-proof-native-test.json');
    expect(f.host.textContent).toContain('Nachweis bereit'); expect(f.host.textContent).not.toContain('Bediennachweis exportiert');
    link.addEventListener('click', event => event.preventDefault()); // jsdom does not save files.
    await act(async () => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
    expect(f.host.textContent).toContain('Download angefordert'); expect(revokeUrl).not.toHaveBeenCalled();
  });
  it('releases the previous URL on a new capture and the current URL on unmount', async () => {
    const f = await mount(); await prepare(f.host); await prepare(f.host);
    expect(revokeUrl).toHaveBeenCalledWith('blob:proof-1'); expect(revokeUrl).not.toHaveBeenCalledWith('blob:proof-2');
    await f.cleanup(); cleanups.pop(); expect(revokeUrl).toHaveBeenCalledWith('blob:proof-2');
  });
  it.each(['domain', 'resize'] as const)('invalidates the prepared download after %s changes', async change => {
    const f = await mount(); await prepare(f.host);
    await act(async () => { if (change === 'domain') f.runtime.send('refresh'); else window.dispatchEvent(new Event('resize')); });
    expect(f.host.querySelector('a[download]')).toBeNull(); expect(revokeUrl).toHaveBeenCalledWith('blob:proof-1');
    expect(f.host.textContent).toContain('erneut aufnehmen');
  });
  it('rejects a late capture after state changed without leaking a Blob URL', async () => {
    const f = await mount(); let resolve: ((value: typeof f.report) => void) | undefined;
    capture.mockImplementation(() => new Promise<typeof f.report>(done => { resolve = done; }));
    await prepare(f.host);
    await act(async () => { f.runtime.send('refresh'); resolve!(f.report); });
    expect(createUrl).not.toHaveBeenCalled(); expect(f.host.querySelector('a[download]')).toBeNull();
  });
  it('rejects a seek between preparing and clicking the download', async () => {
    const f = await mount(); await prepare(f.host); f.setMetrics({ phase: 'paused', progress: .5 });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    await act(async () => f.host.querySelector('a')!.dispatchEvent(event));
    expect(event.defaultPrevented).toBe(true); expect(f.host.querySelector('a[download]')).toBeNull(); expect(revokeUrl).toHaveBeenCalledOnce();
  });
  it('does not create a file or a success message for a privacy rejection', async () => {
    const f = await mount(); capture.mockRejectedValue(new Error('Suchtext verhindert die Bildaufnahme.')); await prepare(f.host);
    expect(f.host.querySelector('[role="alert"]')?.textContent).toContain('Suchtext');
    expect(createUrl).not.toHaveBeenCalled(); expect(f.host.querySelector('a[download]')).toBeNull();
  });
});
