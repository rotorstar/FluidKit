import { describe, expect, it } from 'vitest';
import { SceneNodeSchema, type SceneNode } from '@fluidkit/contracts';
import { createTransitionClip, sampleTransitionClip } from '@fluidkit/effects';
import { isTextSelectionVisible } from '../../packages/webgpu/src/selection-visibility';

const input = SceneNodeSchema.parse({ id: 'draft', kind: 'input', text: 'Edited value', x: 20, y: 20, width: 200, height: 50,
  anatomy: { componentId: 'form', part: 'field', behavior: 'textbox' } });

function presentedSelection(target: SceneNode[], progress: number) {
  const clip = createTransitionClip({ source: [input], target, plan: null, durationMs: 600, viewport: { width: 600, height: 400 } });
  const frame = sampleTransitionClip(clip, progress), node = frame.nodes.find(part => part.id === input.id)!;
  const state = frame.nodeStates.find(part => part.id === input.id)!;
  return { frame, overlay: { target: target.find(part => part.id === input.id) ?? { ...node, opacity: 0 },
    exiting: !target.some(part => part.id === input.id), presentedOpacity: node.opacity, textOpacity: state.textOpacity } };
}

describe('selection and caret visibility with retained replay visuals', () => {
  it('suppresses a removed input throughout its exit while preserving the source descriptor for replay', () => {
    for (const progress of [0, .25, .5, .75, 1]) {
      const { frame, overlay } = presentedSelection([], progress);
      expect(frame.nodes.some(node => node.id === input.id)).toBe(true);
      expect(isTextSelectionVisible(overlay)).toBe(false);
    }
    expect(presentedSelection([], 0).frame.nodes[0]?.text).toBe(input.text);
    expect(presentedSelection([], 1).frame.nodes[0]?.opacity).toBe(0);
  });
  it('suppresses hidden, disabled or retyped targets despite a still-visible source', () => {
    const targets = [
      { ...input, opacity: 0 }, { ...input, disabled: true },
      { ...input, kind: 'card' as const, anatomy: { ...input.anatomy, behavior: 'presentation' as const } },
    ];
    for (const target of targets) for (const progress of [0, .5, 1]) {
      expect(isTextSelectionVisible(presentedSelection([target], progress).overlay)).toBe(false);
    }
  });
  it('keeps an editable empty field caret and temporarily hides overlays when its drawn text channel is hidden', () => {
    const { overlay } = presentedSelection([{ ...input, text: '' }], 1);
    expect(isTextSelectionVisible(overlay)).toBe(true);
    expect(isTextSelectionVisible({ ...overlay, textOpacity: 0 })).toBe(false);
    expect(isTextSelectionVisible({ ...overlay, presentedOpacity: 0 })).toBe(false);
  });
});
