import { z } from 'zod';

const Id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const Coordinate = z.number().finite().min(-100000).max(100000);
export const MOTION_LIMITS = Object.freeze({ sceneNodes: 10000, presentedNodes: 20000, couplingGroups: 8, couplingPieces: 32, couplingBridges: 31 });
const Point = z.strictObject({ x: Coordinate, y: Coordinate });
const Route = z.enum(['x-then-y', 'y-then-x']);
export const MotionRuleSchema = z.strictObject({
  kind: z.enum(['match', 'split', 'merge', 'enter', 'exit']),
  sources: z.array(Id).max(MOTION_LIMITS.couplingPieces).default([]),
  whenState: Id.optional(), whenPresent: z.array(Id).min(1).max(MOTION_LIMITS.couplingPieces).optional(),
  groupId: Id.optional(),
  route: Route.optional(),
}).superRefine((rule, ctx) => {
  if (new Set(rule.sources).size !== rule.sources.length) ctx.addIssue({ code: 'custom', message: 'Duplicate morph source' });
  const count = rule.sources.length;
  if ((['match', 'split'].includes(rule.kind) && count !== 1) || (rule.kind === 'merge' && count < 2) || (['enter', 'exit'].includes(rule.kind) && count !== 0)) ctx.addIssue({ code: 'custom', message: 'Morph rule has invalid cardinality' });
  if (rule.route && rule.kind !== 'match') ctx.addIssue({ code: 'custom', message: 'Axis routing requires a one-to-one match' });
});
export const MotionPortReferenceSchema = z.strictObject({ nodeId: Id, portId: Id.default('center') });
export const SceneMotionSchema = z.strictObject({
  correspondence: z.array(MotionRuleSchema).min(1).max(32).optional(),
  label: z.enum(['stable', 'crossfade', 'context']).default('stable'),
  /** Keep a sharp part at its declared local offset from an animated shell. */
  follow: Id.optional(),
  /** Compact local content position at a declared axis-route junction. */
  lane: Point.optional(),
  ports: z.array(z.strictObject({ id: Id, x: z.number().min(0).max(1), y: z.number().min(0).max(1) })).max(32).optional(),
  connector: z.strictObject({ from: MotionPortReferenceSchema, to: MotionPortReferenceSchema }).optional(),
}).superRefine((motion, ctx) => {
  if (motion.ports && new Set(motion.ports.map(port => port.id)).size !== motion.ports.length) ctx.addIssue({ code: 'custom', message: 'Duplicate motion port' });
});
export type SceneMotion = z.infer<typeof SceneMotionSchema>;
export const MorphRelationSchema = z.strictObject({
  id: Id, kind: z.enum(['match', 'split', 'merge', 'enter', 'exit']),
  sources: z.array(Id).max(MOTION_LIMITS.couplingPieces), targets: z.array(Id).max(MOTION_LIMITS.couplingPieces),
  route: Route.optional(),
}).superRefine((relation, ctx) => {
  const a = relation.sources.length, b = relation.targets.length;
  const valid = relation.kind === 'match' ? a === 1 && b === 1 : relation.kind === 'split' ? a === 1 && b >= 2 : relation.kind === 'merge' ? a >= 2 && b === 1 : relation.kind === 'enter' ? a === 0 && b === 1 : a === 1 && b === 0;
  if (!valid || new Set(relation.sources).size !== a || new Set(relation.targets).size !== b) ctx.addIssue({ code: 'custom', message: 'Invalid morph relation cardinality' });
  if (relation.route && relation.kind !== 'match') ctx.addIssue({ code: 'custom', message: 'Axis routing requires a one-to-one match' });
});
export const MotionPlanSchema = z.strictObject({ schemaVersion: z.literal(1), relations: z.array(MorphRelationSchema).max(MOTION_LIMITS.presentedNodes * 2) });
export type MotionPlan = z.infer<typeof MotionPlanSchema>;
export type MorphRelation = z.infer<typeof MorphRelationSchema>;
export const MotionVelocitySchema = z.strictObject({ id: Id, x: Coordinate, y: Coordinate, width: Coordinate, height: Coordinate, radius: Coordinate, rotation: Coordinate });
export type MotionVelocity = z.infer<typeof MotionVelocitySchema>;
export const CouplingPresentationSchema = z.strictObject({
  id: Id, kind: z.enum(['split', 'merge']), sourceIds: z.array(Id).max(32), targetIds: z.array(Id).max(32),
  progress: z.number().min(0).max(1), opacity: z.number().min(0).max(1), color: z.string().regex(/^#[0-9a-fA-F]{6}$/), layer: z.number().int().min(-100).max(100),
  pieces: z.array(z.strictObject({ id: Id, ...Point.shape, width: z.number().positive().max(10000), height: z.number().positive().max(10000), radius: z.number().min(0).max(1000), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), opacity: z.number().min(0).max(1).optional() })).min(1).max(MOTION_LIMITS.couplingPieces),
  bridges: z.array(z.strictObject({ from: Point, to: Point, radius: z.number().min(0).max(1000), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), opacity: z.number().min(0).max(1).optional() })).max(MOTION_LIMITS.couplingBridges),
});
export type CouplingPresentation = z.infer<typeof CouplingPresentationSchema>;
export const MotionCheckpointSchema = z.strictObject({
  schemaVersion: z.literal(1), velocities: z.array(MotionVelocitySchema).max(MOTION_LIMITS.presentedNodes),
  couplings: z.array(CouplingPresentationSchema).max(MOTION_LIMITS.couplingGroups),
}).superRefine((checkpoint, ctx) => {
  if (new Set(checkpoint.velocities.map(item => item.id)).size !== checkpoint.velocities.length || new Set(checkpoint.couplings.map(item => item.id)).size !== checkpoint.couplings.length) ctx.addIssue({ code: 'custom', message: 'Duplicate motion checkpoint identity' });
});
