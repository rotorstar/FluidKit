'use client';
import { useDiagnosticMessages } from './diagnostic-locale';
import { StudioLink, useStudioMessages } from './studio-locale';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Button } from '@base-ui/react/button';
import { DEFAULT_EFFECT_SETTINGS, type QualityReport } from '@fluidkit/contracts';
import { createFluidRuntime, flowToMermaid } from '@fluidkit/core';
import { createSimulationFlow, simulationCanPrepare, simulationLocation, simulationScene, simulationSearch, type SimulationDataset } from '@fluidkit/cases';
import { FluidProvider } from '@fluidkit/react';
import { StudioFluidSurface as FluidSurface } from './studio-fluid-surface';
import type { SurfaceMetrics, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { EffectLab, EffectTransport } from './effect-lab';
import { UIQuality } from './ui-quality';

export function SimulationShowcase({ dataset, staticReport }: { dataset: SimulationDataset; staticReport: QualityReport }) {
  const tr = useDiagnosticMessages();
  const t = useStudioMessages();
  const runtime = useMemo(() => createFluidRuntime({ flow: createSimulationFlow(dataset), effectSettings: DEFAULT_EFFECT_SETTINGS,
    guards: { 'can-prepare': snapshot => simulationCanPrepare(dataset, snapshot) },
    projections: { simulation: (snapshot, viewport, _settings, language, context) => simulationScene(dataset, snapshot, viewport, language, context) } }), [dataset]);
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null), [controls, setControls] = useState<SurfacePlaybackControls | null>(null), [urlError, setUrlError] = useState('');
  const lifetime = useRef<symbol | null>(null);
  useEffect(() => { const token = Symbol(); lifetime.current = token; return () => { queueMicrotask(() => { if (lifetime.current === token) runtime.dispose(); }); }; }, [runtime]);
  useEffect(() => {
    let restoring = false;
    const restore = () => { restoring = true; try { const result = runtime.send('navigation.restore', simulationLocation(window.location.search, dataset), 'host'); if (!result.accepted) throw new Error(result.reason); setUrlError(''); } catch (error) { setUrlError(error instanceof Error ? error.message : 'Ungültige URL'); } finally { restoring = false; } };
    restore();
    const unsubscribe = runtime.subscribe(() => { if (!restoring) { const next = simulationSearch(runtime.getSnapshot()); if (next !== window.location.search) window.history.pushState(null, '', `${window.location.pathname}${next}${window.location.hash}`); } });
    window.addEventListener('popstate', restore); return () => { unsubscribe(); window.removeEventListener('popstate', restore); };
  }, [runtime, dataset]);
  return <FluidProvider runtime={runtime}><div className="showcase-shell simulation-shell"><main className="showcase-content">
    <nav className="simulation-navigation" aria-label={t('chooseCase')}><StudioLink href="/">Workspace</StudioLink><StudioLink href="/studio/acceptance">AC-Abgleich</StudioLink><StudioLink href="/studio/simulations/real-estate" aria-current={dataset.id==='real-estate'?'page':undefined}>{t('caseHousing')}</StudioLink><StudioLink href="/studio/simulations/commerce" aria-current={dataset.id==='commerce'?'page':undefined}>Commerce</StudioLink><StudioLink href="/studio/simulations/travel" aria-current={dataset.id==='travel'?'page':undefined}>{t('caseTravel')}</StudioLink></nav>
    <div className="page-heading"><div><div className="eyebrow">CASE SIMULATION</div><h1>{t('simulationTitle')}</h1><p>{t('simulationIntro')}</p></div></div>
    <p className="simulation-notice">{t('simulationSource',{time:String(snapshot.fields.scenarioTime)})}</p>
    {urlError && <p role="alert">{tr('invalidURL')}</p>}
    <details className="effect-editor"><summary>{t('simulationEffects')}</summary><EffectLab runtime={runtime} metrics={metrics} controls={controls} onPreview={() => { runtime.send('view.cards'); }} /></details>
    {dataset.id==='travel' && <div className="quality-actions"><Button className="outline-button" onClick={() => runtime.send('clock.expire', {}, 'host')}>{t('expireQuote')}</Button><Button className="outline-button" onClick={() => runtime.send('clock.reset', {}, 'host')}>{t('resetClock')}</Button></div>}
    <section className="showcase-preview" aria-label={t('simulationOffers')}><div className="panel-toolbar"><span>{t(metrics ? metrics.backend==='webgpu'?'webgpuActive':'webglActive':'startingGPU')}</span><span>Simulation · {dataset.id}</span></div>
      {metrics?.fallbackReason && <p role="status">{metrics.fallbackReason}</p>}
      <EffectTransport controls={controls} metrics={metrics}/>
      <div className="simulation-canvas" data-view={snapshot.state} style={{ '--simulation-stack-height': `${450+dataset.records.length*230}px`, '--simulation-grid-height': `${450+Math.ceil(dataset.records.length/2)*230}px`, '--simulation-table-height': `${500+dataset.records.length*150}px` } as CSSProperties}>
        <FluidSurface onMetrics={setMetrics} onControls={value => { setControls(value); if (!value) setMetrics(null); }}/>
      </div>
    </section>
    <p>{t('simulationSummary',{state:snapshot.state,selection:String(snapshot.fields.selected),revision:snapshot.revision})}</p>
    <details><summary>{t('stateUrl')}</summary><pre>{flowToMermaid(runtime.flow)}</pre></details>
    <UIQuality key={`${snapshot.revision}:${Boolean(controls)}`} controls={controls} runtime={runtime} staticReport={staticReport}/>
  </main></div></FluidProvider>;
}
