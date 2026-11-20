/** Shared implicit inset: sampling and GPU text layout must resolve it equally. */
export function resolveTextInsetY(node: { textInsetY?: number }, height: number): number {
  return node.textInsetY ?? Math.min(10, height * .16);
}
