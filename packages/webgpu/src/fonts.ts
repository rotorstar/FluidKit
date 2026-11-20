import { createFontStack, glyph, msdf, type FontFace, type FontFaceSource, type FontSelection } from '@pmndrs/glyph';
import type { ThreeHandle, Text } from '@pmndrs/glyph/three';

export const DEFAULT_PRIMARY_FONT_URL = '/fonts/inter.font.glb';
export const DEFAULT_FALLBACK_FONT_URLS: readonly string[] = Object.freeze(['/fonts/noto-sans-jp-subset.font.glb']);

/** Offline assets only; a configured fallback load failure is explicit, never silently dropped. */
export async function loadSurfaceFonts(primary: FontFaceSource, fallbacks: readonly FontFaceSource[] = [], signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const faces: FontFace<typeof msdf | ReturnType<typeof msdf>>[] = [];
  const owners: Text<typeof msdf>[] = [];
  let disposed = false;
  let ownerHandle: ThreeHandle | undefined;
  let selection: FontSelection<typeof msdf> | undefined;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    const failures: unknown[] = [];
    // Rendered texts must be released by the caller before these leases.
    for (const resource of [...faces, ...owners].reverse()) {
      try { resource.dispose(); } catch (error) { failures.push(error); }
    }
    if (failures.length) throw new AggregateError(failures, 'Font resource disposal failed');
  };
  let abortDisposalError: unknown;
  const abort = () => { try { dispose(); } catch (error) { abortDisposalError = error; } };
  signal?.addEventListener('abort', abort, { once: true });
  try {
    faces.push(glyph.fontFace(primary, { format: msdf }));
    // Fallback assets are baked with this bounded raster profile (see font-bake.config.json).
    for (const source of fallbacks) faces.push(glyph.fontFace(source, { format: msdf({ emSize: 32, pixelRange: 6 }) }));
    await glyph.init();
    await Promise.all(faces.map(face => face.load()));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  } catch (error) {
    try { dispose(); } catch (disposalError) { throw new AggregateError([error, disposalError], 'Font load and disposal failed'); }
    if (abortDisposalError) throw new AggregateError([error, abortDisposalError], 'Font abort and disposal failed');
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    throw error;
  } finally { signal?.removeEventListener('abort', abort); }
  return {
    createSelection(handle: ThreeHandle): FontSelection<typeof msdf> {
      if (disposed) throw new Error('Font set already disposed');
      if (ownerHandle && ownerHandle !== handle) throw new Error('Font set belongs to a different Glyph handle');
      if (selection) return selection;
      ownerHandle = handle;
      try {
        // Glyph 0.1 exposes the acquired Font through public Text.font. These empty
        // Texts are never scene-attached; they keep fallback leases alive until disposal.
        for (const face of faces) owners.push(handle.createText({ font: face, text: '' }));
        const fonts = owners.map(owner => {
          const font = owner.font;
          if ('fonts' in font) throw new Error('A FontFace must acquire a single font');
          return font;
        });
        const first = fonts[0];
        if (!first) throw new Error('Primary font is required');
        selection = fonts.length === 1 ? first : createFontStack(first, ...fonts.slice(1));
        return selection;
      } catch (error) {
        try { dispose(); } catch (disposalError) { throw new AggregateError([error, disposalError], 'Font selection and disposal failed'); }
        throw error;
      }
    },
    dispose,
  };
}
