import { z } from 'zod';

export const SequenceGeometrySchema = z.strictObject({
  progress: z.number().min(0).max(1),
  nodes: z.array(z.strictObject({ id: z.string().min(1), x: z.number().finite(), y: z.number().finite(), width: z.number().nonnegative(), height: z.number().nonnegative(), rotation: z.number().finite(), opacity: z.number().min(0).max(1) })).max(20000),
  lensPresent: z.boolean(), particleCount: z.number().int().nonnegative(), shadowCount: z.number().int().nonnegative(),
});
export type SequenceGeometry = z.infer<typeof SequenceGeometrySchema>;
