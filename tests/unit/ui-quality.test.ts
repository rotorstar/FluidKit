import { describe,expect,it } from 'vitest';
import fc from 'fast-check';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { SceneNodeSchema,VisualScenarioSchema } from '@fluidkit/contracts';
import { overlappingText,recordingScale,textRegion,transitionStages,type SurfaceMetrics } from '@fluidkit/webgpu';
import { EffectTransport } from '../../apps/studio/components/effect-lab';

describe('UI release invariants',()=>{
  it('reserves one bounded line for a heading and enough height for multiline controls',()=>{
    const heading=SceneNodeSchema.parse({id:'title',anatomy:{componentId:'header',part:'title',behavior:'presentation'},kind:'text',fontSize:29,height:40.6,textInset:0,textInsetY:0,textLines:1});
    const region=textRegion(heading,310,40.6,29);
    expect(region.maxLines).toBe(1);expect(region.fontSize*1.25).toBeLessThanOrEqual(region.height);
    const preset=SceneNodeSchema.parse({...heading,textLines:2,textInsetY:4,fontSize:11,height:38});
    const multiline=textRegion(preset,80,38,11);expect(multiline.fontSize*1.25*2).toBeLessThanOrEqual(multiline.height);
  });
  it('detects visible ink intersections without rejecting whitespace or touching edges',()=>{
    const a={id:'a',line:0,x:0,y:0,width:80,height:16};
    expect(overlappingText([a,{...a,id:'b',y:14}])).toEqual([['a','b']]);
    expect(overlappingText([a,{...a,id:'b',y:16}])).toEqual([]);
    expect(overlappingText([a,{...a,id:'a',line:1,y:2}])).toEqual([['a','a']]);
  });
  it('keeps collision detection invariant under translation',()=>{
    fc.assert(fc.property(fc.integer({min:-10000,max:10000}),fc.integer({min:-10000,max:10000}),(x,y)=>{
      const boxes=[{id:'a',line:0,x,y,width:100,height:20},{id:'b',line:0,x:x+50,y:y+10,width:100,height:20}];
      expect(overlappingText(boxes)).toEqual([['a','b']]);
    }));
  });
  it('fits recorded coordinates uniformly instead of reflowing old text on resize',()=>{
    fc.assert(fc.property(fc.integer({min:280,max:2000}),fc.integer({min:300,max:2500}),(width,height)=>{
      const recorded={width:1200,height:1400};const scale=recordingScale(recorded,{width,height});
      expect(scale).toBeGreaterThan(0);expect(recorded.width*scale).toBeLessThanOrEqual(width+1e-6);expect(recorded.height*scale).toBeLessThanOrEqual(height+1e-6);
    }));
  });
  it('requires the recorded viewport and rejects obsolete ambiguous recordings',()=>{
    const run={schemaVersion:2,caseId:'case',viewport:{width:1000,height:1200},source:[],target:[],plan:null,durationMs:1100,redacted:false};
    expect(VisualScenarioSchema.safeParse(run).success).toBe(true);
    expect(VisualScenarioSchema.safeParse({...run,viewport:undefined}).success).toBe(false);
    expect(VisualScenarioSchema.safeParse({...run,schemaVersion:1}).success).toBe(false);
  });
  it('moves geometry only while crossing labels are invisible',()=>{
    fc.assert(fc.property(fc.double({min:0,max:1,noNaN:true}),progress=>{
      const stages=transitionStages(progress);
      if(stages.sourceText>0)expect(stages.geometry).toBe(0);
      if(stages.targetText>0)expect(stages.geometry).toBe(1);
      if(stages.geometry>0&&stages.geometry<1){expect(stages.sourceText).toBe(0);expect(stages.targetText).toBe(0);}
    }));
  });
  it.each(['idle','paused','transitioning'] as const)('does not repeat the timeline endpoint in %s state',phase=>{
    const metrics:SurfaceMetrics={backend:'webgpu',fallbackReason:null,frames:1,nodes:1,geometries:1,textBytes:0,lastFrameMs:0,phase,progress:phase==='idle'?1:.5,durationMs:1100,shader:'typegpu-0.12.9',effectId:'fluid-morph',effectPhase:phase==='idle'?'settled':'bridge',canReplay:true,kernelCheck:null};
    const markup=renderToStaticMarkup(createElement(EffectTransport,{controls:null,metrics}));
    const text=markup.replace(/<[^>]*>/g,' ');expect(text.match(/Ziel/g)).toHaveLength(1);
    if(phase==='idle')expect(text).toContain('Abgeschlossen');
  });
});
