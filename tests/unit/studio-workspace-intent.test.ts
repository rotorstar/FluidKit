import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorkspaceFlow, readWorkspaceLocation, workspaceSearch } from '@fluidkit/cases';
import { createFluidRuntime } from '@fluidkit/core';
import { readWorkspace } from '../../apps/studio/lib/read-workspace';
import { createWorkspaceIntentController } from '../../apps/studio/lib/workspace-intent';

const data = await readWorkspace(process.cwd());
function workspace() {
  const runtime = createFluidRuntime({ flow: createWorkspaceFlow(data), projections: { workspace: () => [] } });
  const intent = createWorkspaceIntentController(runtime, data.modules.map(module => module.id));
  let available = true;
  const disconnect = intent.connect(() => available);
  function alternate(source: 'user' | 'host' = 'user', reason: 'keyboard' | 'pointer' | 'programmatic' = 'pointer') {
    for (const id of ['core', 'webgpu', 'core', 'webgpu']) {
      runtime.send('view.table');
      runtime.send('select.' + id, {}, source, reason);
    }
  }
  const dispose = () => { disconnect(); runtime.dispose(); };
  return { runtime, intent, alternate, hold: () => { available = false; }, dispose };
}

describe('Workspace intent and the approved transition', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1000); });
  afterEach(() => vi.useRealTimers());

  it('observes only accepted user detail opens while assistance is enabled', () => {
    const w = workspace();
    try {
      w.alternate();
      w.runtime.send('mode.set', {mode:'hybrid'});
      w.alternate('host', 'pointer');
      w.alternate('user', 'programmatic');
      w.runtime.send('select.unknown', {}, 'user', 'pointer');
      expect(w.intent.getSnapshot().result.visits).toEqual([]);
      w.alternate('user', 'keyboard');
      expect(w.intent.getSnapshot().result.visits.map(visit => visit.moduleId)).toEqual(['core', 'webgpu', 'core', 'webgpu']);
      expect(w.runtime.getSnapshot().state).toBe('detail');
      w.runtime.send('mode.set', {mode:'manual'});
      expect(w.intent.getSnapshot().result.visits).toEqual([]);
    } finally { w.dispose(); }
  });

  it('commits the pair and comparison together and restores it from the canonical route', () => {
    const w = workspace();
    try {
      w.runtime.send('mode.set', {mode:'hybrid'});
      w.alternate();
      const revision = w.intent.getSnapshot().offerRevision!;
      const commits: string[] = [];
      const stop = w.runtime.subscribe(() => commits.push(workspaceSearch(w.runtime.getSnapshot())));
      expect(w.intent.accept(revision)).toBe(true);
      stop();
      expect(commits).toHaveLength(1);
      expect(readWorkspaceLocation(commits[0]!, data)).toMatchObject({state:'compare', fields:{selection:['core','webgpu']}});
      expect(w.runtime.getSnapshot().revision).toBe(revision + 1);
      expect(w.intent.getSnapshot().response).toBe('accepted');
      expect(w.intent.accept(revision)).toBe(false);
      expect(w.intent.getSnapshot().response).toBe('accepted');
    } finally { w.dispose(); }
  });

  it.each(['dismiss', 'expire', 'editing-or-replay', 'history', 'reset'] as const)('rejects an old offer after %s', which => {
    const w = workspace();
    try {
      w.runtime.send('mode.set', {mode:'hybrid'}); w.alternate();
      const revision = w.intent.getSnapshot().offerRevision!;
      expect(revision).toEqual(w.runtime.getSnapshot().revision);
      if (which === 'dismiss') w.intent.dismiss(revision);
      if (which === 'expire') vi.advanceTimersByTime(120_001);
      if (which === 'editing-or-replay') w.hold();
      if (which === 'history') w.runtime.send('navigation.restore', readWorkspaceLocation('?view=table',data), 'host');
      if (which === 'reset') w.runtime.send('reset');
      const before = w.runtime.getSnapshot();
      expect(w.intent.accept(revision)).toBe(false);
      expect(w.runtime.getSnapshot()).toBe(before);
    } finally { w.dispose(); }
  });

  it('preserves an explicit different shortlist and makes no suggestion during replay or editing', () => {
    const w = workspace();
    try {
      w.runtime.send('mode.set', {mode:'hybrid'});
      w.runtime.send('collection.change', {collectionId:'modules',keys:['cli']});
      w.alternate();
      expect(w.intent.getSnapshot().offerRevision).toBeNull();
      expect(w.runtime.getSnapshot().fields.selection).toEqual(['cli']);
      w.runtime.send('reset');
      w.hold(); w.alternate();
      expect(w.intent.getSnapshot().result.visits).toEqual([]);
    } finally { w.dispose(); }
  });

  it('keeps a dismissal in effect when a search clears the previous visit history', () => {
    const w = workspace();
    try {
      w.runtime.send('mode.set', {mode:'hybrid'}); w.alternate();
      w.intent.dismiss(w.intent.getSnapshot().offerRevision!);
      w.runtime.send('field.change', {fieldId:'query', value:'private query'});
      expect(w.intent.getSnapshot().result.visits).toEqual([]);
      w.alternate();
      expect(w.intent.getSnapshot()).toMatchObject({offerRevision:null, result:{reason:'dismissed'}});
      expect(JSON.stringify(w.intent.getSnapshot())).not.toContain('private query');
    } finally { w.dispose(); }
  });
});
