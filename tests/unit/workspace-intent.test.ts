import { describe, expect, it } from 'vitest';
import { createWorkspaceIntentSession, WorkspaceIntentResultSchema } from '@fluidkit/intelligence';

const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

describe('local workspace comparison intent', () => {
  it('requires repeated alternating visits and exposes the evidence and next expiry', () => {
    const session = createWorkspaceIntentSession(ids, { windowMs: 50 });
    for (const [at, id] of ['b', 'a', 'b'].entries()) {
      expect(session.observeModule(id, at).suggestion).toBeNull();
    }
    const snapshot = WorkspaceIntentResultSchema.parse(session.observeModule('a', 3));
    expect(snapshot.suggestion).toMatchObject({ type: 'compare', moduleIds: ['a', 'b'], score: 1 });
    expect(snapshot.suggestion?.evidence).toEqual(snapshot.visits);
    expect(snapshot.expiresAt).toBe(50);
    expect(session.read(50).suggestion).toBeNull();
    expect(session.read(53)).toMatchObject({ visits: [], expiresAt: null });
  });

  it('coalesces duplicates, drops unknown modules and ignores late observations', () => {
    const session = createWorkspaceIntentSession(ids);
    session.observeModule('a', 0);
    session.observeModule('text typed by a user', 1);
    session.observeModule('b', 2);
    session.observeModule('a', 1);
    expect(session.observeModule('b', 3).visits).toEqual([{ moduleId: 'a', at: 0 }, { moduleId: 'b', at: 2 }]);
    expect(() => session.read(NaN)).toThrow();
  });

  it('abstains when equally plausible pairs compete or the most recent visit breaks the pattern', () => {
    const session = createWorkspaceIntentSession(ids);
    ['a', 'b', 'a', 'b', 'c', 'd', 'c', 'd'].forEach((id, at) => session.observeModule(id, at));
    const tied = session.read(8);
    expect(tied.reason).toBe('ambiguous');
    expect(tied.ranked[0]?.score).toBe(tied.ranked[1]?.score);
    expect(tied.suggestion).toBeNull();
    session.reset();
    ['a', 'b', 'a', 'b', 'c'].forEach((id, at) => session.observeModule(id, at));
    expect(session.read(4).reason).toBe('ambiguous');
  });

  it('respects a dismissal through the quiet window and allows a fresh deliberate sequence afterwards', () => {
    const session = createWorkspaceIntentSession(ids, { windowMs: 10 });
    ['a', 'b', 'a', 'b'].forEach((id, at) => session.observeModule(id, at));
    expect(session.dismiss(4)).toMatchObject({ reason: 'dismissed', suggestion: null, expiresAt: 10 });
    expect(session.read(13).reason).toBe('dismissed');
    expect(session.read(14).reason).toBe('insufficient');
    ['b', 'a', 'b', 'a'].forEach((id, at) => session.observeModule(id, at + 15));
    expect(session.read(19).reason).toBe('ready');
    session.dismiss(19);
    session.reset();
    expect(session.read(0)).toMatchObject({ reason: 'insufficient', visits: [], ranked: [], expiresAt: null });
  });

  it('bounds evidence and top-k even when a session is busy and returns isolated snapshots', () => {
    const session = createWorkspaceIntentSession(ids, { topK: 5 });
    for (let at = 0; at < 50; at++) session.observeModule(ids[at % ids.length]!, at);
    const result = session.read(50);
    expect(result.visits).toHaveLength(24);
    expect(result.ranked).toHaveLength(5);
    result.visits[0]!.moduleId = 'tampered';
    expect(session.read(50).visits[0]?.moduleId).toBe(ids[26 % ids.length]);
    const defaults = createWorkspaceIntentSession(ids);
    ids.forEach((id, at) => defaults.observeModule(id, at));
    expect(defaults.read(6).ranked).toHaveLength(3);
    expect(() => createWorkspaceIntentSession(ids, { topK: 0 })).toThrow();
    expect(() => createWorkspaceIntentSession(ids, { topK: 6 })).toThrow();
    expect(() => createWorkspaceIntentSession(['unknown/id'])).toThrow();
  });
});
