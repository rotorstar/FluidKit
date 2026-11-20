import { describe, expect, it, vi } from 'vitest';
import { CapturedFrameSchema, EffectSettingsSchema, SceneNodeSchema, SequenceReportSchema, TextAuditSchema, VisualScenarioSchema, type TextAudit, type VisualScenario } from '@fluidkit/contracts';
import { captureSequence, sequenceTimes, stressEffect, measureEffectPlayback, stressVisualRetargeting, type SequenceCaptureAdapter, type EffectDiagnosticAdapter, type VisualRetargetAdapter } from '@fluidkit/testing/sequence';
import { createTransitionClip, createClipFromRecording, recordTransitionClip, normalizeVisualScenario, resolveEffect, sampleTransitionClip } from '@fluidkit/effects';
import { createResourceLedger } from '@fluidkit/webgpu';

// Explicit contract-only fixture. These bytes are not browser/GPU evidence.
function fixture(durationMs = 100) {
  const source = SceneNodeSchema.parse({ id: 'card', kind: 'card', anatomy: { componentId: 'card', part: 'root', behavior: 'presentation' }, x: 0, y: 0, width: 100, height: 50 });
  const target = { ...source, x: 80 };
  let recording: VisualScenario = VisualScenarioSchema.parse({ schemaVersion: 3, source: [source], target: [target], viewport: { width: 200, height: 200 }, durationMs, plan: null, caseId: 'test', redacted: false });
  let progress = 1, frameCount = 0, revision = 7;
  const adapter: SequenceCaptureAdapter = {
    replay: vi.fn(), seek: vi.fn(value => { progress = value; }), getRecording: () => recording,
    async captureFrame() { return CapturedFrameSchema.parse({ schemaVersion: 1, id: `f-${++frameCount}`, surfaceFrame: frameCount, capturedAt: '2026-11-03T12:00:00Z', renderTimeMs: frameCount, backend: 'webgpu', progress,
      viewport: { width: 200, height: 200, dpr: 1 }, image: 'data:image/png;base64,AA==', pixelWidth: 200, pixelHeight: 200, parts: [{ id: 'card', componentId: 'card', part: 'root' }], redaction: 'no-sensitive-parts', coverage: 'selected-frame' }); },
    async inspectText() { return TextAuditSchema.parse({ scale: 1, viewport: { width: 200, height: 200 }, backend: 'webgpu', progress, checkedNodes: 1, hiddenDuringMotion: 0, boxes: [], textStyles: [], issues: [] }); },
    getPresentation() { return { nodes: [{ ...source, x: 80 * progress }], progress, particles: [], nodeStates: [], lens: null }; },
  };
  const options = { context: { buildId: 'test-build', dataVersion: 'test-data', revision: 7, state: 'target' }, getRevision: () => revision, initialProgress: .4 };
  return { adapter, options, changeRevision() { revision++; }, changeRecording() { recording = { ...recording, durationMs: recording.durationMs + 1 }; }, sensitive() { recording = { ...recording, source: [{ ...source, sensitive: true, text: 'PRIVATE-FIXTURE' }] }; } };
}

