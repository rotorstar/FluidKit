'use client';
import { useStudioLocale } from './studio-locale';
import { formatNumber } from '@fluidkit/i18n';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import type { EffectStressReport, NaturalPlaybackReport, SequenceReport, VisualRetargetReport, VisualScenario } from '@fluidkit/contracts';
import { EFFECT_LIBRARY } from '@fluidkit/effects';
import type { FluidRuntime } from '@fluidkit/core';
import { captureSequence, stressEffect, measureEffectPlayback, stressVisualRetargeting } from '@fluidkit/testing/sequence';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';

function runLabel(tr: ReturnType<typeof useDiagnosticMessages>, recording: VisualScenario | null, revision: number, backend?: string | null) {
  const ref = recording?.plan?.selected;
  const title = ref ? EFFECT_LIBRARY.find(effect => effect.id === ref.id && effect.version === ref.version)?.title ?? ref.id : tr('defaultTransition');
  return `${title}${ref ? ` v${ref.version}` : ''} · r${revision} · ${recording ? `${recording.viewport.width} × ${recording.viewport.height}` : tr('runViewport')} · ${backend === 'webgpu' ? 'WebGPU' : backend === 'webgl2' ? 'WebGL2' : tr('runBackend')}`;
}

export function SequenceReview({ runtime, controls, metrics, buildId, dataVersion, onStart, onBusyChange }: {
  runtime: FluidRuntime; controls: SurfacePlaybackControls | null; metrics: SurfaceMetrics | null;
  buildId: string; dataVersion: string; onStart: () => void; onBusyChange: (busy: boolean) => void;
}) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale();
  const ms = (value: number | null) => value === null ? tr('unavailableValue') : formatNumber(locale,value,{minimumFractionDigits:1,maximumFractionDigits:1});
  const [report, setReport] = useState<SequenceReport | null>(null), [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stress, setStress] = useState<EffectStressReport | null>(null), [pacing, setPacing] = useState<NaturalPlaybackReport | null>(null);
  const [retarget, setRetarget] = useState<VisualRetargetReport | null>(null);
  const [job, setJob] = useState<'sequence' | 'stress' | 'pacing' | 'retarget'>('sequence');
  const [progress, setProgress] = useState({ done: 0, expected: 0 }), [selected, setSelected] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const busyCallback = useRef(onBusyChange); busyCallback.current = onBusyChange;
  useEffect(() => () => { controller.current?.abort(); controller.current = null; busyCallback.current(false); }, []);
  useEffect(() => { if (!controls) controller.current?.abort(); }, [controls]);
  async function capture() {
    if (!controls || busy) return;
    const abort = new AbortController(); controller.current = abort;
    const snapshot = runtime.getSnapshot(), initialProgress = metrics?.progress ?? 1;
    setJob('sequence'); setBusy(true); onBusyChange(true); setReport(null); setError(''); setProgress({ done: 0, expected: 0 }); onStart();
    try {
      const result = await captureSequence(controls, { context: { buildId, dataVersion, revision: snapshot.revision, state: snapshot.state }, getRevision: () => runtime.getSnapshot().revision,
        initialProgress, signal: abort.signal, onProgress: (done, expected) => { if (controller.current === abort && (done % 5 === 0 || done === expected)) setProgress({ done, expected }); } });
      if (controller.current === abort) { setReport(result); setSelected(Math.floor(Math.max(0, result.samples.length - 1) / 2)); }
    } catch (failure) {
      if (controller.current === abort) setError(failure instanceof Error ? failure.message : '—');
    } finally {
      if (controller.current === abort) { controller.current = null; setBusy(false); onBusyChange(false); }
    }
  }
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(report)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `${report.id}.json`; link.click(); URL.revokeObjectURL(url);
  }
  async function diagnose(kind: 'stress' | 'pacing' | 'retarget') {
    if (!controls || busy) return;
    const abort = new AbortController(); controller.current = abort;
    const snapshot = runtime.getSnapshot();
    setJob(kind); setBusy(true); onBusyChange(true); setError(''); setProgress({ done: 0, expected: kind === 'pacing' ? 0 : 100 }); onStart();
    if (kind === 'stress') setStress(null); else if (kind === 'retarget') setRetarget(null); else setPacing(null);
    const options = { context: { buildId, dataVersion, revision: snapshot.revision, state: snapshot.state }, getRevision: () => runtime.getSnapshot().revision,
      initialProgress: metrics?.progress ?? 1, signal: abort.signal, isVisible: () => !document.hidden,
      onProgress: (done: number, expected: number) => { if (controller.current === abort && (done % 5 === 0 || done === expected)) setProgress({ done, expected }); } };
    try {
      if (kind === 'stress') { const result = await stressEffect(controls, options); if (controller.current === abort) setStress(result); }
      else if (kind === 'retarget') { const result = await stressVisualRetargeting(controls, options); if (controller.current === abort) setRetarget(result); }
      else { const result = await measureEffectPlayback(controls, options); if (controller.current === abort) setPacing(result); }
    } catch (failure) { if (controller.current === abort) setError(failure instanceof Error ? failure.message : '—'); }
    finally { if (controller.current === abort) { controller.current = null; setBusy(false); onBusyChange(false); } }
  }
  function downloadDiagnostics() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ stress, pacing, retarget })], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fluid-effect-diagnostics.json'; link.click(); URL.revokeObjectURL(url);
  }
  const sample = report?.samples[selected];
  const findings = report?.checks.flatMap(check => check.findings) ?? [];
  return <section className="sequence-review" aria-label={tr('sequence')}>
    <h3>{tr('sequenceTitle')}</h3><p>{tr('sequenceInfo')}</p>
    <div className="quality-actions"><Button className="outline-button" disabled={busy || !controls || !metrics?.canReplay} onClick={() => { void capture(); }}>{tr('sequenceCheck')}</Button><Button className="outline-button" disabled={!busy} onClick={() => controller.current?.abort()}>{tr('sequenceCancel')}</Button><Button className="outline-button" disabled={!report || busy} onClick={download}>{tr('saveSequence')}</Button></div>
    <p role="status">{busy ? job === 'pacing' ? tr('pacingBusy') : tr('seqProgress',{n:progress.done,total:progress.expected,unit:job==='stress'||job==='retarget'?'cycle':'sample'}) : report ? tr('seqDone',{coverage:report.coverage,n:report.samples.length,total:report.expectedTimesMs.length,result:report.result}) : tr('sequenceReady')}</p>
    {error && <p role="alert">{tr('reportError')} <span>{error}</span></p>}
    {report && <>
      <p><strong>{tr('seqLabel')}</strong> {runLabel(tr, report.recording, report.context.revision, report.samples[0]?.frame.backend)}</p>
      <ul className="sequence-checks">{report.checks.map(check => <li key={check.id}><strong lang="de">{check.title}</strong><span>{tr(check.status === 'passed' ? 'passed' : check.status === 'failed' ? 'failed' : 'pending')} · {tr('checksCount',{n:check.checked})}</span>{check.reason && <p lang="de">{check.reason}</p>}</li>)}</ul>
      {report.issues.length > 0 && <ul className="sequence-issues">{report.issues.map((issue, index) => <li key={index} lang="de">{issue}</li>)}</ul>}
      {findings.length > 0 && <details><summary>{tr('findingsCount',{n:findings.length})}</summary><ul className="sequence-issues">{findings.map((finding, index) => <li key={index} lang="de">{finding.message}</li>)}</ul></details>}
      {sample && <figure className="sequence-frame"><div className="quality-actions"><Button className="outline-button" disabled={selected === 0} onClick={() => setSelected(index => index - 1)}>{tr('prevFrame')}</Button><Button className="outline-button" disabled={selected === report.samples.length - 1} onClick={() => setSelected(index => index + 1)}>{tr('nextFrame')}</Button><span>Sample {selected + 1} / {report.samples.length} · {ms(sample.logicalTimeMs)} ms</span></div><img src={sample.frame.image} alt={tr('sequenceAlt',{n:selected+1,ms:ms(sample.logicalTimeMs)})} loading="lazy"/><figcaption>{tr('sourceImage')} · {sample.frame.backend} · r{report.context.revision} · {report.context.buildId}</figcaption></figure>}
      <p className="sequence-limits">{tr('sequenceScope')}</p>
    </>}
    <h3>{tr('measureBoth')}</h3><p>{tr('stressInfo')}</p>
    <div className="quality-actions"><Button className="outline-button" disabled={busy || !controls || !metrics?.canReplay} onClick={() => { void diagnose('stress'); }}>{tr('stress')}</Button><Button className="outline-button" disabled={busy || !controls || !metrics?.canReplay} onClick={() => { void diagnose('pacing'); }}>{tr('pacing')}</Button><Button className="outline-button" disabled={busy || !controls || !metrics?.canReplay} onClick={() => { void diagnose('retarget'); }}>{tr('retarget')}</Button><Button className="outline-button" disabled={busy || (!stress && !pacing && !retarget)} onClick={downloadDiagnostics}>{tr('saveDiagnosis')}</Button></div>
    <p>{tr('retargetInfo')}</p>
    {([{value:retarget, label:'retargetLabel', backend:retarget?.samples[0]?.metrics.backend},{value:stress, label:'stressLabel', backend:stress?.samples[0]?.endpoint.backend}] as const).map(({value,label,backend}) => value && <div className="sequence-diagnostic" key={label}>
      <p><strong>{tr(label)}</strong> {runLabel(tr,value.recording,value.context.revision,backend)}</p>
      <p>{tr('cycleRun',{n:value.samples.length,result:value.result})} {'restoration' in value && tr('restoreRun',{result:value.restoration==='skipped-newer-run'?'newer':value.restoration})}</p>
      {value.issues.map((issue,index) => <p key={index} lang="de">{issue}</p>)}<p lang="de">{value.limitations.join(' ')}</p>
    </div>)}
    {pacing && <div className="sequence-diagnostic"><p><strong>{tr('pacingLabel')}</strong> {runLabel(tr,pacing.recording,pacing.context.revision,pacing.backend)}</p>
      <p>{pacing.result === 'measured' ? `${tr('intervals',{n:pacing.intervalsMs.length})} · P50 ${ms(pacing.p50Ms)} ms · P95 ${ms(pacing.p95Ms)} ms` : tr('inconclusive')}</p>
      <p>{tr('maxMs',{ms:pacing.maxMs === null ? tr('unavailableValue') : ms(pacing.maxMs)+' ms',n:pacing.longFramesOver50Ms})}</p>
      {pacing.issues.map((issue,index) => <p key={index} lang="de">{issue}</p>)}<p lang="de">{pacing.limitations.join(' ')}</p></div>}
  </section>;
}
