import { z } from 'zod';

export const DataSourceSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1), version: z.string().min(1),
  mode: z.enum(['live', 'import', 'recording', 'synthetic', 'provider-sandbox']),
  provider: z.string().min(1), label: z.string().min(1),
  asOf: z.iso.datetime(), expiresAt: z.iso.datetime().optional(),
  simulation: z.boolean(),
}).superRefine((value, ctx) => {
  if (['synthetic', 'provider-sandbox'].includes(value.mode) && !value.simulation) ctx.addIssue({ code: 'custom', message: 'Synthetic and sandbox data must be marked as simulation' });
  if (value.mode === 'live' && value.simulation) ctx.addIssue({ code: 'custom', message: 'Live data cannot be labeled simulation' });
  if (value.expiresAt && Date.parse(value.expiresAt) <= Date.parse(value.asOf)) ctx.addIssue({ code: 'custom', message: 'Expiry must follow observation time' });
});
export type DataSource = z.infer<typeof DataSourceSchema>;
export const ActionContextSchema = z.strictObject({
  principalId: z.string().min(1), projectId: z.string().min(1),
  origin: z.enum(['user', 'host', 'ai', 'prefetch', 'replay']),
});
export type ActionContext = z.infer<typeof ActionContextSchema>;
export function dataResultSchema<T extends z.ZodType>(schema: T) {
  return z.strictObject({ schemaVersion: z.literal(1), data: schema, source: DataSourceSchema });
}
