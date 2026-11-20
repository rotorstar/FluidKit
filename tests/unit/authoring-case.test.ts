import { beforeAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { AuthoringDocumentSchema, DEFAULT_AUTHORING_DOCUMENT, type AuthoringDocument } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { authoredWorkspaceHeight, authoredWorkspaceScene, createAuthoredWorkspaceFlow, workspaceCollectionOrder, workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { textRegion, TEXT_LINE_HEIGHT } from '../../packages/webgpu/src/text-layout';

let data: WorkspaceData;
beforeAll(async () => { data = await readWorkspace(process.cwd()); });
const copy = () => AuthoringDocumentSchema.parse(DEFAULT_AUTHORING_DOCUMENT);
function runtime(document = copy()) {
  return createFluidRuntime({ flow: createAuthoredWorkspaceFlow(document, data),
    projections: { workspace: (snapshot, viewport, effects) => authoredWorkspaceScene(document, data, snapshot, viewport, effects) },
    collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot) });
}
const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

describe('registered GPU authoring with the actual Workspace', () => {
  it('validates document bindings before constructing the flow and uses the declared initial view', () => {
    for (const view of ['table', 'cards', 'map'] as const) {
      const document = copy(), explorer = document.sections.find(section => section.type === 'module-explorer')!;
      if (explorer.type !== 'module-explorer') throw new Error('Missing explorer'); explorer.view = view;
      const r = runtime(document); expect(r.getSnapshot().state).toBe(view); r.dispose();
    }
    expect(() => createAuthoredWorkspaceFlow(Object.assign(copy(), { code: 'execute()' }), data)).toThrow();
  });

  it('composes every section order with one title, no duplicate dock and a common bounded height', () => {
    for (const order of orders) {
      const document = copy(); document.sections = order.map(index => document.sections[index]!);
      const r = runtime(document);
      try {
        for (const inspectorOpen of [false, true]) {
          if (inspectorOpen) expect(r.send('inspector.open').accepted).toBe(true);
          for (const view of ['table', 'cards', 'map']) {
            expect(r.send(`view.${view}`).accepted).toBe(true);
            for (const width of [268, 390, 768, 1280]) {
              const height = authoredWorkspaceHeight(document, width, data.modules.length, inspectorOpen);
              const scene = r.getScene({ width, height });
              expect(new Set(scene.map(node => node.id)).size).toBe(scene.length);
              expect(scene.filter(node => node.id === 'authoring.document.title')).toHaveLength(1);
              expect(scene.some(node => ['eyebrow', 'title', 'subtitle'].includes(node.id) || node.id.startsWith('effect-'))).toBe(false);
              const tops = document.sections.map(section => scene.find(node => node.id === `authoring.section.${section.type}.${section.id}.region`)!.y);
              expect(tops).toEqual([...tops].sort((a, b) => a - b));
              for (const node of scene) {
                expect(node.y, `${view}/${width}/${node.id}`).toBeGreaterThanOrEqual(0);
                expect(node.y + node.height, `${view}/${width}/${node.id}`).toBeLessThanOrEqual(height + .1);
              }
            }
          }
        }
      } finally { r.dispose(); }
    }
  });

  it('retains existing module parts, commands and controlled selection across views and composition accents', () => {
    const selected = data.modules.slice(0, 2).map(module => module.id);
    const colors = new Set<string>();
    for (const accent of ['forest', 'indigo', 'amber'] as const) {
      const document = copy(); document.accent = accent; const r = runtime(document);
      try {
        expect(r.send('collection.change', { collectionId: 'modules', keys: selected }).accepted).toBe(true);
        for (const view of ['table', 'cards', 'map']) {
          r.send(`view.${view}`);
          const height = authoredWorkspaceHeight(document, 390, data.modules.length), scene = r.getScene({ width: 390, height });
          const original = workspaceScene(data, r.getSnapshot(), { width: 390, height });
          for (const id of selected) {
            const checkbox = scene.find(node => node.id === `module-${id}-selection`)!;
            const old = original.find(node => node.id === checkbox.id)!;
            expect(checkbox.checked).toBe(true); expect(checkbox.anatomy).toEqual(old.anatomy); expect(checkbox.collection).toEqual(old.collection); colors.add(checkbox.color);
            expect(scene.find(node => node.id === `module-${id}`)?.onActivate).toBe(`select.${id}`);
          }
        }
        expect(r.send(`select.${selected[0]}`).accepted).toBe(true);
        expect(r.getSnapshot().fields.selection).toEqual(selected);
        expect(r.getScene({ width: 390, height: authoredWorkspaceHeight(document, 390, data.modules.length) }).some(node => node.id === `module-${selected[0]}`)).toBe(true);
      } finally { r.dispose(); }
    }
    expect(colors.size).toBe(3);
  });

  it('uses actual dataset aggregates and keeps the note sensitive and outside the authoring document', () => {
    const document = copy(), r = runtime(document);
    try {
      const metric = document.sections.find(section => section.type === 'metric-grid')!;
      const scene = r.getScene({ width: 800, height: authoredWorkspaceHeight(document, 800, data.modules.length) });
      const value = (key: string) => scene.find(node => node.id === `authoring.section.metric-grid.${metric.id}.${key}.value`)?.text;
      expect(value('modules')).toBe(String(data.modules.length));
      expect(value('sources')).toBe(String(data.modules.reduce((sum, module) => sum + module.files, 0)));
      expect(value('dependencies')).toBe(String(new Set(data.modules.flatMap(module => module.dependencies)).size));
      expect(r.send('field.change', { fieldId: 'workspaceNote', value: 'Persönlicher Entwurf 東京' }).accepted).toBe(true);
      expect(JSON.stringify(document)).not.toContain('Persönlicher');
      const note = r.getScene({ width: 800, height: authoredWorkspaceHeight(document, 800, data.modules.length) }).find(node => node.binding === 'workspaceNote')!;
      expect(note.anatomy.behavior).toBe('textbox'); expect(note.sensitive).toBe(true); expect(note.text).toBe('Persönlicher Entwurf 東京');
      r.send('reset'); expect(r.getSnapshot().fields.workspaceNote).toBe('Persönlicher Entwurf 東京');
      const noNote = { ...document, sections: document.sections.filter(section => section.type !== 'project-note') };
      expect(createAuthoredWorkspaceFlow(noNote, data).fields.find(field => field.id === 'workspaceNote')).toMatchObject({ sensitive: true, type: 'text', maxLength: 2000 });
    } finally { r.dispose(); }
  });

  it('wraps long labels without separating combining graphemes or changing the accessible title', () => {
    const document = copy(); document.title = 'W\u0308'.repeat(40);
    const r = runtime(document);
    try {
      const title = r.getScene({ width: 268, height: authoredWorkspaceHeight(document, 268, data.modules.length) }).find(node => node.id === 'authoring.document.title')!;
      expect(title.text.replaceAll('\n', '')).toBe(document.title);
      expect(title.label).toBe(document.title);
      expect(/(?:^|\n)\p{Mark}/u.test(title.text)).toBe(false);
    } finally { r.dispose(); }
  });

  it('fits registered labels and long allowed titles with the real shipped fonts on compact and desktop surfaces', async () => {
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]), [new Blob([await readFile('apps/studio/public/fonts/noto-sans-jp-subset.font.glb')])]);
    const handle = glyph.handle('authoring-font-fit', ThreeConfig), text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    const scene = new Scene(); scene.add(text);
    const documents: AuthoringDocument[] = [copy(), copy()];
    documents[1]!.title = 'W'.repeat(80);
    const longNote = documents[1]!.sections.find(section => section.type === 'project-note')!;
    if (longNote.type !== 'project-note') throw new Error('Missing note'); longNote.label = 'W'.repeat(80);
    try {
      for (const document of documents) {
        const r = runtime(document);
        try {
          for (const width of [268, 320, 390, 768, 1280]) {
            const height = authoredWorkspaceHeight(document, width, data.modules.length);
            for (const node of r.getScene({ width, height }).filter(node => node.id.startsWith('authoring.') && node.text && node.opacity > .01 && node.anatomy.behavior !== 'textbox')) {
              const region = textRegion(node, node.width, node.height, node.fontSize);
              text.text = node.text; text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT };
              text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines };
              text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } };
              glyph.shape(); const measured = text.measure();
              expect(measured.missingGlyphCount, `${width}/${node.id}`).toBe(0);
              expect(measured.overflowed, `${width}/${node.id}: ${node.text}`).toBe(false);
            }
          }
        } finally { r.dispose(); }
      }
    } finally { scene.remove(text); text.dispose(); fonts.dispose(); handle.dispose(); }
  });
});