describe('bounded deterministic sequence evidence', () => {
  it('includes the exact end time and respects the fixed frame budget', () => {
    expect(sequenceTimes(0)).toEqual([0]); expect(sequenceTimes(3000)).toHaveLength(181);
    expect(sequenceTimes(900).at(-1)).toBe(900); expect(sequenceTimes(1100)).toHaveLength(67);
    expect(sequenceTimes(33.4)).toHaveLength(4); expect(sequenceTimes(33.4).at(-1)).toBe(33.4);
    expect(() => sequenceTimes(3001)).toThrow(); expect(() => sequenceTimes(-1)).toThrow();
  });
  it('captures every scheduled sample, checks metadata/endpoints and restores the paused position', async () => {
    const { adapter, options } = fixture();
    const report = await captureSequence(adapter, options);
    expect(report.samples).toHaveLength(7); expect(report.coverage).toBe('complete'); expect(report.result).toBe('passed');
    expect(report.samples.at(-1)?.frame.progress).toBe(1);
    expect(adapter.seek).toHaveBeenLastCalledWith(.4);
    expect(report.openChecks).toContain('native-frame-pacing'); expect(report.openChecks).toContain('temporal-pixel-detection');
    expect(report.samples.every(sample => sample.frame.coverage === 'selected-frame')).toBe(true);
    expect(SequenceReportSchema.safeParse({ ...report, samples: report.samples.slice(1) }).success).toBe(false);
  });
  it('reports missing frames and abort as incomplete, never passed', async () => {
    const f = fixture(); let count = 0;
    const capture = f.adapter.captureFrame;
    f.adapter.captureFrame = async () => { if (++count === 3) throw new Error('Device lost'); return capture(); };
    const report = await captureSequence(f.adapter, f.options);
    expect(report.samples).toHaveLength(2); expect(report.result).toBe('inconclusive'); expect(report.issues).toContain('Device lost');
    const aborted = fixture(), controller = new AbortController(); controller.abort();
    const cancelled = await captureSequence(aborted.adapter, { ...aborted.options, signal: controller.signal });
    expect(cancelled.samples).toHaveLength(0); expect(cancelled.result).toBe('inconclusive');
  });
  it('rejects stale revisions and changed runs without seeking over a new user state', async () => {
    for (const change of ['changeRevision', 'changeRecording'] as const) {
      const f = fixture(), capture = f.adapter.captureFrame;
      f.adapter.captureFrame = async () => { const frame = await capture(); f[change](); return frame; };
      const report = await captureSequence(f.adapter, f.options);
      expect(report.samples).toHaveLength(0); expect(report.result).toBe('inconclusive');
      expect(f.adapter.seek).not.toHaveBeenLastCalledWith(.4);
    }
  });
  it('detects duplicate render IDs, mismatched time and changed viewports', async () => {
    for (const kind of ['id', 'progress', 'viewport'] as const) {
      const f = fixture(), capture = f.adapter.captureFrame; let count = 0;
      f.adapter.captureFrame = async () => { const frame = await capture(); return ++count > 1 ? { ...frame, ...(kind === 'id' ? { id: 'f-1' } : kind === 'progress' ? { progress: 1 } : { viewport: { ...frame.viewport, width: 201 } }) } : frame; };
      const report = await captureSequence(f.adapter, f.options);
      expect(report.samples).toHaveLength(1); expect(report.coverage).toBe('incomplete'); expect(report.result).toBe('inconclusive');
    }
  });
  it('keeps text failures independent of complete sampling and detects residual effects', async () => {
    const f = fixture(), audit = f.adapter.inspectText, presentation = f.adapter.getPresentation;
    f.adapter.inspectText = async () => ({ ...await audit(), issues: [{ kind: 'overlap', nodes: ['card', 'label'], detail: 'Injected collision', severity: 'error' }] } satisfies TextAudit);
    f.adapter.getPresentation = () => ({ ...presentation()!, nodes: [{ ...presentation()!.nodes[0]!, x: 999 }] });
    const report = await captureSequence(f.adapter, f.options);
    expect(report.coverage).toBe('complete'); expect(report.result).toBe('failed');
    expect(report.checks.find(check => check.id === 'sequence-text')?.status).toBe('failed');
    expect(report.checks.find(check => check.id === 'sequence-endpoint')?.status).toBe('failed');
  });
  it('never exports a sensitive recording when capture is refused', async () => {
    const f = fixture(); f.sensitive(); const report = await captureSequence(f.adapter, f.options);
    expect(report.result).toBe('inconclusive'); expect(report.recording).toBeNull(); expect(report.samples).toHaveLength(0);
    expect(JSON.stringify(report)).not.toContain('PRIVATE-FIXTURE');
  });
  it('accepts invisible outgoing descriptors from the real sampler and verifies exact source geometry', async () => {
    const f = fixture(), base = f.adapter.getRecording()!;
    const recording = VisualScenarioSchema.parse({ ...base, target: [{ ...base.target[0]!, id: 'new-card', anatomy: { componentId: 'new-card', part: 'root', behavior: 'presentation' } }] });
    const clip = createTransitionClip({ source: recording.source, target: recording.target, plan: recording.plan, viewport: recording.viewport, durationMs: recording.durationMs });
    let progress = 1;
    const seek = f.adapter.seek;
    f.adapter.seek = value => { progress = value; seek(value); };
    f.adapter.getRecording = () => recording;
    f.adapter.getPresentation = () => sampleTransitionClip(clip, progress);
    const report = await captureSequence(f.adapter, f.options);
    expect(report.result).toBe('passed');
    expect(report.samples.at(-1)!.geometry.nodes).toHaveLength(2);
    f.adapter.getPresentation = () => {
      const frame = sampleTransitionClip(clip, progress);
      return progress === 0 ? { ...frame, nodes: frame.nodes.map(node => ({ ...node, x: node.x + 5 })) } : frame;
    };
    const bad = await captureSequence(f.adapter, f.options);
    expect(bad.checks.find(check => check.id === 'sequence-source')?.status).toBe('failed');
  });
  it('stops at the 64 MiB image budget without silently skipping samples', async () => {
    const f = fixture(3000), capture = f.adapter.captureFrame;
    f.adapter.captureFrame = async () => ({ ...await capture(), image: `data:image/png;base64,${'A'.repeat(5_000_000)}` });
    const report = await captureSequence(f.adapter, f.options);
    expect(report.samples).toHaveLength(13); expect(report.imageBytes).toBeLessThanOrEqual(64 * 1024 * 1024);
    expect(report.coverage).toBe('incomplete'); expect(report.issues.join(' ')).toContain('64 MiB');
  });
});

