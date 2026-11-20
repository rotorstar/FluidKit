import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { createFluidRuntime, type RuntimeOptions } from '@fluidkit/core';
import { DEFAULT_EFFECT_SETTINGS } from '@fluidkit/contracts';
import { EFFECT_LIBRARY } from '@fluidkit/effects';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { textRegion, TEXT_LINE_HEIGHT } from '../../packages/webgpu/src/text-layout';
import {
  WORKSPACE_MODULE_DEFINITION, WorkspaceDataSchema, createWorkspaceFlow,
  readWorkspaceLocation, workspaceLayout, workspaceCollectionOrder, workspaceRows, workspaceScene, workspaceSearch,
} from '@fluidkit/cases';

// Explicit contract fixture; production imports workspace manifests and source counts.
const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'collection-test', capturedAt: '2026-11-13T10:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'contracts', name: '@test/contracts', version: '1', group: 'Kernel', files: 2, lines: 30, dependencies: ['zod'], internal: [] },
  { id: 'core', name: '@test/core', version: '1', group: 'Kernel', files: 100, lines: 700, dependencies: ['xstate', 'zod'], internal: ['contracts'] },
  { id: 'gpu-kernels', name: '@test/gpu-kernels', version: '1', group: 'Kernel', files: 3, lines: 100, dependencies: ['typegpu'], internal: [] },
  { id: 'react', name: '@test/react', version: '1', group: 'Adapter', files: 20, lines: 220, dependencies: ['react', 'zod'], internal: ['core'] },
  { id: 'server', name: '@test/server', version: '1', group: 'Tooling', files: 13, lines: 180, dependencies: ['ai'], internal: ['contracts'] },
] });
const runtime = (extra: Partial<RuntimeOptions> = {}) => createFluidRuntime({
  flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
  projections: { workspace: (snapshot, viewport, settings) => workspaceScene(data, snapshot, viewport, settings) },
  collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
  ...extra,
});

