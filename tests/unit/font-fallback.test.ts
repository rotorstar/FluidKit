import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import config from '../../font-bake.config.json';

const primary = async () => new Blob([await readFile('apps/studio/public/fonts/inter.font.glb')]);
const fallback = async () => new Blob([await readFile('apps/studio/public/fonts/noto-sans-jp-subset.font.glb')]);
let id = 0;

describe('real offline font fallback', () => {
  it('keeps Latin metrics and original mixed-script text while eliminating missing glyphs in the declared corpus', async () => {
    const set = await loadSurfaceFonts(await primary(), [await fallback()]);
    const handle = glyph.handle(`font-qualification-${++id}`, ThreeConfig);
    const font = set.createSelection(handle);
    expect(set.createSelection(handle)).toBe(font);
    if (!('fonts' in font)) throw new Error('Expected a fallback stack');
    const scene = new Scene();
    const properties = { style: { fontSize: 20 }, constraints: { width: { mode: 'at-most' as const, size: 2400 } } };
    const latinString = 'M7 — Grüße! 123,45 €';
    const latin = handle.createText({ font: font.fonts[0], text: latinString, ...properties });
    const mixed = handle.createText({ font, text: latinString, ...properties });
    scene.add(latin, mixed);
    try {
      glyph.shape();
      expect(mixed.measure().missingGlyphCount).toBe(0);
      expect(mixed.measure().width).toBe(latin.measure().width);
      expect(mixed.measure().height).toBe(latin.measure().height);
      for (const value of ['M7 — Grüße 東京', 'Gru\u0308ße 東京', ...config.fonts[1]!.corpus!]) {
        mixed.text = value;
        glyph.shape();
        expect(mixed.text).toBe(value);
        expect(mixed.measure().missingGlyphCount, value).toBe(0);
        expect(mixed.selectionRects(0, Math.min(8, value.length))?.[0]?.width).toBeGreaterThan(0);
        expect(Number.isFinite(mixed.measure().width)).toBe(true);
      }
    } finally {
      scene.remove(latin, mixed); latin.dispose(); mixed.dispose(); set.dispose();
      expect(font.fonts.every(item => item.disposed)).toBe(true);
      set.dispose(); handle.dispose();
    }
  });

  it('keeps unsupported content unchanged and exposes missing glyphs instead of claiming universal CJK or emoji coverage', async () => {
    const set = await loadSurfaceFonts(await primary(), [await fallback()]);
    const handle = glyph.handle(`font-qualification-${++id}`, ThreeConfig);
    const text = handle.createText({ font: set.createSelection(handle), text: '東京 🦄 龘' });
    const scene = new Scene(); scene.add(text);
    try {
      glyph.shape();
      expect(text.text).toBe('東京 🦄 龘');
      expect(text.measure().missingGlyphCount).toBeGreaterThanOrEqual(2);
    } finally { scene.remove(text); text.dispose(); set.dispose(); handle.dispose(); }
  });

  it('rejects invalid or aborted font loads and can subsequently load a clean independent font set', async () => {
    await expect(loadSurfaceFonts(await primary(), [new Blob(['not a font'])])).rejects.toThrow();
    const controller = new AbortController(); controller.abort();
    await expect(loadSurfaceFonts(await primary(), [], controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    const during = new AbortController();
    const pending = loadSurfaceFonts(await primary(), [await fallback()], during.signal);
    during.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    const clean = await loadSurfaceFonts(await primary(), [await fallback()]);
    clean.dispose();
    const handle = glyph.handle(`font-qualification-${++id}`, ThreeConfig);
    try { expect(() => clean.createSelection(handle)).toThrow('disposed'); } finally { handle.dispose(); }
  });

  it('pins the real source bytes and bounded artifact size', async () => {
    const entry = config.fonts[1]!;
    expect(createHash('sha256').update(await readFile(entry.input)).digest('hex')).toBe(entry.sourceSha256);
    expect(createHash('sha256').update(await readFile(entry.originalInput!)).digest('hex')).toBe(entry.originalSha256);
    expect((await stat(entry.output)).size).toBeLessThanOrEqual(entry.maxBytes!);
  });
});
