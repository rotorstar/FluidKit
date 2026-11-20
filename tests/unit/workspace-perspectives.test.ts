import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { createFluidRuntime } from '@fluidkit/core';
import { DEFAULT_EFFECT_SETTINGS, EffectSettingsSchema, type SceneNode } from '@fluidkit/contracts';
import { captureTransitionSource, createTransitionClip, EFFECT_LIBRARY, PresentationFrameSchema, sampleTransitionClip } from '@fluidkit/effects';
import { createWorkspaceFlow, readWorkspaceLocation, WorkspaceDataSchema, workspaceCollectionOrder, workspaceRows, workspaceScene, workspaceSearch, workspaceSurfaceHeight } from '@fluidkit/cases';
import { workspaceComparison, workspaceSuggestedComparison } from '../../packages/cases/src/workspace-compare';
import { workspaceAtlasCells, workspaceTreemap } from '../../packages/cases/src/workspace-atlas';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { textRegion, TEXT_LINE_HEIGHT } from '../../packages/webgpu/src/text-layout';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { hitTestPresentation, type PresentedHitTarget } from '../../packages/webgpu/src/hit-testing';

// Deliberate contract fixture: no fabricated product records are imported by the app.
const data = WorkspaceDataSchema.parse({ schemaVersion: 1, name: 'perspectives-test', capturedAt: '2026-11-14T08:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'contracts', name: '@test/contracts', version: '1.0.0', group: 'Kernel', files: 12, lines: 630, dependencies: ['zod'], internal: [] },
  { id: 'core', name: '@test/core', version: '1.0.0', group: 'Kernel', files: 21, lines: 1450, dependencies: ['zod', 'xstate'], internal: ['contracts'] },
  { id: 'react', name: '@test/react', version: '1.0.0', group: 'Adapter', files: 6, lines: 480, dependencies: ['zod', 'react', '@floating-ui/react-dom'], internal: ['core'] },
  { id: 'webgpu', name: '@test/webgpu', version: '2.0.0', group: 'Adapter', files: 31, lines: 3940, dependencies: ['zod', 'three', '@pmndrs/glyph'], internal: ['core', 'contracts'] },
  { id: 'server', name: '@test/server', version: '1.0.0', group: 'Tooling', files: 4, lines: 240, dependencies: ['ai', 'zod'], internal: ['contracts'] },
  { id: 'tiny', name: '@test/tiny', version: '0.1.0', group: 'Tooling', files: 1, lines: 1, dependencies: [], internal: [] },
  { id: 'empty', name: '@test/empty', version: '', group: 'Tooling', files: 0, lines: 0, dependencies: [], internal: [] },
] });
const runtime = (recipe = 'silk-cascade') => createFluidRuntime({ flow: createWorkspaceFlow(data),
  effectSettings: EffectSettingsSchema.parse({ ...DEFAULT_EFFECT_SETTINGS, effect: { id: recipe, version: '1.0.0' } }),
  projections: { workspace: (snapshot, viewport, settings) => workspaceScene(data, snapshot, viewport, settings) },
  collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot),
});
const widths = [280, 320, 390, 768, 1280];
function assertBounds(scene: SceneNode[], width: number, height: number) {
  expect(new Set(scene.map(node => node.id)).size).toBe(scene.length);
  for (const node of scene) {
    expect(node.width, node.id).toBeGreaterThan(0);
    expect(node.height, node.id).toBeGreaterThan(0);
    expect(node.x, node.id).toBeGreaterThanOrEqual(-.001);
    expect(node.y, node.id).toBeGreaterThanOrEqual(-.001);
    expect(node.x + node.width, node.id).toBeLessThanOrEqual(width + .001);
    expect(node.y + node.height, node.id).toBeLessThanOrEqual(height + .001);
  }
}

