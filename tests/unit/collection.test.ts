import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCollectionBehavior } from '../../packages/core/src/collection';
import type { ChangeReason } from '@fluidkit/contracts';

function fixture(initial: string[] = []) {
  let keys: readonly string[] = Object.freeze([...initial]);
  let order = ['a', 'b', 'c', 'd'];
  let time = 0;
  let allow = true;
  const disabled = new Set<string>();
  const labels: Record<string, string> = { a: 'Änderungen', b: 'Bögen', c: 'Backend', d: 'Dependencies' };
  const setKeys = vi.fn((next: string[], _reason: ChangeReason) => {
    if (!allow) return false;
    keys = Object.freeze([...next]);
    return true;
  });
  const behavior = createCollectionBehavior({
    getKeys: () => keys, setKeys, getOrder: () => order, getLabel: key => labels[key] ?? key,
    isSelectable: key => !disabled.has(key), now: () => time,
  });
  return {
    behavior, setKeys, labels, disabled,
    get keys() { return keys; },
    external(next: string[], notify = true) { keys = Object.freeze([...next]); if (notify) behavior.sync(); },
    order(next: string[]) { order = next; behavior.sync(); },
    time(next: number) { time = next; },
    allow(next: boolean) { allow = next; },
  };
}

afterEach(() => vi.restoreAllMocks());

