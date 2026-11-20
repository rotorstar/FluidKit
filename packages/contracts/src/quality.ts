import { z } from 'zod';

export const QualitySourceSchema = z.enum(['static', 'dom', 'gpu', 'semantics', 'visual']);
export const QualityFindingSchema = z.strictObject({
  rule: z.string().min(1),
  severity: z.enum(['error', 'warning', 'info']),
  message: z.string().min(1),
  target: z.strictObject({
    file: z.string().optional(), line: z.number().int().positive().optional(),
    componentId: z.string().optional(), part: z.string().optional(),
    nodes: z.array(z.string()).default([]),
  }),
});
export const QualityCheckSchema = z.strictObject({
  id: z.string().min(1), source: QualitySourceSchema, title: z.string().min(1),
  status: z.enum(['passed', 'failed', 'not-checked', 'unsupported']),
  checked: z.number().int().nonnegative(), reason: z.string().min(1).optional(),
  findings: z.array(QualityFindingSchema),
}).superRefine((check, ctx) => {
  const errors = check.findings.some(finding => finding.severity === 'error');
  if (check.status === 'passed' && (errors || check.checked === 0)) ctx.addIssue({ code: 'custom', message: 'Passed checks need measured coverage and no errors' });
  if (check.status === 'failed' && !errors) ctx.addIssue({ code: 'custom', message: 'Failed checks need an error finding' });
  if (['not-checked', 'unsupported'].includes(check.status) && (!check.reason || check.checked > 0)) ctx.addIssue({ code: 'custom', message: 'Open checks need a reason and zero coverage' });
});
export const QualityContextSchema = z.strictObject({
  buildId: z.string().min(1), backend: z.enum(['webgpu', 'webgl2', 'not-applicable', 'unavailable']),
  viewport: z.strictObject({ width: z.number().positive(), height: z.number().positive() }).optional(),
  phase: z.number().min(0).max(1).optional(), revision: z.number().int().nonnegative().optional(),
  caseId: z.string().optional(), state: z.string().optional(),
});
export const QualityReportSchema = z.strictObject({
  schemaVersion: z.literal(1), generatedAt: z.iso.datetime(), context: QualityContextSchema,
  tools: z.record(z.string(), z.string()), checks: z.array(QualityCheckSchema).min(1),
}).superRefine((report, ctx) => {
  if (new Set(report.checks.map(check => check.id)).size !== report.checks.length) ctx.addIssue({ code: 'custom', message: 'Duplicate quality check IDs' });
});
export type QualityFinding = z.infer<typeof QualityFindingSchema>;
export type QualityCheck = z.infer<typeof QualityCheckSchema>;
export type QualityContext = z.infer<typeof QualityContextSchema>;
export type QualityReport = z.infer<typeof QualityReportSchema>;
