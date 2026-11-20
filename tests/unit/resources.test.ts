import { describe, expect, it } from 'vitest';
import { createResourceLedger, createResourceScope } from '../../packages/webgpu/src/resources';
import { createFluidRuntime } from '@fluidkit/core';
import { createProjectProof } from '@fluidkit/cases';

describe('resource ownership', () => {
  it('runs real disposers in reverse allocation order and releases a resource only once', () => {
    const ledger=createResourceLedger(),scope=createResourceScope(ledger),order:string[]=[];
    const font=scope.track('font',()=>order.push('font'));
    scope.track('text',()=>order.push('text'));
    expect(ledger.snapshot().live.font).toBe(1);
    font();font();scope.dispose();scope.dispose();
    expect(order).toEqual(['font','text']);
    expect(Object.values(ledger.snapshot().live).every(count=>count===0)).toBe(true);
    expect(ledger.snapshot().owners).toBe(0);
    expect(()=>scope.track('material',()=>{})).toThrow('closed');
  });
  it('does not report a failed real disposer as freed and still cleans other resources', () => {
    const ledger=createResourceLedger(),scope=createResourceScope(ledger);let disposed=false;
    scope.track('renderer',()=>{disposed=true;});scope.track('text',()=>{throw new Error('driver failure');});
    expect(()=>scope.dispose()).toThrow('Resource disposal failed');
    expect(disposed).toBe(true);expect(ledger.snapshot().live.renderer).toBe(0);
    expect(ledger.snapshot().live.text).toBe(1);expect(ledger.snapshot().disposalErrors).toHaveLength(1);
  });
  it('does not let resource counts from one owner cancel another owner', () => {
    const ledger=createResourceLedger(),a=createResourceScope(ledger),b=createResourceScope(ledger);
    a.track('device',()=>{});b.track('device',()=>{});a.dispose();
    expect(ledger.snapshot()).toMatchObject({owners:1,live:{device:1},peak:{device:2}});b.dispose();
    expect(ledger.snapshot().live.device).toBe(0);
  });
  it('clears core subscriptions, actions and mutable scene caches on dispose', () => {
    const runtime=createFluidRuntime({flow:createProjectProof('project')});
    runtime.subscribe(()=>{});runtime.subscribeInteraction(()=>{});runtime.subscribeVisual(()=>{});runtime.subscribeTrace(()=>{});runtime.getScene();
    expect(runtime.getDiagnostics().subscriptions).toBe(4);runtime.dispose();
    expect(runtime.getDiagnostics()).toEqual({disposed:true,subscriptions:0,pendingActions:0,cachedScenes:0});
  });
});
