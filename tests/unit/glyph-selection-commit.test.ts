import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { Scene } from 'three/webgpu';
import { glyph, msdf } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';

describe('Glyph selection publication ordering', () => {
  it('derives selection and caret geometry from the current committed layout after text updates', async () => {
    await glyph.init();
    const font = glyph.fontFace(new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]), { format: msdf });
    await font.load();
    const handle = glyph.handle('selection-commit-regression', ThreeConfig);
    const scene = new Scene();
    const text = handle.createText({ font, text: 'Selected text', style: { fontSize: 20 },
      layout: { wrap: 'word', maxLines: 1 }, constraints: { width: { mode: 'at-most', size: 300 } } });
    scene.add(text);
    try {
      glyph.shape();
      expect(text.commitState().status).toBe('committed');
      expect(text.selectionRects(0, 8)?.[0]?.width).toBeGreaterThan(0);
      // The renderer writes these properties on every frame. They stage a new
      // desired revision even when the visible text has not changed.
      text.style = { fontSize: 20, opacity: 1 };
      text.layout = { wrap: 'word', maxLines: 1 };
      text.constraints = { width: { mode: 'at-most', size: 300 } };
      expect(text.commitState().status).toBe('pending');
      expect(text.selectionRects(0, 8)).toBeUndefined();
      glyph.shape();
      expect(text.commitState().status).toBe('committed');
      const selection = text.selectionRects(0, 8);
      expect(selection?.[0]?.width).toBeGreaterThan(0);
      expect(selection?.[0]?.height).toBeGreaterThan(0);
      const caret = text.caretAt(0, 0);
      expect(caret?.offset).toBe(0); expect(caret?.rect.height).toBeGreaterThan(0);
    } finally {
      scene.remove(text); text.dispose(); handle.dispose(); font.dispose();
    }
  });
});
