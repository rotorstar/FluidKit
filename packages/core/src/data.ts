import { ActionContextSchema, JsonSchema, dataResultSchema, type ActionContext } from '@fluidkit/contracts';
import type { z } from 'zod';

/** Function contracts are intentionally not serialized. Their payloads use schemas. */
export function defineDataAdapter<Q extends z.ZodType, D extends z.ZodType>(definition: {
  id: string; version: string; query: Q; data: D;
  read(query: z.output<Q>, context: { signal: AbortSignal }): Promise<unknown>;
}) {
  const result = dataResultSchema(definition.data);
  const parseQuery = (input: unknown) => { const parsed = definition.query.parse(input); JsonSchema.parse(parsed); return parsed; };
  const readParsed = async (query: z.output<Q>, signal: AbortSignal) => {
    signal.throwIfAborted();
    const value = result.parse(await definition.read(query, { signal }));
    JsonSchema.parse(value); return value;
  };
  return { id: definition.id, version: definition.version, query: definition.query, data: definition.data,
    parseQuery, readParsed,
    async read(input: unknown, signal: AbortSignal) {
      return readParsed(parseQuery(input), signal);
    } };
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(',')}}`;
}
function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const aborted = () => reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', aborted, { once: true });
    if (signal.aborted) aborted();
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted));
  });
}
export class StaleDataError extends Error { constructor() { super('Query no longer belongs to the current revision'); this.name = 'StaleDataError'; } }

/** One client per host/session. A scope supersedes its own previous query only. */
export function createDataClient(options: { revision(): number; now?: () => number; maxCacheEntries?: number }) {
  const now = options.now ?? Date.now;
  const maxCacheEntries = options.maxCacheEntries ?? 100;
  if (!Number.isSafeInteger(maxCacheEntries) || maxCacheEntries < 0) throw new Error('Invalid cache capacity');
  const requests = new Map<string, AbortController>();
  const cache = new Map<string, { value: unknown; until: number }>();
  let disposed = false;
  return {
    async query<Q extends z.ZodType, D extends z.ZodType>(adapter: ReturnType<typeof defineDataAdapter<Q, D>>, input: unknown,
      request: { scope: string; revision: number; signal?: AbortSignal; cacheMs?: number; revalidate?: boolean }) {
      if (disposed) throw new Error('Data client disposed');
      if (request.cacheMs !== undefined && (!Number.isFinite(request.cacheMs) || request.cacheMs < 0)) throw new Error('Invalid cache duration');
      if (request.revision !== options.revision()) throw new StaleDataError();
      const query = adapter.parseQuery(input), key = canonical([adapter.id, adapter.version, query]);
      requests.get(request.scope)?.abort(new StaleDataError());
      const controller = new AbortController(); requests.set(request.scope, controller);
      const aborted = () => controller.abort(request.signal?.reason);
      request.signal?.addEventListener('abort', aborted, { once: true });
      if (request.signal?.aborted) aborted();
      try {
        controller.signal.throwIfAborted();
        const hit = cache.get(key);
        const value = !request.revalidate && hit && hit.until > now()
          ? hit.value as Awaited<ReturnType<typeof adapter.read>>
          : await abortable(adapter.readParsed(query, controller.signal), controller.signal);
        controller.signal.throwIfAborted();
        if (request.revision !== options.revision() || requests.get(request.scope) !== controller) throw new StaleDataError();
        const expiry = value.source.expiresAt ? Date.parse(value.source.expiresAt) : Infinity;
        if (expiry <= now()) throw new Error('Data source has expired; revalidation required');
        const until = Math.min(now() + Math.max(0, request.cacheMs ?? 0), expiry);
        if (until > now()) {
          cache.delete(key); cache.set(key, { value: structuredClone(value), until });
          while (cache.size > maxCacheEntries) cache.delete(cache.keys().next().value!);
        }
        return structuredClone(value);
      } finally {
        request.signal?.removeEventListener('abort', aborted);
        if (requests.get(request.scope) === controller) requests.delete(request.scope);
      }
    },
    dispose() { disposed = true; for (const controller of requests.values()) controller.abort(); requests.clear(); cache.clear(); },
    diagnostics() { return { requests: requests.size, cache: cache.size, disposed }; },
  };
}

export function defineActionAdapter<I extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; version: string; input: I; output: O;
  authorize(input: z.output<I>, context: ActionContext): boolean | Promise<boolean>;
  execute(input: z.output<I>, context: ActionContext): Promise<unknown>;
}) {
  return { ...definition, parseInput: (input: unknown) => { const parsed = definition.input.parse(input); JsonSchema.parse(parsed); return parsed; } };
}
/** In-memory idempotency for one host process. Durable actions require a host store. */
export function createActionClient(options: { maxEntries?: number } = {}) {
  const maxEntries = options.maxEntries ?? 1000;
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1) throw new Error('Invalid idempotency capacity');
  const records = new Map<string, { payload: string; result: Promise<unknown> }>();
  return {
    async execute<I extends z.ZodType, O extends z.ZodType>(adapter: ReturnType<typeof defineActionAdapter<I, O>>, input: unknown,
      request: { context: ActionContext; idempotencyKey: string; signal?: AbortSignal }) {
      const context = ActionContextSchema.parse(request.context);
      if (context.origin !== 'user' && context.origin !== 'host') throw new Error('Actions require an explicit user or host workflow');
      if (!request.idempotencyKey.trim()) throw new Error('Idempotency key required');
      request.signal?.throwIfAborted();
      const parsed = adapter.parseInput(input);
      const authorization = Promise.resolve(adapter.authorize(parsed, context));
      if (!await (request.signal ? abortable(authorization, request.signal) : authorization)) throw new Error('Action not authorized');
      request.signal?.throwIfAborted();
      const key = canonical([context.principalId, context.projectId, adapter.id, adapter.version, request.idempotencyKey]);
      const payload = canonical(parsed), existing = records.get(key);
      if (existing && existing.payload !== payload) throw new Error('Idempotency key reused with different input');
      if (!existing && records.size >= maxEntries) throw new Error('Idempotency store full; attach a durable host store');
      // Execution continues after caller cancellation. A retry observes the same result.
      const result = existing?.result ?? Promise.resolve().then(() => adapter.execute(parsed, context)).then(value => { const output = adapter.output.parse(value); JsonSchema.parse(output); return output; });
      if (!existing) records.set(key, { payload, result });
      const value = request.signal ? await abortable(result, request.signal) : await result;
      return structuredClone(value as z.output<O>);
    },
    diagnostics() { return { records: records.size }; },
  };
}
