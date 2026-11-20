import { z } from 'zod';
import { CapturedFrameSchema, NativeTargetAuditSchema, SequenceGeometrySchema, TextAuditSchema, ThemePreferencesSchema, type SceneNode } from '@fluidkit/contracts';
import { WorkspaceModuleSchema, architectureReviewModule, type WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';
import type { PresentationFrame } from '@fluidkit/effects';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import { qualificationGeometry } from '@fluidkit/testing/workspace-qualification';
import { proofImageBytes, proofSha256 } from '@fluidkit/testing/proof-capture';

const State = z.enum(['scope', 'inspect', 'review', 'revise', 'approved']);
export const FlowProofSchema = z.strictObject({
  schemaVersion: z.literal(1), kind: z.literal('fluid-local-flow-proof'), buildId: z.string().min(1).max(160), capturedAt: z.iso.datetime(),
  appearance: ThemePreferencesSchema,
  scope: z.literal('single-live-frame-local-review'), inputProvenance: z.literal('not-observed-by-exporter'),
  dataset: z.strictObject({ sha256: z.string().regex(/^[a-f0-9]{64}$/), capturedAt: z.iso.datetime(), source: z.literal('Workspace package.json + src/**/*.ts(x)') }),
  module: WorkspaceModuleSchema,
  snapshot: z.strictObject({ flowId: z.literal('architecture-review'), state: State, inspectedNode: State, revision: z.number().int().nonnegative() }),
  trace: z.array(z.strictObject({ sequence: z.number().int().nonnegative(), kind: z.enum(['accepted', 'rejected', 'decision', 'effect', 'error', 'interaction']), eventType: z.string().max(160), revision: z.number().int().nonnegative(), state: State, reason: z.enum(['pointer', 'keyboard', 'input', 'programmatic', 'ai', 'replay']).nullable() })).max(1000),
  frame: CapturedFrameSchema, imageSha256: z.string().regex(/^[a-f0-9]{64}$/), geometry: SequenceGeometrySchema, textAudit: TextAuditSchema, nativeTargets: NativeTargetAuditSchema,
  limitations: z.array(z.string()).min(1).max(8),
}).superRefine((value, ctx) => {
  if (value.frame.progress !== value.geometry.progress || value.frame.progress !== value.textAudit.progress || value.frame.backend !== value.textAudit.backend || value.frame.capturedAt !== value.capturedAt || Math.abs(value.frame.viewport.width - value.textAudit.viewport.width) > .01 || Math.abs(value.frame.viewport.height - value.textAudit.viewport.height) > .01) ctx.addIssue({ code: 'custom', message: 'Frame and geometry/text inspection differ.' });
  if (value.trace.some((entry, index) => entry.revision > value.snapshot.revision || index > 0 && entry.sequence <= value.trace[index - 1]!.sequence)) ctx.addIssue({ code: 'custom', message: 'Trace does not belong to this snapshot.' });
});
export type FlowProof = z.infer<typeof FlowProofSchema>;
export async function captureFlowProof(runtime: FluidRuntime, controls: SurfacePlaybackControls, context: { data: WorkspaceData; moduleId: string; buildId: string }, port: { isCurrent(): boolean; viewport(): { width: number; height: number }; inspectTargets(frame: PresentationFrame, nodes: SceneNode[]): z.infer<typeof NativeTargetAuditSchema> }): Promise<FlowProof> {
  const bound = structuredClone(context), snapshot = runtime.getSnapshot(), trace = runtime.getTraceSnapshot(), visual = runtime.getVisualState(), interaction = runtime.getInteraction();
  const viewport = port.viewport(), viewKey = JSON.stringify(viewport), metrics = controls.getMetrics(), recording = JSON.stringify(controls.getRecording());
  if (snapshot.flowId !== 'architecture-review' || runtime.flow.fields.some(field => field.id === 'inspectedNode' && field.sensitive)) throw new Error('Kein öffentlicher lokaler Review.');
  const scene = runtime.getScene(viewport);
  function privacy() {
    const nodes = [...scene, ...(controls.getPresentation()?.nodes ?? []), ...(controls.getRecording()?.source ?? []), ...(controls.getRecording()?.target ?? [])];
    if (nodes.some(node => node.sensitive || node.binding && node.text.length > 0)) throw new Error('Private oder freie Texteingaben verhindern den Originalbildexport.');
  }
  function current() {
    const now = controls.getMetrics();
    if (!port.isCurrent() || runtime.getDiagnostics().disposed || controls.getPresentationMode() !== 'live' || !metrics || !now || metrics.phase === 'transitioning' || now.phase !== metrics.phase || now.progress !== metrics.progress || now.backend !== metrics.backend || runtime.getSnapshot() !== snapshot || runtime.getTraceSnapshot() !== trace || runtime.getVisualState() !== visual || runtime.getInteraction() !== interaction || JSON.stringify(port.viewport()) !== viewKey || JSON.stringify(controls.getRecording()) !== recording) throw new Error('Stand geändert oder Übergang aktiv. Live-Ansicht pausieren/abschließen und erneut aufnehmen.');
    privacy();
  }
  current(); const datasetHash = await proofSha256(JSON.stringify(bound.data)); current();
  const textAudit = await controls.inspectText(); current();
  const inspectedGeometry = JSON.stringify(controls.getPresentation() && qualificationGeometry(controls.getPresentation()!));
  const frame = await controls.captureFrame(); current();
  const presentation = controls.getPresentation(), measured = controls.getMetrics();
  if (!presentation || !measured || measured.frames !== frame.surfaceFrame || frame.progress !== measured.progress || frame.backend !== measured.backend || JSON.stringify(qualificationGeometry(presentation)) !== inspectedGeometry) throw new Error('Bild und gemessene Darstellung stimmen nicht überein.');
  const nativeTargets = port.inspectTargets(presentation, scene); current();
  const bytes = proofImageBytes(frame.image), header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (header.getUint32(16) !== frame.pixelWidth || header.getUint32(20) !== frame.pixelHeight) throw new Error('PNG-Abmessungen stimmen nicht überein.');
  const imageSha256 = await proofSha256(bytes); current();
  if (controls.getPresentation() !== presentation || controls.getMetrics() !== measured) throw new Error('Renderframe während der Bildbindung geändert.');
  const events = new Set(Object.values(runtime.flow.states).flatMap(state => Object.keys(state.on)));
  return FlowProofSchema.parse({ schemaVersion: 1, kind: 'fluid-local-flow-proof', buildId: bound.buildId, capturedAt: frame.capturedAt, appearance: visual.settings.theme, scope: 'single-live-frame-local-review', inputProvenance: 'not-observed-by-exporter',
    dataset: { sha256: datasetHash, capturedAt: bound.data.capturedAt, source: bound.data.source }, module: architectureReviewModule(bound.data, bound.moduleId),
    snapshot: { flowId: snapshot.flowId, state: snapshot.state, inspectedNode: snapshot.fields.inspectedNode, revision: snapshot.revision },
    trace: trace.slice(-1000).map(entry => ({ sequence: entry.sequence, kind: entry.kind, eventType: events.has(entry.eventType) ? entry.eventType : 'redacted-event', revision: entry.revision, state: entry.state, reason: entry.reason ?? null })),
    frame, imageSha256, geometry: qualificationGeometry(presentation), textAudit, nativeTargets,
    limitations: ['Ein Originalbild mit zeitlich gebundener Geometrie; kein Film und kein Performance-Nachweis.', 'Core-Ereignisgründe sind keine Bescheinigung nativer oder vertrauenswürdiger Eingaben.', 'Trace enthält nur registrierte Ereignisnamen und Metadaten, keine Payloads, Details oder freien Felder.', 'PNG-Signatur, Abmessungen und Byte-Digest geprüft; kein vollständiger PNG-Decoder.'],
  });
}