describe('public UI SDK collection selection adapter', () => {
  it('commits only through the authoritative callback and preserves change reasons', () => {
    const f = fixture();
    expect(f.behavior.select('a', 'pointer')).toBe(true);
    expect(f.keys).toEqual(['a']);
    expect(f.behavior.toggle('c')).toBe(true);
    expect(f.keys).toEqual(['a', 'c']);
    expect(f.behavior.toggle('a')).toBe(true);
    expect(f.keys).toEqual(['c']);
    expect(f.setKeys.mock.calls.map(call => call[1])).toEqual(['pointer', 'keyboard', 'keyboard']);
    expect(f.behavior.getAnchor()).toBe('a');
    f.behavior.destroy();
  });

  it('ranges follow current sort order while skipping disabled entries', () => {
    const f = fixture();
    f.behavior.select('a');
    f.order(['d', 'c', 'b', 'a']);
    f.disabled.add('b');
    expect(f.behavior.range('d')).toBe(true);
    expect(f.keys).toEqual(['d', 'c', 'a']);
    expect(f.behavior.getAnchor()).toBe('a');
    f.behavior.destroy();
  });

  it('filtering removes a hidden anchor, preserves selected identities and uses visible from', () => {
    const f = fixture();
    f.behavior.select('a');
    f.order(['b', 'c', 'd']);
    expect(f.keys).toEqual(['a']);
    expect(f.behavior.getAnchor()).toBeNull();
    f.behavior.range('d', { from: 'b', additive: true });
    expect(f.keys).toEqual(['a', 'b', 'c', 'd']);
    expect(f.behavior.getAnchor()).toBe('b');
    f.behavior.destroy();
  });

  it('cancelled choices retain the old range anchor and perform no optimistic commit', () => {
    const f = fixture();
    f.behavior.select('a');
    f.allow(false);
    expect(f.behavior.toggle('c')).toBe(false);
    expect(f.keys).toEqual(['a']);
    expect(f.behavior.getAnchor()).toBe('a');
    f.allow(true);
    f.behavior.range('b');
    expect(f.keys).toEqual(['a', 'b']);
    f.behavior.destroy();
  });

  it('does not retain the tentative SDK anchor after a refused first range', () => {
    const f = fixture();
    f.allow(false);
    expect(f.behavior.range('d', { from: 'a' })).toBe(false);
    expect(f.behavior.getAnchor()).toBeNull();
    expect(f.keys).toEqual([]);
    f.allow(true);
    f.behavior.range('d', { from: 'c' });
    expect(f.keys).toEqual(['c', 'd']);
    f.behavior.destroy();
  });

  it('external controlled updates reset anchors; unchanged projections do not', () => {
    const f = fixture();
    f.behavior.select('a');
    f.external(['a']);
    expect(f.behavior.getAnchor()).toBe('a');
    f.external(['c']);
    expect(f.behavior.getAnchor()).toBeNull();
    f.behavior.range('d', { from: 'c' });
    expect(f.keys).toEqual(['c', 'd']);
    // A host that has not called sync is still read before the next operation.
    f.external(['b'], false);
    f.behavior.range('c', { from: 'b' });
    expect(f.keys).toEqual(['b', 'c']);
    f.behavior.destroy();
  });

  it('selectAll is idempotent, skips disabled rows and retains hidden selections', () => {
    const f = fixture(['hidden']);
    f.disabled.add('b');
    expect(f.behavior.selectAll()).toBe(true);
    expect(f.keys).toEqual(['hidden', 'a', 'c', 'd']);
    const commits = f.setKeys.mock.calls.length;
    expect(f.behavior.selectAll()).toBe(true);
    expect(f.setKeys).toHaveBeenCalledTimes(commits);
    f.order([]);
    expect(f.behavior.selectAll()).toBe(true);
    expect(f.keys).toEqual(['hidden', 'a', 'c', 'd']);
    f.behavior.destroy();
  });

  it('refuses absent/disabled targets and never invents a range from a hidden from', () => {
    const f = fixture();
    f.disabled.add('b');
    expect(f.behavior.select('missing')).toBe(false);
    expect(f.behavior.toggle('b')).toBe(false);
    expect(f.behavior.range('b')).toBe(false);
    expect(f.setKeys).not.toHaveBeenCalled();
    f.behavior.range('d', { from: 'missing' });
    expect(f.keys).toEqual(['d']);
    f.behavior.destroy();
  });

  it('requires an actual synchronous matching commit even if the host returns true', () => {
    const setKeys = vi.fn(() => true);
    const behavior = createCollectionBehavior({ getKeys: () => [], setKeys, getOrder: () => ['a'], getLabel: key => key });
    expect(behavior.select('a')).toBe(false);
    expect(behavior.getAnchor()).toBeNull();
    behavior.destroy();
  });

  it('surfaces host exceptions, resets rejected range state and can recover', () => {
    const f = fixture();
    f.setKeys.mockImplementationOnce(() => { throw new Error('host rejected'); });
    expect(() => f.behavior.range('d', { from: 'a' })).toThrow('host rejected');
    expect(f.behavior.getAnchor()).toBeNull();
    f.behavior.range('d', { from: 'c' });
    expect(f.keys).toEqual(['c', 'd']);
    f.behavior.destroy();
  });

  it('supports synchronous Core notification and rejects a reentrant operation', () => {
    const f = fixture();
    const commit = f.setKeys.getMockImplementation()!;
    f.setKeys.mockImplementation((keys, reason) => {
      const accepted = commit(keys, reason);
      f.behavior.sync();
      expect(f.behavior.toggle('d')).toBe(false);
      return accepted;
    });
    f.behavior.select('a');
    expect(f.keys).toEqual(['a']);
    expect(f.behavior.getAnchor()).toBe('a');
    f.behavior.range('c');
    expect(f.keys).toEqual(['a', 'b', 'c']);
    f.behavior.destroy();
  });

  it('does not recreate the SDK projection if the host disposes during a refused change', () => {
    const f = fixture();
    f.setKeys.mockImplementation(() => { f.behavior.destroy(); return false; });
    expect(f.behavior.range('d', { from: 'a' })).toBe(false);
    expect(f.behavior.getAnchor()).toBeNull();
    expect(f.behavior.selectAll()).toBe(false);
    expect(f.keys).toEqual([]);
  });
});

