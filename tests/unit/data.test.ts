import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createActionClient, createDataClient, defineActionAdapter, defineDataAdapter, StaleDataError } from '@fluidkit/core/data';
import { SIMULATION_DATASETS, SimulationDatasetSchema, createSimulationAdapter } from '@fluidkit/cases';
import { DataSourceSchema } from '@fluidkit/contracts';

const source = SIMULATION_DATASETS[0]!.source;
const response = (data: string) => ({ schemaVersion: 1, data, source });
const context = { principalId: 'test-user', projectId: 'test-project', origin: 'user' as const };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(done => { resolve = done; }); return { promise, resolve }; }

describe('data adapters and synthetic provenance', () => {
  it('caches neutral reads across display languages and partitions provider translations by request language', async () => {
    const client = createDataClient({revision:()=>0});
    let reads = 0;
    const adapter = defineDataAdapter({id:'catalog-language', version:'1', query:z.object({contentLocale:z.enum(['de','en','fr']).optional()}),data:z.string(),read:async query=>{ reads++; return response(query.contentLocale ?? 'stable'); }});
    const req = {scope:'catalog',revision:0,cacheMs:10000};
    for (const contentLocale of [undefined,undefined,'fr','en','fr'] as const) expect((await client.query(adapter, contentLocale ? {contentLocale} : {},req)).data).toBe(contentLocale ?? 'stable');
    expect(reads).toBe(3); client.dispose();
  });
  it('validates all authored files, unique IDs, prices, stock and dates; forbids disguising simulations as live data', async () => {
    expect(SIMULATION_DATASETS).toHaveLength(3);
    for (const dataset of SIMULATION_DATASETS) {
      expect(SimulationDatasetSchema.safeParse(dataset).success).toBe(true);
      expect(dataset.records.length).toBeGreaterThanOrEqual(8);
      const client = createDataClient({ revision: () => 0 });
      const result = await client.query(createSimulationAdapter(dataset), { sort: 'price-asc', availableOnly: true }, { scope: 'listing', revision: 0 });
      expect(result.source.simulation).toBe(true);
      expect(result.data.every(item => item.available)).toBe(true);
      expect(result.data.map(item => item.priceMinor)).toEqual(result.data.map(item => item.priceMinor).sort((a,b) => a-b));
      client.dispose();
    }
    expect(DataSourceSchema.safeParse({ ...source, simulation: false }).success).toBe(false);
    expect(DataSourceSchema.safeParse({ ...source, mode: 'live' }).success).toBe(false);
    const fixture=SIMULATION_DATASETS[0]!;
    expect(SimulationDatasetSchema.safeParse({...fixture,records:[fixture.records[0],fixture.records[0]]}).success).toBe(false);
    const travel=SIMULATION_DATASETS.find(item=>item.id==='travel')!;
    expect(SimulationDatasetSchema.safeParse({...travel,records:[{...travel.records[0],checkOut:'2027-01-01'}]}).success).toBe(false);
  });
  it('supersedes an ignored AbortSignal and never returns the old result', async () => {
    const old = deferred<unknown>(); let calls = 0;
    const adapter = defineDataAdapter({ id: 'race', version: '1', query: z.string(), data: z.string(), read: async () => ++calls === 1 ? old.promise : response('new') });
    const client = createDataClient({ revision: () => 0 });
    const first = client.query(adapter, 'old', { scope: 'page', revision: 0 });
    const rejection = expect(first).rejects.toBeInstanceOf(StaleDataError);
    expect((await client.query(adapter, 'new', { scope: 'page', revision: 0 })).data).toBe('new');
    await rejection; old.resolve(response('old'));
    expect(client.diagnostics().requests).toBe(0); client.dispose();
  });
  it('rejects stale revisions, caller abort and invalid provider responses', async () => {
    let revision = 0; const pending = deferred<unknown>();
    const adapter = defineDataAdapter({ id: 'revision', version: '1', query: z.string(), data: z.string(), read: () => pending.promise });
    const client = createDataClient({ revision: () => revision });
    const result = client.query(adapter, '', { scope: 'page', revision: 0 }); revision++;
    pending.resolve(response('old')); await expect(result).rejects.toBeInstanceOf(StaleDataError);
    const signal = AbortSignal.abort();
    await expect(client.query(adapter, '', { scope: 'page', revision: 1, signal })).rejects.toBeDefined();
    const invalid = defineDataAdapter({ id: 'invalid', version: '1', query: z.string(), data: z.string(), read: async () => response(42 as unknown as string) });
    await expect(client.query(invalid, '', { scope: 'page', revision: 1 })).rejects.toThrow();
    client.dispose(); expect(client.diagnostics()).toEqual({ requests: 0, cache: 0, disposed: true });
  });
  it('canonicalizes cache keys, isolates returned values, revalidates and rejects expired sources', async () => {
    let calls = 0, now = Date.parse(source.asOf);
    const adapter = defineDataAdapter({ id: 'cache', version: '1', query: z.object({ a: z.number(), b: z.number() }), data: z.object({ count: z.number() }),
      read: async () => ({ schemaVersion: 1, data: { count: ++calls }, source: { ...source, expiresAt: new Date(now + 1000).toISOString() } }) });
    const client = createDataClient({ revision: () => 0, now: () => now });
    const first = await client.query(adapter, { b: 2, a: 1 }, { scope: 'a', revision: 0, cacheMs: 1000 }); first.data.count = 999;
    expect((await client.query(adapter, { a: 1, b: 2 }, { scope: 'a', revision: 0, cacheMs: 1000 })).data.count).toBe(1);
    expect((await client.query(adapter, { a: 1, b: 2 }, { scope: 'a', revision: 0, revalidate: true })).data.count).toBe(2);
    now += 2000;
    const expired = defineDataAdapter({ id: 'expired', version: '1', query: z.string(), data: z.string(), read: async () => ({ ...response('expired'), source: { ...source, expiresAt: new Date(now - 1).toISOString() } }) });
    await expect(client.query(expired, '', { scope: 'a', revision: 0 })).rejects.toThrow('expired'); client.dispose();
  });
});

