import { z } from 'zod';

export const ResourceKindSchema = z.enum(['surface', 'device', 'renderer', 'font', 'glyph-handle', 'geometry', 'material', 'text', 'texture', 'render-target', 'listener', 'observer', 'animation-frame', 'pending-job']);
export const ResourceSnapshotSchema = z.strictObject({
  live: z.record(ResourceKindSchema, z.number().int().nonnegative()),
  peak: z.record(ResourceKindSchema, z.number().int().nonnegative()),
  owners: z.number().int().nonnegative(), disposalErrors: z.array(z.string()),
});
export const LifecycleRunSchema = z.strictObject({
  schemaVersion: z.literal(1), startedAt: z.iso.datetime(), completedAt: z.iso.datetime(),
  buildId: z.string(), requestedCycles: z.number().int().positive(),
  backend: z.enum(['webgpu', 'webgl2']),
  samples: z.array(z.strictObject({ cycle: z.number().int().positive(), frames: z.number().int().nonnegative(), idleFrameDelta: z.number().int().nonnegative(), textBytesWhileMounted: z.number().nonnegative(), coreSubscriptionsAfterDispose:z.number().int().nonnegative(), pendingActionsAfterDispose:z.number().int().nonnegative(), domNodesAfterUnmount:z.number().int().nonnegative(), afterDispose: ResourceSnapshotSchema })),
  failures: z.array(z.string()),
  memoryScope: z.literal('Owned resource counts and Glyph-reported buffer bytes; driver and process memory not measured'),
});
export type ResourceKind = z.infer<typeof ResourceKindSchema>;
export type ResourceSnapshot = z.infer<typeof ResourceSnapshotSchema>;
export type LifecycleRun = z.infer<typeof LifecycleRunSchema>;
