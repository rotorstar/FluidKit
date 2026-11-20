import { z } from 'zod';

export const M8_NATIVE_TOLERANCE_PX = 1;
export const NativeTargetBoundsSchema = z.strictObject({ x: z.number().finite(), y: z.number().finite(), width: z.number().nonnegative(), height: z.number().nonnegative() });
export const NativeTargetObservationSchema = z.strictObject({
  id: z.string().min(1), componentId: z.string().min(1), part: z.string().min(1),
  matches: z.number().int().nonnegative(), actualComponentId: z.string().nullable(), actualPart: z.string().nullable(),
  expected: NativeTargetBoundsSchema, actual: NativeTargetBoundsSchema.nullable(),
  maxDeviation: z.number().nonnegative().nullable(), expectedChecked: z.boolean().nullable(), actualChecked: z.boolean().nullable(),
  inert: z.boolean().nullable(), tabIndex: z.number().int().nullable(),
});
export const NativeTargetAuditSchema = z.strictObject({
  method: z.literal('domrect-versus-presented-controls'), toleranceCssPx: z.literal(M8_NATIVE_TOLERANCE_PX),
  expectedIds: z.array(z.string().min(1)).min(1), observations: z.array(NativeTargetObservationSchema), issues: z.array(z.string()),
}).superRefine((audit, ctx) => {
  const ids = audit.observations.map(item => item.id);
  if (new Set(audit.expectedIds).size !== audit.expectedIds.length || new Set(ids).size !== ids.length || ids.length !== audit.expectedIds.length || ids.some(id => !audit.expectedIds.includes(id))) ctx.addIssue({ code: 'custom', message: 'Every expected native target needs exactly one observation.' });
  for (const item of audit.observations) {
    const actual = item.actual;
    const delta = actual ? Math.max(...(['x', 'y', 'width', 'height'] as const).map(key => Math.abs(actual[key] - item.expected[key]))) : null;
    if (delta === null ? item.maxDeviation !== null : item.maxDeviation === null || Math.abs(item.maxDeviation - delta) > .00001) ctx.addIssue({ code: 'custom', message: 'Native target deviation is inconsistent with measured bounds.' });
  }
});
export type NativeTargetBounds = z.infer<typeof NativeTargetBoundsSchema>;
export type NativeTargetObservation = z.infer<typeof NativeTargetObservationSchema>;
export type NativeTargetAudit = z.infer<typeof NativeTargetAuditSchema>;
