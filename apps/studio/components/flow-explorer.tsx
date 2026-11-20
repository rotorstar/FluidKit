'use client';
import { StudioLink, useStudioLocale, useStudioMessages } from './studio-locale';

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '@base-ui/react/button';
import { StudioSelect } from './studio-controls';
import { FluidProvider } from '@fluidkit/react';
import { StudioFluidSurface as FluidSurface } from './studio-fluid-surface';
import { createFluidRuntime, type FluidRuntime } from '@fluidkit/core';
import { architectureReviewGraph, architectureReviewHeight, architectureReviewMermaid, architectureReviewModule, architectureReviewReturnUrl, architectureReviewScene, createArchitectureReviewFlow, type WorkspaceData } from '@fluidkit/cases';
import { BackendModeSchema, type BackendMode } from '@fluidkit/contracts';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { FlowProofExport } from './flow-proof-export';
import { EffectLab, EffectTransport } from './effect-lab';
import styles from './flow-explorer.module.css';

/** The optional documentation preview is loaded only after an explicit open action. */
function MermaidPreview({ code }: { code: string }) {
  const t = useStudioMessages();
  const id = useId().replace(/[^a-z0-9]/gi, ''), host = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('Diagramm wird geladen …');
  useEffect(() => {
    let active = true;
    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', fontFamily: 'Inter, sans-serif' });
      const result = await mermaid.render(`review-mermaid-${id}`, code);
      if (active && host.current) { host.current.innerHTML = result.svg; setMessage(''); }
    }).catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : 'Diagramm konnte nicht dargestellt werden. Der Textvertrag bleibt verfügbar.'); });
    return () => { active = false; };
  }, [code, id]);
  return <><div className={styles.mermaid} ref={host} role="img" aria-label={t('reviewGraph')}/>{message && <p role="status">{message}</p>}</>;
}
function FlowSurface({ runtime, onMetrics, onControls, backend }: { runtime: FluidRuntime; onMetrics: (metrics: SurfaceMetrics) => void; onControls: (controls: SurfacePlaybackControls | null) => void; backend: BackendMode }) {
  const host = useRef<HTMLDivElement>(null), [width, setWidth] = useState(1000), [error, setError] = useState('');
  useEffect(() => {
    const element = host.current; if (!element) return;
    const observer = new ResizeObserver(entries => { const value = entries[0]?.contentRect.width; if (value && value > 0) setWidth(value); });
    observer.observe(element); return () => observer.disconnect();
  }, []);
  return <div ref={host} className={styles.surface}><FluidProvider runtime={runtime}><FluidSurface height={architectureReviewHeight(width)} backendMode={backend} onMetrics={onMetrics} onControls={onControls} onError={error => setError(error.message)}/></FluidProvider>{error && <p className={styles.error} role="alert">{error}</p>}</div>;
}
function ReviewTrace({ runtime }: { runtime: FluidRuntime }) {
  const t = useStudioMessages();
  const entries = useSyncExternalStore(runtime.subscribeTrace, runtime.getTraceSnapshot, runtime.getTraceSnapshot);
  const events = entries.filter(entry => entry.kind === 'accepted' || entry.kind === 'rejected').slice(-8).toReversed();
  return <section className={styles.trace} aria-label={t('traceLabel')}><div className={styles.sectionHeading}><span>LIVE / CORE TRACE</span><strong>{t(events.length ? 'traceSteps' : 'traceBegin')}</strong></div>
    {events.length ? <ol>{events.map(entry => <li key={entry.sequence}><span className={styles.traceRevision}>r{entry.revision}</span><code>{entry.eventType}</code><span>{runtime.flow.states[entry.state]?.label ?? entry.state}</span><small>{entry.kind === 'accepted' ? 'angenommen' : 'abgelehnt'} · {entry.reason ?? 'programmatic'}</small></li>)}</ol> : <p>{t('traceEmpty')}</p>}</section>;
}
export function FlowExplorer({ data, moduleId, buildId }: { data: WorkspaceData; moduleId: string; buildId: string }) {
  const {locale} = useStudioLocale(), t = useStudioMessages();
  const module = architectureReviewModule(data, moduleId), surfaceHost = useRef<HTMLElement>(null);
  const runtime = useMemo(() => { const flow = createArchitectureReviewFlow(data, moduleId); return createFluidRuntime({ flow, projections: { 'architecture-review': (snapshot, viewport, _settings, language, context) => architectureReviewScene(data, moduleId, flow, snapshot, viewport, language, context) } }); }, [data, moduleId]);
  const lifetime = useRef<{ runtime: FluidRuntime; token: symbol } | null>(null);
  useEffect(() => { const token = Symbol(); lifetime.current = { runtime, token }; return () => { queueMicrotask(() => { if (lifetime.current?.runtime !== runtime || lifetime.current.token === token) runtime.dispose(); }); }; }, [runtime]);
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null), [controls, setControls] = useState<SurfacePlaybackControls | null>(null);
  const updateControls = useCallback((value: SurfacePlaybackControls | null) => { setControls(value); if (!value) setMetrics(null); }, []);
  const [backend, setBackend] = useState<BackendMode>('webgpu-first'), [showMermaid, setShowMermaid] = useState(false);
  const code = useMemo(() => architectureReviewMermaid(runtime.flow, undefined, locale), [runtime, locale]);
  const [download, setDownload] = useState<{ url: string; revision: number } | null>(null);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download.url); }, [download]);
  function prepareExport() {
    const current = runtime.getSnapshot();
    const content = architectureReviewMermaid(runtime.flow, current.state, locale);
    setDownload({ url: URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' })), revision: current.revision });
  }
  function preview() {
    if (controls?.getRecording()) controls.replay();
    // Preview is explicitly visual-only; it never advances the local review.
  }
  return <main className={styles.page}>
    <nav className={styles.navigation} aria-label="Flow Explorer Navigation"><StudioLink href={architectureReviewReturnUrl(module.id)}>← Workspace</StudioLink><span>FLUID STUDIO / FLOW EXPLORER</span><StudioLink href="/studio/rehearsal">Rehearsal ↗</StudioLink></nav>
    <header className={styles.hero}><div><span className={styles.eyebrow}>A CLEAR PATH THROUGH COMPLEXITY</span><h1>{t('flowTitle')}<br/><em>{t('flowSubtitle')}</em></h1><p>{t('flowIntro')}</p></div><div className={styles.heroAside}><span>01 / ARCHITECTURE REVIEW</span><strong>{module.id}</strong><p>{t('localData')}</p><div className={styles.heroCount}><b>{architectureReviewGraph(runtime.flow,locale).nodes.length}</b> {t('states')} <b>{architectureReviewGraph(runtime.flow,locale).edges.length}</b> {t('paths')}</div></div></header>
    <section ref={surfaceHost} className={styles.canvasPanel} aria-label={t('localReview')}><div className={styles.canvasBar}><div className={styles.backend}><i data-ready={Boolean(metrics)}/><strong>{metrics ? metrics.backend === 'webgpu' ? 'WebGPU aktiv' : 'WebGL2 aktiv · Three.js' : 'GPU wird initialisiert …'}</strong><span>{runtime.flow.states[snapshot.state]!.label} · r{snapshot.revision}</span></div><label>Backend<StudioSelect value={backend} onChange={event => { const value = BackendModeSchema.parse(event.target.value); setMetrics(null); setBackend(value); }}><option value="webgpu-first">WebGPU bevorzugt</option><option value="webgpu-only">Nur WebGPU</option><option value="webgl2">WebGL2 prüfen</option></StudioSelect></label></div>
      {metrics?.fallbackReason && <p className={styles.note} role="status">{metrics.fallbackReason}</p>}
      <FlowSurface key={backend} runtime={runtime} onMetrics={setMetrics} onControls={updateControls} backend={backend}/>
      <div className={styles.transport}><EffectTransport controls={controls} metrics={metrics}/></div>
    </section>
    <div className={styles.evidenceGrid}><ReviewTrace runtime={runtime}/><section className={styles.context}><div className={styles.sectionHeading}><span>MODUL / ECHTER BESTAND</span><strong>{module.name}</strong></div><dl><div><dt>{t('moduleGroup')}</dt><dd>{module.group}</dd></div><div><dt>Version</dt><dd>{module.version}</dd></div><div><dt>{t('inputFiles')}</dt><dd>{module.files}</dd></div><div><dt>{t('dependencies')}</dt><dd>{module.dependencies.length}</dd></div></dl><p>{t('internalLinks')}</p><div className={styles.dependencies}>{module.internal.length ? module.internal.map(id => <StudioLink key={id} href={`/studio/flows?module=${encodeURIComponent(id)}`}>{id} ↗</StudioLink>) : <span>{t('noInternal')}</span>}</div><small>{data.source}. Zeilen und Dateianzahl messen Umfang, keine Qualität.</small></section></div>
    <details className={styles.disclosure}><summary>{t('designEffects')} <span>{t('sixEffects')}</span></summary><EffectLab runtime={runtime} metrics={metrics} controls={controls} onPreview={preview}/><p className={styles.note}>{t('reviewReplay')}</p></details>
    <section className={styles.contract}><div className={styles.sectionHeading}><span>ONE CONTRACT / THREE PERSPECTIVES</span><strong>{t('graphContract')}</strong></div><p>{t('graphIntro')}</p><div className={styles.contractActions}><Button type="button" aria-expanded={showMermaid} onClick={() => setShowMermaid(value => !value)}>{t(showMermaid ? 'graphClose' : 'graphOpen')}</Button><Button type="button" onClick={prepareExport}>{t('graphExport')}</Button>{download && <StudioLink href={download.url} download={`architecture-review-${module.id}-r${download.revision}.mmd`}>.mmd herunterladen · r{download.revision}</StudioLink>}</div>{showMermaid && <MermaidPreview code={code}/>}<details><summary>{t('graphSource')}</summary><pre>{code}</pre></details></section>
    <section className={styles.contract}><div className={styles.sectionHeading}><span>QA / LOKALER NACHWEIS</span><strong>{t('flowCapture')}</strong></div><FlowProofExport runtime={runtime} controls={controls} data={data} moduleId={moduleId} buildId={buildId} surfaceHost={surfaceHost}/></section>
    <footer className={styles.footer}><strong>{t('flowDecision')}</strong><p>{t('flowDecisionHint')}</p><StudioLink href={architectureReviewReturnUrl(module.id)}>{t('flowReturn',{module:module.id})}</StudioLink></footer>
  </main>;
}
