import {
  CapturedFrameSchema, SEQUENCE_LIMITS, SequenceGeometrySchema, SequenceReportSchema, TextAuditSchema, VisualScenarioSchema,
  EffectRuntimeMetricsSchema, EffectStressReportSchema, NaturalPlaybackReportSchema, ResourceSnapshotSchema, VisualRetargetReportSchema, MOTION_LIMITS,
  type CapturedFrame, type QualityFinding, type SequenceGeometry, type SequenceReport, type SequenceSample, type TextAudit, type VisualScenario,
  type EffectRuntimeMetrics, type EffectStressReport, type NaturalPlaybackReport, type ResourceSnapshot, type VisualRetargetReport,
} from '@fluidkit/contracts';
import type { PresentationFrame } from '@fluidkit/effects';
import { capturePresentationCheckpoint, normalizeVisualScenario, createTransitionClip, recordTransitionClip } from '@fluidkit/effects';
import { measuredCheck, openCheck, textAuditCheck } from './quality';

export type SequenceCaptureAdapter = {
  replay(): void; seek(progress: number): void;
  captureFrame(): Promise<CapturedFrame>; inspectText(): Promise<TextAudit>;
  getRecording(): VisualScenario | null; getPresentation(): PresentationFrame | null;
  getMetrics?(): EffectRuntimeMetrics | null; getResources?(): ResourceSnapshot;
};
function metricsOf(value: EffectRuntimeMetrics | null): EffectRuntimeMetrics | null {
  if (!value) return null;
  const { backend, frames, lastFrameMs, phase, progress, textBytes, effectResources, qualityProfile } = value;
  return EffectRuntimeMetricsSchema.parse({ backend, frames, lastFrameMs, phase, progress, textBytes, effectResources, qualityProfile });
}

export function sequenceTimes(durationMs: number): number[] {
  if (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > SEQUENCE_LIMITS.maximumDurationMs) throw new Error('Die Sequenz muss zwischen 0 und 3000 ms liegen.');
  const intervals = Math.ceil(durationMs * SEQUENCE_LIMITS.sampleRate / 1000);
  return Array.from({ length: intervals + 1 }, (_, index) => Math.min(durationMs, index * 1000 / SEQUENCE_LIMITS.sampleRate));
}

function abortable<T>(operation: Promise<T>, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    let finished = false;
    const cleanup = () => { clearTimeout(timeout); signal?.removeEventListener('abort', aborted); };
    const fail = (error: unknown) => { if (!finished) { finished = true; cleanup(); reject(error); } };
    const aborted = () => fail(new Error('Sequenzprüfung abgebrochen.'));
    const timeout = setTimeout(() => fail(new Error('Kein bestätigtes Prüfergebnis innerhalb von 3 Sekunden.')), 3000);
    signal?.addEventListener('abort', aborted, { once: true });
    if (signal?.aborted) aborted();
    operation.then(value => { if (!finished) { finished = true; cleanup(); resolve(value); } }, fail);
  });
}
function geometryOf(frame: PresentationFrame): SequenceGeometry {
  return SequenceGeometrySchema.parse({
    progress: frame.progress,
    nodes: frame.nodes.map(({ id, x, y, width, height, rotation, opacity }) => ({ id, x, y, width, height, rotation, opacity })),
    lensPresent: frame.lens !== null, particleCount: frame.particles.length,
    shadowCount: frame.nodeStates.filter(state => state.shadow.opacity > 0.0001).length,
  });
}

