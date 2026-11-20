import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DEFAULT_AUTHORING_DOCUMENT } from '@fluidkit/contracts';
import { createLocalProjectStore } from '../../packages/server/src/local-project';
const roots: string[] = [];
function root() { const directory = mkdtempSync(join(tmpdir(), 'fluid-local-test-')); roots.push(directory); return directory; }
const input = { expectedRevision: 0, document: DEFAULT_AUTHORING_DOCUMENT, datasetHash: 'a'.repeat(64), runtimeRevision: 2, origin: 'manual', ai: null };
afterEach(() => { roots.splice(0).forEach(path => rmSync(path, { recursive: true, force: true })); });
describe('atomic project-local authority', () => {
  it('retains immutable versions across reopen and rejects a second writer with stale revision', () => {
    const directory = root(), one = createLocalProjectStore(directory), two = createLocalProjectStore(directory);
    try { one.saveDraft(input); expect(() => two.saveDraft({ ...input, document: { ...input.document, title: 'Lost update' } })).toThrow('andere Sitzung'); expect(two.drafts().versions[0]?.document.title).toBe(input.document.title); }
    finally { one.close(); two.close(); }
    const reopened = createLocalProjectStore(directory); try { expect(reopened.drafts().revision).toBe(1); reopened.saveDraft({ ...input, expectedRevision: 1, document: { ...input.document, title: 'Next version' } }); expect(reopened.drafts().versions.map(item => item.document.title)).toEqual(['Next version', input.document.title]); } finally { reopened.close(); }
  });
  it('rejects corrupted versions before accepting a correctly numbered write', () => {
    const directory = root(), store = createLocalProjectStore(directory); store.saveDraft(input); store.close();
    const db = new DatabaseSync(join(directory, '.fluid/local/project.sqlite')); db.prepare('UPDATE drafts SET body=?').run('{}'); db.close();
    const reopened = createLocalProjectStore(directory); try { expect(() => reopened.saveDraft({ ...input, expectedRevision: 1 })).toThrow(); } finally { reopened.close(); }
  });
  it('never follows a symlink into another project', () => {
    const directory = root(), outside = root(); symlinkSync(outside, join(directory, '.fluid')); writeFileSync(join(outside, 'sentinel'), 'untouched');
    expect(() => createLocalProjectStore(directory)).toThrow('Speicherpfad'); expect(readFileSync(join(outside, 'sentinel'), 'utf8')).toBe('untouched');
  });
  it('shares reservations across features/connections and preserves unknown costs through restart', () => {
    const directory = root(), one = createLocalProjectStore(directory, () => 0), two = createLocalProjectStore(directory, () => 0);
    const id = one.reserve('session', 'authoring', 200000, 30000);
    expect(() => two.reserve('session', 'review', 1000, 20000)).toThrow('läuft'); one.settle(id, null);
    expect(() => two.reserve('session', 'review', 150001, 20000)).toThrow('Budget');
    const next = two.reserve('session', 'review', 150000, 20000); two.settle(next, 100000); two.settle(next, 0);
    expect(one.budget('session').sessionChargedOrReservedUsd).toBe(.3); one.close(); two.close();
    const reopened = createLocalProjectStore(directory); try { expect(reopened.budget('session').sessionChargedOrReservedUsd).toBe(.3); expect(() => reopened.reserve('session', 'authoring', 50001, 30000)).toThrow('Budget'); } finally { reopened.close(); }
  });
  it('expires an abandoned busy lease without refunding its reservation', () => {
    let now = 0; const store = createLocalProjectStore(root(), () => now);
    try { store.reserve('a', 'authoring', 50000, 1000); now = 6001; store.reserve('a', 'review', 20000, 1000); expect(store.budget('a').sessionChargedOrReservedUsd).toBe(.07); expect(store.budget('a').activeRequests).toBe(1); } finally { store.close(); }
  });
  it('caps total project usage even when clients create new sessions', () => {
    const store = createLocalProjectStore(root());
    try { for (let i = 0; i < 20; i++) { const id = store.reserve(`s${i}`, 'review', 250000, 1000); store.settle(id, null); } expect(() => store.reserve('new-session', 'authoring', 1, 1000)).toThrow('Budget'); } finally { store.close(); }
  });
  it('persists session credentials without serializing them into draft exports', () => {
    const directory = root(), store = createLocalProjectStore(directory); store.sessions.set('session', { token: 'private-csrf', expires: Date.now() + 10000 }); store.saveDraft(input); expect(JSON.stringify(store.drafts())).not.toContain('private-csrf'); store.close();
    const reopened = createLocalProjectStore(directory); try { expect(reopened.sessions.get('session')?.token).toBe('private-csrf'); } finally { reopened.close(); }
  });
});
