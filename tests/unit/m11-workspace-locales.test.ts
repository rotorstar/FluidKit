import { createHash } from 'node:crypto';
import { createTransitionClip, recordTransitionClip } from '@fluidkit/effects';
import { deriveLocalizedRecording } from '../../packages/webgpu/src/restage';
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { glyph } from '@pmndrs/glyph';
import { ThreeConfig } from '@pmndrs/glyph/three';
import { Scene } from 'three/webgpu';
import { caseMessage, createWorkspaceFlow, createSimulationFlow, formatSimulationMoney, simulationScene, simulationRows, workspaceScene, workspaceCollectionOrder, workspaceWrap, SIMULATION_DATASETS } from '@fluidkit/cases';
import { SceneNodeSchema } from '@fluidkit/contracts';
import { createFluidRuntime, resolveSceneLayout } from '@fluidkit/core';
import { LOCALES, resolveLocaleContext } from '@fluidkit/i18n';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { loadSurfaceFonts } from '../../packages/webgpu/src/fonts';
import { glyphCaretAtOffset } from '../../packages/webgpu/src/text-input';
import config from '../../font-bake.config.json';

describe('multilingual runtime projections', () => {
  it('validates every ICU pattern and preserves the model, focus, selection and IME draft while changing language', async () => {
    expect(() => caseMessage.validate()).not.toThrow();
    const data = await readWorkspace(process.cwd());
    const runtime = createFluidRuntime({flow:createWorkspaceFlow(data), projections: {
      workspace: (snapshot, viewport, settings, locale) => workspaceScene(data, snapshot, viewport, settings, locale),
    }, collectionOrder:(snapshot,_id,locale)=>workspaceCollectionOrder(data,snapshot,locale)});
    try {
      runtime.send('collection.change',{collectionId:'modules',keys:['core','webgpu']});
      runtime.send('field.change',{fieldId:'query',value:'Core'});
      const initial = runtime.getSnapshot(), viewport = {width:390,height:2400};
      runtime.setInteraction({focusedId:'search', composingId:'search'},viewport);
      runtime.setLocale('en'); runtime.setLocale('fr');
      expect(runtime.getLocale()).toBe('de');
      runtime.setInteraction({composingId:null},viewport);
      expect(runtime.getScene(viewport).find(node=>node.id==='column-dependencies')?.text).toBe('Dépendances');
      expect(runtime.getScene(viewport).find(node=>node.id==='search')?.text).toBe('Core');
      expect(runtime.getInteraction().focusedId).toBe('search');
      expect(runtime.getSnapshot()).toBe(initial);
      for(const from of LOCALES) for(const to of LOCALES.filter(lang=>lang!==from)){
        runtime.setLocale(from); const source=runtime.getScene(viewport);
        runtime.setLocale(to); const target=runtime.getScene(viewport);
        expect(target.map(node=>node.id)).toEqual(source.map(node=>node.id));
        expect(target.find(node=>node.id==='view-table')?.text).toBe(caseMessage(to,'view.table'));
      }
    } finally { runtime.dispose(); }
  });

  it('restages only known endpoint projections and preserves source hash, language and redaction', async () => {
    const nodes = [SceneNodeSchema.parse({id:'name',kind:'text',text:'Name',anatomy:{componentId:'form',part:'label',behavior:'presentation'}})];
    const sensitive = {...nodes[0]!,id:'draft',sensitive:true,text:'[redacted]'};
    const viewport={width:390,height:500};
    const profile={context:resolveLocaleContext('de'),catalogFingerprint:'source',fontFingerprints:['a'.repeat(64)],buildId:'build'};
    const original=recordTransitionClip(createTransitionClip({source:nodes,target:[...nodes,sensitive],viewport,plan:null,durationMs:400,motionVersion:2,languageProfile:profile}),'proof',true);
    const serialized=JSON.stringify(original);
    const localized=[{...nodes[0]!,text:'Nom'}];
    const result=await deriveLocalizedRecording(original,localized,[...localized,{...sensitive,sensitive:false,text:'private draft'}],{...profile,context:resolveLocaleContext('fr')});
    expect(result?.sourceRecordingSha256).toBe(createHash('sha256').update(serialized).digest('hex'));
    expect(result?.recording.target[0]?.text).toBe('Nom');
    expect(JSON.stringify(result)).not.toContain('private draft');
    expect(JSON.stringify(original)).toBe(serialized);
    expect(await deriveLocalizedRecording(original,[],localized,profile)).toBeNull();
  });

  it('formats a stored quote at midnight in the explicit host zone', () => {
    const dataset=SIMULATION_DATASETS.find(data=>data.id==='travel')!;
    const record=dataset.records[0]!;
    if(record.kind!=='stay') throw new Error('Travel fixture must be a stay');
    const date='2026-11-20T23:55:00.000Z';
    const data={...dataset,records:[{...record,quotedAt:date,quoteExpiresAt:'2026-11-21T00:10:00.000Z'}]};
    const runtime=createFluidRuntime({locale:resolveLocaleContext('fr',{timeZone:'Europe/Paris'}),flow:createSimulationFlow(data),
      guards:{'can-prepare':()=>true},projections:{simulation:(s,v,_e,l,c)=>simulationScene(data,s,v,l,c)}});
    try {
      runtime.send('detail.open');
      runtime.send('field.change',{fieldId:'scenarioTime',value:date});
      const terms=()=>runtime.getScene().find(node=>node.id==='selected-terms')?.text;
      expect(terms()).toContain('01:10');expect(terms()).toContain('00:55');expect(terms()).toContain('Europe/Paris');
      const snapshot=runtime.getSnapshot();runtime.setLocale('en');
      expect(terms()).toContain('00:10');expect(terms()).toContain('23:55');expect(runtime.getSnapshot()).toBe(snapshot);
    } finally {runtime.dispose();}
  });

  it('keeps German case copy while displaying British currency and numeric grouping', async () => {
    const context = resolveLocaleContext('de', { formatLocale: 'en-GB' });
    const travel = SIMULATION_DATASETS.find(dataset => dataset.id === 'travel')!;
    const dataset = { ...travel, records: [{ ...travel.records[0]!, priceMinor: 123456 }] };
    const simulation = createFluidRuntime({
      locale: context, flow: createSimulationFlow(dataset), guards: { 'can-prepare': () => false },
      projections: { simulation: (s, v, _settings, language, host) => simulationScene(dataset, s, v, language, host) },
    });
    try {
      simulation.send('detail.open');
      expect(simulation.getScene().find(node => node.id === 'selected-price')?.text).toBe('€1,234.56');
      expect(simulation.getScene().find(node => node.id === 'sim-label')?.text).toBe('SIMULATION / SYNTHETISCHE DATEN');
    } finally { simulation.dispose(); }

    const workspace = await readWorkspace(process.cwd());
    const data = { ...workspace, modules: workspace.modules.slice(0, 2).map((module, i) => ({ ...module, lines: i ? 17 : 12345 })) };
    const first = data.modules[0]!;
    const runtime = createFluidRuntime({
      locale: context, flow: createWorkspaceFlow(data),
      projections: { workspace: (s, v, settings, language, host) => workspaceScene(data, s, v, settings, language, host) },
    });
    const text = (id: string) => runtime.getScene({ width: 768, height: 1800 }).find(node => node.id === id)?.text;
    try {
      runtime.send('select.' + first.id);
      expect(text('detail-stat-1')).toBe('12,345\nZeilen');
      runtime.send('view.atlas');
      expect(text('atlas-total')).toContain('12,362 Zeilen');
      runtime.send('view.compare');
      runtime.send('compare.suggest');
      expect(text('compare-' + first.id + '-lines')).toBe('12,345');
      runtime.setLocale('de');
      expect(text('compare-' + first.id + '-lines')).toBe('12.345');
    } finally { runtime.dispose(); }
  });

  it('sorts numbers before currency formatting, folds accents for search and breaks display ties by immutable ID', () => {
    const original=SIMULATION_DATASETS[0]!, record=original.records[0]!;
    const dataset={...original,records:[['zz','Îlot 10',123456],['aa','Îlot 2',950],['bb','Îlot 2',900000]].map(([id,title,price])=>({...record,id:'sim-'+id,title:String(title),priceMinor:Number(price)}))};
    for (const locale of LOCALES) {
      const runtime=createFluidRuntime({locale,flow:createSimulationFlow(dataset),guards:{'can-prepare':()=>false},projections:{simulation:(s,v,_e,l)=>simulationScene(dataset,s,v,l)}});
      try {
        runtime.send('field.change',{fieldId:'query',value:'ilot'});
        expect(simulationRows(dataset,runtime.getSnapshot(),locale).map(item=>item.id)).toEqual(['sim-aa','sim-bb','sim-zz']);
        runtime.send('sort.price-asc');
        expect(simulationRows(dataset,runtime.getSnapshot(),locale).map(item=>item.id)).toEqual(['sim-aa','sim-zz','sim-bb']);
        expect(runtime.getScene().find(node=>node.id==='record-sim-zz-title')?.text).toBe('Îlot 10');
      } finally { runtime.dispose(); }
    }
    expect(formatSimulationMoney(123456,'de')).toBe('1.234,56\u00a0€');
    expect(formatSimulationMoney(123456,'en')).toBe('€1,234.56');
    const french=formatSimulationMoney(123456,'fr');
    expect(french).toBe('1\u202f234,56\u00a0€');
    expect(workspaceWrap(french,200)).toEqual([french]);
  });
});

