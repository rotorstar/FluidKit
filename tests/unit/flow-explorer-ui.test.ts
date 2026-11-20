// @vitest-environment jsdom
import { act, createElement, useEffect, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import type { FluidRuntime } from '@fluidkit/core';
import { createResourceLedger, type SurfaceMetrics, type SurfacePlaybackControls } from '@fluidkit/webgpu';
import type { FluidSurface } from '@fluidkit/react';
import { FlowExplorer } from '../../apps/studio/components/flow-explorer';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { architectureReviewMermaid, createArchitectureReviewFlow } from '../../packages/cases/src/flow-explorer';

const observed = vi.hoisted(() => ({ runtime: null as FluidRuntime | null }));
const controls: SurfacePlaybackControls = { getPresentationMode: () => 'live', getMetrics: () => metrics, getPresentation: () => null, getRecording: () => null, getResources: () => createResourceLedger().snapshot(), getFrameTimings: () => [], pause() {}, play() {}, seek() {}, replay: vi.fn(), importRecording() {}, restoreLive() {}, async captureFrame() { throw new Error('No GPU in this component test'); }, async inspectText() { throw new Error('No GPU in this component test'); }, async verifyKernels() { throw new Error('No GPU in this component test'); } };
const metrics: SurfaceMetrics = { backend: 'webgpu', fallbackReason: null, frames: 1, nodes: 1, geometries: 1, textBytes: 0, lastFrameMs: 0, phase: 'idle', progress: 1, durationMs: 0, shader: 'typegpu-0.12.9', effectId: null, effectPhase: 'settled', canReplay: false, kernelCheck: null };
vi.mock('@fluidkit/react', async importOriginal => {
  const original = await importOriginal<typeof import('@fluidkit/react')>();
  return { ...original, FluidSurface: function SurfaceBoundary(props: ComponentProps<typeof FluidSurface>) {
    observed.runtime = original.useFluid().runtime;
    useEffect(() => { props.onControls?.(controls); props.onMetrics?.(metrics); return () => props.onControls?.(null); }, [props.onControls, props.onMetrics]);
    return createElement('div', { 'data-surface-fixture': true });
  } };
});
let data: Awaited<ReturnType<typeof readWorkspace>>;
beforeAll(async () => { data = await readWorkspace(process.cwd()); });
const createUrl = vi.fn(), revokeUrl = vi.fn();
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  createUrl.mockReset().mockImplementation(() => `blob:flow-${createUrl.mock.calls.length}`); revokeUrl.mockReset();
  vi.stubGlobal('URL', class extends URL { static override createObjectURL = createUrl; static override revokeObjectURL = revokeUrl; });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = ''; observed.runtime = null; });

it('binds the visible trace to one real Core and does not advance the review merely to preview effects', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(FlowExplorer, { data, moduleId: 'core', buildId: 'test-component-only' })));
    const r = observed.runtime!, initial = r.getSnapshot();
    expect(host.querySelectorAll('.effect-preset')).toHaveLength(6);
    await act(async () => [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Übergang ansehen')!.click());
    expect(r.getSnapshot()).toBe(initial);
    await act(async () => { r.activatePart('review.action.review.begin', 'keyboard', {}, { width: 1000, height: 900 }); });
    expect(r.getSnapshot().state).toBe('inspect'); expect(host.querySelector('section[aria-label="Tatsächliche Review-Ereignisse"]')?.textContent).toContain('review.begin');
    expect(host.querySelector('section[aria-label="Tatsächliche Review-Ereignisse"]')?.textContent).toContain('keyboard');
    expect(observed.runtime).toBe(r);
  } finally { const runtime = observed.runtime!; await act(async () => root.unmount()); expect(runtime.getDiagnostics().disposed).toBe(true); }
});
it('keeps a prepared Mermaid download revision-bound and releases every Blob URL on replacement/unmount', async () => {
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  await act(async () => root.render(createElement(FlowExplorer, { data, moduleId: 'core', buildId: 'test-component-only' })));
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent === 'Mermaid-Export vorbereiten')!;
  try {
    await act(async () => button.click()); expect(host.querySelector<HTMLAnchorElement>('a[download]')?.download).toBe('architecture-review-core-r0.mmd');
    await act(async () => { observed.runtime!.send('review.begin'); });
    expect(host.querySelector('a[download]')?.textContent).toContain('r0');
    await act(async () => button.click()); expect(host.querySelector<HTMLAnchorElement>('a[download]')?.download).toBe('architecture-review-core-r1.mmd');
    expect(revokeUrl).toHaveBeenCalledWith('blob:flow-1');
  } finally { await act(async () => root.unmount()); }
  expect(revokeUrl).toHaveBeenCalledWith('blob:flow-2');
});
it('parses the derived domain graph with the installed Mermaid engine', async () => {
  const { default: mermaid } = await import('mermaid'); mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
  const result = await mermaid.parse(architectureReviewMermaid(createArchitectureReviewFlow(data, 'core'), 'review'));
  expect(result).toBeTruthy();
});