/** Slow deterministic sampling is deliberately distinct from natural-speed video or frame pacing. */
export async function captureSequence(adapter: SequenceCaptureAdapter, options: {
  context: SequenceReport['context']; getRevision: () => number; initialProgress: number; signal?: AbortSignal;
  onProgress?: (captured: number, expected: number) => void;
}): Promise<SequenceReport> {
  const samples: SequenceSample[] = [], issues: string[] = [], findings: QualityFinding[] = [];
  let recording: VisualScenario | null = null, fingerprint = '', expectedTimesMs: number[] = [], imageBytes = 0;
  let reference: CapturedFrame | undefined;
  const current = () => { try { return options.getRevision() === options.context.revision && JSON.stringify(adapter.getRecording()) === fingerprint; } catch { return false; } };
  const checkCurrent = () => {
    if (options.signal?.aborted) throw new Error('Sequenzprüfung abgebrochen.');
    if (!current()) throw new Error('Run oder Fachrevision hat sich während der Prüfung geändert.');
  };
  try {
    const source = adapter.getRecording();
    if (!source) throw new Error('Zuerst einen Übergang ausführen.');
    const candidate = VisualScenarioSchema.parse(source);
    if (candidate.redacted || [...candidate.source, ...candidate.target].some(node => node.sensitive)) throw new Error('Sensible oder redigierte Inhalte: Sequenzaufnahme nicht freigegeben.');
    recording = candidate;
    fingerprint = JSON.stringify(source);
    expectedTimesMs = sequenceTimes(recording.durationMs);
    checkCurrent(); adapter.replay();
    for (const [index, logicalTimeMs] of expectedTimesMs.entries()) {
      checkCurrent();
      const progress = recording.durationMs > 0 ? logicalTimeMs / recording.durationMs : 1;
      adapter.seek(progress);
      const frame = CapturedFrameSchema.parse(await abortable(adapter.captureFrame(), options.signal));
      checkCurrent();
      const textAudit = TextAuditSchema.parse(await abortable(adapter.inspectText(), options.signal));
      checkCurrent();
      const presented = adapter.getPresentation();
      if (!presented) throw new Error('Kein zuordenbarer Präsentationsframe.');
      const geometry = geometryOf(presented);
      if ([frame.progress, textAudit.progress, geometry.progress].some(value => Math.abs(value - progress) > 0.0001)) throw new Error(`Frame ${index}: Bild, Text und Präsentation gehören nicht zum angeforderten Zeitpunkt.`);
      if (textAudit.backend !== frame.backend || Math.abs(textAudit.viewport.width - frame.viewport.width) > .1 || Math.abs(textAudit.viewport.height - frame.viewport.height) > .1) throw new Error(`Frame ${index}: Textaudit passt nicht zum erfassten Bild.`);
      if (reference && (frame.backend !== reference.backend || frame.pixelWidth !== reference.pixelWidth || frame.pixelHeight !== reference.pixelHeight || JSON.stringify(frame.viewport) !== JSON.stringify(reference.viewport))) throw new Error(`Frame ${index}: Backend oder Viewport hat sich geändert.`);
      if (samples.some(sample => sample.frame.id === frame.id) || (samples.at(-1)?.frame.surfaceFrame ?? 0) >= frame.surfaceFrame) throw new Error(`Frame ${index}: Wiederholte oder rückläufige Renderzuordnung.`);
      if (imageBytes + frame.image.length > SEQUENCE_LIMITS.maximumImageBytes) throw new Error('Das Bildbudget von 64 MiB ist erreicht; die Sequenz ist unvollständig.');
      reference ??= frame;
      const metrics = metricsOf(adapter.getMetrics?.() ?? null), resources = adapter.getResources ? ResourceSnapshotSchema.parse(adapter.getResources()) : null;
      if (metrics && (metrics.backend !== frame.backend || Math.abs(metrics.progress - progress) > .0001)) throw new Error(`Frame ${index}: Runtime-Metriken sind nicht synchron.`);
      imageBytes += frame.image.length;
      samples.push({ index, logicalTimeMs, frame, textAudit, geometry, metrics, resources });
      options.onProgress?.(samples.length, expectedTimesMs.length);
    }
  } catch (error) { issues.push(error instanceof Error ? error.message : 'Sequenzprüfung fehlgeschlagen.'); }
  finally {
    // Stay in read-only replay. Never replace a newer user run or domain revision.
    if (recording && fingerprint && current()) {
      try { adapter.seek(Math.max(0, Math.min(1, options.initialProgress))); }
      catch (error) { issues.push(`Wiedergabeposition konnte nicht wiederhergestellt werden: ${error instanceof Error ? error.message : 'unbekannter Fehler'}`); }
    }
  }
  const complete = expectedTimesMs.length > 0 && samples.length === expectedTimesMs.length && issues.length === 0;
  const textFindings = samples.flatMap(sample => textAuditCheck(sample.textAudit).findings.map(finding => ({ ...finding, message: `Frame ${sample.index} (${sample.logicalTimeMs.toFixed(1)} ms): ${finding.message}` })));
  for (let index = 1; index < samples.length; index++) {
    const previous = samples[index - 1]!, sample = samples[index]!;
    const before = new Map(previous.geometry.nodes.map(node => [node.id, node]));
    const threshold = Math.max(48, Math.hypot(recording?.viewport.width ?? sample.frame.viewport.width, recording?.viewport.height ?? sample.frame.viewport.height) * .2);
    for (const node of sample.geometry.nodes) {
      const a = before.get(node.id);
      if (!a || a.opacity < .01 || node.opacity < .01) continue;
      if (Math.hypot(node.x + node.width / 2 - a.x - a.width / 2, node.y + node.height / 2 - a.y - a.height / 2) > threshold) findings.push({ rule: 'geometry-step-diagnostic', severity: 'warning', message: `Frame ${index}: ${node.id} bewegt sich stärker als die gewählte Diagnosegrenze von ${threshold.toFixed(1)} px. Im Bild prüfen.`, target: { nodes: [node.id] } });
    }
  }
  const endpointFindings: QualityFinding[] = [], sourceFindings: QualityFinding[] = [];
  function checkGeometry(actual: SequenceGeometry, expected: VisualScenario['target'], targetFindings: QualityFinding[], label: string) {
    const nodes = new Map(actual.nodes.map(node => [node.id, node])), ids = new Set(expected.map(node => node.id));
    for (const target of expected) {
      const node = nodes.get(target.id);
      if (!node || (['x', 'y', 'width', 'height', 'rotation', 'opacity'] as const).some(key => Math.abs(node[key] - target[key]) > .01)) targetFindings.push({ rule: 'exact-endpoint', severity: 'error', message: `${label} von ${target.id} stimmt nicht mit der aufgezeichneten Geometrie überein.`, target: { nodes: [target.id] } });
    }
    if (actual.nodes.some(node => !ids.has(node.id) && node.opacity > .01)) targetFindings.push({ rule: 'unexpected-visible-node', severity: 'error', message: `${label}: Ein zusätzlicher Node ist sichtbar.`, target: { nodes: ['surface'] } });
  }
  if (complete && recording) {
    const last = samples.at(-1)!.geometry;
    if (recording.durationMs > 0) checkGeometry(samples[0]!.geometry, recording.source, sourceFindings, 'Quellzustand');
    checkGeometry(last, recording.target, endpointFindings, 'Zielzustand');
    if (last.lensPresent || last.particleCount || last.shadowCount) endpointFindings.push({ rule: 'effect-residual', severity: 'error', message: 'Am Endpunkt sind Effektressourcen sichtbar.', target: { nodes: ['surface'] } });
  }
  const checks = [
    complete ? measuredCheck('sequence-coverage', 'visual', 'Vollständiges deterministisches 60-Hz-Raster', samples.length, []) : openCheck('sequence-coverage', 'visual', 'Vollständiges deterministisches 60-Hz-Raster', issues.join(' ') || 'Nicht alle geplanten Samples vorhanden.'),
    measuredCheck('sequence-text', 'gpu', 'Textprüfung aller erfassten Samples', samples.length, textFindings),
    measuredCheck('sequence-geometry', 'visual', 'Benachbarte Geometrie: diagnostische Sprünge', Math.max(0, samples.length - 1), findings),
    complete && recording && recording.durationMs > 0 ? measuredCheck('sequence-source', 'visual', 'Exakter aufgezeichneter Quellzustand', 1, sourceFindings) : openCheck('sequence-source', 'visual', 'Exakter aufgezeichneter Quellzustand', 'Kein separater vollständiger Anfangsframe bestätigt.'),
    complete ? measuredCheck('sequence-endpoint', 'visual', 'Exakter Zielzustand ohne Effektreste', 1, endpointFindings) : openCheck('sequence-endpoint', 'visual', 'Exakter Zielzustand ohne Effektreste', 'Vollständiger Endpunkt wurde nicht bestätigt.'),
  ];
  const failed = checks.some(check => check.status === 'failed');
  return SequenceReportSchema.parse({ schemaVersion: 1, id: `sequence-${Date.now()}`, generatedAt: new Date().toISOString(), context: options.context,
    method: 'deterministic-60hz-sampling', coverage: complete ? 'complete' : 'incomplete', result: !complete || checks.some(check => check.status === 'not-checked') ? 'inconclusive' : failed ? 'failed' : 'passed',
    recording, expectedTimesMs, samples, imageBytes, checks, issues,
    openChecks: ['native-frame-pacing', 'temporal-pixel-detection', 'independent-human-review', 'retargeting-journey', 'cross-device-qualification'],
  });
}