function diagnosticFixture() {
  const f = fixture(), ledger = createResourceLedger();
  let frames = 0, playing = false, playbackReads = 0, cycles = 0;
  const adapter: EffectDiagnosticAdapter = {
    ...f.adapter, replay() { cycles++; playing = false; playbackReads = 0; }, play() { playing = true; }, pause() { playing = false; },
    getMetrics() {
      const progress = playing ? ++playbackReads >= 3 ? 1 : .5 : f.adapter.getPresentation()!.progress;
      return { backend: 'webgpu', frames: ++frames, progress, phase: playing ? progress === 1 ? 'idle' : 'transitioning' : 'paused', textBytes: 100,
        lastFrameMs: 1, qualityProfile: 'standard', effectResources: { renderTargets: progress === 1 ? 0 : 1, targetBytes: progress === 1 ? 0 : 1024, particles: 0, particleDrawCalls: 0 } };
    },
    getResources: () => ledger.snapshot(), getFrameTimings: () => [16, 17, 16, 16.5],
  };
  return { ...f, adapter, cycles: () => cycles, ledger, options: { ...f.options, isVisible: () => true } };
}
describe('separate effect resource and natural playback diagnostics', () => {
  it('runs exactly 100 replay cycles and measures a stable owned-resource plateau', async () => {
    const f = diagnosticFixture(), report = await stressEffect(f.adapter, f.options);
    expect(report.result).toBe('passed'); expect(report.samples).toHaveLength(100); expect(f.cycles()).toBe(100);
    expect(report.warmupCycles).toBe(5); expect(report.scope).toBe('owned-resources-on-one-surface');
    expect(report.limitations.join(' ')).toContain('kein Mount-/Unmount');
    expect(f.adapter.seek).toHaveBeenLastCalledWith(.4);
  });
  it('detects resource growth after warmup and does not call the partial run passed', async () => {
    const f = diagnosticFixture(), getResources = f.adapter.getResources;
    f.adapter.getResources = () => { if (f.cycles() === 6) f.ledger.acquire('material'); return getResources(); };
    const report = await stressEffect(f.adapter, f.options);
    expect(report.result).toBe('failed'); expect(report.samples).toHaveLength(6); expect(report.issues.join(' ')).toContain('Plateau');
  });
  it('rejects hidden or aborted diagnostics', async () => {
    const f = diagnosticFixture(), hidden = await stressEffect(f.adapter, { ...f.options, isVisible: () => false });
    expect(hidden.result).toBe('inconclusive'); expect(hidden.samples).toHaveLength(0);
    const abort = new AbortController(); abort.abort();
    const playback = await measureEffectPlayback(f.adapter, { ...f.options, signal: abort.signal });
    expect(playback.result).toBe('inconclusive'); expect(playback.intervalsMs).toHaveLength(0);
  });
  it('records renderer intervals from natural playback separately from captures', async () => {
    const f = diagnosticFixture(); const capture = vi.spyOn(f.adapter, 'captureFrame');
    const report = await measureEffectPlayback(f.adapter, f.options);
    expect(report.result).toBe('measured'); expect(report.endpointReached).toBe(true);
    expect(report.intervalsMs).toEqual([16, 17, 16, 16.5]); expect(report.p50Ms).toBe(16); expect(report.p95Ms).toBe(17);
    expect(report.maxMs).toBe(17); expect(report.longFramesOver50Ms).toBe(0);
    expect(capture).not.toHaveBeenCalled(); expect(f.cycles()).toBe(2); expect(f.adapter.seek).toHaveBeenLastCalledWith(.4);
    expect(report.limitations.join(' ')).toContain('keine GPU-Timestamps');
  });
  it('exposes a long frame even when P95 hides the isolated tail', async () => {
    const f = diagnosticFixture(); f.adapter.getFrameTimings = () => [...Array.from({ length: 99 }, () => 16), 491];
    const report = await measureEffectPlayback(f.adapter, f.options);
    expect(report.p95Ms).toBe(16); expect(report.maxMs).toBe(491); expect(report.longFramesOver50Ms).toBe(1);
  });
});

