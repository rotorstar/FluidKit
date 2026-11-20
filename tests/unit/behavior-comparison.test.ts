// @vitest-environment jsdom
import { act, createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import { BehaviorComparison, BehaviorControls } from '../../apps/studio/components/behavior-comparison';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';

const preview = vi.hoisted(() => ({ mounted: vi.fn(), unmounted: vi.fn() }));
// This suite qualifies real DOM library composition and shared Core ownership.
// The GPU is deliberately outside jsdom: no rendering or native popup claim.
vi.mock('../../apps/studio/components/workspace-surface', () => ({
  WorkspaceSurface: function Preview() {
    useEffect(() => { preview.mounted(); return () => { preview.unmounted(); }; }, []);
    return createElement('div', { 'data-test-gpu': true });
  },
}));

let data: WorkspaceData;
const originalAnimations = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations');
beforeAll(async () => { data = await readWorkspace(process.cwd()); });
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} unobserve() {} });
  // jsdom has no Web Animations implementation; this suite does not claim motion coverage.
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [] });
  preview.mounted.mockClear(); preview.unmounted.mockClear();
});
afterEach(() => {
  vi.unstubAllGlobals();
  if (originalAnimations) Object.defineProperty(Element.prototype, 'getAnimations', originalAnimations);
  else Reflect.deleteProperty(Element.prototype, 'getAnimations');
});

function button(host: HTMLElement, name: string) {
  const element = [...host.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent?.startsWith(name));
  if (!element) throw new Error(`Missing control ${name}`);
  return element;
}

it('changes real library tabs through the same Core and keeps the preview mounted when switching adapters', async () => {
  const host = document.createElement('div'); document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(BehaviorComparison, { data, buildId: 'dom-composition-test' })));
    expect(host.querySelectorAll('[aria-label="Workspace-Ansicht"]')).toHaveLength(1);
    expect(host.querySelector('[data-behavior-library]')?.getAttribute('data-behavior-library')).toBe('ui-sdk');
    await act(async () => button(host, 'Karten').click());
    const afterSdk = host.querySelector('[data-runtime-view]')!;
    expect(afterSdk.getAttribute('data-runtime-view')).toBe('cards');
    const revision = afterSdk.getAttribute('data-runtime-revision');
    expect(Number(revision)).toBeGreaterThan(0);

    await act(async () => button(host, 'Base UI').click());
    expect(host.querySelectorAll('[aria-label="Workspace-Ansicht"]')).toHaveLength(1);
    expect(host.querySelector('[data-runtime-view]')?.getAttribute('data-runtime-revision')).toBe(revision);
    expect(button(host, 'Karten').getAttribute('aria-selected')).toBe('true');
    expect(preview.mounted).toHaveBeenCalledTimes(1);
    expect(preview.unmounted).not.toHaveBeenCalled();

    await act(async () => button(host, 'Map').click());
    expect(host.querySelector('[data-runtime-view]')?.getAttribute('data-runtime-view')).toBe('map');
    expect(Number(host.querySelector('[data-runtime-view]')?.getAttribute('data-runtime-revision'))).toBeGreaterThan(Number(revision));
    await act(async () => button(host, 'UI SDK').click());
    expect(button(host, 'Map').getAttribute('aria-selected')).toBe('true');
    expect(preview.mounted).toHaveBeenCalledTimes(1);
  } finally { await act(async () => root.unmount()); host.remove(); }
  expect(preview.unmounted).toHaveBeenCalledTimes(1);
});

it.each(['ui-sdk', 'base-ui'] as const)('keeps controlled values and does not bypass a rejected change in %s', async library => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) }, beforeChange: details => { if (details.event.type === 'view.cards') details.cancel(); } });
  expect(runtime.send('filter.Kernel', {}, 'host').accepted).toBe(true);
  const snapshot = runtime.getSnapshot();
  const request = vi.fn((value: unknown) => typeof value === 'string' && runtime.send(`view.${value}`, {}, 'user').accepted);
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(BehaviorControls, {
      library, snapshot, data, changeView: request, changeGroup: () => false,
      dialogOpen: false, onDialogOpenChange: () => {},
    })));
    expect(host.querySelector('[role="combobox"]')?.textContent).toContain('Kernel');
    expect(button(host, 'Tabelle').getAttribute('aria-selected')).toBe('true');
    await act(async () => button(host, 'Karten').click());
    expect(request).toHaveBeenCalled();
    expect(runtime.getSnapshot()).toBe(snapshot);
    expect(button(host, 'Tabelle').getAttribute('aria-selected')).toBe('true');
    expect(button(host, 'Karten').getAttribute('aria-selected')).toBe('false');
    expect(host.querySelector('[role="combobox"]')?.textContent).toContain('Kernel');
  } finally { await act(async () => root.unmount()); runtime.dispose(); host.remove(); }
});

