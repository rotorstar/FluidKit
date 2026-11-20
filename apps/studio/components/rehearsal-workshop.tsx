'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '@base-ui/react/button';
import { Tabs } from '@base-ui/react/tabs';
import { DEFAULT_EFFECT_SETTINGS, type AIReviewFrame, type QualityReport, type TextAudit } from '@fluidkit/contracts';
import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, createWorkspaceStory, workspaceCollectionOrder, workspaceScene, type WorkspaceData } from '@fluidkit/cases';
import { FluidProvider } from '@fluidkit/react';
import { createStoryRunner } from '@fluidkit/testing/story';
import type { BackendMode, SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { useStudioLocale, useStudioMessages } from './studio-locale';
import { AIReviewPanel } from './ai-review-panel';
import { EffectLab, EffectTransport } from './effect-lab';
import { WorkspaceSurface } from './workspace-surface';
import { SequenceReview } from './sequence-review';
import { StudioSelect } from './studio-controls';
import { UIQuality } from './ui-quality';
import './rehearsal-workshop.css';
import { captureRehearsalFrame } from '../lib/rehearsal-capture';

type RunMode = 'idle' | 'playing' | 'paused' | 'finished' | 'stopped' | 'error';
const PANELS = [['design', 'design'], ['layout', 'layoutSemantics'], ['motion', 'motion'], ['compare', 'compareTab'], ['ai', 'aiTab']] as const;
export function RehearsalWorkshop({ data, staticReport }: { data: WorkspaceData; staticReport: QualityReport }) {
  const tr = useDiagnosticMessages();
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const story = useMemo(() => createWorkspaceStory(data,locale), [data,locale]);
  const runtime = useMemo(() => createFluidRuntime({ flow: createWorkspaceFlow(data), effectSettings: DEFAULT_EFFECT_SETTINGS, collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language), projections: { workspace: (snapshot, viewport, settings, language, context) => workspaceScene(data, snapshot, viewport, settings, language, context) } }), [data]);
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const root = useRef<HTMLDivElement>(null), reset = useRef<HTMLButtonElement>(null);
  const runner = useRef<ReturnType<typeof createStoryRunner> | null>(null);
  const lifetime = useRef<{ runtime: typeof runtime; token: symbol } | null>(null);
  const [controls, setControls] = useState<SurfacePlaybackControls | null>(null), [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [mode, setMode] = useState<RunMode>('idle'), [beatIndex, setBeatIndex] = useState(-1), [error, setError] = useState('');
  const [frames, setFrames] = useState<AIReviewFrame[]>([]), [selected, setSelected] = useState(''), [baseline, setBaseline] = useState('');
  const [audit, setAudit] = useState<TextAudit | null>(null), [captureBusy, setCaptureBusy] = useState(false), [panel, setPanel] = useState('design');
  const [sequenceBusy, setSequenceBusy] = useState(false);
  const [runDownload, setRunDownload] = useState('');
  useEffect(() => () => { if (runDownload) URL.revokeObjectURL(runDownload); }, [runDownload]);
  useEffect(() => { setRunDownload(''); }, [frames, audit, beatIndex]);
  const [backendMode, setBackendMode] = useState<BackendMode>('webgpu-first');
  const anyCaptureBusy = captureBusy || sequenceBusy;
  const captureGeneration = useRef(0), runId = useRef(`run-${crypto.randomUUID()}`);
  useEffect(() => { const token = Symbol(); lifetime.current = { runtime, token }; return () => { captureGeneration.current++; runner.current?.stop(); queueMicrotask(() => { if (lifetime.current?.runtime !== runtime || lifetime.current.token === token) runtime.dispose(); }); }; }, [runtime]);
  useEffect(() => { const pause = () => { if (document.hidden) setMode(current => current === 'playing' ? 'paused' : current); }; document.addEventListener('visibilitychange', pause); return () => document.removeEventListener('visibilitychange', pause); }, []);
  useEffect(() => {
    const preview = root.current?.querySelector('.rehearsal-preview');
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => !entry.isIntersecting)) setMode(current => current === 'playing' ? 'paused' : current); });
    if (preview) observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  function viewport() { const bounds = root.current?.querySelector('canvas')?.getBoundingClientRect(); return { width: bounds?.width || 1000, height: bounds?.height || 1348 }; }
  const advance = useCallback((studioControl?: string) => {
    try {
      const next = story.beats[beatIndex + 1];
      if (next?.target.kind === 'part') {
        const target = root.current?.querySelector<HTMLElement>(`[data-fluid-node="${next.target.nodeId}"]`);
        if (!target || target.getBoundingClientRect().width < 24) throw new Error('Gerendertes Story-Ziel nicht messbar.');
        target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
        if (next.target.kind === 'part') runtime.setInteraction({ hoveredId: next.target.nodeId });
      }
      if (!runner.current) throw new Error('Story zuerst starten.');
      const result = runner.current.advance(viewport(), studioControl);
      setBeatIndex(result.index); setAudit(null); setError('');
      if (result.complete) setMode('finished');
    } catch (error) { setError(error instanceof Error ? error.message : 'Story fehlgeschlagen.'); setMode('error'); }
  }, [beatIndex, story, runtime]);
  function start() {
    runner.current?.stop(); captureGeneration.current++; runId.current = `run-${crypto.randomUUID()}`; setRunDownload(''); setFrames([]); setSelected(''); setBaseline(''); controls?.restoreLive();
    runtime.send('reset', {}, 'user'); runner.current = createStoryRunner(runtime, story);
    try { const first = runner.current.advance(viewport()); setBeatIndex(first.index); setMode('playing'); setError(''); setAudit(null); root.current?.querySelector('.rehearsal-preview')?.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
    catch (error) { setError(error instanceof Error ? error.message : 'Story nicht bereit.'); setMode('error'); }
  }
  useEffect(() => {
    if (mode !== 'playing') return;
    const beat = story.beats[beatIndex]; if (!beat) return;
    const timer = setTimeout(() => {
      if (story.beats[beatIndex + 1]?.target.kind === 'studio') reset.current?.click();
      else advance();
    }, Math.max(beat.holdMs, runtime.getTransitionDuration() + 500));
    return () => clearTimeout(timer);
  }, [mode, beatIndex, story, runtime, advance]);
  function takeOver() { if (mode === 'playing' || mode === 'paused') { runner.current?.stop(); setMode('stopped'); setError(tr('takeOver')); } }
  async function capture() {
    if (!controls || anyCaptureBusy) return;
    const token = ++captureGeneration.current;
    setMode(current => current === 'playing' ? 'paused' : current); controls.pause(); setCaptureBusy(true); setError('');
    try {
      const { frame: captured, text } = await captureRehearsalFrame({ runtime, controls, data, buildId: staticReport.context.buildId, runId: runId.current, beatId: story.beats[beatIndex]?.id ?? null, viewport, isCurrent: () => token === captureGeneration.current });
      if (token !== captureGeneration.current) return;
      setFrames(current => [...current.slice(-11), captured]); setSelected(captured.id); setAudit(text);
    } catch (error) { if (token === captureGeneration.current) setError(error instanceof Error ? error.message : 'Aufnahme fehlgeschlagen.'); }
    finally { if (token === captureGeneration.current) setCaptureBusy(false); }
  }
  function exportRun() {
    const artifact = { schemaVersion: 2, runId: runId.current, buildId: staticReport.context.buildId, story, status: 'inconclusive', coverage: 'selected-frames-only', open: ['continuous-frame-coverage', 'native-pacing', 'manual-accessibility', 'human-visual-review'], beats: runner.current?.getRecords() ?? [], frames, textAudit: audit };
    const url = URL.createObjectURL(new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' }));
    setRunDownload(url);
  }
  const currentFrame = frames.find(frame => frame.id === selected), baselineFrame = frames.find(frame => frame.id === baseline);
  const currentBeat = story.beats[beatIndex];
  return <FluidProvider runtime={runtime}><div ref={root} className="showcase-shell rehearsal-shell">
    <main className="rehearsal-workshop">
      <header className="rehearsal-heading"><div><p className="eyebrow">M7 / DESIGN & REHEARSAL</p><h1>{t('rehearsalHead')}</h1><p>{t('rehearsalIntro')}</p></div><span className="milestone-badge">{tr('vertical')}</span></header>
      <div className="rehearsal-buttons"><Button className="play-button" disabled={!controls || anyCaptureBusy} onClick={start}>{tr(beatIndex < 0 ? 'rehearse' : 'restart')}</Button><Button className="outline-button" disabled={!['playing', 'paused'].includes(mode) || anyCaptureBusy} onClick={() => { if (mode === 'paused') controls?.play(); setMode(current => current === 'playing' ? 'paused' : 'playing'); }}>{tr(mode === 'playing' ? 'guidePause' : 'guideResume')}</Button><Button className="outline-button" disabled={mode !== 'paused' || anyCaptureBusy} onClick={() => { if (story.beats[beatIndex + 1]?.target.kind === 'studio') reset.current?.click(); else advance(); }}>{t('nextStep')}</Button></div>
      <div className="rehearsal-stage">
        <aside className="rehearsal-director" aria-label={t('storyControls')}><span className="eyebrow">{t('guidedStory')}</span><h2>{story.title}</h2><p>{t('storyShort')}</p>

          <ol className="story-beats">{story.beats.map((beat, index) => <li key={beat.id} aria-current={beatIndex === index ? 'step' : undefined}><span className="beat-number">0{index + 1}</span><div><strong>{beat.title}</strong><p>{beat.description}</p>{index === beatIndex && <small>{beat.target.kind === 'context' ? 'Ausgangszustand' : beat.target.eventType} · r{snapshot.revision}</small>}</div></li>)}</ol>
          <Button ref={reset} id="story-reset" className="outline-button" disabled={!controls || anyCaptureBusy} onClick={() => { if (story.beats[beatIndex + 1]?.target.kind === 'studio' && ['playing', 'paused'].includes(mode)) advance('story-reset'); else { takeOver(); runtime.send('reset', {}, 'user'); } }}>{t('resetScene')}</Button>
          <p className="rehearsal-run-status" role="status">{tr(({idle:'runReady',playing:'step',paused:'pausedGuide',finished:'finishedGuide',stopped:'free',error:'stoppedGuide'} as const)[mode],{n:beatIndex+1})}</p>
        </aside>
        <section className="rehearsal-preview" aria-label={t('gpuStory')}><div className="panel-toolbar"><span><span className="tiny-dot"/> {t(metrics ? metrics.backend === 'webgpu' ? 'webgpuActive':'webglActive':'startingGPU')}</span><span>{snapshot.state} · r{snapshot.revision}</span><label className="rehearsal-backend">Backend<StudioSelect aria-label={tr('reviewBackend')} disabled={anyCaptureBusy} value={backendMode} onChange={event => { const value = event.target.value; if (value === 'webgpu-first' || value === 'webgpu-only' || value === 'webgl2') { takeOver(); setMetrics(null); setBackendMode(value); } }}><option value="webgpu-first">{t('preferWebGPU')}</option><option value="webgpu-only">{t('onlyWebGPU')}</option><option value="webgl2">{t('diagnoseGL')}</option></StudioSelect></label></div><div className="rehearsal-current-beat"><strong>{currentBeat?.title ?? tr('initialStory')}</strong><span>{currentBeat?.description ?? tr('workspaceModules',{n:data.modules.length})}</span></div>
          <div className="rehearsal-canvas" onPointerDownCapture={takeOver} onKeyDownCapture={takeOver}><WorkspaceSurface data={data} moduleCount={data.modules.length} backendMode={backendMode} onControls={value => { setControls(value); if (!value) setMetrics(null); }} onMetrics={setMetrics}/></div>
          <div inert={sequenceBusy}><EffectTransport controls={controls} metrics={metrics}/></div>
        </section>
      </div>
      {error && <p className="notice" role="alert">{error}</p>}
      <section className="rehearsal-review" aria-label={t('reviewWorkshop')}><div className="review-section-heading"><div><span className="eyebrow">{tr('reviewCycle')}</span><h2>{t('workshop')}</h2><p>{t('workshopIntro')}</p></div><div className="quality-actions"><Button className="outline-button" disabled={!controls || anyCaptureBusy} onClick={() => { void capture(); }}>{tr(captureBusy ? 'takingFrame' : 'takeFrame')}</Button><Button className="outline-button" disabled={!frames.length} onClick={exportRun}>{tr('saveRun')}</Button>{runDownload && <a className="outline-button" href={runDownload} download="fluid-rehearsal-selected-frames.json">{t('downloadRun')}</a>}</div></div>
        <Tabs.Root value={panel} onValueChange={value => setPanel(String(value))}><Tabs.List className="review-tabs" aria-label={t('reviewAreas')}>{PANELS.map(([id, label]) => <Tabs.Tab value={id} key={id}>{t(label)}</Tabs.Tab>)}</Tabs.List>
          <Tabs.Panel value="design"><div className="review-panel"><h2>{tr('storyFocus')}</h2><p>{story.brief}</p><dl className="review-facts"><div><dt>{t('dataLabel')}</dt><dd>{tr('workspaceModules',{n:data.modules.length})}</dd></div><div><dt>Look</dt><dd>{tr('lookInfo')}</dd></div><div><dt>Story</dt><dd>{story.version} · {tr('storyRuntime')}</dd></div><div><dt>{t('acceptanceLabel')}</dt><dd>{tr('frameScope')}</dd></div></dl><details className="effect-editor"><summary><strong>{tr('effectsTime')}</strong><span>{tr('effectSequence')}</span></summary><EffectLab controls={controls} runtime={runtime} metrics={metrics} onPreview={() => { takeOver(); runtime.send(runtime.getSnapshot().state === 'table' ? 'view.cards' : 'view.table'); }}/></details></div></Tabs.Panel>
          <Tabs.Panel value="layout"><UIQuality controls={controls} runtime={runtime} staticReport={staticReport}/></Tabs.Panel>
          <Tabs.Panel value="motion"><div className="review-panel"><h2>{t('motionEvidence')}</h2><p>{tr('motionScope')}</p><p>{tr('auditFrames',{count:frames.length})} {audit ? tr('auditFindings',{n:audit.checkedNodes,issue:audit.issues.length}) : tr('auditPending')}</p><ol className="rehearsal-records">{runner.current?.getRecords().map(record => <li key={record.beatId}><strong>{record.beatId}</strong><code>{record.eventType ?? tr('eventContext')} · r{record.before} → r{record.after}</code><span>{record.effectId ?? tr('defaultTransition')}</span></li>)}</ol><SequenceReview runtime={runtime} controls={controls} metrics={metrics} buildId={staticReport.context.buildId} dataVersion={data.capturedAt} onStart={() => { setMode(current => current === 'playing' ? 'paused' : current); }} onBusyChange={setSequenceBusy}/></div></Tabs.Panel>
          <Tabs.Panel value="compare"><div className="review-panel"><h2>{tr('compareFrames')}</h2><p>{tr('compareScope')}</p><div className="review-frame-strip">{frames.map(frame => <Button key={frame.id} className="outline-button" aria-pressed={selected === frame.id} onClick={() => setSelected(frame.id)}>{frame.beatId ?? tr('frameManual')} · {frame.state} · r{frame.revision}</Button>)}</div><div className="quality-actions"><Button className="outline-button" disabled={!currentFrame} onClick={() => setBaseline(selected)}>{t('compareBaseline')}</Button></div><div className="review-image-comparison">{[baselineFrame, currentFrame].map((frame, index) => <figure key={index}><figcaption>{tr(index === 0 ? 'refFrame' : 'candidateFrame')}{frame ? ` · ${frame.state} · r${frame.revision}` : ` · ${tr('noFrameYet')}`}</figcaption>{frame && <img src={frame.image} alt={`${tr(index === 0 ? 'refFrame' : 'candidateFrame')}: ${frame.state}`} loading="lazy"/>}</figure>)}</div></div></Tabs.Panel>
          <Tabs.Panel value="ai" keepMounted><AIReviewPanel frames={frames} story={story} onSelect={id => { setSelected(id); setPanel('compare'); }}/></Tabs.Panel>
        </Tabs.Root>
      </section>
      <footer className="showcase-footer">Build {staticReport.context.buildId} · Keine Anwendungs-KI aktiv. AI-Review nur nach gesonderter Bildfreigabe. Gesamtfreigabe bleibt offen.</footer>
    </main>
  </div></FluidProvider>;
}