describe('offline shaping profiles', () => {
  const blob=async(path:string)=>new Blob([await readFile(path)]);
  it('renders French narrow grouping space, ligatures, controls and source text without missing glyphs', async () => {
    const fonts=await loadSurfaceFonts(await blob(config.fonts[0]!.output));
    const handle=glyph.handle('m11-french-spacing',ThreeConfig), text=handle.createText({font:fonts.createSelection(handle),text:'',style:{fontSize:22,language:'fr'}});
    const scene=new Scene();scene.add(text);
    try {
      const width=(value:string)=>{text.text=value;glyph.shape();expect(text.measure().missingGlyphCount,value).toBe(0);return text.measure().width;};
      width('Dépendances · Œuvre · cœur · 1\u202f234,56\u00a0€');
      expect(width('1\u202f234')).toBeGreaterThan(width('1234'));
      expect(width('1\u202f234')).toBeLessThan(width('1\u00a0234'));
    } finally {scene.remove(text);text.dispose();fonts.dispose();handle.dispose();}
  });
  it('resolves logical RTL positions through Yoga while preserving physical diagram coordinates', () => {
    const node=SceneNodeSchema.parse({id:'name',kind:'input',anatomy:{componentId:'form',part:'name',behavior:'textbox'},textLanguage:'ar',textDirection:'rtl',inlineStart:20,x:35,width:120,height:40});
    const physical={...node,id:'physical',inlineStart:undefined};
    const arranged=resolveSceneLayout([node,physical],{width:400,height:100});
    expect(arranged.map(item=>item.x)).toEqual([260,35]);
  });
  it('shapes an isolated Arabic paragraph with a Latin ID, digits, punctuation and bidirectional selections', async () => {
    const font=config.fonts.find(font=>font.id==='noto-sans-arabic-pilot')!;
    const fonts=await loadSurfaceFonts(await blob(config.fonts[0]!.output),[await blob(font.output)]);
    const handle=glyph.handle('m11-bidi',ThreeConfig), value=font.corpus![0]!;
    const text=handle.createText({font:fonts.createSelection(handle),text:value,style:{fontSize:20,language:'ar',direction:'rtl'}});
    const scene=new Scene();scene.add(text);
    try {
      glyph.shape();
      expect(text.measure().missingGlyphCount).toBe(0);
      const levels=text.withGlyphs(view=>Array.from({length:view.glyphCount},(_,i)=>view.glyphAt(i).bidiLevel%2));
      expect(new Set(levels)).toEqual(new Set([0,1]));
      for(const segment of ['مرحبا','webgpu','123','بالعالم']){
        const from=value.indexOf(segment), to=from+segment.length;
        expect(text.selectionRects(from,to)?.some(rect=>rect.width>0)).toBe(true);
        expect(glyphCaretAtOffset(text,value,from)?.rect.height).toBeGreaterThan(0);
      }
    } finally {scene.remove(text);text.dispose();fonts.dispose();handle.dispose();}
  });
});