export type EffectDiagnosticAdapter = SequenceCaptureAdapter & {
  getMetrics(): EffectRuntimeMetrics | null; getResources(): ResourceSnapshot; getFrameTimings(): number[]; play(): void; pause(): void;
};
type DiagnosticOptions = {
  context: SequenceReport['context']; getRevision: () => number; initialProgress: number;
  signal?: AbortSignal; isVisible: () => boolean; onProgress?: (completed: number, requested: number) => void;
};
function diagnosticSession(adapter: EffectDiagnosticAdapter, options: DiagnosticOptions) {
  const original = adapter.getRecording();
  if (!original) throw new Error('Zuerst einen Übergang ausführen.');
  const recording = VisualScenarioSchema.parse(original);
  if (recording.redacted || [...recording.source, ...recording.target].some(node => node.sensitive)) throw new Error('Sensible oder redigierte Inhalte: Diagnose nicht freigegeben.');
  if (recording.durationMs <= 0 || recording.durationMs > 3000) throw new Error('Die Diagnose benötigt einen Übergang zwischen 1 und 3000 ms.');
  const fingerprint = JSON.stringify(original);
  const sameRun = () => { try { return options.getRevision() === options.context.revision && JSON.stringify(adapter.getRecording()) === fingerprint; } catch { return false; } };
  return { recording, sameRun,
    validate() {
      if (options.signal?.aborted) throw new Error('Diagnose abgebrochen.');
      if (!options.isVisible()) throw new Error('Diagnose benötigt einen sichtbaren Tab.');
      if (!sameRun()) throw new Error('Run oder Fachrevision wurde während der Diagnose geändert.');
    },
    restore() { if (sameRun()) { adapter.pause(); adapter.seek(Math.max(0, Math.min(1, options.initialProgress))); } },
  };
}
async function sampleDiagnostic(adapter: EffectDiagnosticAdapter, session: ReturnType<typeof diagnosticSession>, progress: number, signal?: AbortSignal) {
  session.validate(); adapter.seek(progress); await abortable(adapter.inspectText(), signal); session.validate();
  const metrics = metricsOf(adapter.getMetrics());
  if (!metrics || Math.abs(metrics.progress - progress) > .0001) throw new Error('Angeforderte Diagnosephase wurde nicht bestätigt.');
  return metrics;
}

