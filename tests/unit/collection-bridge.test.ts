// @vitest-environment jsdom
import { act, createElement, Profiler } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineFlow, type SceneNode, type SceneNodeInput } from '@fluidkit/contracts';
import { createFluidRuntime, type RuntimeOptions } from '@fluidkit/core';
import { FluidProvider, FluidSurface } from '@fluidkit/react';
import type { SurfaceOptions, SurfacePlaybackControls } from '@fluidkit/webgpu';
import type { PresentationFrame } from '@fluidkit/effects';

// Actual React/Core events with a deterministic Surface port. These tests do not
// claim native browser keyboard behavior, actual raster output or GPU qualification.
const mock = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@fluidkit/webgpu', () => ({
  DEFAULT_PRIMARY_FONT_URL: '/fonts/inter.font.glb', DEFAULT_FALLBACK_FONT_URLS: [],
  createFluidSurface: mock.create,
}));

const cleanups: (() => Promise<void>)[] = [];
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
});
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function scene(grouped: boolean, inspector = false): SceneNodeInput[] {
  const controls: SceneNodeInput[] = ['a', 'b', 'c', 'd'].map((id, index) => ({
    id: `check-${id}`, anatomy: { componentId: `module-${id}`, part: 'selection', behavior: 'checkbox' },
    kind: 'checkbox', checked: false, collection: { id: 'modules', itemId: id },
    label: ['Alpha', 'Beta', 'Gamma', 'Disabled'][index], x: 20, y: 90 + index * 50, width: 140, height: 40,
    disabled: id === 'd', ...(grouped ? { semantics: { parentId: 'group' } } : {}),
  }));
  const result: SceneNodeInput[] = [
    ...(grouped ? [{ id: 'group', anatomy: { componentId: 'group', part: 'root', behavior: 'presentation' as const }, kind: 'box' as const, semantics: { role: 'group' as const }, label: 'Modules', x: 10, y: 80, width: 160, height: 220 }] : []),
    ...controls,
    { id: 'query', anatomy: { componentId: 'search', part: 'input', behavior: 'textbox' }, kind: 'input', binding: 'query', label: 'Search', x: 20, y: 10, width: 200, height: 40 },
    { id: 'all', anatomy: { componentId: 'bulk', part: 'all', behavior: 'button' }, kind: 'button', onCollection: { id: 'modules', operation: 'all' }, label: 'Select all', x: 220, y: 10, width: 100, height: 40 },
    { id: 'open', anatomy: { componentId: 'inspector', part: 'trigger', behavior: 'button' }, kind: 'button', onActivate: 'inspector.open', label: 'Open inspector', x: 340, y: 10, width: 150, height: 40 },
  ];
  if (inspector) result.push(
    { id: 'inspector', anatomy: { componentId: 'inspector', part: 'region', behavior: 'presentation' }, kind: 'card', semantics: { role: 'region' }, label: 'Inspector', onEscape: 'inspector.close', focusReturn: 'open', x: 300, y: 100, width: 280, height: 180 },
    { id: 'close', anatomy: { componentId: 'inspector', part: 'close', behavior: 'button' }, kind: 'button', semantics: { parentId: 'inspector' }, onActivate: 'inspector.close', onEscape: 'inspector.close', focusReturn: 'open', label: 'Close inspector', x: 320, y: 120, width: 150, height: 40 },
  );
  return result;
}

