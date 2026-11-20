import { MOTION_LIMITS, resolveMotionPorts, resolveTextInsetY, type CouplingPresentation, type MorphRelation, type MotionVelocity, type PresentedNodeState, type SceneNode } from '@fluidkit/contracts';
import type { PresentationFrame, TransitionClip } from './presentation';

const clamp = (p: number) => Math.max(0, Math.min(1, p));
const smooth = (p: number) => { const t = clamp(p); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const channels = ['x', 'y', 'width', 'height', 'radius', 'rotation'] as const;
const center = (node: Pick<SceneNode, 'x' | 'y' | 'width' | 'height'>) => ({ x: node.x + node.width / 2, y: node.y + node.height / 2 });
const zeroVelocity = (id: string): MotionVelocity => ({ id, x: 0, y: 0, width: 0, height: 0, radius: 0, rotation: 0 });
const panelAlpha = (node: SceneNode) => node.kind === 'text' ? 0 : node.opacity * (node.panelOpacity ?? 1) * (node.disabled ? .45 : 1);
function bounds(nodes: SceneNode[]): SceneNode {
  const first = nodes[0]!; const x = Math.min(...nodes.map(node => node.x)), y = Math.min(...nodes.map(node => node.y));
  return { ...first, x, y, width: Math.max(...nodes.map(node => node.x + node.width)) - x, height: Math.max(...nodes.map(node => node.y + node.height)) - y };
}
function color(a: string, b: string, p: number) {
  const decode = (value: number) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  const encode = (value: number) => value <= .0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - .055;
  return `#${[1, 3, 5].map(i => Math.round(encode(lerp(decode(parseInt(a.slice(i, i + 2), 16) / 255), decode(parseInt(b.slice(i, i + 2), 16) / 255), clamp(p))) * 255).toString(16).padStart(2, '0')).join('')}`;
}
function state(node: SceneNode, protectedPart: boolean): PresentedNodeState {
  return { id: node.id, protected: protectedPart, panelOpacity: panelAlpha(node), textOpacity: node.opacity,
    shadow: { opacity: 0, offsetX: 0, offsetY: 0, blur: 0 }, shader: { effectId: 0, progress: 1, intensity: 0, frequency: 2.5, seed: 0 } };
}

/** V2 motion changes layout continuously; the immutable V1 sampler remains available for old recordings. */
export function sampleCorrespondenceMotion(clip: TransitionClip, progress: number, options: { reducedMotion?: boolean }, legacy: PresentationFrame): PresentationFrame {
  const p = options.reducedMotion || clip.durationMs <= 0 ? 1 : clamp(Number.isFinite(progress) ? progress : 0);
  const plan = clip.motionPlan;
  if (!plan) throw new Error('Correspondence motion requires a compiled plan');
  const relations = plan.relations;
  const source = new Map(clip.source.map(node => [node.id, node])), target = new Map(clip.target.map(node => [node.id, node]));
  const protectedIds = new Set([...clip.protectedNodeIds, ...(clip.plan?.protectedNodeIds ?? [])]);
  const protectedGroups = new Set([...clip.source, ...clip.target].filter(node => node.onVisual || node.anatomy.behavior === 'textbox' || protectedIds.has(node.id)).map(node => node.anatomy.componentId));
  const protectedPart = (node: SceneNode) => protectedGroups.has(node.anatomy.componentId);
  const checkpoint = clip.sourceCheckpoint, priorStates = new Map(checkpoint?.nodeStates.map(item => [item.id, item]));
  const priorVelocities = new Map(checkpoint?.motion?.velocities.map(item => [item.id, item]));
  if (p === 0) return { nodes: clip.source, nodeStates: clip.source.map(node => priorStates.get(node.id) ?? state(node, protectedPart(node))),
    lens: checkpoint?.lens ?? null, particles: checkpoint?.particles ?? [], progress: 0,
    velocities: clip.source.map(node => priorVelocities.get(node.id) ?? zeroVelocity(node.id)), couplings: checkpoint?.motion?.couplings ?? [] };
  if (p === 1) return { nodes: clip.target, nodeStates: clip.target.map(node => state(node, protectedPart(node))), lens: null, particles: [], progress: 1, velocities: clip.target.map(node => zeroVelocity(node.id)), couplings: [] };
  const seconds = clip.durationMs / 1000;
  const recipe = clip.plan?.selected?.id, intensity = clip.plan?.parameters.intensity ?? 0;
  const rank = new Map(clip.plan?.presentation?.groupOrder.map((id, i) => [id, i]));
  const previous = new Map<string, SceneNode>();
  const byTarget = new Map<string, MorphRelation>();
  for (const relation of relations) for (const id of relation.targets) {
    byTarget.set(id, relation);
    const to = target.get(id)!;
    previous.set(id, relation.sources.length ? relation.kind === 'merge' ? bounds(relation.sources.map(key => source.get(key)!)) : source.get(relation.sources[0]!)! : { ...to, opacity: 0 });
  }
  const movingGroups = new Set(clip.target.filter(to => {
    const from = previous.get(to.id)!;
    return channels.some(key => Math.abs(from[key] - to[key]) > .00001) || from.opacity !== to.opacity;
  }).map(node => node.anatomy.componentId));
  // Language-profile recordings (v5) introduced the faster ink handoff.
  // The historical v4 sampler must still draw the original intermediate frames.
  const localizedHandoff = clip.languageProfile !== undefined;
  const splitSources = new Set(relations.filter(relation => relation.kind === 'split').flatMap(relation => relation.sources));
  const mergeTargets = new Set(relations.filter(relation => relation.kind === 'merge').flatMap(relation => relation.targets));
  for (const relation of relations) if (relation.kind === 'exit') movingGroups.add(source.get(relation.sources[0]!)!.anatomy.componentId);
  function interpolate(from: SceneNode, to: SceneNode, at: number, velocity?: MotionVelocity, route?: MorphRelation['route']): SceneNode {
    let local = at;
    const protectedNode = protectedPart(to);
    const moving = movingGroups.has(to.anatomy.componentId);
    if (recipe === 'silk-cascade' && moving && !protectedNode && !velocity) {
      const delay = (rank.get(to.anatomy.componentId) ?? 0) / Math.max(1, rank.size - 1) * .12;
      local = clamp((at - delay) / (1 - delay));
    }
    const t = smooth(local), h10 = local * (1 - local) ** 2;
    const node = { ...to, sensitive: from.sensitive || to.sensitive, opacity: lerp(from.opacity, to.opacity, t), color: color(from.color, to.color, t), foreground: color(from.foreground, to.foreground, t),
      ...((from.panelOpacity !== undefined || to.panelOpacity !== undefined) ? { panelOpacity: lerp(from.panelOpacity ?? 1, to.panelOpacity ?? 1, t) } : {}),
      fontSize: lerp(from.fontSize, to.fontSize, t), textInset: lerp(from.textInset, to.textInset, t),
      ...((from.textInsetY !== undefined || to.textInsetY !== undefined) ? { textInsetY: lerp(resolveTextInsetY(from, from.height), resolveTextInsetY(to, to.height), t) } : {}) };
    for (const key of channels) {
      const axis = key === 'x' || key === 'width' ? 'x' : key === 'y' || key === 'height' ? 'y' : null;
      const first = route === 'x-then-y' ? 'x' : 'y';
      const phase = route && axis ? smooth(local * 2 - (axis === first ? 0 : 1)) : t;
      node[key] = lerp(from[key], to[key], phase) + h10 * seconds * (velocity?.[key] ?? 0);
    }
    if (moving && !protectedNode) {
      // Squared envelopes have zero initial/final derivative. A captured velocity
      // can therefore continue without the old global source/retirement pause.
      const envelope = Math.sin(Math.PI * local) ** 2;
      if (recipe === 'silk-cascade') node.y -= envelope * intensity * 30;
      if (recipe === 'spring-reflow') {
        const spring = envelope * Math.sin(local * Math.PI * 3) * intensity * .08;
        node.x += (to.x - from.x) * spring; node.y += (to.y - from.y) * spring;
      }
    }
    // Retargeted momentum is bounded by the serialized geometry contract.
    // C1 is qualified only while those safety bounds are inactive.
    node.width = Math.max(.001, Math.min(10000, node.width)); node.height = Math.max(.001, Math.min(10000, node.height)); node.radius = Math.max(0, Math.min(1000, node.radius));
    return node;
  }
  function evaluate(at: number) {
    const nodes = new Map<string, SceneNode>();
    for (const to of clip.target) {
      const from = previous.get(to.id)!;
      const relation = byTarget.get(to.id)!;
      nodes.set(to.id, interpolate(from, to, at, relation.kind === 'match' ? priorVelocities.get(from.id) : undefined, relation.route));
    }
    for (const relation of relations) if (relation.kind === 'exit') {
      const from = source.get(relation.sources[0]!)!;
      if (!nodes.has(from.id)) nodes.set(from.id, interpolate(from, { ...from, opacity: 0 }, at, priorVelocities.get(from.id)));
    }
    const followed = new Set<string>();
    function follow(id: string) {
      if (followed.has(id)) return; followed.add(id);
      const node = nodes.get(id)!, to = target.get(id) ?? source.get(id)!;
      const ownerId = to.motion?.follow;
      if (!ownerId || !nodes.has(ownerId)) return;
      follow(ownerId);
      const owner = nodes.get(ownerId)!, toOwner = target.get(ownerId) ?? source.get(ownerId)!;
      const from = previous.get(id) ?? source.get(id) ?? to;
      // An owner may now be a merge of several old shells. The child's old
      // world position must be relative to THAT owner's source projection,
      // not to its individual old card (which would collapse all titles).
      const fromOwner = previous.get(ownerId) ?? source.get(ownerId) ?? toOwner;
      // Compact content lanes settle before the broad shell finishes moving.
      // This keeps a table metric out of the next card's title/checkbox lane.
      const t = smooth(at / .5);
      const velocity = priorVelocities.get(from.id), ownerRelation = byTarget.get(ownerId);
      const ownerVelocity = ownerRelation?.kind === 'match' ? priorVelocities.get(ownerRelation.sources[0]!) : undefined;
      const h10 = at * (1 - at) ** 2;
      const a = { x: from.x - fromOwner.x, y: from.y - fromOwner.y };
      // An exiting child has no declared target offset. Retain its source-local
      // attachment while it retires, even if its owner now has a new target.
      const b = target.has(id) ? { x: to.x - toOwner.x, y: to.y - toOwner.y } : a;
      node.x = owner.x + lerp(a.x, b.x, t) + h10 * seconds * ((velocity?.x ?? 0) - (ownerVelocity?.x ?? 0));
      node.y = owner.y + lerp(a.y, b.y, t) + h10 * seconds * ((velocity?.y ?? 0) - (ownerVelocity?.y ?? 0));
      const route = ownerRelation?.route;
      const lane = route === 'x-then-y' ? to.motion?.lane : route === 'y-then-x' ? from.motion?.lane : undefined;
      if (route && lane) {
        // At the junction every column already has its own lane. Within a
        // card, metrics travel vertically before crossing the identity label;
        // the reverse path puts the metric to the right before lifting it.
        const x = route === 'x-then-y'
          ? at <= .5 ? lerp(a.x, lane.x, smooth(at * 2)) : lerp(lane.x, b.x, smooth((at - .75) * 4))
          : at <= .5 ? lerp(a.x, lane.x, smooth(at * 4)) : lerp(lane.x, b.x, smooth((at - .5) * 2));
        const y = route === 'x-then-y'
          ? at <= .5 ? lerp(a.y, lane.y, smooth(at * 2)) : lerp(lane.y, b.y, smooth((at - .5) * 4))
          : at <= .5 ? lerp(a.y, lane.y, smooth((at - .25) * 4)) : lerp(lane.y, b.y, smooth((at - .5) * 2));
        node.x = owner.x + x + h10 * seconds * ((velocity?.x ?? 0) - (ownerVelocity?.x ?? 0));
        node.y = owner.y + y + h10 * seconds * ((velocity?.y ?? 0) - (ownerVelocity?.y ?? 0));
      }
    }
    for (const id of nodes.keys()) follow(id);
    // A reused decorative part can carry a different text role (for example a
    // card's dependency sentence becomes a numeric table cell). While the old
    // words are visible, retain their old local content rectangle. Move that
    // rectangle only during the disjoint, invisible handoff window.
    const contentHold = 1 - smooth((at - .2) / .6);
    if (contentHold > 0) for (const node of nodes.values()) {
      const to = target.get(node.id), from = source.get(node.id);
      if (!to || !from?.text || node.anatomy.behavior !== 'presentation' || (from.text === to.text && to.motion?.label !== 'crossfade')) continue;
      // On split the old label still belongs to the comparison panel,
      // while the new card is already moving. Keep its original text lane
      // until the old label fades rather than passing through adjacent rows.
      const sourceOwner = from.motion?.follow;
      const holdsSplitLabel = localizedHandoff && sourceOwner !== undefined && splitSources.has(sourceOwner) && sourceOwner !== to.motion?.follow;
      const ownerId = holdsSplitLabel ? sourceOwner : to.motion?.follow;
      const owner = ownerId ? nodes.get(ownerId) : undefined;
      const fromOwner = ownerId ? previous.get(ownerId) ?? source.get(ownerId) : undefined;
      const ownerRelation = ownerId ? byTarget.get(ownerId) : undefined;
      const ownerVelocity = ownerRelation?.kind === 'match' ? priorVelocities.get(ownerRelation.sources[0]!) : undefined;
      const velocity = priorVelocities.get(from.id), h10 = at * (1 - at) ** 2;
      const x = (owner && fromOwner ? owner.x + from.x - fromOwner.x : from.x) + h10 * seconds * ((velocity?.x ?? 0) - (ownerVelocity?.x ?? 0));
      const y = (owner && fromOwner ? owner.y + from.y - fromOwner.y : from.y) + h10 * seconds * ((velocity?.y ?? 0) - (ownerVelocity?.y ?? 0));
      node.x = lerp(node.x, x, contentHold); node.y = lerp(node.y, y, contentHold);
      node.width = Math.max(.001, Math.min(10000, lerp(node.width, from.width + h10 * seconds * (velocity?.width ?? 0), contentHold)));
      node.height = Math.max(.001, Math.min(10000, lerp(node.height, from.height + h10 * seconds * (velocity?.height ?? 0), contentHold)));
      node.fontSize = lerp(node.fontSize, from.fontSize, contentHold); node.textInset = lerp(node.textInset, from.textInset, contentHold);
      if (from.textInsetY !== undefined || node.textInsetY !== undefined) node.textInsetY = lerp(resolveTextInsetY(node, node.height), resolveTextInsetY(from, from.height), contentHold);
      if (at < .2) node.textLines = from.textLines;
    }
    // Consumed shells no longer own outgoing labels/edges. Their last resolved
    // geometry may fade out, but a checkpoint must never retain dangling scene
    // references. Target references were validated before this presentation.
    for (const node of nodes.values()) if (node.motion) {
      const follow = node.motion.follow;
      const connector = node.motion.connector;
      if ((follow && !nodes.has(follow)) || (connector && (!nodes.has(connector.from.nodeId) || !nodes.has(connector.to.nodeId)))) {
        node.motion = { ...node.motion,
          ...(follow && !nodes.has(follow) ? { follow: undefined } : {}),
          ...(connector && (!nodes.has(connector.from.nodeId) || !nodes.has(connector.to.nodeId)) ? { connector: undefined } : {}),
        };
      }
    }
    return new Map(resolveMotionPorts([...nodes.values()]).map(node => [node.id, node]));
  }
  const current = evaluate(p), delta = .00001, low = evaluate(Math.max(0, p - delta)), high = evaluate(Math.min(1, p + delta));
  const velocityTime = (Math.min(1, p + delta) - Math.max(0, p - delta)) * seconds;
  const velocities = [...current.values()].map(node => {
    const result = zeroVelocity(node.id);
    for (const key of channels) result[key] = Math.max(-100000, Math.min(100000, (high.get(node.id)![key] - low.get(node.id)![key]) / velocityTime));
    return result;
  });
  const legacyStates = new Map(legacy.nodeStates.map(item => [item.id, item]));
  const retirement = checkpoint ? 1 - smooth(p * clip.durationMs / Math.min(120, clip.durationMs * .2)) : 0;
  const nodeStates = [...current.values()].map(node => {
    const from = previous.get(node.id) ?? source.get(node.id)!, to = target.get(node.id);
    const labelSource = source.get(node.id) ?? from;
    const incoming = byTarget.get(node.id)?.kind === 'enter';
    const sameLabel = Boolean(to && !incoming && labelSource.text === to.text && to.motion?.label !== 'crossfade');
    let textOpacity = node.opacity;
    if (!sameLabel && to) {
      // Semantic replacements hand off their text roles after outgoing content
      // has retired. Stable identity/label pairs remain visible throughout.
      const useSource = p < .8 && !incoming;
      const label = useSource ? labelSource : to;
      node.text = label.text; node.foreground = label.foreground;
      textOpacity *= useSource ? 1 - smooth(p / .2) : smooth((p - .8) / .2);
    }
    // A context label and the member labels may occupy the same text lane.
    // Their handoff must be disjoint; a crossfade would superimpose two words.
    // A multipart merge/split moves several neighboring shells into common
    // lanes. Retire departing annotations before a retained title enters them.
    const departure = localizedHandoff && (splitSources.size || mergeTargets.size) ? .08 : .2;
    if (!to) textOpacity = from.motion?.label === 'context' && from.motion.follow && splitSources.has(from.motion.follow) ? from.opacity * (1 - smooth((p - .7) / .1)) : textOpacity * (1 - smooth(p / departure));
    if (incoming && to?.motion?.label === 'context' && to.motion.follow && mergeTargets.has(to.motion.follow)) textOpacity = to.opacity * smooth((p - .2) / .1);
    const value = { ...state(node, protectedPart(node)), textOpacity };
    const old = legacyStates.get(node.id);
    if (old && !value.protected) { value.shader = { ...old.shader }; value.shadow = { ...old.shadow }; }
    if (recipe === 'particle-weave' && !value.protected) value.panelOpacity *= 1 - Math.sin(Math.PI * p) ** 2 * intensity * .8;
    if (node.anatomy.behavior === 'checkbox' && !value.protected && movingGroups.has(node.anatomy.componentId)) {
      const visible = p < .5 ? 1 - smooth(p / (localizedHandoff ? .08 : .15)) : smooth((p - .85) / .15);
      value.panelOpacity *= visible; value.textOpacity *= visible;
    }
    const before = priorStates.get(labelSource.id);
    if (before && retirement > 0) { value.textOpacity = lerp(value.textOpacity, before.textOpacity, retirement); value.panelOpacity = lerp(value.panelOpacity, before.panelOpacity, retirement); }
    return value;
  });
  const states = new Map(nodeStates.map(item => [item.id, item]));
  const couplings: CouplingPresentation[] = [];
  for (const relation of relations) if (relation.kind === 'split' || relation.kind === 'merge') {
    const a = relation.sources.map(id => source.get(id)!), b = relation.targets.map(id => target.get(id)!);
    // Base shell correspondence remains continuous even when a sharp child has
    // focus. Only the child's optional recipe distortion is suppressed above.
    const pieces = relation.kind === 'split' ? b.map(to => interpolate(a[0]!, to, p)) : a.map(from => ({ ...interpolate(from, b[0]!, p), id: from.id }));
    const root = pieces[0]!;
    const bridges = pieces.slice(1).map(piece => ({ from: center(root), to: center(piece), radius: Math.sin(Math.PI * p) ** 2 * Math.min(root.width, root.height, piece.width, piece.height) * .22, color: color(root.color, piece.color, .5), opacity: (panelAlpha(root) + panelAlpha(piece)) / 2 }));
    for (const id of relation.targets) { const item = states.get(id); if (item) item.panelOpacity = 0; }
    const prior = checkpoint?.motion?.couplings.find(item => item.id === relation.id);
    const coupling: CouplingPresentation = { id: relation.id, kind: relation.kind, sourceIds: relation.sources, targetIds: relation.targets, progress: p, opacity: prior || !checkpoint?.motion?.couplings.length ? 1 : 1 - retirement,
      color: color(a[0]!.color, b[0]!.color, smooth(p)), layer: b[0]!.layer, pieces: pieces.map(node => ({ id: node.id, x: node.x, y: node.y, width: node.width, height: node.height, radius: node.radius, color: node.color, opacity: panelAlpha(node) })), bridges };
    if (prior && retirement > 0) {
      coupling.opacity = lerp(coupling.opacity, prior.opacity, retirement);
      coupling.color = color(coupling.color, prior.color, retirement);
      coupling.pieces = coupling.pieces.map((piece, i) => { const old = prior.pieces.find(item => item.id === piece.id) ?? prior.pieces[i]; return old ? { ...piece, x: lerp(piece.x, old.x, retirement), y: lerp(piece.y, old.y, retirement), width: lerp(piece.width, old.width, retirement), height: lerp(piece.height, old.height, retirement), radius: lerp(piece.radius, old.radius, retirement), color: color(piece.color ?? coupling.color, old.color ?? prior.color, retirement), opacity: lerp(piece.opacity ?? 1, old.opacity ?? 1, retirement) } : piece; });
      coupling.bridges = coupling.bridges.map((bridge, i) => { const old = prior.bridges[i]; return old ? { from: { x: lerp(bridge.from.x, old.from.x, retirement), y: lerp(bridge.from.y, old.from.y, retirement) }, to: { x: lerp(bridge.to.x, old.to.x, retirement), y: lerp(bridge.to.y, old.to.y, retirement) }, radius: lerp(bridge.radius, old.radius, retirement), color: color(bridge.color ?? coupling.color, old.color ?? prior.color, retirement), opacity: lerp(bridge.opacity ?? 1, old.opacity ?? 1, retirement) } : bridge; });
    }
    couplings.push(coupling);
  }
  if (retirement > 0) for (const old of checkpoint?.motion?.couplings ?? []) if (!couplings.some(item => item.id === old.id)) couplings.push({ ...old, opacity: old.opacity * retirement });
  if (couplings.length > MOTION_LIMITS.couplingGroups) throw new Error('Retargeted coupling group budget exceeded');
  let lens = legacy.lens;
  if (lens && !retirement && clip.plan?.presentation) {
    const anchor = clip.plan.presentation.anchor;
    const representative = clip.source.find(node => Math.hypot(center(node).x - anchor.x, center(node).y - anchor.y) < .001);
    const moved = representative && current.get(representative.id);
    if (moved) lens = { ...lens, ...center(moved) };
  }
  return { nodes: [...current.values()], nodeStates, progress: p, lens, particles: legacy.particles, velocities, couplings };
}
