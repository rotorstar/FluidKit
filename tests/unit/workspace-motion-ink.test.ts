import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { createFluidRuntime } from '@fluidkit/core';
import { DEFAULT_EFFECT_SETTINGS, type TextInkBox } from '@fluidkit/contracts';
import { createWorkspaceFlow, workspaceScene, workspaceCollectionOrder } from '@fluidkit/cases';
import { createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { overlappingText, textRegion, TEXT_LINE_HEIGHT } from '../../packages/webgpu/src/text-layout';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';

describe('real-font structural workspace text lanes', () => {
  it.each([390, 480, 991])('keeps stable names and source counts separate in both directions at %ipx', async width => {
    const data = await readWorkspace(process.cwd());
    const fonts = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]));
    const handle = glyph.handle(`motion-lane-${width}`, ThreeConfig), text = handle.createText({ font: fonts.createSelection(handle), text: '' });
    const scene = new Scene(); scene.add(text);
    const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS,
      projections: { workspace: (snapshot, viewport, effects) => workspaceScene(data, snapshot, viewport, effects) }, collectionOrder: snapshot => workspaceCollectionOrder(data, snapshot) });
    runtime.setRenderCapabilities({ backend: 'webgpu', typegpu: true, compute: false, reducedMotion: false });
    const viewport = { width, height: 9000 };
    try {
      for (const event of ['view.cards', 'view.table']) {
        const source = runtime.getScene(viewport); expect(runtime.send(event).accepted).toBe(true);
        const clip = createTransitionClip({ source, target: runtime.getScene(viewport), plan: runtime.getVisualState().current, durationMs: runtime.getTransitionDuration(), viewport, motionVersion: 2 });
        for (let step = 0; step <= 20; step++) {
          const frame = sampleTransitionClip(clip, step / 20), states = new Map(frame.nodeStates.map(value => [value.id, value])), boxes: TextInkBox[] = [];
          for (const node of frame.nodes.filter(value => /^module-/.test(value.id) && value.text && (states.get(value.id)?.textOpacity ?? 0) > .01)) {
            const region = textRegion(node, node.width, node.height, node.fontSize);
            text.text = node.text; text.style = { fontSize: region.fontSize, lineHeight: TEXT_LINE_HEIGHT };
            text.layout = { wrap: 'word', overflow: 'ellipsis', maxLines: region.maxLines };
            text.constraints = { width: { mode: 'at-most', size: region.width }, height: { mode: 'at-most', size: region.height } }; glyph.shape();
            expect(text.measure().missingGlyphCount, `${width}/${event}/${step}/${node.id}`).toBe(0);
            const rows = new Map<number, { minX: number; maxX: number; minY: number; maxY: number }>();
            for (const item of text.measureGlyphs() ?? []) {
              const ink = item.localInkBounds; if (ink.isEmpty() || ink.min.x === ink.max.x || ink.min.y === ink.max.y) continue;
              const key = Math.round(item.shapedOrigin.y * 1000), row = rows.get(key) ?? { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
              row.minX = Math.min(row.minX, ink.min.x); row.maxX = Math.max(row.maxX, ink.max.x); row.minY = Math.min(row.minY, ink.min.y); row.maxY = Math.max(row.maxY, ink.max.y); rows.set(key, row);
            }
            let line = 0; for (const row of rows.values()) boxes.push({ id: node.id, line: line++, x: node.x + region.insetX + row.minX, y: node.y + region.insetY - row.maxY, width: row.maxX - row.minX, height: row.maxY - row.minY });
          }
          for (const module of data.modules) for (const id of [`module-${module.id}`, `module-${module.id}-files`]) {
            expect(states.get(id)?.textOpacity, `${width}/${event}/${step}/${id}`).toBe(1);
            expect(boxes.some(box => box.id === id), `${width}/${event}/${step}/${id}`).toBe(true);
          }
          expect(overlappingText(boxes), `${width}/${event}/${step * 5}%`).toEqual([]);
        }
      }
    } finally { runtime.dispose(); scene.remove(text); text.dispose(); fonts.dispose(); handle.dispose(); }
  });
});
