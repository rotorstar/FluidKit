'use client';
import { useDiagnosticMessages } from './diagnostic-locale';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '@base-ui/react/button';
import { StudioLink, useStudioLocale, useStudioMessages } from './studio-locale';
import { workspaceStage } from '../lib/workspace-stage';
import { StructuralControls } from './structural-controls';
import { connectWorkspaceHistory } from '../lib/workspace-navigation';
import styles from './structural-workspace.module.css';
import { StudioSelect } from './studio-controls';
import { Tabs } from '@base-ui/react/tabs';
import { createFluidRuntime, flowToMermaid } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, workspaceRows, workspaceSearch, type WorkspaceData } from '@fluidkit/cases';
import { FluidProvider } from '@fluidkit/react';
import type { SurfaceMetrics, BackendMode, SurfacePlaybackControls } from '@fluidkit/webgpu';
import { DEFAULT_EFFECT_SETTINGS, type FluidProject, type QualityReport } from '@fluidkit/contracts';
import { EffectLab, EffectTransport } from './effect-lab';
import { WorkspaceSurface } from './workspace-surface';
import { EffectShowcaseTour } from './effect-showcase-tour';
import { UIQuality } from './ui-quality';
import { StudioProof } from './studio-proof';
import { ShowcaseCases } from './showcase-cases';

