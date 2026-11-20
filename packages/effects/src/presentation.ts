import { z } from 'zod';
import {
  SceneNodeSchema, ResolvedEffectPlanSchema, SourcePresentationCheckpointSchema,
  PresentedNodeStateSchema, LensPresentationSchema, ParticlePresentationSchema,
  VisualScenarioSchema, VisualScenarioV3Schema, VisualScenarioV4Schema, VisualScenarioV5Schema, RecordingLanguageProfileSchema,
  MOTION_LIMITS, MotionPlanSchema, MotionVelocitySchema, CouplingPresentationSchema,
  type SceneNode, type PresentedNodeState, type LensPresentation, type ParticlePresentation,
  type SourcePresentationCheckpoint, type ResolvedEffectPlan,
} from '@fluidkit/contracts';
import { compileMotionPlan, validateMotionPlan } from './motion-plan';
import { sampleCorrespondenceMotion } from './motion-sampler';

const Viewport = z.strictObject({ width: z.number().positive().max(10000), height: z.number().positive().max(10000) });
export const TransitionClipSchema = z.strictObject({
  source: z.array(SceneNodeSchema).max(MOTION_LIMITS.presentedNodes), target: z.array(SceneNodeSchema).max(MOTION_LIMITS.sceneNodes),
  plan: ResolvedEffectPlanSchema.nullable(), durationMs: z.number().min(0).max(10000), viewport: Viewport,
  sourceCheckpoint: SourcePresentationCheckpointSchema.nullable().default(null),
  protectedNodeIds: z.array(z.string()).default([]),
  languageProfile: RecordingLanguageProfileSchema.optional(),
  motionVersion: z.union([z.literal(1), z.literal(2)]).default(1), motionPlan: MotionPlanSchema.optional(),
});
export type TransitionClip = z.infer<typeof TransitionClipSchema>;
export const PresentationFrameSchema = z.strictObject({
  nodes: z.array(SceneNodeSchema).max(20000), nodeStates: z.array(PresentedNodeStateSchema).max(20000),
  lens: LensPresentationSchema.nullable(), particles: z.array(ParticlePresentationSchema).max(2048),
  progress: z.number().min(0).max(1),
  velocities: z.array(MotionVelocitySchema).max(MOTION_LIMITS.presentedNodes).optional(),
  couplings: z.array(CouplingPresentationSchema).max(MOTION_LIMITS.couplingGroups).optional(),
});
export type PresentationFrame = z.infer<typeof PresentationFrameSchema>;
const NEW_EFFECTS = new Set(['silk-cascade', 'liquid-lens', 'particle-weave']);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function immutable<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) immutable(child);
  }
  return value;
}
function hash(seed: number, text: string) {
  let value = seed >>> 0;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return value;
}
function changed(a: SceneNode, b: SceneNode) {
  return ['x', 'y', 'width', 'height'].some(key => Math.abs(Number(a[key as keyof SceneNode]) - Number(b[key as keyof SceneNode])) > 0.5);
}
function groups(nodes: readonly SceneNode[]) {
  const result = new Map<string, { nodeId: string; x: number; y: number; width: number; height: number; color: string }>();
  for (const node of nodes) {
    if (node.opacity <= 0 || node.kind === 'text') continue;
    const previous = result.get(node.anatomy.componentId);
    if (!previous || node.width * node.height > previous.width * previous.height) result.set(node.anatomy.componentId, { nodeId: node.id, x: node.x + node.width / 2, y: node.y + node.height / 2, width: node.width, height: node.height, color: node.color });
  }
  return result;
}
/** Resolves geometry-dependent quality once. Existing recording decisions win. */
export function createTransitionClip(input: z.input<typeof TransitionClipSchema>): TransitionClip {
  const clip = TransitionClipSchema.parse(input);
  for (const list of [clip.source, clip.target]) if (new Set(list.map(node => node.id)).size !== list.length) throw new Error('Duplicate clip node');
  if (new Set([...clip.source, ...clip.target].map(node => node.id)).size > MOTION_LIMITS.presentedNodes) throw new Error('Presentation union budget exceeded');
  if (clip.motionVersion === 2) clip.motionPlan = clip.motionPlan ? validateMotionPlan(clip.motionPlan, clip.source, clip.target) : compileMotionPlan(clip.source, clip.target, clip.plan?.sourceState);
  else if (clip.motionPlan) throw new Error('Legacy sampler cannot execute a new motion plan');
  if (clip.sourceCheckpoint) {
    const source = new Map(clip.source.map(node => [node.id, node]));
    const checkpoint = clip.sourceCheckpoint;
    if (checkpoint.nodeStates.some(state => !source.has(state.id))) throw new Error('Checkpoint refers to an unknown source node');
    if (checkpoint.motion?.velocities.some(value => !source.has(value.id))) throw new Error('Motion checkpoint refers to an unknown source node');
    const residual = Boolean(checkpoint.motion?.couplings.length || checkpoint.motion?.velocities.some(value => ['x', 'y', 'width', 'height', 'radius', 'rotation'].some(key => value[key as keyof typeof value] !== 0 && key !== 'id'))) || checkpoint.lens !== null || checkpoint.particles.length > 0 || checkpoint.nodeStates.some(state => {
      const node = source.get(state.id)!;
      return state.shadow.opacity > 0 || (state.shader.effectId !== 0 && state.shader.intensity > 0 && state.shader.progress > 0 && state.shader.progress < 1)
        || state.textOpacity !== node.opacity || state.panelOpacity !== (node.kind === 'text' ? 0 : node.opacity * (node.panelOpacity ?? 1) * (node.disabled ? 0.45 : 1));
    });
    if (!residual) clip.sourceCheckpoint = null;
  }
  if (clip.motionVersion === 2) {
    const groupIds = new Set(clip.motionPlan!.relations.filter(relation => relation.kind === 'split' || relation.kind === 'merge').map(relation => relation.id));
    for (const coupling of clip.sourceCheckpoint?.motion?.couplings ?? []) if (coupling.opacity > 0) groupIds.add(coupling.id);
    if (groupIds.size > MOTION_LIMITS.couplingGroups) throw new Error('Retargeted coupling group budget exceeded before rendering');
  }
  const retainedStandard = (clip.sourceCheckpoint?.particles.length ?? 0) > 512;
  if (clip.plan && (NEW_EFFECTS.has(clip.plan.selected?.id ?? '') || retainedStandard) && !clip.plan.presentation) {
    const eventType = clip.plan.eventType;
    const source = groups(clip.source), target = groups(clip.target);
    const combined = new Map([...source, ...target]);
    const trigger = clip.source.find(node => node.onActivate === eventType && !node.onVisual && !eventType.startsWith('view.') && !['workspace', 'navigation', 'toolbar'].includes(node.anatomy.componentId));
    const selected = [...clip.source, ...clip.target].find(node => node.kind === 'card' && node.pressed);
    const leadGroup = trigger?.anatomy.componentId ?? selected?.anatomy.componentId;
    const groupOrder = [...combined.keys()].sort((a, b) => {
      if (a === leadGroup) return -1;
      if (b === leadGroup) return 1;
      const left = source.get(a) ?? target.get(a)!; const right = source.get(b) ?? target.get(b)!;
      return left.y - right.y || left.x - right.x || (a < b ? -1 : a > b ? 1 : 0);
    });
    const moving = groupOrder.filter(id => {
      const a = source.get(id), b = target.get(id);
      return !a || !b || Math.hypot(a.x - b.x, a.y - b.y) > 1;
    });
    const anchors = (moving.length ? moving : groupOrder).map(id => source.get(id) ?? target.get(id)!);
    const quality = !retainedStandard && clip.viewport.width < 768 ? 'compact' : 'standard';
    clip.plan = ResolvedEffectPlanSchema.parse({ ...clip.plan, schemaVersion: 2, presentation: {
      quality, groupOrder,
      anchor: leadGroup && combined.has(leadGroup) ? { x: (source.get(leadGroup) ?? combined.get(leadGroup)!).x, y: (source.get(leadGroup) ?? combined.get(leadGroup)!).y }
        : anchors.length ? { x: anchors.reduce((sum, item) => sum + item.x, 0) / anchors.length, y: anchors.reduce((sum, item) => sum + item.y, 0) / anchors.length } : { x: clip.viewport.width / 2, y: clip.viewport.height / 2 },
      particleBudget: quality === 'compact' ? 512 : 2048, targetEdge: quality === 'compact' ? 1024 : 2048,
    } });
  }
  if (retainedStandard && clip.plan?.presentation?.quality === 'compact') {
    clip.plan = ResolvedEffectPlanSchema.parse({ ...clip.plan, schemaVersion: 2, presentation: { ...clip.plan.presentation, quality: 'standard', particleBudget: 2048, targetEdge: 2048 } });
  }
  return immutable(clip);
}

