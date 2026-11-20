import { createHash, randomUUID } from 'node:crypto';
import { chmodSync, closeSync, existsSync, lstatSync, mkdirSync, openSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { z } from 'zod';
import { LocalDraftInputSchema, LocalDraftVersionSchema, LocalReviewEvidenceSchema, type LocalBudgetSummary } from '@fluidkit/contracts';
import { WorkspaceDataSchema, type WorkspaceData } from '@fluidkit/cases';
import { ReviewError } from './review-policy';

export const LOCAL_BUDGET = Object.freeze({ sessionMicros: 350000, projectMicros: 5000000, requestsPerSession: 10 });
export const contentHash = (value: string) => createHash('sha256').update(value).digest('hex');
/** Observation time is excluded: equal workspace contents have equal identity. */
export function workspaceDatasetHash(input: WorkspaceData) { const { capturedAt: _time, ...contents } = WorkspaceDataSchema.parse(input); void _time; return contentHash(JSON.stringify(contents)); }
const Row = z.object({ body: z.string() });
const Sum = z.object({ total: z.number(), count: z.number() });
export interface LocalBudgetAuthority {
  reserve(session: string, feature: 'authoring' | 'review', micros: number, deadlineMs: number): string;
  settle(id: string, micros: number | null): void;
}

export function findLocalProjectRoot(start = process.cwd()) {
  let directory = resolve(start);
  for (;;) {
    if (existsSync(join(directory, 'packages/contracts/package.json')) && existsSync(join(directory, 'apps/studio/package.json'))) return realpathSync(directory);
    const parent = dirname(directory); if (parent === directory) throw new ReviewError('Lokales Fluid-Projekt nicht gefunden.', 503); directory = parent;
  }
}
function privateDatabasePath(root: string) {
  const canonical = realpathSync(root);
  let path = canonical;
  for (const part of ['.fluid', 'local']) {
    path = join(path, part);
    if (!existsSync(path)) { try { mkdirSync(path, { mode: 0o700 }); } catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error; } }
    if (lstatSync(path).isSymbolicLink() || !lstatSync(path).isDirectory() || realpathSync(path) !== path) throw new ReviewError('Unsicherer lokaler Speicherpfad.', 503);
    chmodSync(path, 0o700);
  }
  path = join(path, 'project.sqlite');
  if (!existsSync(path)) { try { const descriptor = openSync(path, 'wx', 0o600); closeSync(descriptor); } catch (error) { if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) throw error; } }
  const info = lstatSync(path);
  if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1) throw new ReviewError('Unsichere lokale Datenbankdatei.', 503);
  chmodSync(path, 0o600); return path;
}
/** Fixed project-local database; no request can select a filesystem path. */
export function createLocalProjectStore(root: string, now: () => number = Date.now) {
  const db = new DatabaseSync(privateDatabasePath(root), { timeout: 2000, allowExtension: false });
  try { db.exec(`PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS drafts(revision INTEGER PRIMARY KEY, body TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS reservations(id TEXT PRIMARY KEY, session TEXT NOT NULL, feature TEXT NOT NULL, charged INTEGER NOT NULL, settled INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, token TEXT NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS review_evidence(id TEXT PRIMARY KEY, body TEXT NOT NULL, created TEXT NOT NULL);
  `); } catch (error) { db.close(); throw error; }
  function atomic<T>(operation: () => T): T { db.exec('BEGIN IMMEDIATE'); try { const result = operation(); db.exec('COMMIT'); return result; } catch (error) { db.exec('ROLLBACK'); throw error; } }
  const revision = () => z.object({ revision: z.number() }).parse(db.prepare('SELECT COALESCE(MAX(revision),0) revision FROM drafts').get()).revision;
  function versions() { return db.prepare('SELECT body FROM drafts ORDER BY revision DESC LIMIT 1000').all().map(row => {
    const version = LocalDraftVersionSchema.parse(JSON.parse(Row.parse(row).body));
    if (version.documentHash !== contentHash(JSON.stringify(version.document))) throw new ReviewError('Entwurfsspeicher beschädigt. Kein Stand wird überschrieben.', 503);
    return version;
  }); }
  return {
    close: () => db.close(),
    drafts: () => ({ revision: revision(), versions: versions() }),
    saveDraft(input: unknown) {
      const value = LocalDraftInputSchema.parse(input);
      return atomic(() => {
        versions(); // Fail closed on corruption, even for a correctly numbered write.
        if (value.expectedRevision !== revision()) throw new ReviewError('Eine andere Sitzung hat gespeichert. Versionen neu laden; dein Entwurf bleibt unverändert.', 409);
        if (value.expectedRevision >= 1000) throw new ReviewError('Lokales Versionslimit erreicht. Vorhandene Versionen bleiben erhalten.', 409);
        const saved = LocalDraftVersionSchema.parse({ schemaVersion: 1, revision: value.expectedRevision + 1, createdAt: new Date(now()).toISOString(),
          documentHash: contentHash(JSON.stringify(value.document)), datasetHash: value.datasetHash, runtimeRevision: value.runtimeRevision,
          document: value.document, origin: value.origin, ai: value.ai });
        db.prepare('INSERT INTO drafts(revision,body) VALUES(?,?)').run(saved.revision, JSON.stringify(saved)); return saved;
      });
    },
    sessions: {
      get(id: string) { const row = db.prepare('SELECT token,expires FROM sessions WHERE id=?').get(id); return row ? z.object({ token: z.string(), expires: z.number() }).parse(row) : undefined; },
      set(id: string, value: { token: string; expires: number }) {
        atomic(() => { db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());
          const { count } = z.object({ count: z.number() }).parse(db.prepare('SELECT COUNT(*) count FROM sessions').get());
          if (count >= 4096) throw new ReviewError('Sessionlimit erreicht.', 429);
          db.prepare('INSERT INTO sessions(id,token,expires) VALUES(?,?,?)').run(id, value.token, value.expires);
        });
      },
    },
    reserve(session: string, feature: 'authoring' | 'review', micros: number, deadlineMs: number) {
      z.string().min(1).max(100).parse(session); z.number().int().positive().safe().parse(micros); z.number().int().positive().max(60000).parse(deadlineMs);
      return atomic(() => {
        const total = Sum.parse(db.prepare('SELECT COALESCE(SUM(charged),0) total,COUNT(*) count FROM reservations').get());
        const own = Sum.parse(db.prepare('SELECT COALESCE(SUM(charged),0) total,COUNT(*) count FROM reservations WHERE session=?').get(session));
        const active = db.prepare('SELECT id FROM reservations WHERE session=? AND settled=0 AND expires>? LIMIT 1').get(session, now());
        if (active || own.count >= LOCAL_BUDGET.requestsPerSession || own.total + micros > LOCAL_BUDGET.sessionMicros || total.total + micros > LOCAL_BUDGET.projectMicros) throw new ReviewError('Gemeinsames lokales AI-Budget erreicht oder Anfrage läuft bereits.', 429);
        const id = randomUUID(); db.prepare('INSERT INTO reservations VALUES(?,?,?,?,0,?)').run(id, session, feature, micros, now() + deadlineMs + 5000); return id;
      });
    },
    settle(id: string, micros: number | null) {
      if (micros !== null) z.number().int().nonnegative().safe().parse(micros);
      atomic(() => {
        const row = z.object({ charged: z.number(), settled: z.number() }).parse(db.prepare('SELECT charged,settled FROM reservations WHERE id=?').get(id));
        if (row.settled) return; // idempotent; a repeated callback cannot refund twice.
        db.prepare('UPDATE reservations SET charged=?,settled=1 WHERE id=?').run(micros ?? row.charged, id);
      });
    },
    budget(session: string): LocalBudgetSummary {
      const total = Sum.parse(db.prepare('SELECT COALESCE(SUM(charged),0) total,COUNT(*) count FROM reservations').get());
      const own = Sum.parse(db.prepare('SELECT COALESCE(SUM(charged),0) total,COUNT(*) count FROM reservations WHERE session=?').get(session));
      const { count } = z.object({ count: z.number() }).parse(db.prepare('SELECT COUNT(*) count FROM reservations WHERE settled=0 AND expires>?').get(now()));
      return { scope: 'local-project', sessionLimitUsd: LOCAL_BUDGET.sessionMicros / 1e6, projectLimitUsd: LOCAL_BUDGET.projectMicros / 1e6,
        sessionChargedOrReservedUsd: own.total / 1e6, projectChargedOrReservedUsd: total.total / 1e6, activeRequests: count };
    },
    saveReview(input: unknown) {
      const value = LocalReviewEvidenceSchema.parse(input), body = JSON.stringify(value);
      if (Buffer.byteLength(body) > 8500000) throw new ReviewError('Nachweis überschreitet das lokale Bildbudget.', 413);
      for (const { frame, imageSha256 } of value.frames) {
        const encoded = frame.image.split(',')[1]!, bytes = Buffer.from(encoded, 'base64');
        if (bytes.toString('base64') !== encoded || bytes.length < 33 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || bytes.toString('ascii', 12, 16) !== 'IHDR' || bytes.readUInt32BE(16) !== frame.pixelWidth || bytes.readUInt32BE(20) !== frame.pixelHeight) throw new ReviewError('Original-PNG und Bildmaße sind ungültig.', 422);
        const actual = createHash('sha256').update(bytes).digest('hex');
        if (actual !== imageSha256) throw new ReviewError('Bildhash stimmt nicht mit dem Nachweis überein.', 422);
      }
      return atomic(() => {
        const id = `${value.assessment.result.id}-${contentHash(body).slice(0, 12)}`;
        const old = db.prepare('SELECT body FROM review_evidence WHERE id=?').get(id);
        if (old && Row.parse(old).body !== body) throw new ReviewError('Dieser Nachweis ist bereits gespeichert. Neue Bewertung als neue Version exportieren.', 409);
        if (!old) {
          const usage = z.object({ size: z.number() }).parse(db.prepare('SELECT COALESCE(SUM(LENGTH(CAST(body AS BLOB))),0) size FROM review_evidence').get());
          if (usage.size + Buffer.byteLength(body) > 128 * 1024 * 1024) throw new ReviewError('Lokales Nachweisbudget erreicht.', 409);
          db.prepare('INSERT INTO review_evidence VALUES(?,?,?)').run(id, body, new Date(now()).toISOString());
        }
        return { id, sha256: contentHash(body) };
      });
    },
    reviews() { return db.prepare('SELECT id,created FROM review_evidence ORDER BY created DESC LIMIT 200').all().map(item => z.object({ id: z.string(), created: z.string() }).parse(item)); },
    review(id: string) { const row = db.prepare('SELECT body FROM review_evidence WHERE id=?').get(id); if (!row) throw new ReviewError('Nachweis nicht gefunden.', 404); return LocalReviewEvidenceSchema.parse(JSON.parse(Row.parse(row).body)); },
  };
}
let configured: ReturnType<typeof createLocalProjectStore> | undefined;
export const getLocalProjectStore = () => configured ??= createLocalProjectStore(findLocalProjectRoot());
