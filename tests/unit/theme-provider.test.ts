// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { DEFAULT_THEME_PREFERENCES, GPU_PALETTE, ThemePreferencesSchema, defineFlow } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { FluidProvider, FluidThemeProvider, useFluid } from '@fluidkit/react';
import { AppearanceProvider } from '../../apps/studio/components/appearance-provider';
import { APPEARANCE_STORAGE_KEY } from '../../apps/studio/components/appearance-storage';
vi.mock('@fluidkit/webgpu', () => ({ DEFAULT_PRIMARY_FONT_URL: '/font.glb', DEFAULT_FALLBACK_FONT_URLS: [], createFluidSurface: vi.fn() }));
const cleanups: (() => Promise<void>)[] = [];
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); window.localStorage.clear(); });
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
function runtime() { return createFluidRuntime({ flow: defineFlow({ id: 'appearance', name: 'Appearance', initial: 'ready', states: { ready: { label: 'Ready', nodes: [{ id: 'panel', anatomy: { componentId: 'panel', part: 'surface', behavior: 'presentation' }, kind: 'box', x: 0, y: 0, width: 100, height: 100, color: GPU_PALETTE.surface }], on: {} } } }) }); }
function Probe() { const { runtime, visual } = useFluid(); return createElement('output', { 'data-preset': visual.settings.theme.preset, 'data-paint': runtime.getScene()[0]!.color }, visual.settings.mode); }
function mount() { const host = document.createElement('div'); document.body.append(host); const root = createRoot(host); cleanups.push(async () => { await act(async () => root.unmount()); host.remove(); }); return { host, root }; }
it('updates existing Fluid runtimes through the controlled provider without recreating state or resetting effects', async () => {
  const value = runtime(), { host, root } = mount(); cleanups.push(async () => value.dispose());
  value.configureEffects({ ...value.getVisualState().settings, mode: 'random', parameters: { intensity: .2, frequency: 2, durationMs: 700 } });
  const before = value.getSnapshot();
  const render = (preset: 'blue' | 'rose') => createElement(FluidThemeProvider, { preferences: ThemePreferencesSchema.parse({ preset }), children: createElement(FluidProvider, { runtime: value, children: createElement(Probe) }) });
  await act(async () => root.render(render('blue'))); const bluePaint = host.querySelector('output')!.dataset.paint;
  await act(async () => root.render(render('rose')));
  expect(host.querySelector('output')!.dataset.preset).toBe('rose'); expect(host.querySelector('output')!.dataset.paint).not.toBe(bluePaint);
  expect(value.getSnapshot()).toBe(before); expect(value.getVisualState().settings.mode).toBe('random'); expect(value.getVisualState().settings.parameters.durationMs).toBe(700);
});
it('loads validated preferences into actual controls and applies palette changes without history changes', async () => {
  window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ ...DEFAULT_THEME_PREFERENCES, preset: 'violet' }));
  const value = runtime(), { host, root } = mount(); cleanups.push(async () => value.dispose());
  const route = window.location.href, revision = value.getSnapshot().revision;
  await act(async () => root.render(createElement(AppearanceProvider, { children: createElement(FluidProvider, { runtime: value, children: createElement(Probe) }) })));
  const select = host.querySelector<HTMLSelectElement>('select')!; expect(select.value).toBe('violet');
  expect(host.querySelector('output')!.dataset.preset).toBe('violet');
  await act(async () => { select.value = 'amber'; select.dispatchEvent(new Event('change', { bubbles: true })); });
  expect(value.getVisualState().settings.theme.preset).toBe('amber'); expect(JSON.parse(window.localStorage.getItem(APPEARANCE_STORAGE_KEY)!).preset).toBe('amber');
  expect(value.getSnapshot().revision).toBe(revision); expect(window.location.href).toBe(route);
  expect(host.querySelector('style')!.textContent).toContain('--fluid-theme-accent:#d97706');
});