async function mount(beforeChange?: RuntimeOptions['beforeChange'], additionalNodes: SceneNodeInput[] = []) {
  const events = { 'view.table': { target: 'table' }, 'view.cards': { target: 'cards' }, 'inspector.open': { target: 'detail' }, 'inspector.close': { target: 'table' } };
  const flow = defineFlow({ id: 'collection-bridge', name: 'Collection bridge', initial: 'table',
    fields: [{ id: 'selection', type: 'keys', initial: [] }, { id: 'query', initial: '' }],
    collections: [{ id: 'modules', field: 'selection', items: ['a', 'b', 'c', 'd'].map((id, index) => ({ id, label: ['Alpha', 'Beta', 'Gamma', 'Disabled'][index]!, disabled: id === 'd' })) }],
    states: { table: { label: 'Table', nodes: [...scene(false), ...additionalNodes], on: events }, cards: { label: 'Cards', nodes: scene(true), on: events }, detail: { label: 'Detail', nodes: scene(false, true), on: events } },
  });
  const runtime = createFluidRuntime({ flow, beforeChange, clock: { now: () => 0 } });
  let options: SurfaceOptions;
  let frame: PresentationFrame = { nodes: [], nodeStates: [], lens: null, particles: [], progress: 1 };
  let controls: SurfacePlaybackControls | null = null;
  const blocked = new Set<string>();
  const surface = {
    dispose: vi.fn(), updatePresentation() {}, setInteraction() {}, setSelection() {}, setMotionPreference() {}, replay() {}, loadRecording() {},
    setScene(nodes: SceneNode[]) { frame = { ...frame, nodes }; options.onPresentation?.(frame); },
    getPresentation: () => frame,
    hitTest(x: number, y: number) { return frame.nodes.find(node => ['checkbox', 'button', 'textbox'].includes(node.anatomy.behavior) && !node.disabled && !blocked.has(node.id) && x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height); },
  };
  mock.create.mockImplementation(async (_canvas: HTMLCanvasElement, next: SurfaceOptions) => { options = next; return surface; });
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  const renders = vi.fn();
  await act(async () => root.render(createElement(Profiler, { id: 'bridge', onRender: renders }, createElement(FluidProvider, { runtime, children: createElement(FluidSurface, { onControls: value => { controls = value; } }) }))));
  cleanups.push(async () => { await act(async () => root.unmount()); runtime.dispose(); host.remove(); });
  function element<T extends HTMLElement = HTMLElement>(id: string) { const value = host.querySelector<T>(`[data-fluid-node="${id}"]`); if (!value) throw new Error(`Missing ${id}`); return value; }
  return {
    runtime, host, surface, blocked, renders, element,
    get controls() { return controls; },
    async frame(nodes: SceneNode[]) { frame = { ...frame, nodes }; await act(async () => options.onPresentation?.(frame)); },
  };
}

async function key(element: HTMLElement, key: string, extra: KeyboardEventInit = {}) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...extra });
  await act(async () => element.dispatchEvent(event));
  return event;
}