/** A carried standard-profile checkpoint keeps its budget for the entire clip. */
export function getTransitionQuality(clip: TransitionClip): Pick<NonNullable<ResolvedEffectPlan['presentation']>, 'quality' | 'particleBudget' | 'targetEdge'> {
  const recorded = clip.plan?.presentation;
  if (recorded) return { quality: recorded.quality, particleBudget: recorded.particleBudget, targetEdge: recorded.targetEdge };
  const standard = clip.viewport.width >= 768 || (clip.sourceCheckpoint?.particles.length ?? 0) > 512;
  return { quality: standard ? 'standard' : 'compact', particleBudget: standard ? 2048 : 512, targetEdge: standard ? 2048 : 1024 };
}

function mixColor(a: string, b: string, t: number) {
  // Three interpolates linear-sRGB material colors. Return sRGB scene values.
  const decode = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const encode = (value: number) => value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
  return `#${[1, 3, 5].map(index => Math.round(encode(lerp(decode(parseInt(a.slice(index, index + 2), 16) / 255), decode(parseInt(b.slice(index, index + 2), 16) / 255), clamp(t))) * 255).toString(16).padStart(2, '0')).join('')}`;
}
function zeroState(id: string, protectedPart: boolean, opacity: number, textOpacity: number): PresentedNodeState {
  return { id, protected: protectedPart, panelOpacity: opacity, textOpacity, shadow: { opacity: 0, offsetX: 0, offsetY: 0, blur: 0 }, shader: { effectId: 0, progress: 1, intensity: 0, frequency: 2.5, seed: 0 } };
}

