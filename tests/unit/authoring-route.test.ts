import { beforeEach, describe, expect, it, vi } from 'vitest';
import { workspaceDatasetHash } from '@fluidkit/server';
import { WorkspaceDataSchema } from '@fluidkit/cases';
import { DEFAULT_AUTHORING_DOCUMENT } from '@fluidkit/contracts';

const dependencies = vi.hoisted(() => ({ readWorkspace: vi.fn(), generate: vi.fn() }));
vi.mock('../../apps/studio/lib/read-workspace', () => ({ readWorkspace: dependencies.readWorkspace }));
vi.mock('@fluidkit/server', async importOriginal => {
  const actual = await importOriginal<typeof import('@fluidkit/server')>();
  return { ...actual,
  getLocalStudioAccess: (() => { const sessions = new Map<string, { token: string; expires: number }>(); return () => actual.createLocalReviewAccess(Date.now, { cookie: 'fluid_studio', path: '/api', header: 'x-fluid-studio-token' }, sessions); })(),
  getLocalProjectStore: () => ({ budget: () => ({ scope: 'local-project' }) }),
  getConfiguredAuthoring: () => ({ generate: dependencies.generate }),
}; });
import { GET, POST } from '../../apps/studio/app/api/authoring/route';

const origin = 'http://127.0.0.1:3010', url = `${origin}/api/authoring`;
const request = { schemaVersion: 1, id: 'route-authoring', documentRevision: 2, runtimeRevision: 4, prompt: 'Registrierte Komponenten anordnen.', document: DEFAULT_AUTHORING_DOCUMENT };
const data = { schemaVersion: 1, name: 'explicit-unit-fixture', capturedAt: '2026-11-13T00:00:00Z', source: 'Workspace package.json + src/**/*.ts(x)', modules: [
  { id: 'core', name: '@fluidkit/core', version: 'test', group: 'Kernel', files: 7, lines: 30, dependencies: ['x', 'y'], internal: [] },
] };
async function authorized(body: unknown) {
  const session = await GET(new Request(url));
  const { token } = await session.json() as { token: string };
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', origin, cookie: session.headers.get('set-cookie')!, 'x-fluid-studio-token': token }, body: JSON.stringify({ datasetHash: workspaceDatasetHash(WorkspaceDataSchema.parse(data)), ...(body as object) }) });
}
beforeEach(() => { dependencies.readWorkspace.mockReset().mockResolvedValue(data); dependencies.generate.mockReset(); });

describe('local authoring route boundary', () => {
  it('rejects a changed server dataset before generating or preflighting', async () => {
    const response = await POST(await authorized({ operation: 'generate', datasetHash: '0'.repeat(64), input: request }));
    expect(response.status).toBe(409); expect(dependencies.generate).not.toHaveBeenCalled();
  });
  it('derives provider aggregates exclusively from the server workspace', async () => {
    dependencies.generate.mockImplementation(async function* () { yield { type: 'partial', requestId: request.id, value: { title: 'Draft' } }; });
    const response = await POST(await authorized({ operation: 'generate', input: request }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-type')).toContain('application/x-ndjson');
    expect(await response.text()).toContain('partial');
    expect(dependencies.generate.mock.calls[0]?.[2]).toEqual({ datasetHash: workspaceDatasetHash(WorkspaceDataSchema.parse(data)), moduleCount: 1, sourceCount: 7, dependencyCount: 2 });
    expect(dependencies.readWorkspace).toHaveBeenCalledTimes(1);
  });

  it('rejects client-supplied data before filesystem reads or generation', async () => {
    const response = await POST(await authorized({ operation: 'preflight', input: { before: DEFAULT_AUTHORING_DOCUMENT, after: DEFAULT_AUTHORING_DOCUMENT,
      documentRevision: 1, runtimeRevision: 1, origin: { kind: 'manual' }, data } }));
    expect(response.status).toBe(422); expect(dependencies.readWorkspace).not.toHaveBeenCalled(); expect(dependencies.generate).not.toHaveBeenCalled();
  });

  it('executes preflight with server data and without any model call', async () => {
    const response = await POST(await authorized({ operation: 'preflight', input: { before: DEFAULT_AUTHORING_DOCUMENT, after: DEFAULT_AUTHORING_DOCUMENT,
      documentRevision: 1, runtimeRevision: 1, origin: { kind: 'manual' } } }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ basis: { moduleCount: 1 }, preflight: { passed: true, application: 'not-applied' } });
    expect(dependencies.generate).not.toHaveBeenCalled();
  }, 15000);

  it('cancels pending provider iteration without enqueueing into a canceled body', async () => {
    let ended = false, providerSignal: AbortSignal | undefined;
    let started: () => void = () => {};
    const pending = new Promise<void>(resolve => { started = resolve; });
    dependencies.generate.mockImplementation(async function* (_session: string, _input: unknown, _context: unknown, signal: AbortSignal) {
      providerSignal = signal;
      try {
        yield { type: 'partial', requestId: request.id, value: { title: 'Draft' } };
        await new Promise<void>((_resolve, reject) => { signal.addEventListener('abort', () => reject(signal.reason), { once: true }); started(); });
      } finally { ended = true; }
    });
    const response = await POST(await authorized({ operation: 'generate', input: request }));
    const reader = response.body!.getReader();
    expect((await reader.read()).done).toBe(false);
    await pending;
    await reader.cancel();
    expect(providerSignal?.aborted).toBe(true); expect(ended).toBe(true);
  });

  it('redacts provider exceptions and rejects unauthorized requests before reads', async () => {
    const unauthorized = await POST(new Request(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{}' }));
    expect(unauthorized.status).toBe(403); expect(dependencies.readWorkspace).not.toHaveBeenCalled();
    dependencies.generate.mockImplementation(async function* () { yield { type: 'partial', requestId: request.id, value: {} }; throw new Error('PRIVATE-PROVIDER-CONTEXT'); });
    const response = await POST(await authorized({ operation: 'generate', input: request }));
    const text = await response.text();
    expect(text).not.toContain('PRIVATE-PROVIDER-CONTEXT'); expect(text).toContain('Kein Entwurf übernommen');
  });
});