/** Reuses one surface; this is deliberately not a mount/unmount or process-memory proof. */
export async function stressEffect(adapter: EffectDiagnosticAdapter, options: DiagnosticOptions): Promise<EffectStressReport> {
  const samples: EffectStressReport['samples'] = [], issues: string[] = [];
  let session: ReturnType<typeof diagnosticSession> | null = null, failed = false;
  try {
    session = diagnosticSession(adapter, options);
    for (let cycle = 1; cycle <= 100; cycle++) {
      session.validate(); adapter.replay();
      const midpoint = await sampleDiagnostic(adapter, session, .5, options.signal);
      const endpoint = await sampleDiagnostic(adapter, session, 1, options.signal);
      const resources = ResourceSnapshotSchema.parse(adapter.getResources());
      samples.push({ cycle, midpoint, endpoint, resources });
      if (!endpoint.effectResources) throw new Error('Ressourcenmetriken des Effekts fehlen.');
      if (endpoint.effectResources.renderTargets || endpoint.effectResources.targetBytes || endpoint.effectResources.particles || endpoint.effectResources.particleDrawCalls || resources.disposalErrors.length) { failed = true; issues.push(`Zyklus ${cycle}: Effektressourcen bleiben am Endpunkt oder Disposal meldet Fehler.`); }
      const baseline = samples[4];
      if (cycle > 5 && baseline) {
        const growth = Object.entries(resources.live).some(([key, count]) => count > Math.floor((baseline.resources.live[key as keyof typeof resources.live] ?? 0) * 1.05));
        if (growth || resources.owners !== baseline.resources.owners || endpoint.textBytes > baseline.endpoint.textBytes * 1.05) { failed = true; issues.push(`Zyklus ${cycle}: Verwaltete Ressourcen verlassen das Plateau nach fünf Aufwärmzyklen.`); }
      }
      options.onProgress?.(cycle, 100);
      if (failed) break;
    }
  } catch (error) { issues.push(error instanceof Error ? error.message : 'Effekt-Stresstest fehlgeschlagen.'); }
  finally { try { session?.restore(); } catch (error) { issues.push(`Wiedergabe nicht wiederhergestellt: ${String(error)}`); } }
  return EffectStressReportSchema.parse({ schemaVersion: 1, id: `effect-stress-${Date.now()}`, generatedAt: new Date().toISOString(), context: options.context,
    scope: 'owned-resources-on-one-surface', requestedCycles: 100, warmupCycles: 5, recording: session?.recording ?? null, samples,
    result: failed ? 'failed' : samples.length === 100 && !issues.length ? 'passed' : 'inconclusive', issues,
    limitations: ['Eine Surface mit 100 Replay-Zyklen; kein Mount-/Unmount-Nachweis.', 'Gemessen werden verwaltete Ressourcen und Glyph-Bytes; kein Treiber- oder Prozessspeicher.', 'Kein Frame-Pacing- oder geräteübergreifender Performance-Nachweis.'] });
}

