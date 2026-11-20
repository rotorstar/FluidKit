import { AIReviewFrameSchema } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import type { WorkspaceData } from '@fluidkit/cases';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import { proofImageBytes, proofSha256 } from '@fluidkit/testing/proof-capture';
export async function captureRehearsalFrame(input: { runtime: FluidRuntime; controls: Pick<SurfacePlaybackControls, 'getPresentationMode' | 'pause' | 'getMetrics' | 'getRecording' | 'getPresentation' | 'inspectText' | 'captureFrame'>; data: WorkspaceData; buildId: string; runId: string; beatId: string | null; viewport(): { width: number; height: number }; isCurrent(): boolean }) {
  const { runtime, controls } = input;
  if (controls.getPresentationMode() !== 'live') throw new Error('Replay ist keine Live-Aufnahme. Bitte zuerst zur Live-Ansicht zurückkehren.');
  controls.pause();
  const snapshot = runtime.getSnapshot(), visual = runtime.getVisualState(), interaction = runtime.getInteraction(), trace = runtime.getTraceSnapshot();
  const metrics = controls.getMetrics(), view = input.viewport(), recording = JSON.stringify(controls.getRecording());
  const geometry = JSON.stringify(controls.getPresentation());
  if (!metrics || metrics.phase === 'transitioning' || !controls.getPresentation()) throw new Error('Surface ist noch nicht bereit.');
  const forbidden = [...runtime.getScene(view), ...(controls.getRecording()?.source ?? []), ...(controls.getRecording()?.target ?? []), ...(controls.getPresentation()?.nodes ?? [])].some(node => node.sensitive || Boolean(node.binding && node.text));
  if (forbidden) throw new Error('Private oder eingegebene Texte verhindern die Aufnahme. Eingabe bewusst leeren und Übergang abschließen.');
  function unchanged() {
    const current = controls.getMetrics();
    if (!input.isCurrent() || runtime.getDiagnostics().disposed || controls.getPresentationMode() !== 'live' || runtime.getSnapshot() !== snapshot || runtime.getVisualState() !== visual || runtime.getInteraction() !== interaction || runtime.getTraceSnapshot() !== trace || JSON.stringify(input.viewport()) !== JSON.stringify(view) || JSON.stringify(controls.getRecording()) !== recording || JSON.stringify(controls.getPresentation()) !== geometry || !current || current.progress !== metrics!.progress || current.phase !== metrics!.phase || current.backend !== metrics!.backend) throw new Error('Zustand, Darstellung oder Viewport während der Aufnahme geändert. Bild verworfen.');
  }
  const text = await controls.inspectText(); unchanged();
  const auditSurfaceFrame = controls.getMetrics()!.frames;
  const frame = await controls.captureFrame(); unchanged();
  if (frame.surfaceFrame !== controls.getMetrics()!.frames || frame.progress !== metrics.progress || frame.backend !== metrics.backend || text.progress !== frame.progress || text.backend !== frame.backend || text.viewport.width !== view.width || text.viewport.height !== view.height || frame.viewport.width !== view.width || frame.viewport.height !== view.height) throw new Error('Bild und geprüfte Präsentation stimmen nicht überein.');
  const { capturedAt: _time, ...contents } = input.data; void _time;
  const [datasetHash, imageSha256] = await Promise.all([proofSha256(JSON.stringify(contents)), proofSha256(proofImageBytes(frame.image))]); unchanged();
  if (controls.getMetrics()!.frames !== frame.surfaceFrame) throw new Error('Renderframe während der Hashbindung geändert.');
  return { text, frame: AIReviewFrameSchema.parse({ ...frame, buildId: input.buildId, revision: snapshot.revision, state: snapshot.state, beatId: input.beatId,
    binding: { runId: input.runId, presentation: 'live', datasetHash, imageSha256, visualRevision: visual.revision, traceSequence: trace.at(-1)?.sequence ?? 0, auditSurfaceFrame, auditBinding: 'stable-paused-presentation' } }) };
}
