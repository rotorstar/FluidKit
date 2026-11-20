import { ResourceKindSchema, ResourceSnapshotSchema, type ResourceKind, type ResourceSnapshot } from '@fluidkit/contracts';

/** Explicit per-owner accounting; no browser globals or patched native APIs. */
export function createResourceLedger() {
  const counts = () => Object.fromEntries(ResourceKindSchema.options.map(kind => [kind, 0])) as ResourceSnapshot['live'];
  const live = counts(), peak = counts(), owners = new Set<symbol>();
  const disposalErrors: string[] = [];
  return {
    openOwner() { const owner = Symbol(); owners.add(owner); return () => { owners.delete(owner); }; },
    acquire(kind: ResourceKind) { live[kind]++; peak[kind] = Math.max(peak[kind], live[kind]); let active = true; return () => { if (active) { active = false; live[kind]--; } }; },
    error(message: string) { disposalErrors.push(message); },
    snapshot(): ResourceSnapshot { return ResourceSnapshotSchema.parse({ live, peak, owners: owners.size, disposalErrors }); },
  };
}
export type ResourceLedger = ReturnType<typeof createResourceLedger>;

/** A release calls the real disposer before retiring its accounting token. */
export function createResourceScope(ledger: ResourceLedger) {
  const closeOwner = ledger.openOwner();
  const disposers = new Set<() => void>();
  let closed = false;
  return {
    track(kind: ResourceKind, dispose: () => void) {
      if (closed) throw new Error('Resource scope already closed');
      const retire = ledger.acquire(kind); let active = true;
      const release = () => {
        if (!active) return;
        try { dispose(); }
        catch (error) { ledger.error(`${kind}: ${error instanceof Error ? error.message : 'disposal failed'}`); throw error; }
        active = false; disposers.delete(release); retire();
      };
      disposers.add(release); return release;
    },
    dispose() {
      if (closed) return;
      closed = true;
      const failures: unknown[] = [];
      for (const release of [...disposers].reverse()) { try { release(); } catch (error) { failures.push(error); } }
      closeOwner();
      if (failures.length) throw new AggregateError(failures, 'Resource disposal failed');
    },
  };
}