/** Stateless sampling: seek order, frame rate and previous renderer state are irrelevant. */
export function sampleTransitionClip(clip: TransitionClip, progress: number, options: { reducedMotion?: boolean } = {}): PresentationFrame {
  const legacy = sampleLegacyTransitionClip(clip, progress, options);
  return clip.motionVersion === 2 ? immutable(sampleCorrespondenceMotion(clip, progress, options, legacy)) : legacy;
}

function sampleLegacyTransitionClip(clip: TransitionClip, progress: number, options: { reducedMotion?: boolean } = {}): PresentationFrame {
  const p = options.reducedMotion || clip.durationMs <= 0 ? 1 : clamp(Number.isFinite(progress) ? progress : 0);
  const plan = clip.plan, recipe = plan?.selected?.id ?? '', parameters = plan?.parameters ?? { intensity: 0, frequency: 2.5, durationMs: clip.durationMs };
  const source = new Map(clip.source.map(node => [node.id, node])), target = new Map(clip.target.map(node => [node.id, node]));
  const ids = [...new Set([...source.keys(), ...target.keys()])];
  const movingGroups = new Set(ids.filter(id => !source.has(id) || !target.has(id) || changed(source.get(id)!, target.get(id)!)).map(id => (target.get(id) ?? source.get(id)!).anatomy.componentId));
  const protectedIds = new Set([...clip.protectedNodeIds, ...(plan?.protectedNodeIds ?? [])]);
  const protectedGroups = new Set([...clip.source, ...clip.target].filter(node => node.onVisual || node.anatomy.behavior === 'textbox' || protectedIds.has(node.id)).map(node => node.anatomy.componentId));
  const checkpoint = clip.sourceCheckpoint;
  const bridgeDuration = checkpoint ? Math.min(120, clip.durationMs * 0.2) : 0;
  const bridgeFraction = clip.durationMs > 0 ? bridgeDuration / clip.durationMs : 0;
  const retirement = bridgeFraction > 0 ? 1 - smooth(p / bridgeFraction) : 0;
  const newProgress = bridgeFraction > 0 ? clamp((p - bridgeFraction) / (1 - bridgeFraction)) : p;
  // A residual bridge changes presentation only. The domain target was committed already.
  const geometry = clamp((newProgress - 0.15) / 0.65), baseT = ease(geometry);
  const nodeStates: PresentedNodeState[] = [], nodes: SceneNode[] = [];
  const priorStates = new Map(checkpoint?.nodeStates.map(state => [state.id, state]) ?? []);
  const order = plan?.presentation?.groupOrder ?? [];
  const groupRanks = new Map(order.map((id, index) => [id, index]));
  for (const id of ids) {
    const actualSource = source.get(id), actualTarget = target.get(id);
    const from = actualSource ?? { ...actualTarget!, opacity: 0 };
    const to = actualTarget ?? { ...actualSource!, opacity: 0 };
    const protectedPart = protectedGroups.has(to.anatomy.componentId) || protectedIds.has(id);
    // An explicitly removed control must retire its source label even if it
    // had focus. Protection keeps extra distortion off, not obsolete text alive.
    const movement = !actualTarget || (!protectedPart && (!actualSource || from.opacity === 0 || changed(from, to) || (recipe === 'silk-cascade' && movingGroups.has(to.anatomy.componentId))));
    let t = baseT, arc = 0, shadow = 0;
    if (recipe === 'spring-reflow' && geometry < 1) t = 1 - Math.exp(-7 * geometry) * Math.cos(geometry * 10) * parameters.intensity - (1 - parameters.intensity) * (1 - baseT);
    if (recipe === 'silk-cascade' && !protectedPart && movement) {
      const rank = groupRanks.get(to.anatomy.componentId) ?? 0;
      const stagger = Math.min(0.28, 0.04 + parameters.frequency * 0.035);
      const delay = order.length > 1 ? rank / (order.length - 1) * stagger : 0;
      const local = clamp((geometry - delay) / (1 - stagger));
      t = ease(local);
      arc = -Math.sin(Math.PI * local) * parameters.intensity * 30;
      shadow = Math.sin(Math.PI * local) * parameters.intensity;
    }
    if (p === 0) t = 0;
    if (p === 1) t = 1;
    const opacity = clamp(lerp(from.opacity, to.opacity, t));
    const sourceLabel = movement && newProgress < 0.15;
    const label = sourceLabel ? from : to;
    const hidden = movement && newProgress >= 0.15 && newProgress <= 0.8;
    const textOpacity = movement ? sourceLabel ? from.opacity * clamp(1 - newProgress / 0.15) : to.opacity * clamp((newProgress - 0.8) / 0.2) : opacity;
    const node: SceneNode = { ...to, text: hidden ? '' : label.text, foreground: label.foreground, fontSize: label.fontSize, textInset: label.textInset, textInsetY: label.textInsetY, textLines: label.textLines,
      // Target metadata cannot declassify outgoing content or an interrupted
      // source. Only the exact completed target endpoint may clear sensitivity.
      sensitive: from.sensitive || to.sensitive,
      x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) + arc,
      width: Math.max(1, lerp(from.width, to.width, t)), height: Math.max(1, lerp(from.height, to.height, t)),
      radius: Math.max(0, lerp(from.radius, to.radius, t)), rotation: lerp(from.rotation, to.rotation, t), opacity,
      color: mixColor(from.color, to.color, t),
    };
    const state = zeroState(id, protectedPart, to.kind === 'text' ? 0 : opacity * (to.panelOpacity ?? 1) * (to.disabled ? 0.45 : 1), textOpacity);
    if (!protectedPart) {
      state.shader = { effectId: recipe === 'fluid-morph' ? 1 : recipe === 'ripple-reveal' ? 3 : 0, progress: newProgress, intensity: parameters.intensity, frequency: parameters.frequency, seed: ((plan?.seed ?? 0) % 1000) / 100 };
      if (recipe === 'silk-cascade' && to.kind !== 'text') state.shadow = { opacity: shadow * 0.2, offsetX: 0, offsetY: shadow * 7, blur: shadow * 14 };
      if (recipe === 'particle-weave') state.panelOpacity *= 1 - Math.sin(Math.PI * newProgress) ** 2 * parameters.intensity * 0.8;
    }
    const prior = priorStates.get(id);
    if (prior && retirement > 0) {
      state.shader = { ...prior.shader, intensity: prior.shader.intensity * retirement };
      state.shadow = { ...prior.shadow, opacity: prior.shadow.opacity * retirement };
      state.panelOpacity = lerp(state.panelOpacity, prior.panelOpacity, retirement);
      state.textOpacity = lerp(state.textOpacity, prior.textOpacity, retirement);
    }
    // Endpoints retain exact node values, including strings and original color rounding.
    if (p === 0 && actualSource) Object.assign(node, actualSource);
    if (p === 1 && actualTarget) { Object.assign(node, actualTarget); state.textOpacity = actualTarget.opacity; state.panelOpacity = actualTarget.kind === 'text' ? 0 : actualTarget.opacity * (actualTarget.panelOpacity ?? 1) * (actualTarget.disabled ? 0.45 : 1); state.shader.intensity = 0; state.shadow.opacity = 0; }
    nodes.push(node); nodeStates.push(state);
  }
  let lens: LensPresentation | null = null;
  let particles: ParticlePresentation[] = [];
  if (retirement > 0 && checkpoint) {
    lens = checkpoint.lens ? { ...checkpoint.lens, strength: checkpoint.lens.strength * retirement, opacity: checkpoint.lens.opacity * retirement } : null;
    const seconds = p * clip.durationMs / 1000;
    particles = checkpoint.particles.map(item => ({ ...item, x: item.x + item.velocityX * seconds * retirement, y: item.y + item.velocityY * seconds * retirement, opacity: item.opacity * retirement, velocityX: item.velocityX * retirement, velocityY: item.velocityY * retirement }));
  } else if (newProgress > 0 && newProgress < 1 && recipe === 'liquid-lens') {
    const anchor = plan?.presentation?.anchor ?? { x: clip.viewport.width / 2, y: clip.viewport.height / 2 };
    const envelope = Math.sin(Math.PI * newProgress) ** 2;
    const sourceGroups = groups(clip.source), targetGroups = groups(clip.target);
    const anchoredGroup = [...sourceGroups.entries()].find(([, group]) => Math.hypot(group.x - anchor.x, group.y - anchor.y) < 0.001);
    let center = anchor;
    if (anchoredGroup) {
      // Follow the stable component that caused the transition. Prefer its
      // target root over a fading table-row wrapper, avoiding a discontinuous
      // switch when the largest visible rectangle changes during expansion.
      const representativeId = targetGroups.get(anchoredGroup[0])?.nodeId ?? anchoredGroup[1].nodeId;
      const current = nodes.find(node => node.id === representativeId);
      const origin = source.get(representativeId);
      if (current) {
        const residual = 1 - smooth(newProgress);
        center = { x: current.x + current.width / 2 + (origin ? anchor.x - origin.x - origin.width / 2 : 0) * residual,
          y: current.y + current.height / 2 + (origin ? anchor.y - origin.y - origin.height / 2 : 0) * residual };
      }
    }
    // Unattached averaged anchors stay fixed; no arbitrary viewport-wide sweep.
    const baseRadius = Math.min(clip.viewport.width, clip.viewport.height) * (0.12 + parameters.frequency * 0.022);
    lens = { x: center.x, y: center.y,
      radius: baseRadius * (0.35 + 1.65 * smooth(newProgress)), strength: parameters.intensity * envelope, phase: newProgress, opacity: envelope };
  } else if (newProgress > 0 && newProgress < 1 && recipe === 'particle-weave') {
    const sourceGroups = groups(clip.source), targetGroups = groups(clip.target);
    const eligible = order.filter(id => movingGroups.has(id) && sourceGroups.has(id) && targetGroups.has(id) && !protectedGroups.has(id));
    const budget = getTransitionQuality(clip).particleBudget;
    const perGroup = Math.max(0, Math.min(Math.floor(budget / Math.max(1, eligible.length)), Math.round(20 + parameters.frequency * 16)));
    const phase = smooth(newProgress), envelope = Math.sin(Math.PI * newProgress) ** 2;
    for (const componentId of eligible) for (let i = 0; i < perGroup; i++) {
      const a = sourceGroups.get(componentId)!, b = targetGroups.get(componentId)!;
      const seed = hash(plan?.seed ?? 0, `${componentId}:${i}`), fraction = seed / 4294967295;
      const u = ((seed >>> 8) % 1000) / 1000 - 0.5, v = ((seed >>> 18) % 1000) / 1000 - 0.5;
      const ax = a.x + u * a.width, ay = a.y + v * a.height, bx = b.x + u * b.width, by = b.y + v * b.height;
      const bend = (fraction - 0.5) * 90 * parameters.intensity;
      const theta = Math.PI * newProgress;
      const x = lerp(ax, bx, phase) + Math.sin(theta) * bend;
      const y = lerp(ay, by, phase) + Math.sin(theta * 2 + fraction * Math.PI) * envelope * 20 * parameters.intensity;
      const seconds = Math.max(0.001, clip.durationMs * (1 - bridgeFraction) / 1000);
      const phaseVelocity = 6 * newProgress * (1 - newProgress);
      particles.push({ id: `particle-${groupRanks.get(componentId) ?? 0}-${i}`, componentId, x, y,
        velocityX: Math.max(-100000, Math.min(100000, ((bx - ax) * phaseVelocity + Math.cos(theta) * Math.PI * bend) / seconds)),
        velocityY: Math.max(-100000, Math.min(100000, ((by - ay) * phaseVelocity + 20 * parameters.intensity * (Math.cos(theta * 2 + fraction * Math.PI) * 2 * Math.PI * envelope + Math.sin(theta * 2 + fraction * Math.PI) * Math.sin(theta * 2) * Math.PI)) / seconds)),
        size: 1.5 + fraction * 2.5, rotation: theta * (fraction - 0.5), color: mixColor(a.color, b.color, phase), opacity: envelope * (0.35 + fraction * 0.45) * parameters.intensity });
    }
  }
  return immutable({ nodes, nodeStates, lens, particles, progress: p });
}

