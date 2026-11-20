import { z } from 'zod';
import { ThemePreferencesSchema } from './theme';

const Id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
export const EffectReferenceSchema = z.strictObject({ id: Id, version: z.string().regex(/^\d+\.\d+\.\d+$/) });
export type EffectReference = z.infer<typeof EffectReferenceSchema>;
export const EFFECT_POLICY_VERSION = 'effects-1' as const;
export const EffectParametersSchema = z.strictObject({
  intensity: z.number().min(0).max(1).default(0.65),
  frequency: z.number().min(0.2).max(8).default(2.5),
  durationMs: z.number().int().min(0).max(3000).default(1100),
});
export const EffectRuleSchema = z.strictObject({
  mode: z.enum(['off', 'fixed', 'random']),
  effect: EffectReferenceSchema.optional(),
  pool: z.array(EffectReferenceSchema).max(32).optional(),
  parameters: z.strictObject({ intensity: z.number().min(0).max(1).optional(), frequency: z.number().min(0.2).max(8).optional(), durationMs: z.number().int().min(0).max(3000).optional() }).optional(),
}).superRefine((rule, ctx) => {
  if (rule.mode === 'fixed' && !rule.effect) ctx.addIssue({ code: 'custom', message: 'Fixed rule requires a versioned effect' });
});
export type EffectRule = z.infer<typeof EffectRuleSchema>;
export const VisualCommandSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('effect.select'), effect: EffectReferenceSchema }),
  z.strictObject({ type: z.literal('effect.mode'), mode: z.enum(['off', 'fixed', 'random', 'case']) }),
  z.strictObject({ type: z.literal('effect.reroll') }),
]);
export type VisualCommand = z.infer<typeof VisualCommandSchema>;
export const EffectSettingsSchema = z.strictObject({
  schemaVersion: z.literal(1).default(1),
  enabled: z.boolean().default(true),
  theme: ThemePreferencesSchema.prefault({}),
  motionPreference: z.enum(['system', 'reduced']).default('system'),
  mode: z.enum(['off', 'fixed', 'random', 'case']).default('fixed'),
  effect: EffectReferenceSchema.default({ id: 'fluid-morph', version: '1.0.0' }),
  pool: z.array(EffectReferenceSchema).max(32).default([
    { id: 'fluid-morph', version: '1.0.0' }, { id: 'spring-reflow', version: '1.0.0' }, { id: 'ripple-reveal', version: '1.0.0' },
  ]),
  seed: z.number().int().min(0).max(4294967295).default(42),
  parameters: EffectParametersSchema.prefault({}),
  caseRules: z.record(Id, EffectRuleSchema).default({}),
  transitionRules: z.record(Id, EffectRuleSchema).default({}),
});
export type EffectSettings = z.infer<typeof EffectSettingsSchema>;
export const DEFAULT_EFFECT_SETTINGS = EffectSettingsSchema.parse({});
export const EffectDefinitionSchema = z.strictObject({
  schemaVersion: z.literal(1), ...EffectReferenceSchema.shape,
  title: z.string().min(1), description: z.string().min(1),
  category: z.enum(['shape', 'motion', 'light']),
  engine: z.enum(['typegpu', 'cpu']),
  backends: z.array(z.enum(['webgpu', 'webgl2'])).min(1),
  requiresCompute: z.boolean().default(false),
  maxNodes: z.number().int().positive().max(100000),
  fallback: EffectReferenceSchema.optional(),
  style: z.enum(['classic', 'elegant', 'balanced', 'experimental']).default('classic'),
  frequencyLabel: z.string().min(1).max(80).default('Frequenz'),
  recommendedParameters: EffectParametersSchema.prefault({}),
});
export type EffectDefinition = z.infer<typeof EffectDefinitionSchema>;
export const RenderCapabilitiesSchema = z.strictObject({
  backend: z.enum(['webgpu', 'webgl2', 'unavailable']),
  typegpu: z.boolean(), compute: z.boolean(), reducedMotion: z.boolean(),
});
export type RenderCapabilities = z.infer<typeof RenderCapabilitiesSchema>;
export const EffectPresentationSchema = z.strictObject({
  quality: z.enum(['compact', 'standard']),
  anchor: z.strictObject({ x: z.number().finite(), y: z.number().finite() }),
  groupOrder: z.array(Id).max(10000),
  particleBudget: z.number().int().min(0).max(2048),
  targetEdge: z.number().int().positive().max(2048),
}).superRefine((presentation, ctx) => {
  if (new Set(presentation.groupOrder).size !== presentation.groupOrder.length) ctx.addIssue({ code: 'custom', message: 'Duplicate effect group' });
  if (presentation.quality === 'compact' && (presentation.particleBudget > 512 || presentation.targetEdge > 1024)) ctx.addIssue({ code: 'custom', message: 'Compact effect budget exceeded' });
});
export const ResolvedEffectPlanSchema = z.strictObject({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), id: Id, eventId: Id, eventType: Id, caseId: Id,
  policyVersion: z.literal(EFFECT_POLICY_VERSION),
  sourceState: Id, targetState: Id,
  sourceRevision: z.number().int().nonnegative(), targetRevision: z.number().int().positive(),
  mode: z.enum(['off', 'fixed', 'random', 'case']),
  policySource: z.enum(['project', 'case', 'transition', 'master']),
  requested: EffectReferenceSchema.nullable(), selected: EffectReferenceSchema.nullable(),
  seed: z.number().int().min(0).max(4294967295),
  parameters: EffectParametersSchema.extend({ durationMs: z.number().int().min(0).max(10000) }),
  capabilities: RenderCapabilitiesSchema,
  fallbackReason: z.string().max(1000).nullable(),
  protectedNodeIds: z.array(Id).max(10000),
  presentation: EffectPresentationSchema.optional(),
}).superRefine((plan, ctx) => {
  if (plan.schemaVersion === 1 && plan.presentation) ctx.addIssue({ code: 'custom', message: 'Legacy effect plans cannot carry a new presentation profile' });
});
export type ResolvedEffectPlan = z.infer<typeof ResolvedEffectPlanSchema>;
export const VisualStateSchema = z.strictObject({
  revision: z.number().int().nonnegative(), settings: EffectSettingsSchema,
  capabilities: RenderCapabilitiesSchema,
  plans: z.array(ResolvedEffectPlanSchema).max(500),
  current: ResolvedEffectPlanSchema.nullable(),
});
export type VisualState = z.infer<typeof VisualStateSchema>;
