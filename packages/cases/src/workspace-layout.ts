/** Shared geometry for the GPU dock and its React host. No DOM measurements live in the case. */
export function workspaceLayout(width: number, moduleCount: number, effectCount: number, inspectorOpen = false) {
  const navigationColumns = width < 550 ? 3 : 5, navigationOffset = Math.ceil(5 / navigationColumns) * 46 - 46;
  const padding = width < 550 ? 18 : 30;
  const innerWidth = Math.max(1, width - padding * 2);
  const dockInset = 12, gap = 8, presetHeight = 44, modeHeight = 36;
  const columns = width < 550 ? 2 : 3;
  const rows = Math.ceil(effectCount / columns);
  const modeColumns = width < 360 ? 3 : 5, modeRows = Math.ceil(5 / modeColumns);
  const presetsTop = 230;
  const modesTop = presetsTop + rows * presetHeight + Math.max(0, rows - 1) * gap + 12;
  const dockHeight = effectCount ? modesTop + modeRows * modeHeight + (modeRows - 1) * gap + dockInset - 188 : 0;
  const contentOffset = effectCount ? dockHeight + 12 : 0;
  // The collection controls are part of the case, not the optional effect dock.
  // Keep their offsets shared with the host so expanded inspection never clips.
  const collectionTop = 296;
  const collectionToolbarHeight = width < 550 ? 70 : 38;
  const inspectorTop = collectionTop + collectionToolbarHeight + 12;
  const inspectorHeight = width < 550 ? 226 : 180;
  const collectionOffset = collectionToolbarHeight + 12 + (inspectorOpen ? inspectorHeight + 12 : 0);
  const cardColumns = width > 700 ? 3 : 2;
  const compactMap = width < 800 || moduleCount > 12;
  const compactMapBottom = 380 + Math.floor(Math.max(0, moduleCount - 1) / 2) * 93 + 34;
  const cardHeight = 148, cardStride = 164;
  const contentHeight = Math.max(885, 387 + moduleCount * 49, 370 + Math.ceil(moduleCount / cardColumns) * cardStride, compactMap ? compactMapBottom + 120 : 885);
  return {
    padding, innerWidth, navigationColumns, navigationOffset, dockTop: 188, dockInset, gap, columns, rows,
    presetHeight, presetWidth: Math.max(1, (innerWidth - dockInset * 2 - gap * (columns - 1)) / columns),
    presetsTop, modesTop, modeHeight, modeColumns, modeWidth: Math.max(1, (innerWidth - dockInset * 2 - gap * (modeColumns - 1)) / modeColumns),
    dockHeight, contentOffset, collectionTop, collectionToolbarHeight, collectionOffset,
    inspectorTop, inspectorHeight, cardHeight, cardStride,
    surfaceHeight: contentHeight + contentOffset + collectionOffset + navigationOffset,
  };
}