/** Measures intervals from the actual renderer scheduler with no per-frame image readback. */
export async function measureEffectPlayback(adapter: EffectDiagnosticAdapter, options: DiagnosticOptions): Promise<NaturalPlaybackReport> {
  let session: ReturnType<typeof diagnosticSession> | null = null, endpointReached = false;
  let intervalsMs: number[] = [], backend: NaturalPlaybackReport['backend'] = null;
  const issues: string[] = [];
  try {
    session = diagnosticSession(adapter, options); session.validate(); adapter.replay();
    await sampleDiagnostic(adapter, session, .5, options.signal); await sampleDiagnostic(adapter, session, 1, options.signal);
    const previousFrame = adapter.getMetrics()?.frames ?? -1;
    adapter.replay(); adapter.play();
    const started = performance.now(), deadline = session.recording.durationMs + 3000;
    while (performance.now() - started <= deadline) {
      session.validate();
      await abortable(new Promise<void>(resolve => setTimeout(resolve, 20)), options.signal);
      const metrics = metricsOf(adapter.getMetrics());
      if (metrics && metrics.frames > previousFrame && metrics.progress === 1 && metrics.phase === 'idle') { endpointReached = true; backend = metrics.backend; break; }
    }
    session.validate();
    if (!endpointReached) throw new Error('Natürliches Ende wurde vor der Deadline nicht bestätigt.');
    intervalsMs = adapter.getFrameTimings();
    if (intervalsMs.length < 2 || intervalsMs.length > 2000 || intervalsMs.some(value => !Number.isFinite(value) || value <= 0)) { intervalsMs = []; throw new Error('Keine ausreichenden gültigen Renderintervalle vorhanden.'); }
  } catch (error) { issues.push(error instanceof Error ? error.message : 'Wiedergabemessung fehlgeschlagen.'); }
  finally { try { session?.restore(); } catch (error) { issues.push(`Wiedergabe nicht wiederhergestellt: ${String(error)}`); } }
  const sorted = [...intervalsMs].sort((a, b) => a - b), percentile = (fraction: number) => sorted.length ? sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)]! : null;
  return NaturalPlaybackReportSchema.parse({ schemaVersion: 1, id: `effect-pacing-${Date.now()}`, generatedAt: new Date().toISOString(), context: options.context,
    scope: 'warmed-render-scheduler-intervals', recording: session?.recording ?? null, backend, intervalsMs, p50Ms: percentile(.5), p95Ms: percentile(.95),
    maxMs: sorted.at(-1) ?? null, longFramesOver50Ms: intervalsMs.filter(interval => interval > 50).length, endpointReached,
    startupIntervalOmitted: true, result: endpointReached && intervalsMs.length >= 2 && !issues.length ? 'measured' : 'inconclusive', issues,
    limitations: ['Zeitabstände der tatsächlichen Render-Scheduler-Aufrufe nach Aufwärmen; keine GPU-Timestamps.', 'Keine Screenshot-Aufnahme während der Messung.', 'Ein lokales Browser-/Geräteprofil; keine hochgerechnete FPS- oder Produktfreigabe.'] });
}