export function capturePresentationCheckpoint(frame: PresentationFrame): SourcePresentationCheckpoint {
  return immutable(SourcePresentationCheckpointSchema.parse({ schemaVersion: 1, nodeStates: frame.nodeStates, lens: frame.lens, particles: frame.particles,
    ...(frame.velocities ? { motion: { schemaVersion: 1, velocities: frame.velocities, couplings: frame.couplings ?? [] } } : {}) }));
}

/** Keep only presentation that can contribute pixels to the next source frame.
 * This does not change the immutable old clip or its backward-seek membership. */
export function captureTransitionSource(frame: PresentationFrame): Pick<TransitionClip, 'source' | 'sourceCheckpoint'> {
  const states = new Map(frame.nodeStates.map(state => [state.id, state]));
  const particleGroups = new Set(frame.particles.filter(particle => particle.opacity > 0).map(particle => particle.componentId));
  const retained = new Set(frame.nodes.filter(node => {
    const state = states.get(node.id);
    return node.opacity > 0 || (state?.panelOpacity ?? 0) > 0 || (state?.textOpacity ?? 0) > 0 || (state?.shadow.opacity ?? 0) > 0 || particleGroups.has(node.anatomy.componentId);
  }).map(node => node.id));
  const byId = new Map(frame.nodes.map(node => [node.id, node]));
  // Invisible owners/ports can still define the position of a visible child.
  // Prune only unreachable nodes, never the referential context of live ink.
  for (const id of retained) {
    const node = byId.get(id)!;
    const references = [node.motion?.follow, node.motion?.connector?.from.nodeId, node.motion?.connector?.to.nodeId].filter((value): value is string => Boolean(value));
    for (const reference of references) {
      if (!byId.has(reference)) throw new Error('Captured motion reference is missing');
      retained.add(reference);
    }
  }
  const source = frame.nodes.filter(node => retained.has(node.id));
  const sourceCheckpoint = capturePresentationCheckpoint({ ...frame, nodes: source, nodeStates: frame.nodeStates.filter(state => retained.has(state.id)),
    ...(frame.velocities ? { velocities: frame.velocities.filter(value => retained.has(value.id)) } : {}) });
  return immutable({ source, sourceCheckpoint });
}

