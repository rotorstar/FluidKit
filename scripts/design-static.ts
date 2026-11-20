import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { check, loadConfig, loadRules } from '@enmera/ai-design-check';
import { z } from 'zod';
import { createQualityReport, measuredCheck } from '../packages/testing/src/quality';

const SeveritySchema = z.enum(['error', 'warn', 'info', 'off']);
export const DesignProfileSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().min(1), locale: z.string().min(1),
  include: z.array(z.string()).min(1), componentDirs: z.array(z.string()),
  qualifiedBlockingRules: z.array(z.string()), ruleOverrides: z.record(z.string(), SeveritySchema),
  exceptions: z.array(z.strictObject({ rule: z.string(), scope: z.string().min(1), reason: z.string().min(15) })),
}).superRefine((profile, ctx) => {
  for (const [rule, severity] of Object.entries(profile.ruleOverrides)) {
    if (severity === 'off' && !profile.exceptions.some(exception => exception.rule === rule)) ctx.addIssue({ code: 'custom', message: `Missing reason for disabled rule ${rule}` });
  }
});
const UpstreamFindingSchema = z.object({ rule: z.string(), severity: z.enum(['error', 'warn', 'info']), path: z.string(), line: z.number().int().positive(), message: z.string() });
const CatalogueSchema = z.object({ rules: z.array(z.object({ id: z.string(), severity: SeveritySchema, check: z.unknown().optional() })) });
export function runDesignCheck(root: string, profileInput: unknown) {
  const profile = DesignProfileSchema.parse(profileInput);
  const catalogue = CatalogueSchema.parse(loadRules());
  for (const rule of [...profile.qualifiedBlockingRules, ...Object.keys(profile.ruleOverrides)]) {
    if (!catalogue.rules.some(item => item.id === rule)) throw new Error(`Unknown design rule: ${rule}`);
  }
  const rules = Object.fromEntries(catalogue.rules.map(rule => [rule.id,
    profile.ruleOverrides[rule.id] ?? (profile.qualifiedBlockingRules.includes(rule.id) ? 'error' : rule.severity === 'error' ? 'warn' : rule.severity)]));
  const findings = z.array(UpstreamFindingSchema).parse(check(root, {
    ...loadConfig(root), include: profile.include, componentDirs: profile.componentDirs, rules,
    ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/generated/**'],
    // Baselines and broad per-file allows are intentionally not consumed.
    allow: {},
  })).map(finding => ({ rule: finding.rule, severity: finding.severity === 'warn' ? 'warning' as const : finding.severity,
    message: finding.message, target: { file: finding.path, line: finding.line, nodes: [] } }));
  return { profile, findings };
}
async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.filter(entry => !entry.isSymbolicLink() && !['node_modules', '.next', 'dist', 'generated'].includes(entry.name)).map(async entry => {
    if(entry.isDirectory()&&entry.name==='knowledge'&&directory.endsWith(join('apps','studio','public')))return [];
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : /\.(tsx?|css|mjs|json|glb|ttf|woff2|svg)$/.test(path) ? [path] : [];
  }));
  return nested.flat();
}
export async function buildDesignReport(root: string) {
  const input = JSON.parse(await readFile(join(root, 'design-quality.config.json'), 'utf8')) as unknown;
  const { profile, findings } = runDesignCheck(root, input);
  const files = (await Promise.all(['packages', 'apps/studio/app', 'apps/studio/components', 'apps/studio/lib', 'apps/studio/public', 'scripts'].map(path => sourceFiles(join(root, path))))).flat();
  files.push(...['package.json', 'package-lock.json', 'font-bake.config.json', 'design-quality.config.json', 'apps/studio/next.config.ts'].map(path => join(root, path)));
  const hash = createHash('sha256');
  for (const path of [...new Set(files)].sort()) { hash.update(relative(root, path)); hash.update('\0'); hash.update(await readFile(path)); hash.update('\0'); }
  const checked = files.filter(path => profile.include.some(include => relative(root, path).startsWith(`${include}/`))).length;
  const report = createQualityReport({ buildId: `fluid-${hash.digest('hex').slice(0, 20)}`, backend: 'not-applicable' }, [
    measuredCheck('studio-static', 'static', 'Statische Studio-Regeln', checked, findings),
  ], { designChecker: '@enmera/ai-design-check@0.9.0', profile: profile.id });
  return report;
}