export type VisualRetargetAdapter = EffectDiagnosticAdapter & { importRecording(input: unknown): void };
function sameVisualFrame(before: PresentationFrame, after: PresentationFrame) {
  const afterNodes = new Map(after.nodes.map(node => [node.id, node])), afterStates = new Map(after.nodeStates.map(state => [state.id, state]));
  for (const node of before.nodes) {
    const current = afterNodes.get(node.id);
    if (!current) return false;
    for (const key of ['x', 'y', 'width', 'height', 'rotation', 'radius', 'opacity', 'fontSize', 'textInset', 'textInsetY', 'textLines', 'layer'] as const) {
      const a = current[key], b = node[key];
      if (a === undefined || b === undefined) { if (a !== b) return false; }
      else if (Math.abs(a - b) > 1e-6) return false;
    }
    for (const key of ['text', 'color', 'foreground'] as const) if (current[key] !== node[key]) return false;
  }
  const beforeIds = new Set(before.nodes.map(node => node.id));
  if (after.nodes.some(node => !beforeIds.has(node.id) && node.opacity > .001)) return false;
  for (const state of before.nodeStates) {
    const current = afterStates.get(state.id);
    if (!current || current.panelOpacity !== state.panelOpacity || current.textOpacity !== state.textOpacity || JSON.stringify(current.shader) !== JSON.stringify(state.shader) || JSON.stringify(current.shadow) !== JSON.stringify(state.shadow)) return false;
  }
  return JSON.stringify(before.lens) === JSON.stringify(after.lens) && JSON.stringify(before.particles) === JSON.stringify(after.particles)
    && JSON.stringify(before.couplings ?? []) === JSON.stringify(after.couplings ?? []);
}

