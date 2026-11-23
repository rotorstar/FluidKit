import type { TraceEntry } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import { createWorkspaceIntentSession, type WorkspaceIntentResult } from '@fluidkit/intelligence';
import { workspaceSelection } from '@fluidkit/cases';

type IntentView = {
  result: WorkspaceIntentResult;
  offerRevision: number | null;
  response: 'accepted' | 'dismissed' | 'unavailable' | null;
};

/** A local observer of completed user actions. Stored or restored traces are never re-ingested. */
export function createWorkspaceIntentController(runtime: FluidRuntime, moduleIds: string[], now = Date.now) {
  const session = createWorkspaceIntentSession(moduleIds);
  const listeners = new Set<() => void>();
  let view: IntentView = { result: session.read(0), offerRevision: null, response: null };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let canPresent = () => false;
  function update(result: WorkspaceIntentResult, revision: number | null, response: IntentView['response'] = null) {
    clearTimeout(timer);
    view = { result, offerRevision: result.suggestion ? revision : null, response };
    if (result.expiresAt !== null) {
      timer = setTimeout(() => update(session.read(now()), view.offerRevision, view.response), Math.max(1, result.expiresAt - now()));
    }
    listeners.forEach(listener => listener());
  }
  function reset() {
    session.reset();
    update(session.read(now()), null);
  }
  function abandonOffer() {
    if (view.offerRevision !== null) update(session.read(now()), null);
  }
  function observe(entry: TraceEntry) {
    if (entry.kind !== 'accepted') return;
    const current = runtime.getSnapshot();
    if (entry.eventType === 'mode.set') { reset(); return; }
    if (current.mode !== 'hybrid') return;
    if (entry.eventType === 'reset' || entry.eventType === 'field.change' || entry.eventType === 'collection.change' || entry.eventType.startsWith('filter.')) {
      update(session.clearVisits(now()), null); return;
    }
    if (current.state !== 'detail' || entry.source !== 'user' || (entry.reason !== 'keyboard' && entry.reason !== 'pointer') ||
        entry.eventType !== 'select.' + current.fields.selected || typeof current.fields.selected !== 'string' || !canPresent()) {
      abandonOffer(); return;
    }
    const result = session.observeModule(current.fields.selected, now());
    const pair = result.suggestion?.moduleIds;
    const fitsSelection = pair && workspaceSelection(current).every(id => pair.includes(id));
    update(result, fitsSelection ? current.revision : null);
  }
  function eligible(revision: number, pair: string[]) {
    const snapshot = runtime.getSnapshot();
    const candidate = session.read(now()).suggestion;
    return canPresent() && !runtime.isReplay() && snapshot.mode === 'hybrid' && snapshot.state === 'detail' &&
      snapshot.revision === revision && view.offerRevision === revision && candidate !== null &&
      candidate.moduleIds.every((id, index) => id === pair[index]) && workspaceSelection(snapshot).every(id => pair.includes(id));
  }
  return {
    getSnapshot: () => view,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    connect(available: () => boolean) {
      canPresent = available;
      // subscribeTrace fires once per new entry. The ring may already contain earlier or replayed actions.
      const unsubscribe = runtime.subscribeTrace(() => {
        const entry = runtime.getTraceSnapshot().at(-1);
        if (entry) observe(entry);
      });
      return () => { unsubscribe(); canPresent = () => false; reset(); };
    },
    abandonOffer,
    dismiss(revision: number) {
      if (view.offerRevision === revision) update(session.dismiss(now()), null, 'dismissed');
    },
    accept(revision: number) {
      if (view.offerRevision !== revision) return false;
      const pair = view.result.suggestion?.moduleIds;
      if (!pair || !eligible(revision, pair)) { update(session.read(now()), null, 'unavailable'); return false; }
      const result = runtime.transact({
        schemaVersion: 1, id: 'intent-compare-' + revision, expectedRevision: revision,
        commands: [{ type: 'collection', collectionId: 'modules', keys: [...pair] }, { type: 'event', eventType: 'view.compare', payload: {} }],
      }, { source: 'ai', reason: 'ai', approved: true, authorize: () => eligible(revision, pair) });
      update(result.accepted ? session.dismiss(now()) : session.read(now()), null, result.accepted ? 'accepted' : 'unavailable');
      return result.accepted;
    },
  };
}
