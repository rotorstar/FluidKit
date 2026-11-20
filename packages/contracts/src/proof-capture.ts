import { z } from 'zod';
import { ThemePreferencesSchema } from './theme';
import { CapturedFrameSchema } from './rehearsal';
import { NativeTargetAuditSchema } from './native-targets';
import { SequenceGeometrySchema } from './sequence-geometry';

const Id = z.string().min(1).max(160).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/);
const Hash = z.string().regex(/^[a-f0-9]{64}$/);
export const ProofViewportSchema = z.strictObject({
  browser: z.strictObject({ width: z.number().positive(), height: z.number().positive(), dpr: z.number().positive() }),
  surface: z.strictObject({ x: z.number().finite(), y: z.number().finite(), width: z.number().positive(), height: z.number().positive() }),
});
/** Deliberately narrower than RuntimeSnapshot: no free text, URLs or payloads. */
export const ProofFieldsSchema = z.strictObject({
  sort: z.enum(['name', 'files', 'dependencies']), direction: z.enum(['asc', 'desc']),
  selected: Id.or(z.literal('')), group: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']),
  selection: z.array(Id).max(1000), inspectorOpen: z.boolean(),
  cardsPickedOnly: z.boolean().optional(), workspaceTools: z.boolean().optional(),
  compareDifferences: z.boolean().optional(), atlasMetric: z.enum(['lines', 'files']).optional(), atlasGroup: z.enum(['all', 'Kernel', 'Adapter', 'Tooling']).optional(),
});
export const NativeProofSchema = z.strictObject({
  schemaVersion: z.union([z.literal(1), z.literal(2)]), kind: z.literal('fluid-native-workspace-proof'),
  id: Id, buildId: Id, capturedAt: z.iso.datetime(),
  scope: z.literal('single-bound-canvas-frame'), inputProvenance: z.literal('not-observed-by-exporter'),
  dataset: z.strictObject({ version: z.iso.datetime(), source: z.literal('Workspace package.json + src/**/*.ts(x)'), sha256: Hash, moduleIds: z.array(Id).min(1).max(1000) }),
  viewport: ProofViewportSchema, appearance: ThemePreferencesSchema.optional(),
  snapshot: z.strictObject({ flowId: Id, state: z.enum(['table', 'cards', 'map', 'detail', 'compare', 'atlas']), revision: z.number().int().nonnegative(), mode: z.enum(['manual', 'hybrid', 'auto']), fields: ProofFieldsSchema, redactedFieldIds: z.array(Id) }),
  trace: z.array(z.strictObject({ sequence: z.number().int().nonnegative(), timestamp: z.number().finite().nonnegative(), kind: z.enum(['accepted', 'rejected', 'decision', 'effect', 'error', 'interaction']), eventType: Id, revision: z.number().int().nonnegative(), state: Id, applicationReportedReason: z.enum(['pointer', 'keyboard', 'input', 'programmatic', 'ai', 'replay']).nullable() })).max(1000),
  traceCoverage: z.literal('latest-at-most-1000-no-payloads-or-details'),
  frame: CapturedFrameSchema, imageSha256: Hash,
  metrics: z.strictObject({ backend: z.enum(['webgpu', 'webgl2']), frames: z.number().int().positive(), phase: z.enum(['idle', 'paused']), progress: z.number().min(0).max(1) }),
  geometry: SequenceGeometrySchema,
  currentParts: z.array(z.strictObject({ id: Id, componentId: Id, part: Id, behavior: z.enum(['presentation', 'button', 'textbox', 'checkbox', 'progressbar', 'status']), checked: z.boolean().nullable() })).max(1000),
  nativeTargets: NativeTargetAuditSchema,
  effect: z.strictObject({ id: Id.nullable(), seed: z.number().finite().nullable(), sourceState: Id.nullable(), targetState: Id.nullable(), targetRevision: z.number().int().nonnegative().nullable() }),
  redaction: z.literal('free-input-pixels-blocked-fields-allowlisted-trace-metadata-only'),
  limitations: z.array(z.string().min(1).max(500)).min(1).max(10),
}).superRefine((proof, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const { frame, metrics, viewport, geometry, snapshot } = proof;
  if (proof.schemaVersion === 1 && (proof.appearance !== undefined || ['compare', 'atlas'].includes(snapshot.state) || snapshot.fields.compareDifferences !== undefined || snapshot.fields.atlasMetric !== undefined || snapshot.fields.atlasGroup !== undefined)) fail('M9 presentation fields require proof version 2.');
  if (frame.backend !== metrics.backend || frame.surfaceFrame !== metrics.frames || frame.progress !== metrics.progress || frame.progress !== geometry.progress || frame.capturedAt !== proof.capturedAt) fail('Frame, metrics and presentation do not share one capture.');
  // Capture reports effective DPR = integer canvas width / CSS width. Independent
  // pixel rounding on both axes permits <1 + CSS-height/CSS-width pixels vertically.
  // This concerns image dimensions only; native-target tolerance remains 1 CSS pixel.
  const heightQuantization = 1 + frame.viewport.height / frame.viewport.width;
  if (Math.abs(frame.viewport.width - viewport.surface.width) > .01 || Math.abs(frame.viewport.height - viewport.surface.height) > .01 || Math.abs(frame.pixelWidth - frame.viewport.width * frame.viewport.dpr) > 1 || Math.abs(frame.pixelHeight - frame.viewport.height * frame.viewport.dpr) > heightQuantization) fail('Captured image and measured surface differ.');
  const moduleIds = new Set(proof.dataset.moduleIds);
  if (moduleIds.size !== proof.dataset.moduleIds.length || snapshot.fields.selection.some(id => !moduleIds.has(id)) || snapshot.fields.selected && !moduleIds.has(snapshot.fields.selected)) fail('Selection does not belong to this dataset.');
  if (proof.trace.some((entry, index) => entry.revision > snapshot.revision || index > 0 && entry.sequence <= proof.trace[index - 1]!.sequence)) fail('Trace is not ordered or belongs to a newer snapshot.');
  const nodes = new Map(geometry.nodes.map(node => [node.id, node])), parts = new Map(proof.currentParts.map(part => [part.id, part]));
  if (nodes.size !== geometry.nodes.length || parts.size !== proof.currentParts.length) fail('Duplicate presented or current part.');
  for (const part of frame.parts) if (!nodes.has(part.id) || parts.get(part.id)?.componentId !== part.componentId || parts.get(part.id)?.part !== part.part) fail('Captured part does not belong to the bound current scene.');
  const targetIds = proof.currentParts.filter(part => ['button', 'checkbox', 'textbox'].includes(part.behavior) && nodes.has(part.id)).map(part => part.id);
  if (targetIds.length !== proof.nativeTargets.expectedIds.length || targetIds.some(id => !proof.nativeTargets.expectedIds.includes(id))) fail('Native target audit omits current controls.');
  for (const observation of proof.nativeTargets.observations) {
    const node = nodes.get(observation.id), part = parts.get(observation.id);
    if (!node || !part) { fail('Native target has no bound part.'); continue; }
    const width = Math.abs(Math.cos(node.rotation)) * node.width + Math.abs(Math.sin(node.rotation)) * node.height;
    const height = Math.abs(Math.sin(node.rotation)) * node.width + Math.abs(Math.cos(node.rotation)) * node.height;
    const expected = { x: node.x + (node.width - width) / 2, y: node.y + (node.height - height) / 2, width, height };
    if ((['x', 'y', 'width', 'height'] as const).some(key => Math.abs(expected[key] - observation.expected[key]) > .00001) || observation.componentId !== part.componentId || observation.part !== part.part || observation.expectedChecked !== part.checked) fail('Native target expectation differs from captured geometry/identity.');
  }
  if (proof.effect.targetRevision !== null && (proof.effect.targetRevision !== snapshot.revision || proof.effect.targetState !== snapshot.state)) fail('Effect recording belongs to another domain snapshot.');
});
export type ProofViewport = z.infer<typeof ProofViewportSchema>;
export type NativeProof = z.infer<typeof NativeProofSchema>;
