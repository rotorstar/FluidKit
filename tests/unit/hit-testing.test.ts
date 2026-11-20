import { describe, expect, it } from 'vitest';
import { SceneNodeSchema, type SceneNode } from '@fluidkit/contracts';
import { hitTestPresentation, type PresentedHitTarget } from '../../packages/webgpu/src/hit-testing';

function item(id: string, options: Partial<SceneNode> = {}, presentation: Partial<PresentedHitTarget> = {}): PresentedHitTarget {
  const target = SceneNodeSchema.parse({
    id, kind: 'button', anatomy: { componentId: id, part: 'trigger', behavior: 'button' },
    x: 20, y: 20, width: 100, height: 60, radius: 0, text: id, onActivate: `select.${id}`, ...options,
  });
  return { presented: target, target, panelOpacity: target.opacity, textOpacity: target.opacity, renderOrder: 200 + target.layer * 2, exiting: false, ...presentation };
}

function panel(id: string, layer: number, componentId = id, opacity = 1) {
  return item(id, { kind: 'box', anatomy: { componentId, part: 'background', behavior: 'presentation' }, layer, onActivate: undefined, text: '' }, { panelOpacity: opacity });
}

describe('presentation hit testing', () => {
  it('returns the current target authority using sampled geometry', () => {
    const button = item('action');
    const moved = { ...button, presented: { ...button.presented, x: 220, text: 'Older label' } };
    expect(hitTestPresentation([moved], 50, 40)).toBeUndefined();
    expect(hitTestPresentation([moved], 240, 40)).toBe(button.target);
  });

  it('blocks covered controls behind an opaque foreground panel', () => {
    const button = item('action'), cover = panel('modal', 4);
    expect(hitTestPresentation([button, cover], 50, 40)).toBeUndefined();
    expect(hitTestPresentation([cover, button], 50, 40)).toBeUndefined();
    expect(hitTestPresentation([button, panel('underlay', -1)], 50, 40)).toBe(button.target);
  });

  it('lets same-component presentation labels reach their control, but not a different component', () => {
    const button = item('action'), ownLabel = panel('label', 1, 'action');
    expect(hitTestPresentation([button, ownLabel], 50, 40)).toBe(button.target);
    expect(hitTestPresentation([button, ownLabel, panel('overlay', 2)], 50, 40)).toBeUndefined();
  });

  it.each(['disabled', 'exiting'] as const)('a visible %s control never activates or exposes an underlying control', reason => {
    const button = item('action');
    const cover = item('cover', { layer: 2, disabled: reason === 'disabled' }, { exiting: reason === 'exiting', panelOpacity: 0.45 });
    expect(hitTestPresentation([button, cover], 50, 40)).toBeUndefined();
  });

  it('does not click controls whose labels are hidden during motion', () => {
    const button = item('action'), hidden = item('moving', { layer: 2 });
    const moving = { ...hidden, presented: { ...hidden.presented, text: '' }, textOpacity: 0 };
    expect(hitTestPresentation([button, moving], 50, 40)).toBeUndefined();
  });

  it('ignores hidden surfaces and translucent presentation overlays', () => {
    const button = item('action');
    const hidden = item('hidden', { layer: 3, opacity: 0 });
    expect(hitTestPresentation([button, panel('glass', 2, 'glass', 0.4), hidden], 50, 40)).toBe(button.target);
  });

  it('never activates text or actionless decorative nodes, and accepts visual commands/textboxes', () => {
    const text = item('text', { kind: 'text' });
    const inert = item('inert', { onActivate: undefined });
    expect(hitTestPresentation([text], 50, 40)).toBeUndefined();
    expect(hitTestPresentation([inert], 50, 40)).toBeUndefined();
    const visual = item('visual', { onActivate: undefined, onVisual: { type: 'effect.reroll' } });
    const input = item('input', { kind: 'input', anatomy: { componentId: 'input', part: 'field', behavior: 'textbox' }, onActivate: undefined, text: '' });
    expect(hitTestPresentation([visual], 50, 40)).toBe(visual.target);
    expect(hitTestPresentation([input], 50, 40)).toBe(input.target);
  });

  it('uses drawn rotation and rounded corners for hits and occlusion', () => {
    const rotated = item('rotated', { rotation: Math.PI / 2, radius: 10 });
    expect(hitTestPresentation([rotated], 70, 10)).toBe(rotated.target);
    expect(hitTestPresentation([rotated], 25, 50)).toBeUndefined();
    const button = item('action'), round = panel('round', 2);
    const roundCover = { ...round, presented: { ...round.presented, radius: 30 } };
    expect(hitTestPresentation([button, roundCover], 21, 21)).toBe(button.target);
    expect(hitTestPresentation([button, roundCover], 70, 50)).toBeUndefined();
  });

  it('uses last drawn order for equal layers without mutating caller arrays', () => {
    const first = item('first'), last = item('last');
    const items = Object.freeze([first, last]);
    expect(hitTestPresentation(items, 50, 40)).toBe(last.target);
    expect(items).toEqual([first, last]);
    expect(hitTestPresentation(items, Number.NaN, 40)).toBeUndefined();
  });
});
