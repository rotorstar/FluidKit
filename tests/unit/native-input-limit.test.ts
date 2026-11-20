// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { defineFlow } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import type { FluidSurfaceHandle } from '@fluidkit/webgpu';
import { FluidProvider, FluidSurface } from '@fluidkit/react';

// Qualifies the semantic DOM contract; this is not a GPU or native-paste test.
vi.mock('@fluidkit/webgpu', () => ({
  DEFAULT_PRIMARY_FONT_URL: '/fonts/inter.font.glb', DEFAULT_FALLBACK_FONT_URLS: [],
  createFluidSurface: vi.fn(async () => ({
    dispose() {}, setScene() {}, updatePresentation() {}, setInteraction() {}, setMotionPreference() {},
    getPresentation: () => null,
    localizeScene() {},
    getCapabilities: () => ({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false }),
  } satisfies Pick<FluidSurfaceHandle, 'dispose'|'setScene'|'updatePresentation'|'setInteraction'|'setMotionPreference'|'getPresentation'|'localizeScene'|'getCapabilities'>)),
}));
afterEach(() => vi.unstubAllGlobals());

it.each([7, 100, undefined])('derives the native length boundary from the bound field (%s)', async limit => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  const flow = defineFlow({ id: 'input-limit', name: 'Native input limit', initial: 'ready',
    fields: [{ id: 'query', type: 'text', initial: '', ...(limit === undefined ? {} : { maxLength: limit }) }],
    states: { ready: { label: 'Ready', nodes: [{ id: 'query-input', kind: 'input', binding: 'query', anatomy: { componentId: 'search', part: 'input', behavior: 'textbox' } }] } },
  });
  const runtime = createFluidRuntime({ flow }), host = document.createElement('div');
  document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(FluidProvider, { runtime, children: createElement(FluidSurface) })));
    const input = host.querySelector<HTMLInputElement>('input[data-fluid-node="query-input"]');
    expect(input).not.toBeNull();
    const boundary = runtime.flow.fields[0]!.maxLength;
    expect(input!.maxLength).toBe(boundary);
    // Include a surrogate pair to keep the browser/Core UTF-16 length contract aligned.
    const value = '東京' + '😀' + 'x'.repeat(boundary - 4);
    await act(async () => { expect(runtime.send('field.change', { fieldId: 'query', value }, 'user', 'input').accepted).toBe(true); });
    expect(input!.value).toBe(value);
    const snapshot = runtime.getSnapshot();
    await act(async () => { expect(runtime.send('field.change', { fieldId: 'query', value: value + 'x' }, 'host', 'programmatic').accepted).toBe(false); });
    expect(runtime.getSnapshot()).toBe(snapshot); expect(input!.value).toBe(value);
  } finally { await act(async () => root.unmount()); runtime.dispose(); host.remove(); }
});
