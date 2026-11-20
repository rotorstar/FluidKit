import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Scene } from 'three/webgpu';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { clipTextRect, glyphCaretAtOffset, textInputScroll } from '../../packages/webgpu/src/text-input';

describe('full-value native input projection', () => {
  it('keeps End, Home and backward-selection carets visible using actual mixed-script glyph positions', async () => {
    const set = await loadSurfaceFonts(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]), [new Blob([await readFile('apps/studio/public/fonts/noto-sans-jp-subset.font.glb')])]);
    const handle = glyph.handle('full-input-projection', ThreeConfig), scene = new Scene();
    const value = 'Gru\u0308ße 東京 · '.repeat(12);
    const text = handle.createText({ font: set.createSelection(handle), text: value, style: { fontSize: 20 }, layout: { wrap: 'none', overflow: 'visible', maxLines: 1 }, constraints: { width: { mode: 'unconstrained' } } });
    scene.add(text);
    try {
      glyph.shape();
      expect(text.measure().missingGlyphCount).toBe(0);
      expect(text.measure().width).toBeGreaterThan(200);
      let scroll = 0;
      for (const offset of [value.length, 0, value.indexOf('東京') + 2, value.length - 12, 2, 0]) {
        const caret = glyphCaretAtOffset(text, value, offset);
        expect(caret).toBeDefined();
        scroll = textInputScroll(scroll, 180, text.measure().width, caret!.rect.x);
        expect(caret!.rect.x - scroll).toBeGreaterThanOrEqual(0);
        expect(caret!.rect.x - scroll).toBeLessThanOrEqual(180);
        expect(text.caretAt(caret!.rect.x, caret!.rect.y)?.offset).toBe(caret!.offset);
      }
      expect(scroll).toBe(0); expect(text.text).toBe(value);
      // The native UTF-16 offset inside u + combining diaeresis must resolve to
      // an existing cluster boundary, never a fabricated per-code-unit position.
      const combining = glyphCaretAtOffset(text, value, 3)!;
      expect([2, 4]).toContain(combining.offset);
      const selected = text.selectionRects(0, value.length) ?? [];
      expect(selected.length).toBe(1);
      const clipped = clipTextRect(selected[0]!, { x: 10, y: selected[0]!.y, width: 180, height: 40 });
      expect(clipped?.x).toBe(10); expect(clipped?.width).toBe(180);
    } finally { scene.remove(text); text.dispose(); set.dispose(); handle.dispose(); }
  });
  it('clamps scrolling across resized viewports and clips partial or absent selection rectangles', () => {
    expect(textInputScroll(500, 1000, 700, 700)).toBe(0);
    expect(textInputScroll(0, 180, 700, 700)).toBe(523);
    expect(textInputScroll(523, 180, 700, 0)).toBe(0);
    expect(clipTextRect({ x: -10, y: -5, width: 30, height: 20 }, { x: 0, y: 0, width: 100, height: 10 })).toEqual({ x: 0, y: 0, width: 20, height: 10 });
    expect(clipTextRect({ x: 101, y: 0, width: 10, height: 10 }, { x: 0, y: 0, width: 100, height: 10 })).toBeNull();
  });
});
