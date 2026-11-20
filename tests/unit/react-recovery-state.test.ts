// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { defineFlow, type SceneNode } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { FluidProvider, FluidSurface } from '@fluidkit/react';
import type { SurfaceOptions } from '@fluidkit/webgpu';

const port = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock('@fluidkit/webgpu', () => ({ DEFAULT_PRIMARY_FONT_URL: '/fonts/inter.font.glb', DEFAULT_FALLBACK_FONT_URLS: [], createFluidSurface: port.create }));

// Exercises the actual React recovery ownership with a deterministic Surface port.
// No GPU adapter/device, native browser input or hardware loss is simulated here.
it('reprojects the same Core drafts, collection and route after replacing a lost Surface', async () => {
  vi.useFakeTimers(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  const flow = defineFlow({ id: 'recovery-state', name: 'Recovery ownership', initial: 'table',
    fields: [{ id: 'query', initial: '' }, { id: 'selection', type: 'keys', initial: [] }, { id: 'sort', initial: 'name' }],
    collections: [{ id: 'modules', field: 'selection', items: [{ id: 'core', label: 'Core' }] }],
    states: { table: { label: 'Table', route: '/table', nodes: [], on: { detail: { target: 'detail' } } },
      detail: { label: 'Detail', route: '/detail', nodes: [
        { id: 'query', kind: 'input', binding: 'query', label: 'Query', anatomy: { componentId: 'search', part: 'input', behavior: 'textbox' } },
        { id: 'core-pick', kind: 'checkbox', checked: false, collection: { id: 'modules', itemId: 'core' }, label: 'Core', y: 60, anatomy: { componentId: 'core', part: 'selection', behavior: 'checkbox' } },
      ] } },
  });
  const navigate = vi.fn(), runtime = createFluidRuntime({ flow, router: { navigate } });
  runtime.send('field.change', { fieldId: 'query', value: 'Unsubmitted Grüße 東京' });
  runtime.send('field.change', { fieldId: 'sort', value: 'dependencies' });
  runtime.send('collection.change', { collectionId: 'modules', keys: ['core'] });
  runtime.send('detail');
  const before = runtime.getSnapshot(), routeCalls = navigate.mock.calls.length;
  const created: { options: SurfaceOptions; dispose: ReturnType<typeof vi.fn>; scenes: SceneNode[][] }[] = [];
  port.create.mockImplementation(async (_canvas: HTMLCanvasElement, options: SurfaceOptions) => {
    const surface = { options, dispose: vi.fn(), scenes: [] as SceneNode[][] };
    created.push(surface);
    options.onCapabilitiesChange?.({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
    return { dispose: surface.dispose, setMotionPreference() {}, updatePresentation() {}, setInteraction() {}, setSelection() {},
      setScene(nodes: SceneNode[]) { surface.scenes.push(nodes); },
    };
  });
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(FluidProvider, { runtime, children: createElement(FluidSurface) })));
    expect(created).toHaveLength(1);
    const failure = new Error('WebGPU Gerät verloren'); failure.name = 'CapabilityError';
    await act(async () => created[0]!.options.onError?.(failure));
    expect(runtime.getSnapshot()).toBe(before);
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(created).toHaveLength(2); expect(created[0]!.dispose).toHaveBeenCalledTimes(1);
    expect(runtime.getSnapshot()).toBe(before); expect(navigate).toHaveBeenCalledTimes(routeCalls);
    expect(created[1]!.scenes.at(-1)?.find(node => node.id === 'query')?.text).toBe('Unsubmitted Grüße 東京');
    expect(created[1]!.scenes.at(-1)?.find(node => node.id === 'core-pick')?.checked).toBe(true);
    expect(host.querySelector<HTMLInputElement>('[data-fluid-node="query"]')?.value).toBe('Unsubmitted Grüße 東京');
    expect(host.querySelector<HTMLInputElement>('[data-fluid-node="core-pick"]')?.checked).toBe(true);
    expect(host.querySelector('[data-testid="fluid-surface"]')?.getAttribute('data-status')).toBe('ready');
    expect(runtime.getDiagnostics().disposed).toBe(false);
  } finally {
    await act(async () => root.unmount()); runtime.dispose(); host.remove(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks();
  }
});