export function StudioShowcase({data,project,staticReport,workshop = false}:{workshop?: boolean;data:WorkspaceData;project:FluidProject;staticReport:QualityReport}){
  const tr = useDiagnosticMessages();
  const { locale } = useStudioLocale(), t = useStudioMessages();
  const runtime = useMemo(() => createFluidRuntime({
    flow: project.flows.find(flow => flow.id === 'workspace-explorer') ?? createWorkspaceFlow(data),
    effectSettings: { ...DEFAULT_EFFECT_SETTINGS, mode: 'off' },
    collectionOrder: (snapshot, _id, language) => workspaceCollectionOrder(data, snapshot, language),
    projections: { workspace: (snapshot, viewport, _settings, language, context) => workspaceStage(data, snapshot, viewport, workshop, language, context) },
  }), [data, project, workshop]);
  const snapshot=useSyncExternalStore(runtime.subscribe,runtime.getSnapshot,runtime.getSnapshot);
  const trace=useSyncExternalStore(runtime.subscribeTrace,runtime.getTraceSnapshot,runtime.getTraceSnapshot);
  const [metrics,setMetrics]=useState<SurfaceMetrics|null>(null);
  const [controls,setControls]=useState<SurfacePlaybackControls|null>(null);
  const [panel,setPanel]=useState('state');
  const [proof,setProof]=useState(false);
  const [urlError,setUrlError]=useState('');
  const [deviceLossToken,setDeviceLossToken]=useState(0);
  const [backendMode,setBackendMode]=useState<BackendMode>('webgpu-first');
  const lifetime=useRef<{runtime:typeof runtime;token:symbol}|null>(null);
  useEffect(()=>{const token=Symbol();lifetime.current={runtime,token};return()=>{queueMicrotask(()=>{if(lifetime.current?.runtime!==runtime||lifetime.current.token===token)runtime.dispose();});};},[runtime]);
  useEffect(()=>workshop ? undefined : connectWorkspaceHistory(runtime,data,setUrlError),[runtime,data,workshop]);
  const [mobileVersion,setMobileVersion]=useState<'original'|'structure'|'both'>('structure');
  const stages=useRef<(HTMLDivElement|null)[]>([]);
  const [original,setOriginal]=useState<SurfacePlaybackControls|null>(null);
  const [originalMetrics,setOriginalMetrics]=useState<SurfaceMetrics|null>(null);
  const transport=useMemo(()=>{
    if (!controls || !workshop) return controls;
    if (!original) return null;
    return {...controls,seek:(value:number)=>{original.seek(value);controls.seek(value);},pause:()=>{original.pause();controls.pause();},
      play:()=>{original.play();controls.play();},replay:()=>{original.replay();controls.replay();},restoreLive:()=>{original.restoreLive();controls.restoreLive();}};
  },[controls,original,workshop]);
  const rows=workspaceRows(data,snapshot,locale);
  const selected=data.modules.find(module=>module.id===snapshot.fields.selected);
  const scene=runtime.getScene();
  if(proof)return <><div className="return-to-showcase"><Button className="play-button" onClick={()=>setProof(false)}>{t('returnWorkspace')}</Button></div><StudioProof project={project} buildId={staticReport.context.buildId} effectSettings={runtime.getVisualState().settings}/></>;
  function stage(version:1|2) {
    const current=version===1?originalMetrics:metrics;
    return <section key={version} className={styles.stage} data-motion-version={version} data-view={snapshot.state} data-backend={current?.backend} data-phase={current?.phase} data-progress={current?.progress} aria-label={t(version===1?'originalMotion':'structuralMotion')}>
      <div className={styles.stagebar}><strong>{t(workshop?(version===1?'originalLabel':'structureLabel'):'workspaceModules')}</strong><Button className={styles.filter} aria-pressed={snapshot.fields.workspaceTools===true} onClick={()=>runtime.send(snapshot.fields.workspaceTools===true?'tools.close':'tools.open')}>{t('filters')}</Button><span role="status">{t(current?.backend==='webgpu'?'webgpuActive':current?.backend==='webgl2'?'webglActive':'startingGPU')}</span></div>
      {current?.fallbackReason&&<div className="backend-notice">{current.fallbackReason}</div>}
      <div className={styles.scroll} ref={element=>{stages.current[version]=element;}} onScroll={event=>{
        if(!workshop)return;
        const peer=stages.current[version===1?2:1];
        if(peer && Math.abs(peer.scrollTop-event.currentTarget.scrollTop)>1)peer.scrollTop=event.currentTarget.scrollTop;
      }}><WorkspaceSurface compact comparison={workshop} data={data} moduleCount={data.modules.length} motionVersion={version} onMetrics={version===1?setOriginalMetrics:setMetrics} onControls={value=>{if(version===1){setOriginal(value);if(!value)setOriginalMetrics(null);}else{setControls(value);if(!value)setMetrics(null);}}} deviceLossToken={deviceLossToken} backendMode={backendMode}/></div>
    </section>;
  }
  return <FluidProvider runtime={runtime}><main className={styles.page}>
    <header><div><h1>{t(workshop?'workshopTitle':'workspaceTitle')}</h1><p>{workshop?t('workshopDescription'):t('workspaceDescription',{project:data.name,count:data.modules.length})}</p></div>{!workshop&&<StudioLink href="/studio/transitions">{t('openCompare')}</StudioLink>}</header>
    <StructuralControls runtime={runtime} data={data} ready={Boolean(transport)}/>
    {urlError&&<div className="notice" role="alert">{tr('invalidURL')}<Button onClick={()=>{runtime.send('reset');window.history.replaceState(null,'',workspaceSearch(runtime.getSnapshot()));setUrlError('');}}>{t('reset')}</Button></div>}
    {workshop && <EffectTransport controls={transport} metrics={metrics}/>}
    {workshop && <div className={styles.mobileVersions} role="group" aria-label={t('compareVersion')}>
      {([['structure','structure'],['original','original'],['both','both']] as const).map(([key,label])=><Button key={key} type="button" aria-pressed={mobileVersion===key} onClick={()=>setMobileVersion(key)}>{t(label)}</Button>)}
    </div>}
    <div data-mobile-version={mobileVersion} className={workshop?styles.columns:undefined} aria-label={t('gpuWorkspace')}>{workshop&&stage(1)}{stage(2)}</div>
    <div className={styles.notes}><span>{snapshot.state==='compare'?t('selectedComparison'):t('visibleModules',{count:rows.length})} · {t('selectedCount',{count:Array.isArray(snapshot.fields.selection)?snapshot.fields.selection.length:0})}{selected?' · '+selected.id:''}</span>{snapshot.fields.cardsPickedOnly===true&&snapshot.state==='cards'&&<Button className="outline-button" onClick={()=>runtime.send('cards.scope.all')}>{t('allCards')}</Button>}<Button className="outline-button" onClick={()=>runtime.send('reset')}>{t('reset')}</Button></div>
    {!workshop&&<details className={styles.more}><summary>{t('playback')}</summary><EffectTransport controls={controls} metrics={metrics}/></details>}
    <details className={styles.more}><summary>{t('effects')}</summary><EffectLab runtime={runtime} metrics={metrics} controls={controls} onPreview={()=>runtime.send(runtime.getSnapshot().state==='table'?'view.cards':'view.table')}/><EffectShowcaseTour runtime={runtime} data={data} controls={controls}/></details>
    <details className={styles.more}><summary>{t('examples')}</summary><ShowcaseCases runtime={runtime} data={data}/></details>
    <details className={styles.more}><summary>{t('developerTools')}</summary><Button className="outline-button" onClick={()=>setProof(true)}>{t('inputProof')}</Button>
    <Tabs.Root className="showcase-inspector" value={panel} onValueChange={value=>setPanel(String(value))}><Tabs.List className="inspector-tabs" activateOnFocus aria-label={t('showcaseEvidence')}><Tabs.Tab value="state">{t('stateData')}</Tabs.Tab><Tabs.Tab value="anatomy">{t('anatomy')}</Tabs.Tab><Tabs.Tab value="flow">{t('mermaidContract')}</Tabs.Tab><Tabs.Tab value="events">{t('eventTrace')}</Tabs.Tab><Tabs.Tab value="quality">{t('uiQuality')}</Tabs.Tab></Tabs.List>
    <Tabs.Panel value="state"><div className="showcase-facts"><div><small>DOMAIN SNAPSHOT</small><strong>{snapshot.state} / r{snapshot.revision}</strong><span>{String(snapshot.fields.sort)} · {String(snapshot.fields.direction)} · {String(snapshot.fields.group)}</span></div><div><small>GPU PRESENTATION</small><strong>{metrics?.backend??'initializing'} / {metrics?.phase??'pending'}</strong><span>{metrics?.nodes??0} Nodes · {metrics?.frames??0} Frames · {metrics?.durationMs??0} ms</span></div><div><small>{t('dataSource')}</small><strong>{t('sourceTs',{count:data.modules.reduce((sum,module)=>sum+module.files,0)})}</strong><span>{t('captured')} · {data.capturedAt}</span></div><div><small>RENDERER / LIFECYCLE</small><StudioSelect aria-label={t('backend')} value={backendMode} onChange={event=>{const value=event.target.value;if(value==='webgpu-first'||value==='webgpu-only'||value==='webgl2'){setMetrics(null);setBackendMode(value);}}}><option value="webgpu-first">{t('preferWebGPU')}</option><option value="webgpu-only">{t('onlyWebGPU')}</option><option value="webgl2">{t('diagnoseGL')}</option></StudioSelect><Button className="outline-button" onClick={()=>setDeviceLossToken(value=>value+1)}>{t('deviceLoss')}</Button><span>{t('snapshotKept')}</span></div></div></Tabs.Panel>
    <Tabs.Panel value="quality"><UIQuality key={`${snapshot.revision}:${backendMode}:${Boolean(controls)}`} controls={controls} runtime={runtime} staticReport={staticReport} workspaceData={data}/></Tabs.Panel>
    <Tabs.Panel value="anatomy"><div className="showcase-anatomy">{scene.filter(node=>node.anatomy.behavior!=='presentation'||node.semantics?.role).slice(0,28).map(node=><div key={node.id}><code>{node.id}</code><span>{node.semantics?.role??node.anatomy.behavior}</span><small>{node.semantics?.sort??node.kind}</small></div>)}</div></Tabs.Panel>
    <Tabs.Panel value="flow"><pre className="showcase-mermaid">{flowToMermaid(runtime.flow)}</pre></Tabs.Panel>
    <Tabs.Panel value="events"><ol className="showcase-events">{[...trace].reverse().slice(0,12).map(entry=><li key={entry.sequence}><code>{entry.eventType}</code><span>{entry.detail}</span><small>r{entry.revision} · {entry.reason}</small></li>)}</ol></Tabs.Panel></Tabs.Root>
    </details></main></FluidProvider>;
}
