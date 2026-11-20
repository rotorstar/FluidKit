import type { SceneNode } from '@fluidkit/contracts';

/** Selection and caret must belong to a currently visible, editable target part.
 * Retained source visuals are replay resources, never active input overlays. */
export function isTextSelectionVisible(part: {
  target: SceneNode;
  exiting: boolean;
  presentedOpacity: number;
  textOpacity: number;
}): boolean {
  return !part.exiting && !part.target.disabled && part.target.anatomy.behavior === 'textbox'
    && part.target.opacity > .05 && part.presentedOpacity > .05 && part.textOpacity > .05;
}
