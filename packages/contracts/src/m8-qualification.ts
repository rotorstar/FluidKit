import { z } from 'zod';
import { NativeTargetAuditSchema, M8_NATIVE_TOLERANCE_PX } from './native-targets';
import { M7_EFFECT_IDS, M7_PHASES, WorkspaceQualificationCaseSchema, WorkspaceQualificationSchema } from './workspace-qualification';

// Share unchanged checkpoint/recipe contracts; M7's detail directions stay intact.
export const M8_DIRECTIONS = [['table', 'cards'], ['cards', 'table'], ['cards', 'map'], ['map', 'cards'], ['map', 'table'], ['table', 'map']] as const;
export const M8_EFFECT_IDS = M7_EFFECT_IDS;
export const M8_PHASES = M7_PHASES;
export * from './native-targets';
const Keys = z.array(z.string().min(1)).min(2).max(1000).refine(keys => new Set(keys).size === keys.length, 'Duplicate selected IDs.');

const OldSample = WorkspaceQualificationCaseSchema.shape.samples.element;
export const M8QualificationSampleSchema = OldSample.extend({
  selectedIds: Keys, inspectorOpen: z.literal(true), nativeTargets: NativeTargetAuditSchema,
});
export const M8QualificationCaseSchema = WorkspaceQualificationCaseSchema.extend({
  source: z.enum(['table', 'cards', 'map']), target: z.enum(['table', 'cards', 'map']),
  selectedIds: Keys, inspectorOpen: z.literal(true),
  setupEvents: z.array(z.strictObject({ type: z.string().min(1), revision: z.number().int().nonnegative(), accepted: z.literal(true) })).min(3),
  samples: z.array(M8QualificationSampleSchema).max(5),
});
export const M8QualificationSchema = z.strictObject({
  schemaVersion: z.literal(1), milestone: z.literal('M8'), generatedAt: z.iso.datetime(),
  buildId: z.string().min(1), dataVersion: z.string().min(1), dataSource: z.string().min(1), moduleIds: z.array(z.string().min(1)).min(2),
  scope: z.literal('core-collection-five-checkpoints-native-targets'),
  backend: WorkspaceQualificationSchema.shape.backend, browser: WorkspaceQualificationSchema.shape.browser,
  surface: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }).nullable(),
  selectedIds: Keys, cases: z.array(M8QualificationCaseSchema).max(18),
  result: z.enum(['passed', 'failed', 'inconclusive']), issues: z.array(z.string()), limitations: z.array(z.string()).min(1),
}).superRefine((report, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const sameKeys = (left: string[], right: string[]) => left.length === right.length && [...left].sort().every((key, index) => key === [...right].sort()[index]);
  const keys = report.cases.map(item => `${item.effect}:${item.source}:${item.target}`);
  if (new Set(keys).size !== keys.length) fail('Duplicate matrix case.');
  const frameIds = report.cases.flatMap(item => item.samples.map(sample => sample.frame.id));
  if (new Set(frameIds).size !== frameIds.length) fail('A captured frame cannot cover two checkpoints.');
  if (new Set(report.moduleIds).size !== report.moduleIds.length || report.selectedIds.some(id => !report.moduleIds.includes(id))) fail('Selected IDs must belong to this actual dataset.');
  if (report.cases.some(item => !M8_DIRECTIONS.some(([source, target]) => source === item.source && target === item.target))) fail('Unplanned M8 direction.');
  let imageBytes = 0;
  for (const item of report.cases) {
    if (!sameKeys(item.selectedIds, report.selectedIds)) fail('Case selection differs from the prepared selection.');
    if (!['collection.change', 'inspector.open'].every(type => item.setupEvents.some(event => event.type === type)) || item.setupEvents.some(event => event.revision >= item.revision)) fail('Selection and inspector must be committed before the transition.');
    if (item.recording.plan?.selected?.id !== item.effect || item.recording.plan.sourceState !== item.source || item.recording.plan.targetState !== item.target || item.recording.plan.targetRevision !== item.revision) fail('Recorded plan does not belong to the M8 case.');
    for (const [index, sample] of item.samples.entries()) {
      const phase = M8_PHASES[index];
      if (new Set(sample.geometry.nodes.map(node => node.id)).size !== sample.geometry.nodes.length) fail('Duplicate presented node.');
      if ([sample.frame.progress, sample.textAudit.progress, sample.geometry.progress].some(value => value !== phase)) fail('Checkpoint mismatch.');
      if (sample.frame.backend !== report.backend || sample.textAudit.backend !== report.backend) fail('Backend mismatch.');
      if (!sameKeys(sample.selectedIds, report.selectedIds)) fail('Selection changed during the transition.');
      if (report.result === 'passed' && (phase === 0 || phase === 1)) {
        const expected = phase === 0 ? item.recording.source : item.recording.target;
        const actual = new Map(sample.geometry.nodes.map(node => [node.id, node]));
        const properties = ['x', 'y', 'width', 'height', 'rotation', 'opacity'] as const;
        if (expected.some(node => { const shown = actual.get(node.id); return !shown || properties.some(key => Math.abs(shown[key] - node[key]) > .01); })
          || sample.geometry.nodes.some(node => node.opacity > .01 && !expected.some(target => target.id === node.id))
          || sample.geometry.lensPresent || sample.geometry.particleCount || sample.geometry.shadowCount) fail('Passing endpoints must match the recorded state without effect residues.');
      }
      const surface = report.surface;
      if (!surface || Math.abs(sample.frame.viewport.width - surface.width) > .1 || Math.abs(sample.frame.viewport.height - surface.height) > .1 || Math.abs(sample.frame.viewport.dpr - surface.dpr) > .01 || Math.abs(sample.textAudit.viewport.width - surface.width) > .1 || Math.abs(sample.textAudit.viewport.height - surface.height) > .1) fail('Surface dimensions changed or are missing.');
      const targetControls = item.recording.target.filter(node => ['button', 'checkbox', 'textbox'].includes(node.anatomy.behavior) && sample.geometry.nodes.some(shown => shown.id === node.id));
      if (!sameKeys(sample.nativeTargets.expectedIds, targetControls.map(node => node.id))) fail('Native audit omits a presented current control.');
      for (const observation of sample.nativeTargets.observations) {
        const shown = sample.geometry.nodes.find(node => node.id === observation.id);
        const target = targetControls.find(node => node.id === observation.id);
        if (!shown || !target) { fail('Native observation has no correlated control.'); continue; }
        const width = Math.abs(Math.cos(shown.rotation)) * shown.width + Math.abs(Math.sin(shown.rotation)) * shown.height;
        const height = Math.abs(Math.sin(shown.rotation)) * shown.width + Math.abs(Math.cos(shown.rotation)) * shown.height;
        const bounds = { x: shown.x + (shown.width - width) / 2, y: shown.y + (shown.height - height) / 2, width, height };
        if ((['x', 'y', 'width', 'height'] as const).some(key => Math.abs(observation.expected[key] - bounds[key]) > .00001)) fail('Native expected bounds differ from the recorded presentation.');
        if (observation.componentId !== target.anatomy.componentId || observation.part !== target.anatomy.part || observation.expectedChecked !== (target.anatomy.behavior === 'checkbox' ? Boolean(target.checked) : null)) fail('Native observation has wrong part identity or checked expectation.');
      }
      imageBytes += sample.frame.image.length;
    }
  }
  if (imageBytes > 64 * 1024 * 1024) fail('Matrix image budget exceeded.');
  const failedCase = report.cases.some(item => item.samples.length !== 5 || item.issues.length || item.samples.some(sample =>
    sample.textAudit.issues.some(issue => issue.severity === 'error') || sample.nativeTargets.issues.length || sample.nativeTargets.observations.some(target =>
      !target.actual || target.matches !== 1 || target.actualComponentId !== target.componentId || target.actualPart !== target.part || target.maxDeviation === null || target.maxDeviation > M8_NATIVE_TOLERANCE_PX || target.actualChecked !== target.expectedChecked)));
  if (report.result === 'passed' && (report.issues.length || !report.surface || report.cases.length !== 18 || failedCase)) fail('Passing M8 requires all 90 correlated frames, stable selection and native targets within one CSS pixel.');
});
export type M8Qualification = z.infer<typeof M8QualificationSchema>;
export type M8QualificationCase = z.infer<typeof M8QualificationCaseSchema>;
