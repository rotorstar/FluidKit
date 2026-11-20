import { z } from 'zod';
import { MOTION_LIMITS, MotionCheckpointSchema } from './motion';

const Id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/);
const Coordinate = z.number().finite().min(-100000).max(100000);
export const PresentedNodeStateSchema = z.strictObject({
  id: Id, textOpacity: z.number().min(0).max(1), panelOpacity: z.number().min(0).max(1),
  protected: z.boolean(),
  shadow: z.strictObject({ opacity: z.number().min(0).max(1), offsetX: Coordinate, offsetY: Coordinate, blur: z.number().min(0).max(100) }),
  shader: z.strictObject({ effectId: z.union([z.literal(0), z.literal(1), z.literal(3)]), progress: z.number().min(0).max(1), intensity: z.number().min(0).max(1), frequency: z.number().min(0.2).max(8), seed: z.number().finite() }),
});
export type PresentedNodeState = z.infer<typeof PresentedNodeStateSchema>;
export const LensPresentationSchema = z.strictObject({
  x: Coordinate, y: Coordinate, radius: z.number().min(0).max(20000),
  strength: z.number().min(0).max(1), phase: z.number().min(0).max(1),
  opacity: z.number().min(0).max(1),
});
export type LensPresentation = z.infer<typeof LensPresentationSchema>;
export const ParticlePresentationSchema = z.strictObject({
  id: Id, componentId: Id, x: Coordinate, y: Coordinate,
  velocityX: z.number().finite().min(-100000).max(100000), velocityY: z.number().finite().min(-100000).max(100000),
  size: z.number().min(0).max(100), rotation: z.number().finite(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/), opacity: z.number().min(0).max(1),
});
export type ParticlePresentation = z.infer<typeof ParticlePresentationSchema>;
/** Flat rendered channels only. No GPU handles, executable code or clip history. */
export const SourcePresentationCheckpointSchema = z.strictObject({
  schemaVersion: z.literal(1),
  nodeStates: z.array(PresentedNodeStateSchema).max(MOTION_LIMITS.presentedNodes),
  lens: LensPresentationSchema.nullable(),
  particles: z.array(ParticlePresentationSchema).max(2048),
  motion: MotionCheckpointSchema.optional(),
}).superRefine((checkpoint, ctx) => {
  for (const list of [checkpoint.nodeStates, checkpoint.particles]) {
    if (new Set(list.map(item => item.id)).size !== list.length) ctx.addIssue({ code: 'custom', message: 'Duplicate presentation identity' });
  }
});
export type SourcePresentationCheckpoint = z.infer<typeof SourcePresentationCheckpointSchema>;
