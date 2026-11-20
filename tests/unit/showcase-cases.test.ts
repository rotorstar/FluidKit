// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { WorkspaceDataSchema, createWorkspaceFlow, workspaceScene } from '@fluidkit/cases';
import { createFluidRuntime } from '@fluidkit/core';
import { ShowcaseCases } from '../../apps/studio/components/showcase-cases';

const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'case-test', capturedAt: '2026-11-14T05:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 3, lines: 40, dependencies: ['zod'], internal: [] },
  { id: 'react', name: '@test/react', version: '1', group: 'Adapter', files: 1, lines: 20, dependencies: ['react', 'zod'], internal: ['core'] },
] });
beforeEach(() => { vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); Element.prototype.scrollIntoView = vi.fn(); });
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); document.body.innerHTML = ''; });

it('opens an explicitly suggested comparison and preserves that selection when entering Atlas', async () => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (s, v, e) => workspaceScene(data, s, v, e) } });
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ShowcaseCases, { runtime, data })));
    expect(runtime.getSnapshot().fields.selection).toEqual([]);
    const buttons = Array.from(host.querySelectorAll('button'));
    await act(async () => buttons.find(button => button.textContent?.includes('Beispiel vergleichen'))!.click());
    expect(runtime.getSnapshot().state).toBe('compare');
    expect(runtime.getSnapshot().fields.selection).toEqual(['core', 'react']);
    await act(async () => buttons.find(button => button.textContent?.includes('Atlas öffnen'))!.click());
    expect(runtime.getSnapshot().state).toBe('atlas');
    expect(runtime.getSnapshot().fields.selection).toEqual(['core', 'react']);
    expect(host.querySelector('a')?.getAttribute('href')).toBe('/de/studio/flows?module=core');
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});

it('reports a denied case action and does not claim that navigation succeeded', async () => {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: (s, v, e) => workspaceScene(data, s, v, e) }, beforeChange: change => change.cancel() });
  const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
  try {
    await act(async () => root.render(createElement(ShowcaseCases, { runtime, data })));
    await act(async () => host.querySelector('button')!.click());
    expect(runtime.getSnapshot().state).toBe('table');
    expect(runtime.getSnapshot().fields.selection).toEqual([]);
    expect(host.querySelector('[role=alert]')?.textContent).toBeTruthy();
  } finally { await act(async () => root.unmount()); runtime.dispose(); }
});
