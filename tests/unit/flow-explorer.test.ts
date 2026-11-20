import { beforeAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { createFluidRuntime } from '@fluidkit/core';
import { SceneNodeSchema } from '@fluidkit/contracts';
import { architectureReviewGraph, architectureReviewHeight, architectureReviewMermaid, architectureReviewModule, architectureReviewReturnUrl, architectureReviewScene, createArchitectureReviewFlow } from '../../packages/cases/src/flow-explorer';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { textRegion, TEXT_LINE_HEIGHT } from '../../packages/webgpu/src/text-layout';

let data: Awaited<ReturnType<typeof readWorkspace>>;
beforeAll(async () => { data = await readWorkspace(process.cwd()); });
function runtime() { const flow = createArchitectureReviewFlow(data, 'core'); return createFluidRuntime({ flow, projections: { 'architecture-review': (snapshot, viewport) => architectureReviewScene(data, 'core', flow, snapshot, viewport) } }); }

describe('local executable Architecture Review', () => {
  it('derives exactly the six domain edges and five nodes from the actual contract', () => {
    const flow = createArchitectureReviewFlow(data, 'core'), graph = architectureReviewGraph(flow);
    expect(graph.nodes.map(node => node.id)).toEqual(['scope', 'inspect', 'review', 'revise', 'approved']);
    expect(graph.edges.map(edge => [edge.from, edge.to])).toEqual([['scope', 'inspect'], ['inspect', 'review'], ['review', 'revise'], ['review', 'approved'], ['revise', 'inspect'], ['approved', 'scope']]);
    for (const edge of graph.edges) expect(flow.states[edge.from]!.on[edge.event]!.target).toBe(edge.to);
    const mermaid = architectureReviewMermaid(flow, 'scope');
    for (const edge of graph.edges) expect(mermaid).toContain(`: ${edge.event}`);
    expect(mermaid).not.toContain(': inspect.'); expect(mermaid).toContain('Selbstereignisse');
    expect(Object.values(flow.states).flatMap(state => Object.values(state.on)).some(transition => transition.action !== undefined || transition.aiAllowed)).toBe(false);
  });
  it('allows inspection without advancing the case, rejects shortcuts, and executes both review branches honestly', () => {
    const r = runtime();
    try {
      expect(r.send('review.approve').accepted).toBe(false); expect(r.getSnapshot().revision).toBe(0);
      expect(r.send('inspect.approved').accepted).toBe(true); expect(r.getSnapshot()).toMatchObject({ state: 'scope', fields: { inspectedNode: 'approved' } });
      for (const event of ['review.begin', 'review.inspect', 'review.revise', 'review.retry', 'review.inspect', 'review.approve']) expect(r.send(event).accepted, event).toBe(true);
      expect(r.getSnapshot()).toMatchObject({ state: 'approved', fields: { inspectedNode: 'approved' } });
      expect(r.getTraceSnapshot().filter(entry => entry.kind === 'accepted').map(entry => entry.eventType)).toEqual(['inspect.approved', 'review.begin', 'review.inspect', 'review.revise', 'review.retry', 'review.inspect', 'review.approve']);
      expect(r.send('review.restart').accepted).toBe(true); expect(r.getSnapshot().state).toBe('scope');
    } finally { r.dispose(); }
  });
  it('uses real module context and a fixed local return URL; invalid module IDs never fall back silently', () => {
    const selected = architectureReviewModule(data, 'core'); expect(selected).toEqual(data.modules.find(module => module.id === 'core'));
    expect(() => createArchitectureReviewFlow(data, 'no-such-module')).toThrow();
    expect(() => architectureReviewModule({ ...data, modules: [] })).toThrow();
    const url = new URL(architectureReviewReturnUrl(selected.id), 'https://fluid.invalid'); expect(url.origin).toBe('https://fluid.invalid'); expect(url.pathname).toBe('/'); expect(url.searchParams.get('selected')).toBe(selected.id);
    const r = runtime(); try { expect(r.getScene({ width: 390, height: architectureReviewHeight(390) }).find(node => node.id === 'review.metrics')!.text).toContain(`${selected.files} Quelldateien`); } finally { r.dispose(); }
  });
  it('keeps graph identities stable and controls within their actual responsive viewport in every state', () => {
    const r = runtime();
    try {
      const ids: string[][] = [];
      for (const event of [null, 'review.begin', 'review.inspect', 'review.revise', 'review.retry', 'review.inspect', 'review.approve']) {
        if (event) r.send(event);
        for (const width of [268, 320, 390, 768, 1280]) {
          const scene = r.getScene({ width, height: architectureReviewHeight(width) });
          expect(new Set(scene.map(node => node.id)).size).toBe(scene.length);
          const controls = scene.filter(node => node.anatomy.behavior === 'button');
          const graphControls = controls.filter(node => node.id.startsWith('review.state.')); ids.push(graphControls.map(node => node.id));
          for (const node of controls) {
            expect(node.x, node.id).toBeGreaterThanOrEqual(0); expect(node.x + node.width, node.id).toBeLessThanOrEqual(width);
            expect(node.y + node.height, node.id).toBeLessThanOrEqual(architectureReviewHeight(width)); expect(node.height).toBeGreaterThanOrEqual(44);
            expect(r.flow.states[r.getSnapshot().state]!.on[node.onActivate!], node.id).toBeDefined();
          }
          for (const a of graphControls) for (const b of graphControls) if (a.id !== b.id) expect(a.x >= b.x + b.width || a.x + a.width <= b.x || a.y >= b.y + b.height || a.y + a.height <= b.y).toBe(true);
          expect(scene.filter(node => node.id.startsWith('review.action.')).map(node => node.onActivate)).toEqual(architectureReviewGraph(r.flow).edges.filter(edge => edge.from === r.getSnapshot().state).map(edge => edge.event));
        }
      }
      expect(ids.every(value => value.join(',') === ids[0]!.join(','))).toBe(true);
    } finally { r.dispose(); }
  });
  it('fits all graph, context and action text with the actual shipped font at compact and wide widths', async () => {
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]));
    const handle = glyph.handle('review-font-fit', ThreeConfig), text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    new Scene().add(text); const r = runtime();
    try {
      for (const event of [null, 'review.begin', 'review.inspect', 'review.revise', 'review.retry', 'review.inspect', 'review.approve']) {
        if (event) r.send(event);
        for (const width of [268, 320, 390, 768, 1280]) for (const raw of r.getScene({ width, height: architectureReviewHeight(width) }).filter(node => node.text)) {
          const node = SceneNodeSchema.parse(raw), region = textRegion(node, node.width, node.height, node.fontSize);
          text.text = node.text; text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT }; text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines }; text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } }; glyph.shape();
          const measured = text.measure(); expect(measured.missingGlyphCount, node.id).toBe(0); expect(measured.overflowed, `${width}/${node.id}: ${node.text}`).toBe(false);
        }
      }
    } finally { text.dispose(); fonts.dispose(); handle.dispose(); r.dispose(); }
  });
});