/** Backward-compatible import; validation runs before creating render resources. */
export function normalizeVisualScenario(input: unknown): z.infer<typeof VisualScenarioV3Schema> | z.infer<typeof VisualScenarioV4Schema> | z.infer<typeof VisualScenarioV5Schema> {
  const scenario = VisualScenarioSchema.parse(input);
  if (scenario.schemaVersion === 5) {
    if (scenario.motionVersion === 2) validateMotionPlan(scenario.motionPlan, scenario.source, scenario.target);
    return scenario;
  }
  if (scenario.schemaVersion === 4) { validateMotionPlan(scenario.motionPlan, scenario.source, scenario.target); return VisualScenarioV4Schema.parse(scenario); }
  return VisualScenarioV3Schema.parse({ ...scenario, schemaVersion: 3, sourceCheckpoint: scenario.schemaVersion === 3 ? scenario.sourceCheckpoint : null });
}

/** Serialize only the version's public fields, never an internal clip spread. */
export function recordTransitionClip(clip: TransitionClip, caseId: string, redacted = false) {
  const fields = { caseId, redacted, viewport: clip.viewport, source: clip.source, target: clip.target,
    plan: clip.plan, durationMs: clip.durationMs, sourceCheckpoint: clip.sourceCheckpoint, protectedNodeIds: clip.protectedNodeIds };
  if (clip.languageProfile) return normalizeVisualScenario({ ...fields, schemaVersion: 5, languageProfile: clip.languageProfile,
    motionVersion: clip.motionVersion, ...(clip.motionVersion === 2 ? { motionPlan: clip.motionPlan } : {}) });
  return normalizeVisualScenario(clip.motionVersion === 2
    ? { ...fields, schemaVersion: 4, motionVersion: 2, motionPlan: clip.motionPlan }
    : { ...fields, schemaVersion: 3 });
}

/** Import version dispatch is independent of the current host's sampler choice. */
export function createClipFromRecording(input: unknown): TransitionClip {
  const recording = normalizeVisualScenario(input);
  return createTransitionClip({ source: recording.source, target: recording.target, plan: recording.plan, durationMs: recording.durationMs,
    viewport: recording.viewport, sourceCheckpoint: recording.sourceCheckpoint, protectedNodeIds: recording.protectedNodeIds,
    ...(recording.schemaVersion === 5 ? { languageProfile: recording.languageProfile } : {}),
    ...(recording.schemaVersion !== 3 ? { motionVersion: recording.motionVersion, motionPlan: recording.motionPlan } : { motionVersion: 1 }) });
}
