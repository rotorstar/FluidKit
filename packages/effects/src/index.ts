import {
  EFFECT_POLICY_VERSION, EffectDefinitionSchema, EffectParametersSchema, EffectSettingsSchema, ResolvedEffectPlanSchema,
  type EffectDefinition, type EffectReference, type EffectRule, type EffectSettings,
  type RenderCapabilities, type ResolvedEffectPlan,
} from '@fluidkit/contracts';

export const EFFECT_LIBRARY: readonly EffectDefinition[] = Object.freeze([
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'fluid-morph', version: '1.0.0', title: 'Fluid Morph', description: 'Weiche SDF-Konturen verbinden die aktuelle Form mit dem Ziel.', category: 'shape', engine: 'typegpu', backends: ['webgpu', 'webgl2'], maxNodes: 2000, fallback: { id: 'spring-reflow', version: '1.0.0' } }),
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'spring-reflow', version: '1.0.0', title: 'Spring Reflow', description: 'Ein deterministischer Federimpuls ordnet dieselben Inhalte neu.', category: 'motion', engine: 'cpu', backends: ['webgpu', 'webgl2'], maxNodes: 10000 }),
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'ripple-reveal', version: '1.0.0', title: 'Ripple Reveal', description: 'Eine GPU-Lichtwelle begleitet das Entfalten der Zielansicht.', category: 'light', engine: 'typegpu', backends: ['webgpu', 'webgl2'], maxNodes: 2000, fallback: { id: 'spring-reflow', version: '1.0.0' } }),
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'silk-cascade', version: '1.0.0', title: 'Silk Cascade', description: 'Zusammengehörige Inhalte gleiten in sanft versetzten Bögen mit schwebenden Schatten an ihren neuen Platz.', category: 'motion', style: 'elegant', frequencyLabel: 'Staffelung', recommendedParameters: { durationMs: 900, intensity: 0.55, frequency: 2.5 }, engine: 'cpu', backends: ['webgpu', 'webgl2'], maxNodes: 2000, fallback: { id: 'spring-reflow', version: '1.0.0' } }),
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'liquid-lens', version: '1.0.0', title: 'Liquid Lens', description: 'Eine wandernde Flüssiglinse bricht die Flächen lokal. Texte und aktive Eingaben bleiben klar.', category: 'light', style: 'balanced', frequencyLabel: 'Linsenbreite', recommendedParameters: { durationMs: 1100, intensity: 0.55, frequency: 2.5 }, engine: 'typegpu', backends: ['webgpu', 'webgl2'], maxNodes: 2000, fallback: { id: 'spring-reflow', version: '1.0.0' } }),
  EffectDefinitionSchema.parse({ schemaVersion: 1, id: 'particle-weave', version: '1.0.0', title: 'Particle Weave', description: 'Feine Partikelstränge verbinden die ursprünglichen Flächen mit ihren neuen Positionen und weben sich wieder zusammen.', category: 'motion', style: 'experimental', frequencyLabel: 'Strangdichte', recommendedParameters: { durationMs: 1300, intensity: 0.65, frequency: 2.5 }, engine: 'typegpu', backends: ['webgpu', 'webgl2'], maxNodes: 2000, fallback: { id: 'spring-reflow', version: '1.0.0' } }),
]);
export function effectReference(effect: EffectDefinition): EffectReference { return { id: effect.id, version: effect.version }; }
export function findEffect(ref: EffectReference, library = EFFECT_LIBRARY) { return library.find(effect => effect.id === ref.id && effect.version === ref.version); }
export function transitionSeed(runSeed: number, eventId: string, caseId: string): number {
  let seed = runSeed >>> 0;
  for (const character of `${EFFECT_POLICY_VERSION}:${caseId}:${eventId}`) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  return seed;
}
function incompatible(effect: EffectDefinition, capabilities: RenderCapabilities, nodeCount: number): string | null {
  if (capabilities.backend === 'unavailable' || !effect.backends.includes(capabilities.backend)) return 'Backend unterstützt das Rezept nicht';
  if (effect.engine === 'typegpu' && !capabilities.typegpu) return 'TypeGPU-Kernel nicht verfügbar';
  if (effect.requiresCompute && !capabilities.compute) return 'Compute nicht verfügbar';
  if (nodeCount > effect.maxNodes) return 'Scene überschreitet das Rezeptbudget';
  return null;
}
export function resolveEffect(input: {
  settings: EffectSettings; capabilities: RenderCapabilities;
  eventId: string; eventType: string; caseId: string; sourceState: string; targetState: string;
  sourceRevision: number; targetRevision: number; baseDuration: number; nodeCount: number;
  transitionRule?: EffectRule; protectedNodeIds?: string[]; library?: readonly EffectDefinition[];
}): ResolvedEffectPlan {
  const settings = EffectSettingsSchema.parse(input.settings);
  const library = input.library ?? EFFECT_LIBRARY;
  const seed = transitionSeed(settings.seed, input.eventId, input.caseId);
  let policySource: ResolvedEffectPlan['policySource'] = 'project';
  let rule: EffectRule = { mode: settings.mode === 'case' ? 'fixed' : settings.mode, effect: settings.effect, pool: settings.pool };
  if (settings.mode === 'case' && settings.caseRules[input.caseId]) { rule = settings.caseRules[input.caseId]!; policySource = 'case'; }
  const transition = input.transitionRule ?? settings.transitionRules[input.eventType];
  if (transition) { rule = transition; policySource = 'transition'; }
  if (!settings.enabled || settings.mode === 'off') { rule = { mode: 'off' }; policySource = 'master'; }
  let requested: EffectReference | null = null, selected: EffectReference | null = null, fallbackReason: string | null = null;
  const parameters = EffectParametersSchema.parse({ ...settings.parameters, ...rule.parameters });
  if (input.capabilities.reducedMotion) { fallbackReason = 'Reduced Motion'; parameters.durationMs = 0; }
  else if (rule.mode === 'off') parameters.durationMs = input.baseDuration;
  else if (rule.mode === 'fixed') {
    requested = rule.effect ?? settings.effect;
    const effect = findEffect(requested, library);
    if (!effect) fallbackReason = 'Gespeicherte Rezeptversion nicht verfügbar';
    else {
      fallbackReason = incompatible(effect, input.capabilities, input.nodeCount);
      if (!fallbackReason) selected = effectReference(effect);
      else if (effect.fallback) {
        const fallback = findEffect(effect.fallback, library);
        if (fallback && !incompatible(fallback, input.capabilities, input.nodeCount)) selected = effectReference(fallback);
      }
    }
  } else {
    const candidates = (rule.pool ?? settings.pool).map(ref => findEffect(ref, library)).filter((effect): effect is EffectDefinition => Boolean(effect && !incompatible(effect, input.capabilities, input.nodeCount)));
    if (candidates.length) { selected = effectReference(candidates[seed % candidates.length]!); requested = selected; }
    else fallbackReason = 'Kein kompatibles Rezept im Random-Pool';
  }
  if (!selected && !input.capabilities.reducedMotion) parameters.durationMs = input.baseDuration;
  return ResolvedEffectPlanSchema.parse({
    schemaVersion: selected && ['silk-cascade', 'liquid-lens', 'particle-weave'].includes(selected.id) ? 2 : 1, policyVersion:EFFECT_POLICY_VERSION, id: input.eventId, eventId: input.eventId, eventType: input.eventType, caseId: input.caseId,
    sourceState: input.sourceState, targetState: input.targetState, sourceRevision: input.sourceRevision, targetRevision: input.targetRevision,
    mode: settings.mode, policySource, requested, selected, seed, parameters, capabilities: input.capabilities, fallbackReason,
    protectedNodeIds: input.protectedNodeIds ?? [],
  });
}
export * from './presentation';
export * from './motion-plan';

/** Replays the recorded selection; never runs the current random policy again. */
export function validateEffectReplay(input: unknown, capabilities: RenderCapabilities, library = EFFECT_LIBRARY): ResolvedEffectPlan {
  const plan = ResolvedEffectPlanSchema.parse(input);
  if (plan.selected) {
    const effect = findEffect(plan.selected, library);
    if (!effect) throw new Error('Rezeptversion dieses Runs fehlt');
    const failure = incompatible(effect, capabilities, 0);
    if (failure) throw new Error(`Replay benötigt andere Fähigkeiten: ${failure}`);
  }
  return plan;
}
