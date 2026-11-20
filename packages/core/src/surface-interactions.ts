import type { InteractionSnapshot, SceneNode } from '@fluidkit/contracts';
import type { SceneViewport } from './layout';

type Patch = Partial<Omit<InteractionSnapshot, 'revision'>>;
const empty: InteractionSnapshot = Object.freeze({ revision: 0, focusedId: null, pressedId: null, hoveredId: null, composingId: null });
export const defaultViewport = Object.freeze({ width: 1000, height: 700 });
const host = Symbol('host');
const canInteract = (node: SceneNode) => !node.disabled && ['button', 'textbox', 'checkbox'].includes(node.anatomy.behavior);

/** Each surface validates its own responsive controls. The aggregate also protects host/AI operations. */
export function createSurfaceInteractions() {
  const lanes = new Map<symbol, { state: InteractionSnapshot; viewport: SceneViewport }>();
  let aggregate = empty;
  function publish() {
    const next = { ...empty, revision: aggregate.revision + 1 };
    for (const { state } of lanes.values()) {
      next.focusedId = state.focusedId ?? next.focusedId;
      next.hoveredId = state.hoveredId ?? next.hoveredId;
      next.pressedId = state.pressedId ?? next.pressedId;
      next.composingId = state.composingId ?? next.composingId;
    }
    aggregate = Object.freeze(next);
  }
  function set(patch: Patch, nodes: readonly SceneNode[], viewport: SceneViewport, owner = host) {
    const previous = lanes.get(owner)?.state ?? empty;
    for (const id of Object.values(patch)) {
      if (id !== null && !nodes.some(node => node.id === id && canInteract(node))) throw new Error('Unknown or disabled interaction target');
    }
    if (Object.entries(patch).every(([key, value]) => previous[key as keyof Patch] === value)) {
      const lane = lanes.get(owner);
      if (lane) lane.viewport = viewport;
      return false;
    }
    lanes.delete(owner);
    lanes.set(owner, { state: Object.freeze({ ...previous, ...patch, revision: previous.revision + 1 }), viewport });
    publish();
    return true;
  }
  return {
    get: (owner?: symbol) => owner === undefined ? aggregate : lanes.get(owner)?.state ?? empty,
    protectedIds: () => [...new Set([...lanes.values()].flatMap(({ state }) => [state.focusedId, state.composingId]).filter((id): id is string => id !== null))],
    set,
    /** Prepare against the candidate before publishing the domain commit. */
    prepare(scene: (viewport: SceneViewport) => readonly SceneNode[], reset: boolean) {
      return [...lanes].map(([owner, { state, viewport }]) => {
        const nodes = scene(viewport);
        const keep = (id: string | null) => !reset && id && nodes.some(node => node.id === id && canInteract(node)) ? id : null;
        return { owner, viewport, nodes, patch: { focusedId: keep(state.focusedId), hoveredId: keep(state.hoveredId), composingId: keep(state.composingId), pressedId: null } };
      });
    },
    release(owner: symbol) { if (!lanes.delete(owner)) return false; publish(); return true; },
    clear() { lanes.clear(); aggregate = empty; },
  };
}
