import { IdentifierSchema } from '@fluidkit/contracts';
import { z } from 'zod';

const MAX_VISITS = 24;
const SessionOptionsSchema = z.strictObject({
  windowMs: z.number().int().positive().max(86_400_000).default(120_000),
  topK: z.number().int().min(1).max(5).default(3),
});
const TimeSchema = z.number().finite().nonnegative();
export const WorkspaceIntentVisitSchema = z.strictObject({ moduleId: IdentifierSchema, at: TimeSchema });
export const WorkspaceComparisonIntentSchema = z.strictObject({
  type: z.literal('compare'),
  moduleIds: z.tuple([IdentifierSchema, IdentifierSchema]),
  score: z.number().min(0).max(1),
  evidence: z.array(WorkspaceIntentVisitSchema).max(MAX_VISITS),
});
export const WorkspaceIntentResultSchema = z.strictObject({
  schemaVersion: z.literal(1),
  reason: z.enum(['ready', 'insufficient', 'ambiguous', 'dismissed']),
  suggestion: WorkspaceComparisonIntentSchema.nullable(),
  ranked: z.array(WorkspaceComparisonIntentSchema).max(5),
  visits: z.array(WorkspaceIntentVisitSchema).max(MAX_VISITS),
  expiresAt: TimeSchema.nullable(),
});
export type WorkspaceIntentVisit = z.infer<typeof WorkspaceIntentVisitSchema>;
export type WorkspaceComparisonIntent = z.infer<typeof WorkspaceComparisonIntentSchema>;
export type WorkspaceIntentResult = z.infer<typeof WorkspaceIntentResultSchema>;

function rankPairs(visits: WorkspaceIntentVisit[]): WorkspaceComparisonIntent[] {
  const pairs = new Map<string, { ids: [string, string]; switches: number }>();
  for (let index = 1; index < visits.length; index++) {
    const a = visits[index - 1]!.moduleId;
    const b = visits[index]!.moduleId;
    const ids: [string, string] = a < b ? [a, b] : [b, a];
    const key = ids.join('/'); // Identifiers cannot contain a slash.
    const pair = pairs.get(key) ?? { ids, switches: 0 };
    pair.switches++;
    pairs.set(key, pair);
  }
  return Array.from(pairs.values(), ({ ids, switches }): WorkspaceComparisonIntent => {
    const evidence = visits.filter(visit => ids.includes(visit.moduleId));
    const firstCount = evidence.filter(visit => visit.moduleId === ids[0]).length;
    const repeatDepth = Math.min(firstCount, evidence.length - firstCount, 2) / 2;
    // A ranking weight for repeated switching, two-sided interest and share of attention.
    const score = 0.5 * Math.min(switches / 3, 1) + 0.25 * repeatDepth + 0.25 * evidence.length / visits.length;
    return { type: 'compare', moduleIds: ids, score, evidence };
  }).sort((left, right) => right.score - left.score || (left.moduleIds.join('/') < right.moduleIds.join('/') ? -1 : 1));
}

/** One opt-in workspace session. The caller forwards successful, deliberate detail opens only. */
export function createWorkspaceIntentSession(moduleIds: readonly string[], options: z.input<typeof SessionOptionsSchema> = {}) {
  const allowed = new Set(IdentifierSchema.array().parse(moduleIds));
  const { topK, windowMs } = SessionOptionsSchema.parse(options);
  let visits: WorkspaceIntentVisit[] = [];
  let clock = 0;
  let quietUntil = 0;

  function advance(at: number) {
    clock = Math.max(clock, TimeSchema.parse(at));
    visits = visits.filter(visit => visit.at + windowMs > clock);
  }

  function result(): WorkspaceIntentResult {
    // Give the inspector its own objects so changing its snapshot cannot change this session.
    const snapshot = visits.map(visit => ({ ...visit }));
    const ranked = rankPairs(snapshot);
    const winner = ranked[0];
    let reason: WorkspaceIntentResult['reason'] = 'insufficient';
    if (clock < quietUntil) {
      reason = 'dismissed';
    } else if (winner && snapshot.length >= 4) {
      const recent = snapshot.slice(-4);
      // Adjacent duplicate opens are coalesced. Four recent visits to this pair therefore alternate.
      const alternates = recent.every(visit => winner.moduleIds.includes(visit.moduleId));
      const dominant = winner.evidence.length * 3 >= snapshot.length * 2;
      const tied = ranked[1]?.score === winner.score;
      reason = alternates && dominant && !tied ? 'ready' : 'ambiguous';
    }
    const deadlines = [snapshot[0] && snapshot[0].at + windowMs, quietUntil]
      .filter((deadline): deadline is number => deadline !== undefined && deadline > clock);
    return { schemaVersion: 1, reason, suggestion: reason === 'ready' && winner ? winner : null,
      ranked: ranked.slice(0, topK), visits: snapshot, expiresAt: deadlines.length ? Math.min(...deadlines) : null };
  }

  return {
    observeModule(moduleId: string, at: number): WorkspaceIntentResult {
      advance(at);
      if (at === clock && allowed.has(moduleId) && visits.at(-1)?.moduleId !== moduleId) {
        visits.push({ moduleId, at });
        if (visits.length > MAX_VISITS) visits.shift();
      }
      return result();
    },
    read(at: number): WorkspaceIntentResult {
      advance(at);
      return result();
    },
    dismiss(at: number): WorkspaceIntentResult {
      advance(at);
      if (result().suggestion) quietUntil = clock + windowMs;
      return result();
    },
    clearVisits(at: number): WorkspaceIntentResult {
      advance(at);
      visits = [];
      return result();
    },
    reset() {
      visits = [];
      quietUntil = 0;
      clock = 0;
    },
  };
}
