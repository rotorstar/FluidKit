import type { msdf } from '@pmndrs/glyph';
import type { LayoutBox, Text } from '@pmndrs/glyph/three';

type ShapedText = Pick<Text<typeof msdf>, 'withGlyphs' | 'caretAt'>;

/** Resolve a native UTF-16 caret to an actual shaped cluster edge, including bidi direction. */
export function glyphCaretAtOffset(text: ShapedText, value: string, offset: number) {
  const clamped = Math.max(0, Math.min(value.length, Math.trunc(offset)));
  const clusters = text.withGlyphs(view => {
    const result = new Map<number, { start: number; left: number; right: number; y: number; rtl: boolean }>();
    for (let i = 0; i < view.glyphCount; i++) {
      const glyph = view.glyphAt(i);
      const left = Math.min(glyph.x, glyph.x + glyph.advance), right = Math.max(glyph.x, glyph.x + glyph.advance);
      const previous = result.get(glyph.cluster);
      if (previous) { previous.left = Math.min(previous.left, left); previous.right = Math.max(previous.right, right); }
      else result.set(glyph.cluster, { start: glyph.cluster, left, right, y: glyph.y, rtl: (glyph.bidiLevel & 1) !== 0 });
    }
    return [...result.values()].sort((a, b) => a.start - b.start);
  });
  const first = clusters[0];
  if (!first) return text.caretAt(0, 0);
  const cluster = clusters.findLast(item => item.start <= clamped) ?? first;
  const after = clamped >= value.length;
  const x = after ? (cluster.rtl ? cluster.left : cluster.right) : (cluster.rtl ? cluster.right : cluster.left);
  return text.caretAt(x, cluster.y);
}

/** Keep the active caret in the input viewport without changing content or shaping offsets. */
export function textInputScroll(previous: number, width: number, contentWidth: number, caretX: number, padding = 3): number {
  const viewport = Math.max(1, width);
  const inset = Math.min(Math.max(0, padding), viewport / 3);
  const maximum = Math.max(0, Math.max(contentWidth, caretX) - viewport + inset);
  let next = Math.max(0, Math.min(previous, maximum));
  if (caretX - next > viewport - inset) next = caretX - viewport + inset;
  else if (caretX - next < inset) next = caretX - inset;
  return Math.max(0, Math.min(next, maximum));
}

/** Same logical rectangle intersection for caret, selection and measured visible ink. */
export function clipTextRect(rect: LayoutBox, viewport: LayoutBox): LayoutBox | null {
  const left = Math.max(rect.x, viewport.x), top = Math.max(rect.y, viewport.y);
  const right = Math.min(rect.x + rect.width, viewport.x + viewport.width);
  const bottom = Math.min(rect.y + rect.height, viewport.y + viewport.height);
  if (right <= left || bottom <= top) return null;
  return { x: left, y: top, width: right - left, height: bottom - top };
}
