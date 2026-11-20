import { resolveLocaleContext, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { caseTranslator } from './messages';
import { z } from 'zod';
import { GPU_PALETTE, defineFlow, type RuntimeSnapshot, type SceneNodeInput } from '@fluidkit/contracts';
import { filterSimulationRecords, formatSimulationMoney, SimulationQuerySchema, selectedSimulationRecord, type SimulationDataset } from './simulation';

export const SIMULATION_TITLES = { 'real-estate': 'Wohnen im nächsten Kontext.', commerce: 'Vom Katalog zur Entscheidung.', travel: 'Angebote werden Erlebnisse.' };
const views = ['cards','table','detail','comparison','prepared','handoff'] as const;
export function simulationRows(dataset: SimulationDataset, snapshot: RuntimeSnapshot, locale: Locale = 'de') {
  const query = SimulationQuerySchema.parse({ search: snapshot.fields.query, sort: snapshot.fields.sort });
  return filterSimulationRecords(dataset, {...query,locale});
}
export function simulationCanPrepare(dataset: SimulationDataset, snapshot: RuntimeSnapshot) {
  const selected = selectedSimulationRecord(dataset, snapshot);
  if (!selected?.available) return false;
  if (selected.kind === 'stay') return Date.parse(String(snapshot.fields.scenarioTime)) < Date.parse(selected.quoteExpiresAt);
  if (selected.kind === 'product') return (selected.variants[Number(snapshot.fields.variant)]?.stock ?? 0) > 0;
  return true;
}
export function createSimulationFlow(dataset: SimulationDataset) {
  return defineFlow({ id: `simulation-${dataset.id}`, name: `Simulation ${dataset.id}`, initial: 'cards', fields: [
    { id: 'query', initial: '', maxLength: 200 }, { id: 'sort', initial: 'name' }, { id: 'selected', initial: dataset.records[0]!.id },
    { id: 'comparison', initial: (dataset.records[1]?.id ?? dataset.records[0]!.id) }, { id: 'variant', initial: '0' }, { id: 'draft', initial: '', maxLength: 1000, sensitive: true },
    { id: 'scenarioTime', initial: dataset.source.asOf },
  ], states: Object.fromEntries(views.map(view => [view, { label: view, nodes: [], projection: 'simulation', on: {
    'view.cards': { target: 'cards', duration: 650 }, 'view.table': { target: 'table', duration: 650 },
    'detail.open': { target: 'detail', duration: 650 },
    ...Object.fromEntries(dataset.records.map(record => [`select.${record.id}`, { target: 'detail', assign: { selected: record.id, variant: '0' }, duration: 750 }])),
    ...Object.fromEntries(dataset.records.map(record => [`compare.${record.id}`, { target: 'comparison', assign: { comparison: record.id }, duration: 750 }])),
    ...Object.fromEntries(['name','price-asc','price-desc'].map(sort => [`sort.${sort}`, { target: view, assign: { sort }, duration: 600 }])),
    ...Object.fromEntries([0,1].map(variant => [`variant.${variant}`, { target: 'detail', assign: { variant: String(variant) }, duration: 400 }])),
    'prepare': { target: 'prepared', guard: 'can-prepare', duration: 750 },
    'handoff': { target: 'handoff', guard: 'can-prepare', duration: 750 },
    'clock.expire': { target: view, assign: { scenarioTime: new Date(Date.parse(dataset.source.asOf)+20*60_000).toISOString() } },
    'clock.reset': { target: view, assign: { scenarioTime: dataset.source.asOf } },
  } }])) });
}
export function simulationScene(dataset: SimulationDataset, snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, locale: Locale = 'de', context: LocaleContext = resolveLocaleContext(locale)): SceneNodeInput[] {
  const tr = caseTranslator(context);
  const money = (value: number, currency: 'EUR') => formatSimulationMoney(value, context, currency);
  const time = (iso: string) => new Intl.DateTimeFormat(context.formatLocale, {hour:'2-digit', minute:'2-digit', hourCycle:'h23', timeZone:context.timeZone}).format(new Date(iso));
  const width = viewport.width, pad = width < 550 ? 18 : 32, inner = width-pad*2;
  const nodes: SceneNodeInput[] = [];
  function add(id: string, value: Omit<SceneNodeInput, 'id' | 'anatomy'> & { behavior?: 'presentation'|'button'|'textbox'|'status' }) {
    const { behavior = 'presentation', ...rest } = value;
    nodes.push({ id, anatomy: { componentId: id.startsWith('record-') ? id.split('-').slice(0,5).join('-') : 'simulation', part: id, behavior },
      color: GPU_PALETTE.background, foreground: GPU_PALETTE.foreground, radius: 12, textInset: 12, fontSize: 14, ...rest });
  }
  const text = (id:string, value:string, x:number, y:number, w:number, size=14, lines=1, color=GPU_PALETTE.muted) => add(id, { kind:'text',text:value,x,y,width:w,height:size*1.6*lines,fontSize:size,textLines:lines,textInset:0,textInsetY:0,foreground:color,layer:2 });
  const button = (id:string, value:string, event:string, x:number,y:number,w:number,disabled=false) => add(id,{kind:'button',behavior:'button',text:value,onActivate:event,label:value,x,y,width:w,height:44,color:GPU_PALETTE.selected,foreground:GPU_PALETTE.foreground,textLines:2,textInsetY:5,disabled,layer:3});
  text('sim-label',tr('sim.overline'),pad,22,inner,12);
  text('sim-title',tr(`sim.title.${dataset.id}`),pad,56,inner,width<550?23:30,2,GPU_PALETTE.foreground);
  text('sim-source',tr('sim.source'),pad,144,inner,14,2);
  const tab = (inner-8)/2;
  button('cards',tr('view.cards'),'view.cards',pad,204,tab);button('table',tr('view.table'),'view.table',pad+tab+8,204,tab);
  const selected = selectedSimulationRecord(dataset,snapshot);
  if (snapshot.state === 'cards' || snapshot.state === 'table') {
    add('search',{kind:'input',behavior:'textbox',binding:'query',label:tr('sim.search'),x:pad,y:272,width:inner,height:44,color:GPU_PALETTE.surface});
    if (!snapshot.fields.query) text('search-hint',tr('sim.searchHint'),pad+12,282,inner-24,14);
    const sw=(inner-16)/3;
    [['name',tr('sim.sort.name')],['price-asc',tr('sim.sort.up')],['price-desc',tr('sim.sort.down')]].forEach(([sort,label],index)=>button(`sort-${sort}`,label!,`sort.${sort}`,pad+index*(sw+8),332,sw));
    const rows=simulationRows(dataset,snapshot,locale);
    text('results',tr('sim.results',{count:rows.length}),pad,400,inner,14);
    if (!rows.length) text('empty',tr('sim.empty'),pad,450,inner,18,2);
    if (snapshot.state==='table' && rows.length) {
      const titleWidth=inner*.55,priceWidth=inner-titleWidth-20;
      add('offers-table',{kind:'box',x:pad,y:446,width:inner,height:rows.length*150+50,opacity:0,semantics:{role:'table'},label:tr('sim.table')});
      add('offers-header',{kind:'box',x:pad,y:446,width:inner,height:44,color:GPU_PALETTE.surfaceRaised,semantics:{role:'row',parentId:'offers-table'}});
      add('offers-heading-name',{kind:'text',text:tr('sim.offer'),x:pad+10,y:456,width:titleWidth-10,height:25,textInset:0,semantics:{role:'columnheader',parentId:'offers-header',...(snapshot.fields.sort==='name'?{sort:'ascending' as const}:{})}});
      add('offers-heading-price',{kind:'text',text:tr('sim.price'),x:pad+titleWidth+10,y:456,width:priceWidth,height:25,textInset:0,semantics:{role:'columnheader',parentId:'offers-header',...(snapshot.fields.sort==='name'?{}:{sort:snapshot.fields.sort==='price-desc'?'descending' as const:'ascending' as const})}});
      rows.forEach((record,index)=>{
        const row=`row-${record.id}`,y=500+index*150;
        add(row,{kind:'box',x:pad,y,width:inner,height:138,color:GPU_PALETTE.surfaceRaised,semantics:{role:'row',parentId:'offers-table'}});
        add(`${row}-name`,{kind:'text',text:record.title,x:pad+10,y:y+10,width:titleWidth-10,height:54,textLines:2,textInset:0,textInsetY:0,semantics:{role:'cell',parentId:row}});
        add(`${row}-price`,{kind:'text',text:money(record.priceMinor,record.currency),x:pad+titleWidth+10,y:y+10,width:priceWidth,height:54,textLines:2,textInset:0,textInsetY:0,semantics:{role:'cell',parentId:row}});
        add(`${row}-action`,{kind:'box',x:pad+10,y:y+78,width:inner-20,height:44,opacity:0,semantics:{role:'cell',parentId:row}});
        add(`${row}-open`,{kind:'button',behavior:'button',text:record.available?tr('sim.details'):tr('sim.unavailable'),onActivate:`select.${record.id}`,x:pad+10,y:y+78,width:inner-20,height:44,color:GPU_PALETTE.selected,semantics:{parentId:`${row}-action`}});
      });
      return nodes;
    }
    const cols=snapshot.state==='cards'&&width>=700?2:1, gap=16, cw=(inner-gap*(cols-1))/cols;
    rows.forEach((record,index)=>{
      const x=pad+(index%cols)*(cw+gap),y=450+Math.floor(index/cols)*230;
      add(`record-${record.id}`,{kind:'card',x,y,width:cw,height:212,color:GPU_PALETTE.surfaceRaised,layer:0});
      text(`record-${record.id}-title`,record.title,x+16,y+16,cw-32,19,2,'#eaf5f8');
      text(`record-${record.id}-location`,record.city,x+16,y+80,cw-32,14);
      text(`record-${record.id}-price`,`${money(record.priceMinor,record.currency)}${record.kind==='property'?tr('sim.month'):''}`,x+16,y+108,cw-32,19,1,GPU_PALETTE.accent);
      button(`record-${record.id}-open`,record.available?tr('sim.discover'):tr('sim.unavailable'),`select.${record.id}`,x+16,y+154,cw-32);
    });
  } else if (selected) {
    text('selected-title',selected.title,pad,280,inner,24,2,'#ecf6fa');
    text('selected-summary',selected.summary,pad,370,inner,16,3);
    const selectedPrice=selected.kind==='product'?(selected.variants[Number(snapshot.fields.variant)]?.priceMinor??selected.priceMinor):selected.priceMinor;
    text('selected-price',money(selectedPrice,selected.currency),pad,470,inner,30,1,GPU_PALETTE.accent);
    if (snapshot.state==='detail') {
      if(selected.kind==='product')selected.variants.forEach((variant,index)=>button(`variant-${index}`,`${snapshot.fields.variant===String(index)?'> ':''}${variant.label} · ${money(variant.priceMinor,selected.currency)}`,`variant.${index}`,pad,540+index*58,inner,variant.stock===0));
      else text('selected-terms',selected.kind==='property'?tr('sim.charges',{charges:money(selected.serviceChargeMinor,selected.currency),deposit:money(selected.depositMinor,selected.currency)}):tr('sim.quotes',{expiry:time(selected.quoteExpiresAt),time:time(String(snapshot.fields.scenarioTime)),zone:context.timeZone}),pad,540,inner,15,3);
      const canPrepare=simulationCanPrepare(dataset,snapshot);
      button('prepare',canPrepare?dataset.id==='real-estate'?tr('sim.prepare.real-estate'):dataset.id==='commerce'?tr('sim.prepare.commerce'):tr('sim.prepare.travel'):tr('sim.expired'),'prepare',pad,690,inner,!canPrepare);
      text('compare-label',tr('sim.compare'),pad,766,inner,16,2);
      dataset.records.filter(item=>item.id!==selected.id).slice(0,3).forEach((item,index)=>button(`compare-${item.id}`,item.title,`compare.${item.id}`,pad,830+index*58,inner));
    } else if (snapshot.state==='comparison') {
      const other=dataset.records.find(item=>item.id===snapshot.fields.comparison)!;
      text('compare-other',other.title,pad,550,inner,23,2,'#edf6fa');
      text('compare-summary',other.summary,pad,640,inner,16,3);
      text('compare-price',money(other.priceMinor,other.currency),pad,742,inner,30,1,GPU_PALETTE.accent);
      button('compare-return',tr('sim.return'),'detail.open',pad,830,inner);
    } else {
      text('draft-label',snapshot.state==='handoff'?tr('sim.complete'):tr('sim.next'),pad,550,inner,23,2,'#f0f8fa');
      text('transaction-limit',snapshot.state==='handoff'?tr('sim.closed'):tr('sim.handoff'),pad,640,inner,16,4);
      if(snapshot.state==='prepared') {
        add('draft',{kind:'input',behavior:'textbox',binding:'draft',label:tr('sim.note'),sensitive:true,x:pad,y:790,width:inner,height:54,color:GPU_PALETTE.surface});
        button('handoff',tr('sim.run'),'handoff',pad,878,inner,!simulationCanPrepare(dataset,snapshot));
      }
      button('draft-return',tr('sim.return'),'detail.open',pad,960,inner);
    }
  }
  return nodes;
}
const LocationSchema=z.strictObject({view:z.enum(views).default('cards'),selected:z.string().default(''),comparison:z.string().default(''),sort:SimulationQuerySchema.shape.sort,variant:z.enum(['0','1']).default('0')});
export function simulationLocation(search:string,dataset:SimulationDataset) {
  const query=new URLSearchParams(search),value=LocationSchema.parse(Object.fromEntries([...query].filter(([key])=>['view','selected','comparison','sort','variant'].includes(key))));
  const selected=value.selected||dataset.records[0]!.id,comparison=value.comparison||(dataset.records[1]?.id ?? dataset.records[0]!.id);
  if (![selected,comparison].every(id=>dataset.records.some(item=>item.id===id))) throw new Error('Angebot existiert nicht.');
  return {state:value.view,fields:{selected,comparison,sort:value.sort,variant:value.variant}};
}
export function simulationSearch(snapshot:RuntimeSnapshot) {
  return `?${new URLSearchParams({view:snapshot.state,selected:String(snapshot.fields.selected),comparison:String(snapshot.fields.comparison),sort:String(snapshot.fields.sort),variant:String(snapshot.fields.variant)})}`;
}