describe('controlled collection semantics and activation', () => {
  it('uses one activation authority for native checkbox and bulk button', async () => {
    const f = await mount(), activate = vi.spyOn(f.runtime, 'activatePart');
    await act(async () => f.element<HTMLInputElement>('check-a').click());
    expect(activate).toHaveBeenCalledTimes(1);
    expect(f.runtime.getSnapshot().fields.selection).toEqual(['a']);
    expect(f.runtime.getSnapshot().revision).toBe(1);
    expect(f.element<HTMLInputElement>('check-a').checked).toBe(true);
    await act(async () => f.element('all').click());
    expect(activate).toHaveBeenCalledTimes(2);
    expect(f.runtime.getSnapshot().fields.selection).toEqual(['a', 'b', 'c']);
  });

  it('restores the controlled checkbox when Core cancels the native change', async () => {
    const f = await mount(details => details.cancel());
    await act(async () => f.element<HTMLInputElement>('check-a').click());
    expect(f.runtime.getSnapshot().revision).toBe(0);
    expect(f.element<HTMLInputElement>('check-a').checked).toBe(false);
  });

  it('moves focus with arrows/Home/End, extends from the current row and selects all', async () => {
    const f = await mount();
    await act(async () => f.element('check-a').focus());
    expect(f.element('check-a').tabIndex).toBe(0); expect(f.element('check-b').tabIndex).toBe(-1);
    await key(f.element('check-a'), 'ArrowDown', { shiftKey: true });
    expect(document.activeElement).toBe(f.element('check-b'));
    expect(f.runtime.getSnapshot().fields.selection).toEqual(['a', 'b']);
    await key(f.element('check-b'), 'End');
    expect(document.activeElement).toBe(f.element('check-c'));
    await key(f.element('check-c'), 'Home');
    expect(document.activeElement).toBe(f.element('check-a'));
    await key(f.element('check-a'), 'a', { metaKey: true });
    expect(f.runtime.getSnapshot().fields.selection).toEqual(['a', 'b', 'c']);
  });

  it('navigates by label without changing selection, and preserves textbox/IME input', async () => {
    const f = await mount();
    await act(async () => f.element('check-a').focus());
    await key(f.element('check-a'), 'g');
    expect(document.activeElement).toBe(f.element('check-c'));
    expect(f.runtime.getSnapshot().fields.selection).toEqual([]);
    const input = f.element<HTMLInputElement>('query');
    await act(async () => input.focus());
    expect((await key(input, 'ArrowDown')).defaultPrevented).toBe(false);
    expect((await key(input, 'a', { ctrlKey: true })).defaultPrevented).toBe(false);
    await act(async () => input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: 'a' })));
    expect(f.runtime.getInteraction().composingId).toBe('query');
    expect((await key(f.element('check-c'), 'Home', { isComposing: true })).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
  });

  it('restores logical selection focus after semantic reparenting without stealing Studio focus', async () => {
    const f = await mount();
    await act(async () => f.element('check-b').focus());
    const previous = f.element('check-b');
    await act(async () => { f.runtime.send('view.cards'); });
    expect(f.element('check-b')).not.toBe(previous);
    expect(document.activeElement).toBe(f.element('check-b'));
    const studio = document.createElement('input'); document.body.append(studio);
    try {
      await act(async () => studio.focus());
      await act(async () => { f.runtime.send('view.table'); });
      expect(document.activeElement).toBe(studio);
    } finally { studio.remove(); }
  });

  it('handles declared inspector Escape and returns focus only after an accepted close', async () => {
    const f = await mount();
    await act(async () => f.element('open').click());
    expect(f.host.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Inspector');
    await act(async () => f.element('close').focus());
    await key(f.element('close'), 'Escape');
    expect(f.runtime.getSnapshot().state).toBe('table');
    expect(document.activeElement).toBe(f.element('open'));
  });

  it.each([false, true])('returns close-button focus only if Core accepts it (cancel=%s)', async cancel => {
    const f = await mount(details => { if (cancel && details.event.type === 'inspector.close') details.cancel(); });
    await act(async () => f.element('open').click());
    await act(async () => f.element('close').focus());
    await act(async () => f.element('close').click());
    expect(f.runtime.getSnapshot().state).toBe(cancel ? 'detail' : 'table');
    expect(document.activeElement).toBe(f.element(cancel ? 'close' : 'open'));
  });

  it('orders table cells by declared column index, keeping unindexed order stable', async () => {
    const presentation = (id: string, semantics: NonNullable<SceneNodeInput['semantics']>, label = id): SceneNodeInput => ({
      id, anatomy: { componentId: id, part: 'content', behavior: 'presentation' }, kind: 'text', label, semantics,
    });
    const f = await mount(undefined, [
      presentation('table-root', { role: 'table' }, 'Columns'),
      presentation('header-row', { role: 'row', parentId: 'table-root' }),
      presentation('name-heading', { role: 'columnheader', parentId: 'header-row', columnIndex: 1 }, 'Name'),
      presentation('select-heading', { role: 'columnheader', parentId: 'header-row', columnIndex: 0 }, 'Selection'),
      presentation('body-row', { role: 'row', parentId: 'table-root' }),
      presentation('name-cell', { role: 'cell', parentId: 'body-row', columnIndex: 1 }, 'Alpha'),
      presentation('select-cell', { role: 'cell', parentId: 'body-row', columnIndex: 0 }, 'Selected'),
      presentation('unindexed-first', { role: 'cell', parentId: 'body-row' }, 'First'),
      presentation('unindexed-second', { role: 'cell', parentId: 'body-row' }, 'Second'),
    ]);
    const rows = f.host.querySelectorAll('table tr');
    expect([...rows[0]!.children].map(cell => cell.textContent)).toEqual(['Selection', 'Name']);
    expect([...rows[1]!.children].map(cell => cell.textContent)).toEqual(['Selected', 'Alpha', 'First', 'Second']);
  });

  it('uses the same activation path for Canvas pointer gestures without synthesizing a click', async () => {
    const f = await mount(), activate = vi.spyOn(f.runtime, 'activatePart');
    const canvas = f.host.querySelector('canvas')!;
    Object.assign(canvas, { setPointerCapture() {}, hasPointerCapture: () => false, releasePointerCapture() {} });
    await act(async () => {
      canvas.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 40, clientY: 110 }));
      canvas.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, cancelable: true, clientX: 40, clientY: 110 }));
    });
    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledWith('check-a', 'pointer', { shiftKey: false }, expect.any(Object));
    expect(f.runtime.getSnapshot().fields.selection).toEqual(['a']);
  });
});