describe('deterministic collection typeahead', () => {
  it('normalizes accents/case and cycles repeated characters without changing selection', () => {
    const f = fixture(['d']);
    expect(f.behavior.typeahead('a')).toBe('a');
    f.time(500);
    expect(f.behavior.typeahead('B', { currentKey: 'a' })).toBe('b');
    f.time(600);
    expect(f.behavior.typeahead('b', { currentKey: 'b' })).toBe('c');
    expect(f.keys).toEqual(['d']);
    expect(f.setKeys).not.toHaveBeenCalled();
    f.behavior.destroy();
  });

  it('prefers actual repeated-prefix labels before falling back to cycling', () => {
    const f = fixture();
    f.labels.a = 'Llama'; f.labels.b = 'Lemon'; f.labels.c = 'Lily';
    expect(f.behavior.typeahead('l', { currentKey: 'a' })).toBe('b');
    f.time(100);
    expect(f.behavior.typeahead('l', { currentKey: 'b' })).toBe('a');
    f.time(200);
    expect(f.behavior.typeahead('l', { currentKey: 'a' })).toBe('b');
    f.behavior.destroy();
  });

  it('uses the injected clock including the exact expiry boundary and a replay rewind', () => {
    const f = fixture();
    f.labels.a = 'ab'; f.labels.b = 'ba';
    expect(f.behavior.typeahead('a')).toBe('a');
    expect(f.behavior.typeahead('b', { time: 499, currentKey: 'a' })).toBe('a');
    expect(f.behavior.typeahead('b', { time: 999, currentKey: 'a' })).toBe('b');
    expect(f.behavior.typeahead('a', { time: 10, currentKey: 'b' })).toBe('a');
    f.behavior.destroy();
  });

  it('protects active input/composition, ignores shortcuts and resets the prior query', () => {
    const f = fixture();
    f.behavior.typeahead('b');
    expect(f.behavior.typeahead('x', { composing: true })).toBeNull();
    expect(f.behavior.typeahead('d')).toBe('d');
    expect(f.behavior.typeahead('a', { editing: true })).toBeNull();
    for (const modifier of ['ctrlKey', 'metaKey', 'altKey'] as const) expect(f.behavior.typeahead('b', { [modifier]: true })).toBeNull();
    expect(f.behavior.typeahead('a')).toBe('a');
    expect(f.behavior.typeahead('Dead')).toBeNull();
    f.behavior.destroy();
  });

  it('continues spaces only inside a query and searches only enabled visible labels', () => {
    const f = fixture();
    f.labels.a = 'Build tool'; f.labels.b = 'Build runtime';
    f.disabled.add('b');
    f.order(['a', 'b', 'd']);
    expect(f.behavior.typeahead(' ')).toBeNull();
    for (const key of 'build ') expect(f.behavior.typeahead(key)).toBe('a');
    expect(f.behavior.typeahead('t')).toBe('a');
    f.behavior.destroy();
  });

  it('requires a finite explicit time and creates no global timers', () => {
    const timer = vi.spyOn(globalThis, 'setTimeout');
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    const behavior = createCollectionBehavior({ getKeys: () => [], setKeys: () => true, getOrder: () => ['a'], getLabel: () => 'Alpha' });
    expect(() => behavior.typeahead('a')).toThrow('explicit clock');
    expect(() => behavior.typeahead('a', { time: Number.NaN })).toThrow('explicit clock');
    expect(behavior.typeahead('a', { time: 0 })).toBe('a');
    behavior.destroy();
    expect(timer).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });

  it('disposes idempotently and never reads callbacks or commits after disposal', () => {
    const f = fixture();
    f.behavior.select('a');
    f.behavior.destroy(); f.behavior.destroy();
    f.setKeys.mockClear();
    expect(f.behavior.select('a')).toBe(false);
    expect(f.behavior.toggle('a')).toBe(false);
    expect(f.behavior.range('a')).toBe(false);
    expect(f.behavior.selectAll()).toBe(false);
    expect(f.behavior.typeahead('a')).toBeNull();
    expect(f.behavior.getAnchor()).toBeNull();
    f.behavior.sync();
    expect(f.setKeys).not.toHaveBeenCalled();
  });
});