it('attributes Base UI automatic focus to its captured key and does not reuse that cause for later programmatic focus', async () => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) } });
  const changeView = vi.fn(() => true), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(BehaviorControls, { library: 'base-ui', snapshot: runtime.getSnapshot(), data,
      changeView, changeGroup: () => true, dialogOpen: false, onDialogOpenChange: () => {},
    })));
    await act(async () => button(host, 'Tabelle').focus());
    await act(async () => button(host, 'Tabelle').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(changeView).toHaveBeenCalledWith('cards', 'keyboard');
    changeView.mockClear();
    await act(async () => button(host, 'Map').focus());
    expect(changeView).toHaveBeenCalledWith('map', 'programmatic');
    changeView.mockClear();
    await act(async () => button(host, 'Karten').click());
    expect(changeView).toHaveBeenCalledWith('cards', 'programmatic');
  } finally { await act(async () => root.unmount()); runtime.dispose(); host.remove(); }
});

it('preserves the keyboard cause of a Base UI Select internal click through its portal', async () => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) } });
  const changeGroup = vi.fn(() => true), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(BehaviorControls, { library: 'base-ui', snapshot: runtime.getSnapshot(), data,
      changeView: () => true, changeGroup, dialogOpen: false, onDialogOpenChange: () => {},
    })));
    await act(async () => host.querySelector<HTMLElement>('[role="combobox"]')!.click());
    const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(item => item.textContent === 'Kernel');
    if (!option) throw new Error('Missing actual Base UI option');
    const clicks: Event[] = []; option.addEventListener('click', event => { clicks.push(event); });
    await act(async () => option.focus());
    await act(async () => option.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    expect(clicks.some(event => event instanceof MouseEvent && event.detail === 0)).toBe(true);
    expect(changeGroup).toHaveBeenCalledWith('Kernel', 'keyboard');
  } finally { await act(async () => root.unmount()); runtime.dispose(); host.remove(); }
});

it.each([{ delay: 0, expected: 'keyboard' }, { delay: 501, expected: 'programmatic' }])('attributes deferred native focus without relying on microtask order (age $delay ms)', async ({ delay, expected }) => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) } });
  const changeView = vi.fn(() => true), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  let clock = 100; const now = vi.spyOn(performance, 'now').mockImplementation(() => clock);
  try {
    await act(async () => root.render(createElement(BehaviorControls, { library: 'base-ui', snapshot: runtime.getSnapshot(), data,
      changeView, changeGroup: () => true, dialogOpen: false, onDialogOpenChange: () => {},
    })));
    const table = button(host, 'Tabelle'), cards = button(host, 'Karten');
    await act(async () => table.focus());
    // The actual library requests focus; delay only its DOM delivery to represent
    // a later browser/React task. Value callbacks and capture remain real Base UI.
    const focusRequest = vi.spyOn(cards, 'focus').mockImplementation(() => {});
    await act(async () => table.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(focusRequest).toHaveBeenCalled(); expect(changeView).not.toHaveBeenCalled();
    focusRequest.mockRestore(); clock += delay;
    await act(async () => cards.focus());
    expect(changeView).toHaveBeenCalledWith('cards', expected);
    changeView.mockClear();
    await act(async () => button(host, 'Map').focus());
    expect(changeView).toHaveBeenCalledWith('map', 'programmatic');
  } finally { await act(async () => root.unmount()); now.mockRestore(); runtime.dispose(); host.remove(); }
});

it('consumes keyboard attribution at a disabled tab focus without activating it or lending the cause to a later click', async () => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) } });
  const changeView = vi.fn(() => true), host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(BehaviorControls, { library: 'base-ui', snapshot: runtime.getSnapshot(), data,
      changeView, changeGroup: () => true, dialogOpen: false, onDialogOpenChange: () => {},
    })));
    await act(async () => button(host, 'Map').focus()); changeView.mockClear();
    await act(async () => button(host, 'Map').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(button(host, 'Detail'));
    expect(button(host, 'Detail').getAttribute('aria-disabled')).toBe('true');
    expect(changeView).not.toHaveBeenCalled();
    await act(async () => button(host, 'Karten').click());
    expect(changeView).toHaveBeenCalledWith('cards', 'programmatic');
  } finally { await act(async () => root.unmount()); runtime.dispose(); host.remove(); }
});