describe('presentation-owned semantics and replay', () => {
  it('applies presented bounds/rotation and removes occluded targets without a React frame render', async () => {
    const f = await mount();
    const count = f.renders.mock.calls.length, snapshot = f.runtime.getSnapshot();
    const nodes = f.runtime.getScene().map(node => node.id === 'check-a' ? { ...node, x: 105, y: 220, width: 170, height: 45, rotation: 0.2 } : node);
    await f.frame(nodes);
    expect(f.element('check-a').style.left).toBe('105px');
    expect(f.element('check-a').style.top).toBe('220px');
    expect(f.element('check-a').style.width).toBe('170px');
    expect(f.element('check-a').style.transform).toBe('rotate(0.2rad)');
    expect(f.renders).toHaveBeenCalledTimes(count);
    expect(f.runtime.getSnapshot()).toBe(snapshot);
    f.blocked.add('check-a'); await f.frame(nodes);
    expect(f.element('check-a').inert).toBe(true);
    expect(f.element('check-a').getAttribute('aria-hidden')).toBe('true');
    expect(f.element('check-a').tabIndex).toBe(-1);
    expect(f.element('check-b').tabIndex).toBe(0);
    await act(async () => f.element<HTMLInputElement>('check-a').click());
    expect(f.runtime.getSnapshot()).toBe(snapshot);
  });

  it('keeps imported replay read-only and restores the existing live selection', async () => {
    const f = await mount();
    await act(async () => f.element<HTMLInputElement>('check-a').click());
    const snapshot = f.runtime.getSnapshot();
    expect(f.controls!.getPresentationMode()).toBe('live');
    await act(async () => f.controls!.replay());
    expect(f.controls!.getPresentationMode()).toBe('replay');
    expect(f.host.querySelector('.fluid-semantics')).toBeNull();
    const canvas = f.host.querySelector('canvas')!;
    await act(async () => canvas.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 40, clientY: 110 })));
    expect(f.runtime.getSnapshot()).toBe(snapshot);
    await act(async () => f.controls!.restoreLive());
    expect(f.controls!.getPresentationMode()).toBe('live');
    expect(f.element<HTMLInputElement>('check-a').checked).toBe(true);
    expect(f.runtime.getSnapshot()).toBe(snapshot);
  });

  it('excludes clipped control centres even when part of the rectangle remains visible', async () => {
    const f = await mount();
    const nodes = f.runtime.getScene().map(node => node.id === 'check-a' ? { ...node, x: 980, width: 140 } : node);
    await f.frame(nodes); // 20px intersect the 1000px Surface, but the centre is outside.
    expect(f.element('check-a').inert).toBe(true);
    expect(f.element('check-a').tabIndex).toBe(-1);
    expect(f.element('check-b').tabIndex).toBe(0);
  });
});