describe('explicit action authority and idempotency', () => {
  it('deduplicates concurrent calls, checks permission on retries, and detects conflicting payloads', async () => {
    let calls = 0, permitted = true;
    const adapter = defineActionAdapter({ id: 'action', version: '1', input: z.string(), output: z.number(), authorize: async () => permitted, execute: async () => ++calls });
    const client = createActionClient();
    const request = { context, idempotencyKey: 'once' };
    expect(await Promise.all([client.execute(adapter, 'first', request), client.execute(adapter, 'first', request)])).toEqual([1,1]);
    expect(calls).toBe(1);
    await expect(client.execute(adapter, 'different', request)).rejects.toThrow('different input');
    permitted = false;
    await expect(client.execute(adapter, 'first', request)).rejects.toThrow('not authorized');
  });
  it('blocks AI, prefetch and replay; scopes keys to principal/project and does not evict completed actions', async () => {
    let calls = 0;
    const adapter = defineActionAdapter({ id: 'action', version: '1', input: z.string(), output: z.number(), authorize: () => true, execute: async () => ++calls });
    const client = createActionClient({ maxEntries: 2 });
    for (const origin of ['ai','prefetch','replay'] as const) await expect(client.execute(adapter, '', { context: { ...context, origin }, idempotencyKey: 'x' })).rejects.toThrow('explicit');
    await client.execute(adapter, '', { context, idempotencyKey: 'x' });
    await client.execute(adapter, '', { context: { ...context, projectId: 'other' }, idempotencyKey: 'x' });
    await expect(client.execute(adapter, '', { context, idempotencyKey: 'new' })).rejects.toThrow('store full');
    expect(await client.execute(adapter, '', { context, idempotencyKey: 'x' })).toBe(1); expect(calls).toBe(2);
  });
  it('preserves the result of an in-flight action after caller cancellation', async () => {
    const pending = deferred<number>(); let calls = 0;
    const adapter = defineActionAdapter({ id: 'action', version: '1', input: z.string(), output: z.number(), authorize: () => true, execute: () => { calls++; return pending.promise; } });
    const client = createActionClient(), abort = new AbortController();
    const result = client.execute(adapter, '', { context, idempotencyKey: 'once', signal: abort.signal });
    const rejection = expect(result).rejects.toBeDefined();
    await Promise.resolve(); await Promise.resolve(); abort.abort(); await rejection;
    pending.resolve(42);
    expect(await client.execute(adapter, '', { context, idempotencyKey: 'once' })).toBe(42); expect(calls).toBe(1);
  });
});

describe('data transform semantics', () => {
  it('parses a transforming query once and exposes the inferred result type', async () => {
    const adapter = defineDataAdapter({ id:'transform',version:'1',query:z.string().transform(value=>value.length),data:z.number(),
      read:async count=>({schemaVersion:1,data:count,source}) });
    const client=createDataClient({revision:()=>0});
    expect((await client.query(adapter,'four',{scope:'query',revision:0})).data).toBe(4);
    client.dispose();
    expect(DataSourceSchema.safeParse({...source,expiresAt:'2026-11-01T12:00:00.500Z'}).success).toBe(true);
  });
});

it('rejects invalid resource budgets and nonserializable query values before calling a provider',async()=>{
  expect(()=>createDataClient({revision:()=>0,maxCacheEntries:-1})).toThrow('capacity');
  expect(()=>createDataClient({revision:()=>0,maxCacheEntries:NaN})).toThrow('capacity');
  expect(()=>createActionClient({maxEntries:Infinity})).toThrow('capacity');
  let called=false;
  const adapter=defineDataAdapter({id:'date',version:'1',query:z.date(),data:z.string(),read:async()=>{called=true;return response('unused');}});
  const client=createDataClient({revision:()=>0});
  await expect(client.query(adapter,new Date(),{scope:'query',revision:0})).rejects.toThrow();
  expect(called).toBe(false);client.dispose();
});
