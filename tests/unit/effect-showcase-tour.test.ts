// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WorkspaceDataSchema, createWorkspaceFlow, workspaceScene } from '@fluidkit/cases';
import { DEFAULT_EFFECT_SETTINGS } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createResourceLedger, type SurfacePlaybackControls } from '@fluidkit/webgpu';
import { EffectShowcaseTour } from '../../apps/studio/components/effect-showcase-tour';
import { EffectLab } from '../../apps/studio/components/effect-lab';
import { EFFECT_LIBRARY } from '@fluidkit/effects';

// Component fixture only; actual Showcase data still comes from the workspace adapter.
const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'tour-test', capturedAt: '2026-11-03T12:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 3, lines: 30, dependencies: ['zod'], internal: [] },
  { id: 'react', name: '@test/react', version: '1', group: 'Adapter', files: 1, lines: 10, dependencies: ['react'], internal: [] },
] });
const createRuntime = () => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS, projections: { workspace: (s, v, settings) => workspaceScene(data, s, v, settings) } });
const controls: SurfacePlaybackControls = {
  getPresentationMode: () => 'live',
  restoreLive: vi.fn(), pause() {}, play() {}, seek() {}, replay() {}, importRecording() {}, getRecording() { return null; }, getPresentation() { return null; }, getMetrics() { return null; }, getResources() { return createResourceLedger().snapshot(); }, getFrameTimings() { return []; },
  async captureFrame() { throw new Error('No GPU capture in component test'); },
  async inspectText() { throw new Error('No GPU inspection in component test'); },
  async verifyKernels() { throw new Error('No GPU readback in component test'); },
};
beforeEach(() => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 16));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = ''; });

it('runs exactly four stations with real events, keeps search/sort and restores effect settings', async () => {
  const runtime = createRuntime();
  runtime.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
  runtime.send('field.change', { fieldId: 'query', value: 'core' }); runtime.send('sort.files.desc');
  const settings = runtime.getVisualState().settings, initial = runtime.getSnapshot().revision;
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(EffectShowcaseTour, { runtime, data, controls })));
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => vi.runAllTimers());
    expect(runtime.getSnapshot().revision).toBe(initial + 5);
    expect(runtime.getSnapshot().state).toBe('map');
    expect(runtime.getSnapshot().fields).toMatchObject({ query: 'core', sort: 'files', direction: 'desc', selected: 'core' });
    expect(runtime.getVisualState().settings).toEqual(settings);
    expect(runtime.getVisualState().plans.slice(-5).map(plan => plan.selected?.id ?? null)).toEqual([null, 'silk-cascade', 'liquid-lens', 'liquid-lens', 'particle-weave']);
    expect(host.querySelector('[role=status]')?.textContent).toContain('Demo abgeschlossen');
    expect(vi.getTimerCount()).toBe(0);
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});

it('cancels future events on user takeover and preserves the reached domain state', async () => {
  const runtime = createRuntime(), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(EffectShowcaseTour, { runtime, data, controls })));
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
    const reached = runtime.getSnapshot();
    await act(async () => vi.runAllTimers());
    expect(runtime.getSnapshot()).toBe(reached);
    expect(runtime.getVisualState().settings).toEqual(DEFAULT_EFFECT_SETTINGS);
    expect(host.querySelector('[role=status]')?.textContent).toContain('Du steuerst jetzt selbst');
    expect(vi.getTimerCount()).toBe(0);
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});

it('keeps an explicit user effect change when it interrupts the tour', async () => {
  const runtime = createRuntime(), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(EffectShowcaseTour, { runtime, data, controls })));
    await act(async () => host.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => runtime.send('visual.command', { command: { type: 'effect.select', effect: { id: 'spring-reflow', version: '1.0.0' } } }));
    const reached = runtime.getSnapshot();
    await act(async () => vi.runAllTimers());
    expect(runtime.getSnapshot()).toBe(reached);
    expect(runtime.getVisualState().settings.effect.id).toBe('spring-reflow');
    expect(host.querySelector('[role=status]')?.textContent).toContain('Deine Effektwahl gilt');
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});

it('renders six choices and applies a selected preset without a domain commit or in-flight restart', async () => {
  const runtime = createRuntime(), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  runtime.send('view.cards');
  const snapshot = runtime.getSnapshot(), plan = runtime.getVisualState().current;
  try {
    await act(async () => root.render(createElement(EffectLab, { runtime, metrics: null, controls, onPreview() {} })));
    expect(host.querySelectorAll('.effect-preset')).toHaveLength(6);
    const pick = [...host.querySelectorAll<HTMLButtonElement>('.effect-preset')].find(button => button.textContent?.includes('Silk Cascade'))!;
    const before = runtime.getVisualState().settings.parameters;
    await act(async () => pick.click());
    expect(runtime.getVisualState().settings.parameters).toEqual(before);
    expect(host.querySelector('input[aria-label="Staffelung"]')).not.toBeNull();
    const apply = [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === 'Empfohlenes Preset übernehmen')!;
    await act(async () => apply.click());
    expect(runtime.getVisualState().settings.parameters).toEqual(EFFECT_LIBRARY.find(effect => effect.id === 'silk-cascade')!.recommendedParameters);
    expect(runtime.getSnapshot()).toBe(snapshot); expect(runtime.getVisualState().current).toBe(plan);
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});