/** Real pure sampler plus a stable contract ledger; deliberately no GPU-memory claim. */
function retargetFixture(effect = 'liquid-lens', motionVersion: 1 | 2 = 1) {
  const f = diagnosticFixture(), base = normalizeVisualScenario(f.adapter.getRecording());
  const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: effect, version: '1.0.0' }, seed: 31 }),
    capabilities: { backend: 'webgpu', compute: true, typegpu: true, reducedMotion: false }, eventId: 'retarget-test', eventType: 'view.cards',
    caseId: 'test', sourceState: 'a', targetState: 'b', sourceRevision: 6, targetRevision: 7, baseDuration: 100, nodeCount: 2 });
  const target = [...base.target, { ...base.target[0]!, id: 'new-card', y: 70, anatomy: { componentId: 'new-card', part: 'root', behavior: 'presentation' as const } }];
  let clip = createTransitionClip({ source: base.source, target, plan, durationMs: base.durationMs, viewport: base.viewport, motionVersion }), progress = 1, frames = 0;
  let recording = recordTransitionClip(clip, base.caseId, base.redacted);
  const original = recording;
  const imported: VisualScenario[] = [];
  const adapter: VisualRetargetAdapter = {
    ...f.adapter,
    replay: vi.fn(() => { progress = 0; }), seek: vi.fn(value => { progress = value; }),
    importRecording: vi.fn(input => {
      const candidate = normalizeVisualScenario(input);
      clip = createClipFromRecording(candidate); recording = recordTransitionClip(clip, candidate.caseId, candidate.redacted); imported.push(recording); progress = 0;
    }),
    getRecording: () => recording, getPresentation: () => sampleTransitionClip(clip, progress),
    async inspectText() { return { ...await f.adapter.inspectText(), progress }; },
    getMetrics() {
      const frame = sampleTransitionClip(clip, progress);
      return { backend: 'webgpu', frames: ++frames, progress, phase: 'paused', textBytes: 100, lastFrameMs: 1, qualityProfile: 'compact',
        effectResources: { renderTargets: frame.lens ? 1 : 0, targetBytes: frame.lens ? 1024 : 0, particles: frame.particles.length, particleDrawCalls: frame.particles.length ? 1 : 0 } };
    },
  };
  return { ...f, adapter, original, imported, progress: () => progress, replaceRun() { recording = { ...recording, caseId: 'new-user-run' }; } };
}