/** Imports declarative visual recordings only. No runtime event or domain action is executed. */
export async function stressVisualRetargeting(adapter: VisualRetargetAdapter, options: DiagnosticOptions): Promise<VisualRetargetReport> {
  const samples: VisualRetargetReport['samples'] = [], issues: string[] = [];
  const baselines = new Map<string, VisualRetargetReport['samples'][number]>();
  let original: VisualScenario | null = null, ownedFingerprint = '', failed = false;
  let settled: EffectRuntimeMetrics | null = null, restoration: VisualRetargetReport['restoration'] = 'not-started';
  const stillOwned = () => { try { return options.getRevision() === options.context.revision && JSON.stringify(adapter.getRecording()) === ownedFingerprint; } catch { return false; } };
  const validate = () => {
    if (options.signal?.aborted) throw new Error('Visueller Retargeting-Test abgebrochen.');
    if (!options.isVisible()) throw new Error('Visueller Retargeting-Test benötigt einen sichtbaren Tab.');
    if (!stillOwned()) throw new Error('Neuerer Run oder Fachrevision: Test beendet, ohne den Nutzerzustand zu überschreiben.');
  };
  async function sample(progress: number) {
    validate(); adapter.seek(progress); await abortable(adapter.inspectText(), options.signal); validate();
    const frame = adapter.getPresentation(), metrics = metricsOf(adapter.getMetrics());
    if (!frame || !metrics || Math.abs(frame.progress - progress) > .0001 || Math.abs(metrics.progress - progress) > .0001) throw new Error('Retargeting-Frame ist nicht dem angeforderten Zeitpunkt zugeordnet.');
    return { frame, metrics };
  }
  try {
    const initial = diagnosticSession(adapter, options);
    initial.validate(); original = initial.recording; ownedFingerprint = JSON.stringify(adapter.getRecording());
    const baseline = normalizeVisualScenario(original);
    adapter.replay();
    for (let cycle = 1; cycle <= 100; cycle++) {
      const phase = ([.25, .5, .75] as const)[(cycle - 1) % 3]!;
      const target = cycle % 2 ? 'source' : 'target';
      const { frame } = await sample(phase), destination = baseline[target];
      const union = new Set([...frame.nodes, ...destination].map(node => node.id));
      const modern = baseline.schemaVersion !== 3 && baseline.motionVersion === 2;
      if (union.size > (modern ? MOTION_LIMITS.presentedNodes : 2048) || frame.nodes.length > (modern ? MOTION_LIMITS.presentedNodes : 1000) || destination.length > (modern ? MOTION_LIMITS.sceneNodes : 1000)) throw new Error('Nodebudget der aufgezeichneten Version überschritten.');
      if (frame.nodes.some(node => node.sensitive)) throw new Error('Sensibler Präsentationsinhalt: Retargeting-Import verweigert.');
      const next = recordTransitionClip(createTransitionClip({ source: frame.nodes, target: destination, sourceCheckpoint: capturePresentationCheckpoint(frame),
        plan: baseline.plan ? { ...baseline.plan, presentation: undefined } : null, durationMs: baseline.durationMs, viewport: baseline.viewport,
        languageProfile: baseline.schemaVersion === 5 ? baseline.languageProfile : undefined,
        protectedNodeIds: baseline.protectedNodeIds, motionVersion: modern ? 2 : 1 }), baseline.caseId, baseline.redacted);
      validate(); adapter.importRecording(next);
      const imported = adapter.getRecording();
      if (!imported || JSON.stringify(imported.source) !== JSON.stringify(next.source) || JSON.stringify(imported.target) !== JSON.stringify(next.target)
        || JSON.stringify(imported.plan?.selected ?? null) !== JSON.stringify(next.plan?.selected ?? null) || imported.plan?.seed !== next.plan?.seed) throw new Error('Eigener visueller Import wurde nicht unverändert bestätigt.');
      ownedFingerprint = JSON.stringify(imported);
      const resumed = await sample(0), continuous = sameVisualFrame(frame, resumed.frame);
      const resources = ResourceSnapshotSchema.parse(adapter.getResources());
      const entry: VisualRetargetReport['samples'][number] = { cycle, phase, target, sourceNodes: frame.nodes.length, continuous, metrics: resumed.metrics, resources };
      samples.push(entry);
      if (!continuous) { failed = true; issues.push(`Zyklus ${cycle}: Geometrie, Text oder Effektkanäle springen am übernommenen Quellbild.`); }
      if (resources.disposalErrors.length) { failed = true; issues.push(`Zyklus ${cycle}: Fehler beim Freigeben verwalteter Ressourcen.`); }
      const key = `${phase}:${target}`, prior = baselines.get(key);
      if (cycle <= 12) baselines.set(key, entry);
      else if (prior && (resources.owners !== prior.resources.owners || Object.entries(resources.live).some(([kind, count]) => count > Math.floor((prior.resources.live[kind as keyof typeof resources.live] ?? 0) * 1.05)) || resumed.metrics.textBytes > prior.metrics.textBytes * 1.05)) {
        failed = true; issues.push(`Zyklus ${cycle}: Das Plateau für Phase ${phase} und Ziel ${target} wächst nach zwölf Aufwärmzyklen.`);
      }
      options.onProgress?.(cycle, 100);
      if (failed) break;
    }
    if (samples.length === 100 && !failed) {
      settled = (await sample(1)).metrics;
      const resources = settled.effectResources;
      if (!resources) throw new Error('Endpunkt-Ressourcenmetriken fehlen.');
      if (resources.renderTargets || resources.targetBytes || resources.particles || resources.particleDrawCalls || resources.couplingDrawCalls || resources.couplingGroups || resources.couplingPieces) { failed = true; issues.push('Am endgültigen Ziel verbleiben Effektressourcen.'); }
    }
  } catch (error) { issues.push(error instanceof Error ? error.message : 'Visueller Retargeting-Test fehlgeschlagen.'); }
  finally {
    if (original && ownedFingerprint) {
      if (stillOwned()) {
        try { adapter.importRecording(original); adapter.seek(Math.max(0, Math.min(1, options.initialProgress))); restoration = 'restored'; }
        catch (error) { restoration = 'failed'; issues.push(`Original-Run konnte nicht wiederhergestellt werden: ${String(error)}`); }
      } else restoration = 'skipped-newer-run';
    }
  }
  return VisualRetargetReportSchema.parse({ schemaVersion: 1, id: `visual-retarget-${Date.now()}`, generatedAt: new Date().toISOString(), context: options.context,
    scope: 'visual-only-retarget-imports', requestedCycles: 100, warmupCycles: 12, recording: original, samples, settled, restoration,
    result: failed ? 'failed' : samples.length === 100 && settled && restoration === 'restored' && !issues.length ? 'passed' : 'inconclusive', issues,
    limitations: ['Synthetische visuelle Imports mit dem Sampler der Aufzeichnung bei 25/50/75 Prozent auf einer Surface; keine fachlichen Events oder externen Aktionen.',
      'Kein Nachweis für Pointer-/Keyboard-Journeys, Host-Navigation oder wechselnde fachliche Daten.', 'Plateau verwalteter Ressourcen und Glyph-Bytes; kein Treiber-/Prozessspeicher und kein Mount-/Unmount-Nachweis.'] });
}
