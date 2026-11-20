import { NativeProofSchema, ProofFieldsSchema, type CapturedFrame, type NativeProof, type NativeTargetAudit, type ProofViewport, type SceneNode, type VisualScenario } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import type { PresentationFrame } from '@fluidkit/effects';
import { qualificationGeometry } from './workspace-qualification';

type Metrics = { backend: 'webgpu' | 'webgl2'; frames: number; phase: 'idle' | 'paused' | 'transitioning'; progress: number };
export type NativeProofPort = {
  runtime: FluidRuntime;
  captureFrame(): Promise<CapturedFrame>;
  getPresentation(): PresentationFrame | null;
  getMetrics(): Metrics | null;
  getRecording(): VisualScenario | null;
  getPresentationMode(): 'live' | 'replay';
  viewport(): ProofViewport;
  inspectTargets(frame: PresentationFrame, scene: SceneNode[]): NativeTargetAudit;
  isCurrent(): boolean;
};
export type NativeProofContext = Pick<NativeProof, 'id' | 'buildId' | 'dataset'>;
const PUBLIC_FIELDS = ProofFieldsSchema.keyof().options;
export async function proofSha256(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : Uint8Array.from(value);
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function proofImageBytes(image: string): Uint8Array {
  const prefix = 'data:image/png;base64,';
  if (!image.startsWith(prefix)) throw new Error('Original-PNG fehlt.');
  const binary = atob(image.slice(prefix.length)), bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  if (bytes.length < 33 || ![137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82].every((value, index) => bytes[index] === value)) throw new Error('Ungültige PNG-Datei.');
  return bytes;
}
function capturedBytes(frame: CapturedFrame) {
  const bytes = proofImageBytes(frame.image), header = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (header.getUint32(16) !== frame.pixelWidth || header.getUint32(20) !== frame.pixelHeight) throw new Error('PNG-Abmessungen und Capture-Metadaten stimmen nicht überein.');
  return bytes;
}
/** Caller can verify downloaded artifacts without any renderer or host mutation. */
export async function validateNativeProof(input: unknown): Promise<NativeProof> {
  const proof = NativeProofSchema.parse(input);
  if (await proofSha256(capturedBytes(proof.frame)) !== proof.imageSha256) throw new Error('Originalbild und Digest stimmen nicht überein.');
  return proof;
}
/** Original pixels are never relabelled as redacted: refuse unsafe captures. */
function assertCapturePrivacy(nodes: SceneNode[], allowed: Set<string>) {
  if (nodes.some(node => node.sensitive || node.binding && !allowed.has(node.binding) && node.text.length > 0)) throw new Error('Suchtext, Notizen oder private Inhalte verhindern die Bildaufnahme. Eingabe bewusst leeren und den Übergang abschließen.');
}
export async function captureNativeProof(port: NativeProofPort, context: NativeProofContext): Promise<NativeProof> {
  const { runtime } = port, boundContext = structuredClone(context);
  const snapshot = runtime.getSnapshot(), trace = runtime.getTraceSnapshot(), interaction = runtime.getInteraction(), visual = runtime.getVisualState();
  const view = port.viewport(), viewKey = JSON.stringify(view);
  const metricsBefore = port.getMetrics();
  if (port.getPresentationMode() !== 'live') throw new Error('Für einen Bediennachweis zuerst zur Live-Ansicht zurückkehren.');
  if (!port.isCurrent() || !metricsBefore || metricsBefore.phase === 'transitioning') throw new Error('Übergang zuerst pausieren oder abschließen.');
  const allowed = new Set<string>(PUBLIC_FIELDS);
  if (runtime.flow.fields.some(field => allowed.has(field.id) && field.sensitive)) throw new Error('Private Felder dürfen nicht als öffentliche Workspacewerte exportiert werden.');
  const fields = ProofFieldsSchema.parse(Object.fromEntries(PUBLIC_FIELDS.map(id => [id, snapshot.fields[id]])));
  const scene = runtime.getScene({ width: view.surface.width, height: view.surface.height }), recording = port.getRecording();
  assertCapturePrivacy([...scene, ...(recording?.source ?? []), ...(recording?.target ?? []), ...(port.getPresentation()?.nodes ?? [])], allowed);
  const recordingKey = JSON.stringify(recording);
  function unchanged() {
    if (!port.isCurrent() || port.getPresentationMode() !== 'live' || runtime.getDiagnostics().disposed || runtime.getSnapshot() !== snapshot || runtime.getTraceSnapshot() !== trace || runtime.getInteraction() !== interaction || runtime.getVisualState() !== visual || JSON.stringify(port.viewport()) !== viewKey || JSON.stringify(port.getRecording()) !== recordingKey) throw new Error('Stand während der Aufnahme geändert. Bitte erneut exportieren.');
  }
  const frame = await port.captureFrame();
  unchanged();
  const presented = port.getPresentation(), metrics = port.getMetrics();
  if (!presented || !metrics || metrics.phase === 'transitioning' || metrics.phase !== metricsBefore.phase || metrics.progress !== metricsBefore.progress || metrics.backend !== metricsBefore.backend || metrics.frames !== frame.surfaceFrame || metrics.progress !== frame.progress || metrics.backend !== frame.backend) throw new Error('Bild und aktueller Renderframe stimmen nicht überein.');
  assertCapturePrivacy(presented.nodes, allowed);
  const targets = port.inspectTargets(presented, scene);
  unchanged();
  if (port.getPresentation() !== presented || port.getMetrics() !== metrics) throw new Error('Darstellung während der Geometriemessung geändert.');
  const registeredEvents = new Set([...Object.values(runtime.flow.states).flatMap(state => Object.keys(state.on)), 'field.change', 'collection.change', 'navigation.restore', 'visual.policy.change', 'transaction.local']);
  const plan = recording?.plan;
  const proof = NativeProofSchema.parse({
    ...boundContext, schemaVersion: 2, kind: 'fluid-native-workspace-proof', capturedAt: frame.capturedAt,
    scope: 'single-bound-canvas-frame', inputProvenance: 'not-observed-by-exporter', viewport: view, appearance: visual.settings.theme,
    snapshot: { flowId: snapshot.flowId, state: snapshot.state, revision: snapshot.revision, mode: snapshot.mode, fields, redactedFieldIds: Object.keys(snapshot.fields).filter(id => !allowed.has(id)) },
    trace: trace.slice(-1000).map(entry => ({ sequence: entry.sequence, timestamp: entry.timestamp, kind: entry.kind, eventType: registeredEvents.has(entry.eventType) ? entry.eventType : 'redacted-event', revision: entry.revision, state: entry.state, applicationReportedReason: entry.reason ?? null })),
    traceCoverage: 'latest-at-most-1000-no-payloads-or-details', frame, imageSha256: await proofSha256(capturedBytes(frame)),
    metrics: { backend: metrics.backend, frames: metrics.frames, phase: metrics.phase, progress: metrics.progress },
    geometry: qualificationGeometry(presented), currentParts: scene.map(node => ({ id: node.id, ...node.anatomy, checked: node.anatomy.behavior === 'checkbox' ? Boolean(node.checked) : null })),
    nativeTargets: targets,
    effect: { id: plan?.selected?.id ?? null, seed: plan?.seed ?? null, sourceState: plan?.sourceState ?? null, targetState: plan?.targetState ?? null, targetRevision: plan?.targetRevision ?? null },
    redaction: 'free-input-pixels-blocked-fields-allowlisted-trace-metadata-only',
    limitations: ['Ein bewusst aufgenommenes Canvasbild; kein Film und keine Frametimingmessung.', 'Eingabeherkunft wird nicht durch den Export beobachtet. Core-reason ist kein isTrusted-Nachweis.', 'Trace enthält höchstens1000 Metadateneinträge ohne Payloads, Details, Rohtext oder Prompts.', 'Nichtleere freie Texteingaben verhindern den Originalbildexport; es findet keine Pixelretusche statt.', 'PNG-Signatur, IHDR-Abmessungen und Byte-Digest geprüft; kein vollständiger PNG-Decoder oder CRC-Prüfer.'],
  });
  unchanged();
  // Hashing may yield; do not bind the old picture to a later presentation.
  if (port.getPresentation() !== presented || port.getMetrics() !== metrics) throw new Error('Darstellung während der Bildbindung geändert.');
  return proof;
}