describe('M9 workspace perspectives', () => {
  it('does not select implicitly, and applies only an explicit real-data suggestion', () => {
    const r = runtime();
    expect(r.send('view.compare').accepted).toBe(true);
    expect(r.getSnapshot().fields.selection).toEqual([]);
    expect(r.getScene().find(node => node.id === 'compare-suggest')?.onActivate).toBe('compare.suggest');
    expect(r.send('compare.suggest').accepted).toBe(true);
    expect(r.getSnapshot().fields.selection).toEqual(workspaceSuggestedComparison(data));
    expect(workspaceSuggestedComparison({ ...data, modules: data.modules.filter(module => ['core', 'react'].includes(module.id)) }).sort()).toEqual(['core', 'react']);
    expect(workspaceSuggestedComparison(data).every(id => data.modules.some(module => module.id === id))).toBe(true);
    r.dispose();
  });

  it('preserves every selection beyond capacity and presents explicit correction controls', () => {
    const r = runtime(); r.send('collection.change', { collectionId: 'modules', keys: data.modules.map(module => module.id) }); r.send('view.compare');
    expect(r.getSnapshot().fields.selection).toHaveLength(7);
    const scene = r.getScene({ width: 390, height: 2400 });
    expect(scene.find(node => node.id === 'compare-guidance')?.text).toContain('2–4');
    expect(scene.filter(node => node.collection)).toHaveLength(7);
    expect(scene.some(node => node.id === 'compare-table')).toBe(false);
    expect(r.activatePart('module-tiny-selection', 'keyboard')).toBe(true);
    expect(r.getSnapshot().fields.selection).not.toContain('tiny');
    expect(r.getSnapshot().fields.selection).toHaveLength(6); r.dispose();
  });

  it.each([['core', 'react'], ['contracts', 'core', 'react', 'server'], ['contracts', 'core', 'react', 'server', 'tiny']])('uses only visible comparison items for keyboard/selection under incompatible filters: %j', (...keys) => {
    const r = runtime();
    try {
      r.send('collection.change', { collectionId: 'modules', keys });
      r.send('field.change', { fieldId: 'query', value: 'webgpu' }); r.send('filter.Adapter'); r.send('view.compare');
      const expected = [...keys].sort((a, b) => a.localeCompare(b, 'en'));
      expect(workspaceRows(data, r.getSnapshot()).map(module => module.id)).toEqual(['webgpu']);
      expect(workspaceCollectionOrder(data, r.getSnapshot())).toEqual(expected);
      expect(r.getScene().filter(node => node.collection).map(node => node.collection!.itemId)).toEqual(expected);
      expect(r.collection('modules').typeahead('r', { currentKey: 'core', time: 100 })).toBe('react');
      expect(r.activatePart('selection-all', 'keyboard')).toBe(true);
      expect(r.getSnapshot().fields.selection).toEqual(keys); expect(r.getSnapshot().fields.selection).not.toContain('webgpu');
      expect(r.activatePart('module-core-selection', 'keyboard')).toBe(true);
      expect(r.getSnapshot().fields.selection).toEqual(keys.filter(id => id !== 'core'));
      expect(workspaceCollectionOrder(data, r.getSnapshot())).toEqual(expected.filter(id => id !== 'core'));
      r.send('view.table'); expect(workspaceCollectionOrder(data, r.getSnapshot())).toEqual(['webgpu']);
    } finally { r.dispose(); }
  });

  it('limits shift ranges to the comparison presentation order instead of hidden query matches', () => {
    const r = runtime();
    try {
      r.send('collection.change', { collectionId: 'modules', keys: ['core', 'react', 'server'] });
      r.send('field.change', { fieldId: 'query', value: 'not-a-module' }); r.send('view.compare');
      expect(r.activatePart('module-server-selection', 'keyboard', { shiftKey: true, from: 'react' })).toBe(true);
      expect(r.getSnapshot().fields.selection).toEqual(['react', 'server']);
      expect(r.getSnapshot().state).toBe('compare');
    } finally { r.dispose(); }
  });

  it('derives exact values, shared intersection and remaining dependencies without quality scores', () => {
    const modules = data.modules.filter(module => ['core', 'react', 'webgpu'].includes(module.id));
    const rows = workspaceComparison(modules);
    expect(rows.find(row => row.id === 'files')?.values).toEqual(['21', '6', '31']);
    expect(rows.find(row => row.id === 'shared')).toMatchObject({ values: ['zod', 'zod', 'zod'], different: false });
    expect(rows.find(row => row.id === 'distinct')?.values).toEqual(['xstate', '@floating-ui/react-dom\nreact', '@pmndrs/glyph\nthree']);
    expect(rows.find(row => row.id === 'version')?.different).toBe(true);
    const r = runtime(); r.send('compare.suggest'); r.send('view.compare'); r.send('compare.differences.on');
    expect(r.getScene({ width: 1280, height: 2400 }).some(node => node.id === 'compare-row-shared')).toBe(false);
    expect(r.getScene({ width: 1280, height: 2400 }).some(node => node.id === 'compare-row-files')).toBe(true); r.dispose();
  });

  it('keeps selected module parts across filtered comparison, atlas and detail navigation', () => {
    const r = runtime(); r.send('collection.change', { collectionId: 'modules', keys: ['core', 'react'] });
    r.send('field.change', { fieldId: 'query', value: 'not-a-module' }); r.send('view.compare');
    expect(r.getScene().find(node => node.id === 'module-core-selection')).toMatchObject({ checked: true, collection: { id: 'modules', itemId: 'core' } });
    r.send('field.change', { fieldId: 'query', value: '' });
    for (const view of ['atlas', 'compare', 'table', 'cards']) {
      r.send(`view.${view}`);
      const scene = r.getScene({ width: 390, height: 4000 });
      if (view === 'atlas') {
        expect(scene.filter(node => node.collection)).toHaveLength(0);
        for (const [group, id] of [['Kernel', 'core'], ['Adapter', 'react']]) {
          r.send(`atlas.group.${group}`); expect(r.getScene().find(node => node.id === `module-${id}-selection`)?.checked).toBe(true);
        }
        r.send('atlas.group.all');
      } else for (const id of ['core', 'react']) expect(scene.find(node => node.id === `module-${id}-selection`)?.checked).toBe(true);
      expect(r.getSnapshot().fields.selection).toEqual(['core', 'react']);
    }
    r.activatePart('module-core', 'keyboard');
    expect(r.getSnapshot()).toMatchObject({ state: 'detail', fields: { selected: 'core', selection: ['core', 'react'] } }); r.dispose();
  });

  it('roundtrips validated view options and independent detail/collection identities through history', () => {
    const r = runtime(); r.send('compare.suggest'); r.send('compare.differences.on'); r.send('atlas.metric.files'); r.send('atlas.group.Adapter'); r.send('view.atlas');
    const search = workspaceSearch(r.getSnapshot()), location = readWorkspaceLocation(search, data);
    expect(location).toMatchObject({ state: 'atlas', fields: { atlasMetric: 'files', atlasGroup: 'Adapter', compareDifferences: true } });
    r.send('view.compare'); const comparison = workspaceSearch(r.getSnapshot());
    expect(r.send('navigation.restore', location, 'host').accepted).toBe(true);
    expect(workspaceSearch(r.getSnapshot())).toBe(search);
    expect(r.send('navigation.restore', readWorkspaceLocation(comparison, data), 'host').accepted).toBe(true);
    expect(r.getSnapshot().state).toBe('compare');
    for (const invalid of ['?view=atlas&metric=bytes', '?view=atlas&atlasGroup=Unknown', '?view=compare&differences=perhaps', '?view=compare&picked=missing', '?view=compare&picked=core&picked=core']) expect(() => readWorkspaceLocation(invalid, data)).toThrow();
    r.dispose();
  });

  it('produces complete table/row/cell relationships at desktop and readable stacked modules below 900px', () => {
    const r = runtime(); r.send('compare.suggest'); r.send('view.compare');
    const scene = r.getScene({ width: 1280, height: 4000 });
    expect(scene.find(node => node.id === 'compare-table')?.semantics?.role).toBe('table');
    const tableRows = scene.filter(node => node.semantics?.parentId === 'compare-table');
    expect(tableRows.length).toBeGreaterThanOrEqual(6);
    for (const row of tableRows) {
      expect(row.semantics?.role).toBe('row');
      const cells = scene.filter(node => node.semantics?.parentId === row.id).sort((a, b) => a.semantics!.columnIndex! - b.semantics!.columnIndex!);
      expect(cells.map(node => node.semantics!.columnIndex)).toEqual([0, 1, 2, 3]);
      expect(cells.every(node => ['cell', 'columnheader'].includes(node.semantics!.role!))).toBe(true);
    }
    for (const width of [320, 390, 768]) {
      const compact = r.getScene({ width, height: 6000 });
      expect(compact.some(node => node.id === 'compare-table')).toBe(false);
      const panels = compact.filter(node => node.id.startsWith('compare-panel-')).sort((a, b) => a.y - b.y);
      expect(panels).toHaveLength(3);
      for (let i = 1; i < panels.length; i++) expect(panels[i]!.y).toBeGreaterThan(panels[i - 1]!.y + panels[i - 1]!.height);
    } r.dispose();
  });

  it('keeps five navigation controls and both new views within actual shared surface bounds', () => {
    const r = runtime();
    for (const selected of [['core', 'react'], ['core', 'react', 'webgpu', 'contracts']]) {
      r.send('collection.change', { collectionId: 'modules', keys: selected });
      for (const inspector of [false, true]) {
        r.send(inspector ? 'inspector.open' : 'inspector.close');
        for (const view of ['compare', 'atlas']) {
          r.send(`view.${view}`);
          for (const width of widths) {
            const height = workspaceSurfaceHeight(data, r.getSnapshot(), width, EFFECT_LIBRARY.length);
            const scene = r.getScene({ width, height }); assertBounds(scene, width, height);
            const nav = scene.filter(node => node.id.startsWith('view-'));
            expect(nav).toHaveLength(5);
            for (const a of nav) for (const b of nav) if (a !== b) expect(a.x + a.width <= b.x + .01 || b.x + b.width <= a.x + .01 || a.y + a.height <= b.y + .01 || b.y + b.height <= a.y + .01).toBe(true);
          }
        }
      }
    } r.dispose();
  });

  it('allocates exact proportional areas with deterministic nonoverlapping rectangles', () => {
    const bounds = { x: 18, y: 510, width: 284, height: 360 };
    const items = [{ id: 'small', weight: 1 }, { id: 'medium', weight: 9 }, { id: 'large', weight: 90 }, { id: 'zero', weight: 0 }];
    const cells = workspaceTreemap(items, bounds);
    expect(cells).toEqual(workspaceTreemap([...items].reverse(), bounds));
    expect(cells).toHaveLength(3);
    for (const cell of cells) {
      expect(cell.width * cell.height / (bounds.width * bounds.height)).toBeCloseTo(cell.weight / 100, 10);
      expect(cell.x).toBeGreaterThanOrEqual(bounds.x); expect(cell.y).toBeGreaterThanOrEqual(bounds.y);
      expect(cell.x + cell.width).toBeLessThanOrEqual(bounds.x + bounds.width + 1e-8);
      expect(cell.y + cell.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1e-8);
      for (const other of cells) if (other !== cell) expect(cell.x + cell.width <= other.x + 1e-8 || other.x + other.width <= cell.x + 1e-8 || cell.y + cell.height <= other.y + 1e-8 || other.y + other.height <= cell.y + 1e-8).toBe(true);
    }
    expect(cells.reduce((sum, cell) => sum + cell.width * cell.height, 0)).toBeCloseTo(bounds.width * bounds.height, 8);
    expect(workspaceTreemap([{ id: 'zero', weight: 0 }], bounds)).toEqual([]);
    expect(() => workspaceTreemap([{ id: 'bad', weight: -1 }], bounds)).toThrow();
  });

  it('does not allow inherited group metadata to overwrite leaf identity or weight', () => {
    const groupBounds = { x: 10, y: 20, width: 300, height: 180, id: 'Kernel', weight: 800 };
    const cells = workspaceTreemap([{ id: 'contracts', weight: 1 }, { id: 'core', weight: 3 }], groupBounds);
    expect(cells.map(cell => [cell.id, cell.weight])).toEqual([['core', 3], ['contracts', 1]]);
    expect(cells[0]!.width * cells[0]!.height).toBe(300 * 180 * .75);
  });

  it('omits subpixel paint instead of rounding it to invalid zero geometry or inventing area', () => {
    const r = runtime(); r.send('view.atlas'); r.send('atlas.group.Tooling');
    // In the expanded Tooling region this fixture remains below the 3px
    // paint threshold through 768px; at desktop it legitimately gains area.
    for (const width of widths.filter(value => value <= 768)) {
      const height = workspaceSurfaceHeight(data, r.getSnapshot(), width, EFFECT_LIBRARY.length);
      const scene = r.getScene({ width, height }); assertBounds(scene, width, height);
      expect(scene.some(node => node.id === 'atlas-cell-tiny')).toBe(false);
      expect(scene.find(node => node.id === 'module-tiny-summary')?.text).toContain('1 Zeilen');
      for (const checkbox of scene.filter(node => node.collection)) {
        const summary = scene.find(node => node.id === `module-${checkbox.collection!.itemId}-summary`)!;
        expect(summary.x + summary.width <= checkbox.x || checkbox.x + checkbox.width <= summary.x || summary.y + summary.height <= checkbox.y || checkbox.y + checkbox.height <= summary.y).toBe(true);
      }
    } r.dispose();
  });

  it('preserves group and module proportions, and keeps tiny/zero modules accessible without fake area', () => {
    const bounds = { x: 18, y: 500, width: 284, height: 360 };
    for (const metric of ['files', 'lines'] as const) {
      const result = workspaceAtlasCells(data.modules, metric, bounds);
      const total = data.modules.reduce((sum, module) => sum + module[metric], 0);
      expect(result.zero).toEqual(['empty']);
      for (const module of data.modules.filter(item => item[metric] > 0)) {
        const cell = result.cells.find(item => item.id === module.id)!;
        expect(cell.width * cell.height / (bounds.width * bounds.height)).toBeCloseTo(module[metric] / total, 10);
      }
    }
    const r = runtime(); r.send('view.atlas'); r.send('atlas.group.Tooling');
    const scene = r.getScene({ width: 320, height: 4000 });
    expect(scene.some(node => node.id === 'atlas-cell-empty')).toBe(false);
    for (const id of ['tiny', 'empty']) {
      const control = scene.find(node => node.id === `module-${id}`)!;
      expect(control.height).toBeGreaterThanOrEqual(24); expect(control.width).toBeGreaterThanOrEqual(24);
      expect(scene.some(node => node.id === `module-shell-${id}`)).toBe(true);
    }
    expect(scene.find(node => node.id === 'module-empty-summary')?.text).toContain('0 Zeilen');
    r.send('atlas.group.Tooling');
    expect(r.getScene().filter(node => node.collection).map(node => node.collection!.itemId).sort()).toEqual(['empty', 'server', 'tiny']);
    r.send('atlas.metric.files'); expect(r.getScene().find(node => node.id === 'module-empty-summary')?.text).toContain('0 Dateien');
    r.send('atlas.group.all'); expect(r.getScene().filter(node => node.collection)).toHaveLength(0);
    expect(r.getScene().filter(node => node.id.startsWith('atlas-open-'))).toHaveLength(3); r.dispose();
  });

  it('fits every new-view text node with the actual shipped Inter/Glyph font at target widths', async () => {
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]));
    const handle = glyph.handle('workspace-perspectives-font-test', ThreeConfig), text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    const scene = new Scene(); scene.add(text); const r = runtime();
    try {
      for (const selection of [['core', 'react'], ['core', 'react', 'webgpu', 'contracts']]) {
        r.send('collection.change', { collectionId: 'modules', keys: selection });
        for (const view of ['compare', 'atlas']) {
          r.send(`view.${view}`);
          for (const width of widths) {
            const height = workspaceSurfaceHeight(data, r.getSnapshot(), width, EFFECT_LIBRARY.length);
            for (const node of r.getScene({ width, height }).filter(node => node.text && /^(compare-|atlas-|module-|view-)/.test(node.id))) {
              const region = textRegion(node, node.width, node.height, node.fontSize);
              text.text = node.text; text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT };
              text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines };
              text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } };
              glyph.shape(); const measured = text.measure();
              expect(measured.missingGlyphCount, `${view}/${width}/${node.id}`).toBe(0);
              expect(measured.overflowed, `${view}/${width}/${node.id}: ${node.text}`).toBe(false);
            }
          }
        }
      }
    } finally { r.dispose(); scene.remove(text); text.dispose(); fonts.dispose(); handle.dispose(); }
  });

  it('qualifies the current imported workspace text and geometry with the shipped font', async () => {
    const actual = await readWorkspace(process.cwd());
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]));
    const handle = glyph.handle('workspace-actual-perspectives-font-test', ThreeConfig), text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    const scene = new Scene(); scene.add(text);
    const r = createFluidRuntime({ flow: createWorkspaceFlow(actual), effectSettings: DEFAULT_EFFECT_SETTINGS,
      projections: { workspace: (snapshot, viewport, settings) => workspaceScene(actual, snapshot, viewport, settings) },
      collectionOrder: snapshot => workspaceCollectionOrder(actual, snapshot),
    });
    try {
      r.send('collection.change', { collectionId: 'modules', keys: ['core', 'react', 'webgpu', 'contracts'].filter(id => actual.modules.some(module => module.id === id)) });
      for (const view of ['compare', 'atlas']) {
        r.send(`view.${view}`);
        for (const width of widths) {
          const height = workspaceSurfaceHeight(actual, r.getSnapshot(), width, EFFECT_LIBRARY.length);
          const projection = r.getScene({ width, height }); assertBounds(projection, width, height);
          for (const node of projection.filter(node => node.text && /^(compare-|atlas-|module-|view-)/.test(node.id))) {
            const region = textRegion(node, node.width, node.height, node.fontSize);
            text.text = node.text; text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT };
            text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines };
            text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } };
            glyph.shape(); const measured = text.measure();
            expect(measured.missingGlyphCount, `actual/${view}/${width}/${node.id}`).toBe(0);
            expect(measured.overflowed, `actual/${view}/${width}/${node.id}: ${node.text}`).toBe(false);
          }
        }
      }
    } finally { r.dispose(); scene.remove(text); text.dispose(); fonts.dispose(); handle.dispose(); }
  });

  it.each([390, 1280])('keeps module controls above their actual panels after reordered and interrupted transitions at %ipx', width => {
    const r = runtime('liquid-lens');
    r.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
    r.send('compare.suggest');
    const viewport = { width, height: 6000 };
    const assertHits = (frame: ReturnType<typeof sampleTransitionClip>, target: SceneNode[]) => {
      const targetById = new Map(target.map(node => [node.id, node]));
      const states = new Map(frame.nodeStates.map(state => [state.id, state]));
      const items: PresentedHitTarget[] = frame.nodes.map(node => ({ presented: node, target: targetById.get(node.id) ?? { ...node, opacity: 0 },
        panelOpacity: states.get(node.id)!.panelOpacity, textOpacity: states.get(node.id)!.textOpacity,
        renderOrder: node.layer * 2 + 200, exiting: !targetById.has(node.id),
      }));
      for (const node of target.filter(node => node.id.startsWith('module-') && ['button', 'checkbox'].includes(node.anatomy.behavior))) {
        // Real hit testing includes opaque panels, rather than trusting bounds.
        expect(hitTestPresentation(items, node.x + node.width / 2, node.y + node.height / 2)?.id, `${r.getSnapshot().state}/${width}/${node.id}`).toBe(node.id);
      }
    };
    for (const view of ['compare', 'atlas']) {
      r.send('view.cards'); const source = r.getScene(viewport);
      r.send(`view.${view}`);
      if (view === 'atlas') { r.send('atlas.metric.files'); r.send('atlas.group.Kernel'); }
      const target = r.getScene(viewport);
      const clip = createTransitionClip({ source, target, plan: r.getVisualState().current, durationMs: r.getTransitionDuration(), viewport });
      assertHits(sampleTransitionClip(clip, 1), target);
      const halfway = captureTransitionSource(sampleTransitionClip(clip, .4));
      r.send('view.table'); const intermediate = r.getScene(viewport);
      const interruption = createTransitionClip({ ...halfway, target: intermediate, plan: r.getVisualState().current, durationMs: r.getTransitionDuration(), viewport });
      r.send(`view.${view}`); const retarget = r.getScene(viewport);
      const resumed = createTransitionClip({ ...captureTransitionSource(sampleTransitionClip(interruption, .25)), target: retarget, plan: r.getVisualState().current, durationMs: r.getTransitionDuration(), viewport });
      const end = sampleTransitionClip(resumed, 1); assertHits(end, retarget);
      // Paint identity may be retained in either order across prior clips.
      // Explicit layering must make the settled controls independent of that order.
      assertHits({ ...end, nodes: [...end.nodes].reverse() }, retarget);
    } r.dispose();
  });

  it.each(EFFECT_LIBRARY.map(effect => effect.id))('%s preserves new-view endpoints, backward seek and interrupted presentation without changing selection', recipe => {
    const r = runtime(recipe); r.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: true, reducedMotion: false });
    r.send('compare.suggest'); const ids = [...r.getSnapshot().fields.selection as string[]];
    const viewport = { width: 390, height: 5000 };
    for (const view of ['compare', 'atlas']) {
      const source = r.getScene(viewport); r.send(`view.${view}`); const target = r.getScene(viewport);
      const clip = createTransitionClip({ source, target, plan: r.getVisualState().current, durationMs: r.getTransitionDuration(), viewport });
      const midpoint = sampleTransitionClip(clip, .5);
      for (const progress of [0, .25, .75, 1, .1, .5]) expect(PresentationFrameSchema.safeParse(sampleTransitionClip(clip, progress)).success).toBe(true);
      expect(sampleTransitionClip(clip, .5)).toEqual(midpoint);
      const start = sampleTransitionClip(clip, 0), end = sampleTransitionClip(clip, 1);
      for (const node of source) expect(start.nodes.find(item => item.id === node.id)).toEqual(node);
      for (const node of target) expect(end.nodes.find(item => item.id === node.id)).toEqual(node);
      const captured = captureTransitionSource(midpoint);
      const next = createTransitionClip({ ...captured, target: source, plan: null, durationMs: 400, viewport });
      const interrupted = sampleTransitionClip(next, 0);
      // Semantics bind to the newly committed Core projection immediately;
      // continuity applies to pixels and content, not a stale table parent.
      for (const node of captured.source) {
        const shown = interrupted.nodes.find(item => item.id === node.id)!;
        expect({ ...shown, semantics: undefined }).toEqual({ ...node, semantics: undefined });
      }
      const reduced = sampleTransitionClip(clip, .3, { reducedMotion: true });
      expect(reduced.progress).toBe(1); expect(reduced.lens).toBeNull(); expect(reduced.particles).toEqual([]);
      for (const node of target) expect(reduced.nodes.find(item => item.id === node.id)).toEqual(node);
      expect(r.getSnapshot().fields.selection).toEqual(ids);
    } r.dispose();
  });
});