describe('Workspace collection pilot', () => {
  it('uses the same real multipart control, checkbox and summary identities in table, cards and map', () => {
    const r = runtime();
    expect(WORKSPACE_MODULE_DEFINITION.parts.map(part => part.id)).toEqual(['control', 'selection', 'summary']);
    let previous: unknown;
    for (const view of ['table', 'cards', 'map']) {
      expect(r.send(`view.${view}`).accepted).toBe(true);
      const nodes = r.getScene({ width: 390, height: 1800 }).filter(node => node.id.startsWith('module-gpu-kernels'));
      const parts = ['control', 'selection', 'summary'].map(part => nodes.find(node => node.anatomy.part === part)!);
      expect(parts.map(node => node.id)).toEqual(['module-gpu-kernels', 'module-gpu-kernels-selection', 'module-gpu-kernels-summary']);
      expect(parts[0]).toMatchObject({ onActivate: 'select.gpu-kernels', label: 'Modul gpu-kernels öffnen' });
      expect(parts[1]).toMatchObject({ checked: false, collection: { id: 'modules', itemId: 'gpu-kernels' }, label: 'Modul gpu-kernels auswählen' });
      expect(parts[1]?.onActivate).toBeUndefined();
      const anatomy = parts.map(node => node.anatomy);
      if (previous) expect(anatomy).toEqual(previous);
      previous = anatomy;
    }
    r.dispose();
  });

  it('selects independently of navigation and preserves selection/focus identity across representation changes', () => {
    const r = runtime();
    expect(r.activatePart('module-core-selection', 'pointer')).toBe(true);
    expect(r.getSnapshot()).toMatchObject({ state: 'table', fields: { selected: '', selection: ['core'] } });
    r.setInteraction({ focusedId: 'module-core-selection' });
    for (const view of ['cards', 'map', 'table']) {
      expect(r.send(`view.${view}`).accepted).toBe(true);
      expect(r.getSnapshot().fields.selection).toEqual(['core']);
      expect(r.getInteraction().focusedId).toBe('module-core-selection');
      expect(r.getScene().find(node => node.id === 'module-core-selection')?.checked).toBe(true);
    }
    expect(r.activatePart('module-core', 'keyboard')).toBe(true);
    expect(r.getSnapshot()).toMatchObject({ state: 'detail', fields: { selected: 'core', selection: ['core'] } });
    r.dispose();
  });

  it('matches typeahead against the visible module label rather than its package namespace', () => {
    const r = runtime();
    r.setInteraction({ focusedId: 'module-core-selection' });
    const before = r.getSnapshot();
    expect(r.collection('modules').typeahead('s', { currentKey: 'core', time: 1000 })).toBe('server');
    expect(r.collection('modules').typeahead('g', { currentKey: 'core', time: 2000 })).toBe('gpu-kernels');
    expect(r.getSnapshot()).toBe(before);
    expect(r.getInteraction().focusedId).toBe('module-core-selection');
    r.send('filter.Kernel');
    expect(r.collection('modules').typeahead('s', { currentKey: 'core', time: 3000 })).toBeNull();
    r.dispose();
  });

  it('extends ranges in the current numeric sort order, not original data order or lexicographic counts', () => {
    const r = runtime();
    r.send('sort.files.asc');
    expect(workspaceRows(data, r.getSnapshot()).map(module => module.id)).toEqual(['contracts', 'gpu-kernels', 'server', 'react', 'core']);
    expect(r.activatePart('module-gpu-kernels-selection', 'keyboard')).toBe(true);
    expect(r.activatePart('module-react-selection', 'keyboard', { shiftKey: true, from: 'gpu-kernels' })).toBe(true);
    expect(r.getSnapshot().fields.selection).toEqual(['gpu-kernels', 'server', 'react']);
    r.send('sort.files.desc');
    expect(r.activatePart('module-server-selection', 'keyboard', { shiftKey: true, from: 'core' })).toBe(true);
    // The existing anchor survives sorting; the range follows the new visible
    // order from gpu-kernels to server rather than resetting itself to `from`.
    expect(r.getSnapshot().fields.selection).toEqual(['server', 'gpu-kernels']);
    r.dispose();
  });

  it('retains hidden selections and restricts select-all/range candidates to the current filter', () => {
    const r = runtime();
    r.activatePart('module-react-selection', 'keyboard');
    r.setInteraction({ focusedId: 'module-react-selection' });
    r.send('filter.Kernel');
    expect(r.getInteraction().focusedId).toBeNull();
    expect(r.getSnapshot().fields.selection).toEqual(['react']);
    expect(r.getScene().find(node => node.id === 'selection-count')?.text).toContain('1 ausgeblendet');
    expect(r.activatePart('selection-all', 'keyboard')).toBe(true);
    expect(new Set(r.getSnapshot().fields.selection as string[])).toEqual(new Set(['react', 'contracts', 'core', 'gpu-kernels']));
    expect(r.collection('modules').range('server')).toBe(false);
    expect(r.getSnapshot().fields.selection).not.toContain('server');
    r.send('field.change', { fieldId: 'query', value: 'no-match' });
    expect(r.getScene().some(node => node.id === 'reset-empty')).toBe(true);
    expect(r.getScene().find(node => node.id === 'selection-count')?.text).toContain('4 ausgeblendet');
    expect(r.activatePart('selection-clear', 'pointer')).toBe(true);
    expect(r.getSnapshot().fields.selection).toEqual([]);
    r.dispose();
  });

  it('orders semantic cells like the visible selection/name/files/dependencies/group columns', () => {
    const r = runtime(), nodes = r.getScene();
    expect(nodes.filter(node => node.semantics?.parentId === 'header-row').map(node => node.id)).toEqual(['column-selection', 'column-name', 'column-files', 'column-dependencies', 'column-group']);
    expect(nodes.filter(node => node.semantics?.parentId === 'row-core').map(node => node.id)).toEqual(['module-core-selection', 'module-core', 'module-core-files', 'module-core-dependencies', 'module-core-summary']);
    const headers = nodes.filter(node => node.semantics?.parentId === 'header-row').toSorted((a, b) => a.semantics!.columnIndex! - b.semantics!.columnIndex!);
    const cells = nodes.filter(node => node.semantics?.parentId === 'row-core').toSorted((a, b) => a.semantics!.columnIndex! - b.semantics!.columnIndex!);
    expect(cells.map(node => node.semantics?.columnIndex)).toEqual(headers.map(node => node.semantics?.columnIndex));
    expect(cells.map(node => node.text)).toEqual(['', 'core', '100', '2', 'Kernel']);
    r.dispose();
  });

  it('inspects actual aggregate data, preserves collection state when closing and declares a stable focus return', () => {
    const r = runtime();
    r.activatePart('module-core-selection', 'pointer');
    r.activatePart('module-react-selection', 'pointer');
    expect(r.activatePart('selection-inspect', 'keyboard')).toBe(true);
    expect(r.getSnapshot()).toMatchObject({ state: 'table', fields: { inspectorOpen: true, selection: ['core', 'react'] } });
    const scene = r.getScene({ width: 390, height: 2000 });
    expect(scene.find(node => node.id === 'inspector-region')).toMatchObject({ semantics: { role: 'region' }, label: 'Auswahldetails' });
    expect(scene.find(node => node.id === 'inspector-metrics')?.text).toBe('2 Module · 120 Quellen\n920 Zeilen · 3 Pakete');
    expect(scene.find(node => node.id === 'inspector-names')?.text).toBe('core · react');
    for (const id of ['inspector-close', 'module-core-selection']) expect(scene.find(node => node.id === id)).toMatchObject({ onEscape: 'inspector.close', focusReturn: 'selection-inspect' });
    expect(r.activatePart('inspector-close', 'keyboard')).toBe(true);
    expect(r.getSnapshot()).toMatchObject({ fields: { inspectorOpen: false, selection: ['core', 'react'] } });
    expect(r.getScene().some(node => node.id === 'inspector-region')).toBe(false);
    r.send('reset');
    expect(r.getSnapshot()).toMatchObject({ fields: { selection: [], inspectorOpen: false } });
    r.dispose();
  });

  it('serializes selection canonically as repeated picked values and restores it with the detail route atomically', () => {
    const r = runtime();
    r.activatePart('module-react-selection', 'pointer');
    r.activatePart('module-core-selection', 'pointer');
    r.send('select.server');
    const search = workspaceSearch(r.getSnapshot());
    expect(new URLSearchParams(search).getAll('picked')).toEqual(['core', 'react']);
    expect(new URLSearchParams(search).get('selected')).toBe('server');
    const restored = runtime();
    expect(restored.send('navigation.restore', readWorkspaceLocation(search, data), 'host').accepted).toBe(true);
    expect(restored.getSnapshot()).toMatchObject({ state: 'detail', revision: 1, fields: { selected: 'server', selection: ['core', 'react'] } });
    expect(restored.send('navigation.restore', readWorkspaceLocation('?view=cards', data), 'host').accepted).toBe(true);
    expect(restored.getSnapshot().fields.selection).toEqual([]);
    for (const search of ['?picked=missing', '?picked=core&picked=core', '?picked=', '?picked=bad/id']) expect(() => readWorkspaceLocation(search, data)).toThrow();
    r.dispose(); restored.dispose();
  });

  it('cancels selection and inspection atomically without changing checked state or tentative range anchors', () => {
    const reasons: string[] = [];
    const r = runtime({ beforeChange: details => { reasons.push(details.reason); details.cancel(); } });
    const initial = r.getSnapshot();
    expect(r.activatePart('module-core-selection', 'pointer')).toBe(false);
    expect(r.activatePart('module-react-selection', 'keyboard', { shiftKey: true, from: 'core' })).toBe(false);
    expect(r.activatePart('selection-all', 'keyboard')).toBe(false);
    expect(r.activatePart('selection-inspect', 'keyboard')).toBe(false);
    expect(r.getSnapshot()).toBe(initial);
    expect(r.collection('modules').getAnchor()).toBeNull();
    expect(r.getScene().filter(node => node.collection).every(node => node.checked === false)).toBe(true);
    expect(reasons).toEqual(['pointer', 'keyboard', 'keyboard', 'keyboard']);
    r.dispose();
  });

  it('rejects invalid collection keys without a partial commit', () => {
    const r = runtime(), snapshot = r.getSnapshot();
    for (const keys of [['missing'], ['core', 'core']]) expect(r.send('collection.change', { collectionId: 'modules', keys }).accepted).toBe(false);
    expect(r.getSnapshot()).toBe(snapshot);
    r.dispose();
  });

  it('keeps the dock, filters, collection toolbar, inspector and data disjoint at compact and desktop widths', () => {
    const r = runtime();
    r.activatePart('module-gpu-kernels-selection', 'keyboard');
    for (const inspectorOpen of [false, true]) {
      r.send(inspectorOpen ? 'inspector.open' : 'inspector.close');
      for (const state of ['table', 'cards', 'map']) {
        r.send(`view.${state}`);
        for (const width of [268, 320, 390, 550, 768, 1100]) {
          const layout = workspaceLayout(width, data.modules.length, EFFECT_LIBRARY.length, inspectorOpen);
          const scene = r.getScene({ width, height: layout.surfaceHeight });
          const controls = scene.filter(node => node.id.startsWith('selection-'));
          const filters = scene.filter(node => node.id.startsWith('group-'));
          expect(Math.min(...controls.map(node => node.y))).toBeGreaterThan(Math.max(...filters.map(node => node.y + node.height)));
          for (const a of controls) {
            expect(a.x).toBeGreaterThanOrEqual(0);
            expect(a.x + a.width).toBeLessThanOrEqual(width);
            for (const b of controls) if (a !== b) expect(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y).toBe(true);
          }
          const inspector = scene.find(node => node.id === 'inspector-region');
          if (inspector) {
            expect(inspector.y).toBeGreaterThan(Math.max(...controls.map(node => node.y + node.height)));
            expect(scene.find(node => node.id === 'result-count')!.y).toBeGreaterThan(inspector.y + inspector.height);
            for (const child of scene.filter(node => node.semantics?.parentId === inspector.id)) {
              expect(child.y).toBeGreaterThanOrEqual(inspector.y);
              expect(child.y + child.height).toBeLessThanOrEqual(inspector.y + inspector.height);
            }
          }
          expect(layout.surfaceHeight).toBeGreaterThan(Math.max(...scene.map(node => node.y + node.height)));
        }
      }
    }
    r.dispose();
  });

  it('fits the new collection controls and multipart text with the real shipped font at narrow and desktop sizes', async () => {
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]));
    const handle = glyph.handle('workspace-collection-font-test', ThreeConfig);
    const text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    const scene = new Scene(); scene.add(text);
    const r = runtime();
    try {
      r.activatePart('selection-all', 'keyboard');
      r.send('inspector.open');
      for (const view of ['table', 'cards', 'map']) {
        r.send(`view.${view}`);
        for (const width of [268, 320, 390, 768, 1100]) {
          for (const node of r.getScene({ width, height: 2200 }).filter(node => node.text && /^(selection-|inspector-|module-)/.test(node.id))) {
            const region = textRegion(node, node.width, node.height, node.fontSize);
            text.text = node.text;
            text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT };
            text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines };
            text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } };
            glyph.shape();
            const measured = text.measure();
            expect(measured.missingGlyphCount, `${view}/${width}/${node.id}`).toBe(0);
            expect(measured.overflowed, `${view}/${width}/${node.id}: ${node.text}`).toBe(false);
          }
        }
      }
    } finally { r.dispose(); scene.remove(text); text.dispose(); fonts.dispose(); handle.dispose(); }
  });
});