describe('bounded visual-only retargeting diagnostics', () => {
  it('retains V4 correspondence and velocity checkpoints through 100 diagnostic imports', async () => {
    const f = retargetFixture('silk-cascade', 2), report = await stressVisualRetargeting(f.adapter, f.options);
    expect(report.issues).toEqual([]); expect(report.result).toBe('passed'); expect(f.imported).toHaveLength(101);
    expect(f.imported.every(recording => recording.schemaVersion === 4)).toBe(true);
    expect(f.adapter.getRecording()).toEqual(f.original);
  });
  it.each(['silk-cascade', 'liquid-lens', 'particle-weave'])('keeps all visual channels continuous for 100 %s imports and restores the original', async effect => {
    const f = retargetFixture(effect), report = await stressVisualRetargeting(f.adapter, f.options);
    expect(report.issues).toEqual([]); expect(report.result).toBe('passed'); expect(report.samples).toHaveLength(100);
    expect(report.samples.every(sample => sample.continuous && sample.sourceNodes <= 2048)).toBe(true);
    expect(report.samples.slice(0, 3).map(sample => sample.phase)).toEqual([.25, .5, .75]);
    expect(report.scope).toBe('visual-only-retarget-imports'); expect(report.restoration).toBe('restored');
    expect(f.adapter.getRecording()).toEqual(f.original); expect(f.progress()).toBe(.4); expect(f.imported).toHaveLength(101);
    expect(f.imported.every(recording => recording.plan?.seed === f.original.plan?.seed && recording.plan?.selected?.id === effect)).toBe(true);
    expect(report.limitations.join(' ')).toContain('keine fachlichen Events');
  });
  it('fails on a source jump instead of marking a partial retarget test passed', async () => {
    const f = retargetFixture(), presentation = f.adapter.getPresentation;
    f.adapter.getPresentation = () => {
      const frame = presentation()!;
      return f.imported.length > 0 && frame.progress === 0 ? { ...frame, nodes: frame.nodes.map(node => ({ ...node, x: node.x + 10 })) } : frame;
    };
    const report = await stressVisualRetargeting(f.adapter, f.options);
    expect(report.result).toBe('failed'); expect(report.samples).toHaveLength(1); expect(report.samples[0]?.continuous).toBe(false);
    expect(report.restoration).toBe('restored'); expect(f.adapter.getRecording()).toEqual(f.original);
  });
  it.each(['revision', 'recording'])('never overwrites a newer user %s', async kind => {
    const f = retargetFixture();
    const report = await stressVisualRetargeting(f.adapter, { ...f.options, onProgress: () => { if (kind === 'revision') f.changeRevision(); else f.replaceRun(); } });
    expect(report.result).toBe('inconclusive'); expect(report.samples).toHaveLength(1);
    expect(report.restoration).toBe('skipped-newer-run'); expect(f.imported).toHaveLength(1);
    if (kind === 'recording') expect(f.adapter.getRecording()?.caseId).toBe('new-user-run');
  });
  it('cancels and restores only the diagnostic-owned run', async () => {
    const f = retargetFixture(), controller = new AbortController();
    const report = await stressVisualRetargeting(f.adapter, { ...f.options, signal: controller.signal, onProgress: () => controller.abort() });
    expect(report.result).toBe('inconclusive'); expect(report.samples).toHaveLength(1);
    expect(report.restoration).toBe('restored'); expect(f.adapter.getRecording()).toEqual(f.original); expect(f.progress()).toBe(.4);
  });
  it('rejects sensitive recordings without importing or exporting them', async () => {
    const f = retargetFixture(), original = f.adapter.getRecording()!;
    f.adapter.getRecording = () => ({ ...original, source: original.source.map(node => ({ ...node, sensitive: true, text: 'PRIVATE-RETARGET' })) });
    const report = await stressVisualRetargeting(f.adapter, f.options);
    expect(report.result).toBe('inconclusive'); expect(report.recording).toBeNull(); expect(report.samples).toHaveLength(0);
    expect(f.imported).toHaveLength(0); expect(JSON.stringify(report)).not.toContain('PRIVATE-RETARGET');
  });
  it('detects owned-resource growth after the six phase/target patterns are warmed', async () => {
    const f = retargetFixture();
    const report = await stressVisualRetargeting(f.adapter, { ...f.options, onProgress: cycle => { if (cycle === 12) f.ledger.acquire('material'); } });
    expect(report.result).toBe('failed'); expect(report.samples).toHaveLength(13);
    expect(report.issues.join(' ')).toContain('Plateau'); expect(report.restoration).toBe('restored');
  });
  it('does not adopt or overwrite an import that did not match the owned request', async () => {
    const f = retargetFixture(), importRecording = f.adapter.importRecording;
    f.adapter.importRecording = input => { importRecording(input); const actual = f.adapter.getRecording()!; f.adapter.getRecording = () => ({ ...actual, source: [] }); };
    const report = await stressVisualRetargeting(f.adapter, f.options);
    expect(report.result).toBe('inconclusive'); expect(report.samples).toHaveLength(0);
    expect(report.restoration).toBe('skipped-newer-run'); expect(f.imported).toHaveLength(1);
    expect(report.issues.join(' ')).toContain('Import wurde nicht unverändert bestätigt');
  });
});
