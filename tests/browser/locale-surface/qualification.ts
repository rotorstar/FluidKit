import { createFluidSurface, type FluidSurfaceHandle } from '@fluidkit/webgpu';
import { caseCatalogFingerprint, caseMessage, formatSimulationMoney } from '@fluidkit/cases';
import { SceneNodeSchema, type BackendMode } from '@fluidkit/contracts';
import { resolveLocaleContext, type Locale } from '@fluidkit/i18n';

function project(locale: Locale, width: number, cards: boolean, pseudo = false) {
  const inset=20;
  const entries = [caseMessage(locale,'table.deps'),formatSimulationMoney(123456,locale),caseMessage(locale,'view.cards')];
  return entries.map((value,index)=>SceneNodeSchema.parse({
    id:'probe-'+index,kind:'card',anatomy:{componentId:'locale-proof',part:'part-'+index,behavior:'presentation'},
    text:pseudo?'['+value+' '+value.slice(0,Math.ceil(value.length*.35))+']':value,
    x:inset+(cards && index>0 ? 10 : 0),y:12+index*85,width:width-inset*2-10,height:58,fontSize:18,textLines:1,
    textInset:12,textInsetY:12,color:'#17263c',foreground:'#e8f2ff',
  }));
}
export async function qualify(backend: BackendMode,width:number,reducedMotion:boolean) {
  const canvas=document.querySelector('canvas')!;
  const surface=await createFluidSurface(canvas,{fontUrl:'/fonts/inter.font.glb',backendMode:backend});
  const localeData=(locale:Locale)=>({context:resolveLocaleContext(locale),catalogFingerprint:caseCatalogFingerprint(locale),buildId:'isolated-m11-regression'});
  async function inspect() {
    const audit=await surface.inspectText();
    const errors=audit.issues.filter(issue=>issue.severity==='error' || issue.kind==='truncated');
    if(errors.length) throw new Error(JSON.stringify(errors));
    if(audit.boxes.length<3) throw new Error('Expected visible ink from all three labels');
    return audit;
  }
  async function readPixelHash() {
    const frame=await surface.captureFrame();
    const bytes=Uint8Array.from(atob(frame.image.split(',')[1]!),char=>char.charCodeAt(0));
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
    return {backend:frame.backend,hash};
  }
  const checks: string[]=[];
  const originalReplayHashes: Record<string,string>={};
  let recording:ReturnType<FluidSurfaceHandle['getRecording']>=null;
  try {
    for (const from of ['de','en','fr'] as const) for (const to of ['de','en','fr'] as const) if (from!==to) {
      surface.setScene(project(from,width,false),false,0,null,true,null,localeData(from));await inspect();
      surface.setScene(project(from,width,true),true,1200,null,true,null,localeData(from));
      surface.seek(.5);await inspect();
      const before=surface.getPresentation()!;
      const midpoint = reducedMotion ? undefined : await readPixelHash();
      surface.localizeScene(project(to,width,false),project(to,width,true),resolveLocaleContext(to),caseCatalogFingerprint(to));
      await inspect();
      const after=surface.getPresentation()!;
      if(!reducedMotion && (before.progress!==.5 || after.progress!==.5)) throw new Error('Locale changed the transport');
      if(after.nodes.find(node=>node.id==='probe-1')?.text!==formatSimulationMoney(123456,to)) throw new Error('Translated amount missing from the surface');
      checks.push(from+'→'+to);
      recording=surface.getRecording();
      if(!reducedMotion) {
        if(recording?.schemaVersion!==5 || recording.languageProfile.context.language!==from) throw new Error('Original language was modified');
        surface.loadRecording(recording);surface.replay();surface.seek(1);await inspect();
        surface.seek(.5);await inspect();
        const replayed = await readPixelHash();
        if(replayed.hash !== midpoint?.hash) throw new Error('Replay pixels differ for '+from+'→'+to+' at 50% after reverse seek');
        originalReplayHashes[from+'→'+to]=replayed.hash;
        if(surface.getPresentation()!.nodes.find(node=>node.id==='probe-1')?.text!==formatSimulationMoney(123456,from)) throw new Error('Replay language changed');
      }
    }
    surface.setScene(project('fr',width,false,true),false,0,null,false,null,localeData('fr'));
    await inspect();checks.push('pseudo+35%');
    surface.setScene(project('fr',width,false),false,0,null,false,null,localeData('fr'));
    const audit=await inspect(), frame=await readPixelHash();
    return {backend:frame.backend,width,reducedMotion,checks,originalReplayHashes,inkBoxes:audit.boxes.length,frameHash:frame.hash};
  } finally {surface.dispose();}
}
Object.assign(window,{qualify});

import { createFluidRuntime } from '@fluidkit/core';
import { createWorkspaceFlow, workspaceCollectionOrder, type WorkspaceData } from '@fluidkit/cases';
import { workspaceStage } from '../../../apps/studio/lib/workspace-stage';

export async function qualifyWorkspace(backend: BackendMode, width: number, data: WorkspaceData) {
  const canvas=document.querySelector('canvas')!, viewport={width,height:1500};
  canvas.style.height=viewport.height+'px';
  const runtime=createFluidRuntime({flow:createWorkspaceFlow(data),collectionOrder:(s,_id,l)=>workspaceCollectionOrder(data,s,l),
    projections:{workspace:(s,v,_e,l)=>workspaceStage(data,s,v,false,l)}});
  const surface=await createFluidSurface(canvas,{fontUrl:'/fonts/inter.font.glb',backendMode:backend,onError:error=>console.error(error.message),onCapabilitiesChange:cap=>runtime.setRenderCapabilities(cap)});
  const issues: string[]=[];
  let samples=0;
  try {
    for(const locale of ['de','en','fr'] as const) {
      runtime.setLocale(locale);
      const profile={context:resolveLocaleContext(locale),catalogFingerprint:caseCatalogFingerprint(locale)};
      for(const [initial,events] of [
        ['table',['view.cards','view.table']],
        ['compare',['view.cards','view.compare']],
        ['atlas',['atlas.group.Kernel','atlas.group.all']],
      ] as const) {
        runtime.send('reset');runtime.send('collection.change',{collectionId:'modules',keys:['core','webgpu']});runtime.send('view.'+initial);
        surface.setScene(runtime.getScene(viewport),false,0,null,false,null,profile);await surface.inspectText();
        for(const event of events){
          if(!runtime.send(event).accepted)throw new Error('Invalid event '+event);
          surface.setScene(runtime.getScene(viewport),true,1200,runtime.getVisualState().current,true,null,profile);
          for(let step=0;step<=20;step++){
            surface.seek(step/20);
            const audit=await surface.inspectText(); samples++;
            for(const issue of audit.issues.filter(issue=>issue.severity==='error' ||
              (locale==='fr' && (step===0 || step===20) && issue.kind==='truncated' && issue.nodes.includes('column-dependencies')))){
              const key=[locale,initial,event,step,issue.kind,issue.nodes.join(',')].join('/');
              if(issues.length<50 && !issues.includes(key)) issues.push(key);
            }
          }
        }
      }
    }
    return {backend:surface.getMetrics()?.backend,width,samples,issues};
  } finally {surface.dispose();runtime.dispose();}
}
Object.assign(window,{qualifyWorkspace});
