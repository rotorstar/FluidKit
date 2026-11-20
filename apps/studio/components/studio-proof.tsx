'use client';
import { projectProofOptions } from '@fluidkit/cases';
import { useDiagnosticMessages } from './diagnostic-locale';
import { StudioLink } from './studio-locale';
import { NativeInputObserver } from './native-input-observer';
import { Button } from '@base-ui/react/button';
import { StudioSelect } from './studio-controls';
import { Tabs } from '@base-ui/react/tabs';
import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { createFluidRuntime, flowToMermaid } from '@fluidkit/core';
import { FluidProvider } from '@fluidkit/react';
import { StudioFluidSurface as FluidSurface } from './studio-fluid-surface';
import type { FluidProject, EffectSettings } from '@fluidkit/contracts';
import type { SurfaceMetrics } from '@fluidkit/webgpu';

const stages = ['ready', 'validating', 'result', 'detail'];
export function StudioProof({ project, effectSettings, buildId }: { project: FluidProject; effectSettings?: EffectSettings; buildId: string }) {
  const tr = useDiagnosticMessages();
  const flow = project.flows[0];
  if (!flow) throw new Error('Project has no flow');
  const runtime = useMemo(() => createFluidRuntime({ ...projectProofOptions(flow), effectSettings }), [flow, effectSettings]);
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const [playing, setPlaying] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SurfaceMetrics | null>(null);
  const [tab, setTab] = useState<'inspector' | 'flow' | 'anatomy'>('inspector');
  const interaction = useSyncExternalStore(runtime.subscribeInteraction, runtime.getInteraction, runtime.getInteraction);
  const trace = useSyncExternalStore(runtime.subscribeTrace, runtime.getTraceSnapshot, runtime.getTraceSnapshot);
  const suggestion = useSyncExternalStore(runtime.subscribe, runtime.getSuggestion, runtime.getSuggestion);
  const [notice, setNotice] = useState('');
  const request = useRef<AbortController | null>(null);
  const lifetime = useRef<{ runtime: typeof runtime; token: symbol } | null>(null);
  useEffect(() => {
    const token = Symbol(); lifetime.current = { runtime, token };
    return () => { queueMicrotask(() => {
      // StrictMode immediately reacquires the same instance. A real unmount or
      // a different flow releases it, including in-flight action controllers.
      if (lifetime.current?.runtime !== runtime || lifetime.current.token === token) runtime.dispose();
    }); };
  }, [runtime]);
  useEffect(() => {
    if (snapshot.state !== 'validating') return;
    const controller = new AbortController(); request.current = controller;
    setReport(null); setValidationError(null);
    void fetch('/api/validate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(flow), signal: controller.signal }).then(async response => {
      const data: unknown = await response.json();
      if (!response.ok || typeof data !== 'object' || data === null || !('message' in data) || typeof data.message !== 'string') throw new Error('Flow-Validierung fehlgeschlagen');
      if (!controller.signal.aborted) setReport(data.message);
    }).catch((error: unknown) => { if (!controller.signal.aborted) setValidationError(error instanceof Error ? error.message : 'Prüffehler'); });
    return () => controller.abort();
  }, [flow, snapshot.state]);
  useEffect(() => {
    if (!playing) return;
    if (snapshot.state === 'ready') { runtime.send('validation.start'); return; }
    if (snapshot.state === 'validating' && !report) return;
    if (snapshot.state === 'detail' || snapshot.state === 'failed') { setPlaying(false); return; }
    const timer = setTimeout(() => {
      if (snapshot.state === 'validating' && report) { runtime.send('field.change', { fieldId: 'report', value: report }); runtime.send('validation.complete'); }
      else if (snapshot.state === 'result') runtime.send('detail.open');
    }, snapshot.state === 'validating' ? 1100 : 1800);
    return () => clearTimeout(timer);
  }, [playing, report, runtime, snapshot.state]);
  useEffect(() => {
    if (validationError && snapshot.state === 'validating') { runtime.send('field.change', { fieldId: 'report', value: validationError }); runtime.send('validation.failed'); }
  }, [validationError, runtime, snapshot.state]);
  function step() {
    setPlaying(false);
    if (snapshot.state === 'ready') runtime.send('validation.start');
    else if (snapshot.state === 'validating' && report) { runtime.send('field.change', { fieldId: 'report', value: report }); runtime.send('validation.complete'); }
    else if (snapshot.state === 'result') runtime.send('detail.open');
    else if (snapshot.state === 'detail' || snapshot.state === 'failed') runtime.send('reset');
  }
  function reset() { setPlaying(false); request.current?.abort(); if (snapshot.state !== 'ready') runtime.send('reset'); setReport(null); setValidationError(null); }
  const active = stages.indexOf(snapshot.state);
  return <div className="studio-shell">
    <aside className="sidebar">
      <StudioLink className="brand" href="/"><span className="brand-mark">f</span><span>fluid<span className="brand-light">studio</span></span></StudioLink>
      <div className="workspace-label">WORKSPACE <span>LOCAL</span></div>
      <Button className="workspace-card"><span className="project-mark">F</span><span><strong>FluidKit Pro</strong><small>Framework workspace</small></span><span className="dots">···</span></Button>
      <div className="nav-label">DEVELOP</div>
      <Button className="nav-item selected"><span>◈</span> {tr('visualSim')} <span className="nav-count">01</span></Button>
      <Button className="nav-item" onClick={() => setTab('flow')}><span>⌘</span> {tr('proofFlow')}</Button>
      <Button className="nav-item" onClick={() => { setTab('inspector'); setNotice(tr('inspectorHint')); }}><span>≋</span> {tr('inspector')}</Button>
      <div className="nav-label cases-label">PRACTICE CASES</div>
      <div className="case-current"><span className="tiny-dot" /> Projektworkflow <small>LIVE</small></div>
      {([tr('estateCase'),tr('shopCase'),tr('tripCase')]).map(name => <Button key={name} className="case-item" onClick={() => setNotice(tr('caseHint',{name}))}>{name}<span>↗</span></Button>)}
      <div className="sidebar-bottom"><div className="milestone-badge">MILESTONE 01</div><p>Erleben, prüfen,<br />gemeinsam weiterbauen.</p><span className="version">Contract preview · 0.2.0-alpha</span></div>
    </aside>
    <div className="main-area">
      <header className="topbar"><div><span className="breadcrumb">Workspace</span><span className="slash">/</span><span>{tr('visualSim')}</span></div><div className="topbar-status"><span className="tiny-dot" /> Local session <span className="avatar">TK</span></div></header>
      <main>
        <div className="page-heading"><div><div className="eyebrow">THE FIRST VISUAL PROOF</div><h1>{tr('proofTitle')}</h1><p>{tr('proofLead')}</p></div><Button className="outline-button" onClick={() => { const blob = new Blob([JSON.stringify({ project, snapshot, trace }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'fluid-proof.json'; link.click(); URL.revokeObjectURL(url); }}>{tr('exportProof')}</Button></div>
        <div className="proof-note"><span className="note-icon">◉</span><span><strong>{metrics ? metrics?.backend === 'webgl2' ? 'WebGL2 aktiv.' : 'WebGPU live.' : 'WebGPU-Proof.'}</strong> {tr('simScope')}</span></div>
        {notice && <div className="notice" role="status">{notice}<Button aria-label={tr('dismissHint')} onClick={() => setNotice('')}>×</Button></div>}
        <section className="workbench">
          <div className="preview-column">
            <div className="panel-toolbar"><div className="panel-title"><span className="tiny-dot" /> Live surface <span className="tag">WEBGPU DEFAULT</span></div><Dialog.Root><Dialog.Trigger className="surface-info">{tr('aboutProof')}</Dialog.Trigger><Dialog.Portal><Dialog.Backdrop className="studio-dialog-backdrop" /><Dialog.Popup className="studio-dialog"><Dialog.Title>{tr('aboutTitle')}</Dialog.Title><Dialog.Description>{tr('aboutBody')}</Dialog.Description><ul><li>{tr('realMetadata')}</li><li>{tr('inputPreserved')}</li><li>{tr('markedSim')}</li><li>{tr('inspectParts')}</li></ul><Dialog.Close className="play-button">{tr('closeProof')}</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root></div>
            <NativeInputObserver runtime={runtime} buildId={buildId}><div className="surface-frame"><FluidProvider runtime={runtime}><FluidSurface onMetrics={setMetrics} /></FluidProvider><span className="surface-corner">01 / PROJECT WORKFLOW</span></div></NativeInputObserver>
            <div className="transport"><div className="transport-buttons"><Button className="play-button" onClick={() => setPlaying(value => !value)}>{tr(playing ? 'simPause' : 'simPlay')}</Button><Button className="outline-button" onClick={step} disabled={snapshot.state === 'validating' && !report}>{tr('nextProof')}</Button><Button className="icon-button" aria-label={tr('resetProof')} onClick={reset}>↺</Button></div><div className="transport-info"><span className={playing ? 'running-dot' : 'idle-dot'} /> {tr(playing ? 'simRunning' : 'simSteps')}</div></div>
          </div>
          <Tabs.Root className="inspector" value={tab} onValueChange={(value, details) => { if (value === 'inspector' || value === 'flow' || value === 'anatomy') setTab(value); else details.cancel(); }}>
            <Tabs.List className="inspector-tabs" activateOnFocus aria-label={tr('runtimeViews')}><Tabs.Tab value="inspector">{tr('inspectTab')}</Tabs.Tab><Tabs.Tab value="anatomy">{tr('anatomyTab')}</Tabs.Tab><Tabs.Tab value="flow">{tr('flowTab')}</Tabs.Tab></Tabs.List>
            <Tabs.Panel value="inspector">
              <div className="inspector-section"><div className="section-caption">CURRENT SNAPSHOT <span>↗</span></div><div className="state-value"><span className="tiny-dot" />{flow.states[snapshot.state]?.label}</div><div className="property-row"><span>State</span><code>{snapshot.state}</code></div><div className="property-row"><span>Revision</span><code>{String(snapshot.revision).padStart(3, '0')}</code></div><div className="property-row"><span>{tr('controlMode')}</span><StudioSelect aria-label={tr('controlMode')} value={snapshot.mode} onChange={e => runtime.send('mode.set', { mode: e.target.value })}><option value="manual">{tr('modeManual')}</option><option value="hybrid">{tr('modeHybrid')}</option><option value="auto">{tr('modeAuto')}</option></StudioSelect></div><div className="property-row"><span>Focus / local</span><code>{interaction.focusedId ?? 'none'}</code></div><div className="property-row"><span>GPU phase</span><code>{metrics?.phase ?? 'initializing'}</code></div><div className="property-row"><span>Transition</span><code>{metrics?.durationMs ?? 0} ms</code></div><div className="property-row"><span>Data source</span><code>package.json</code></div></div>
              <div className="inspector-section"><div className="section-caption">CONTENT PRESERVATION</div><div className="content-value"><span>projectName</span><strong>{String(snapshot.fields.projectName)}</strong></div><p className="inspector-copy">{tr('dataPreservation')}</p></div>
              <div className="inspector-section event-section"><div className="section-caption">EVENT TIMELINE <span>{trace.length}</span></div>{trace.length === 0 ? <p className="empty-events">{tr('typeEvent')}</p> : <ol className="event-list">{trace.slice(-5).reverse().map(entry => <li key={entry.sequence}><span className={`event-dot ${entry.kind}`} /><div><code>{entry.eventType}</code><small lang="de">{entry.detail}</small></div><span className="event-rev">r{entry.revision}</span></li>)}</ol>}</div>
              {snapshot.mode !== 'manual' && ['ready', 'result'].includes(snapshot.state) && <div className="inspector-section"><Button className="outline-button full" onClick={() => { const result = runtime.propose({ schemaVersion: 1, id: `proof-plan-${snapshot.revision}`, flowId: flow.id, snapshotRevision: snapshot.revision, policyVersion: 'policy-1', expiresAt: Date.now() + 30000, eventType: 'detail.open', explanation: 'Simulierter Vorschlag: dieselben Inhalte als Detailansicht zeigen.' }); if (!result.accepted) setNotice(result.reason); }}>{tr('simProposal')}</Button><p className="inspector-copy">{tr('simExplain')}</p>{suggestion && <Button className="play-button full" onClick={() => runtime.acceptSuggestion()}>{tr('acceptProposal')}</Button>}</div>}
            </Tabs.Panel>
            <Tabs.Panel value="anatomy"><div className="anatomy-panel"><div className="section-caption">EXPLICIT COMPONENT PARTS</div><p className="inspector-copy">{tr('dataContracts')}</p>{runtime.getScene().map(node => <div className="anatomy-part" key={node.id}><strong>{node.anatomy.componentId}<span>.{node.anatomy.part}</span></strong><div><code>{node.anatomy.behavior}</code><small>visuell: {node.kind}</small></div></div>)}<div className="ownership-note">Core: Fachwerte<br />Interaction: Fokus und Eingabe<br />Surface: GPU-Transition</div></div></Tabs.Panel>
            <Tabs.Panel value="flow"><div className="contract-panel"><div className="section-caption">GENERATED FROM THE CONTRACT</div><pre lang="de">{flowToMermaid(flow)}</pre><p className="inspector-copy">{tr('sameFlow')}</p></div></Tabs.Panel>
          </Tabs.Root>
        </section>
        <section className="flow-strip"><div className="flow-strip-heading"><div><span className="eyebrow">ONE IDENTITY · FOUR FORMS</span><h2>{tr('flowPath')}</h2></div><span className="tag neutral">STATE DRIVEN</span></div><div className="stage-track">{stages.map((stage, index) => <div key={stage} className={`stage ${active === index ? 'current' : active > index ? 'complete' : ''}`}><div className="stage-number">{active > index ? '✓' : `0${index + 1}`}</div><div><strong>{tr((['stageReady','stageCheck','stageResult','stageDetail'] as const)[index]!)}</strong><span>{tr((['stageButton','stageProgress','stageCard','stageView'] as const)[index]!)}</span></div>{index < 3 && <span className="stage-arrow">→</span>}</div>)}</div></section>
        <footer className="proof-footer"><span><span className="tiny-dot" /> {tr(metrics ? 'gpuConfirmed' : 'runtimeStart')}</span><span>{metrics ? `${metrics.nodes} Scene nodes · ${metrics.frames} Frames` : tr('checkingCapabilities')}</span><span>{tr('sessionLocal')}</span></footer>
      </main>
    </div>
  </div>;
}
