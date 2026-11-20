import { z } from 'zod';
import {
  AGENT_MAX_STEPS, AgentActionRefSchema, AgentExecutionSchema, AgentPolicySchema, AgentProposalSchema, AgentQueryRequestSchema,
  AgentReadSnapshotSchema, AgentRequestSchema, AgentScopeSchema, JsonSchema, LocalCommandSchema,
  type ActionContext, type AgentErrorCode, type AgentExecution, type AgentPolicy, type AgentProposal,
  type AgentReadSnapshot, type AgentRequest, type AgentScope, type AgentStepResult,
  type Json, type LocalCommand,
} from '@fluidkit/contracts';
import { createActionClient, defineActionAdapter } from './data';
import type { FluidRuntime } from './index';

export class AgentBridgeError extends Error {
  constructor(readonly code: AgentErrorCode) { super(code); this.name = 'AgentBridgeError'; }
}
export type AgentLocalAction = {
  kind: 'local'; id: string; componentId: string;
  validate(parameters: unknown): void;
  commands(parameters: unknown): LocalCommand[];
};
export type AgentExternalAction = {
  kind: 'external'; id: string; componentId: string;
  validate(parameters: unknown): void;
  execute(client: ReturnType<typeof createActionClient>, parameters: unknown, context: ActionContext,
    options: { idempotencyKey: string; signal: AbortSignal; assertCurrent(): void; onStarted(): void }): Promise<unknown>;
  publicResult(value: unknown): Json | undefined;
};
export type AgentQuery = {
  id: string; validate(parameters: unknown): void;
  read(parameters: unknown, context: { snapshot: AgentReadSnapshot; signal: AbortSignal; assertCurrent(): void }): Promise<Json>;
};
export function defineAgentLocalAction<P extends z.ZodType>(definition: {
  id: string; componentId: string; parameters: P;
  commands(parameters: z.output<P>): readonly LocalCommand[];
}): AgentLocalAction {
  return { kind: 'local', id: definition.id, componentId: definition.componentId,
    validate(input) { JsonSchema.parse(definition.parameters.parse(input)); },
    commands(input) { return z.array(LocalCommandSchema).min(1).max(AGENT_MAX_STEPS).parse(definition.commands(definition.parameters.parse(input))); },
  };
}
export function defineAgentExternalAction<I extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; componentId: string; adapter: ReturnType<typeof defineActionAdapter<I, O>>;
  /** Omit this projection to expose no external result data. */
  publicResult?(result: z.output<O>): Json;
}): AgentExternalAction {
  return { kind: 'external', id: definition.id, componentId: definition.componentId,
    validate(input) { definition.adapter.parseInput(input); },
    async execute(client, input, context, options) {
      const guarded = defineActionAdapter({ ...definition.adapter,
        async authorize(parameters, authority) {
          options.assertCurrent();
          const allowed = await definition.adapter.authorize(parameters, authority);
          options.assertCurrent();
          return allowed;
        },
        execute(parameters, authority) {
          options.assertCurrent(); options.onStarted();
          return definition.adapter.execute(parameters, authority);
        },
      });
      return client.execute(guarded, input, { context, idempotencyKey: options.idempotencyKey, signal: options.signal });
    },
    publicResult(value) { return definition.publicResult ? JsonSchema.parse(definition.publicResult(definition.adapter.output.parse(value))) : undefined; },
  };
}
export function defineAgentQuery<P extends z.ZodType, O extends z.ZodType>(definition: {
  id: string; parameters: P; result: O;
  read(parameters: z.output<P>, context: { snapshot: AgentReadSnapshot; signal: AbortSignal }): Promise<unknown>;
  /** Explicit public projection: raw adapter responses never leave the bridge. */
  publicResult(value: z.output<O>): Json;
}): AgentQuery {
  return { id: definition.id,
    validate(input) { JsonSchema.parse(definition.parameters.parse(input)); },
    async read(input, context) {
      const parameters = definition.parameters.parse(input);
      context.assertCurrent();
      const value = definition.result.parse(await definition.read(parameters, { snapshot: context.snapshot, signal: context.signal }));
      return JsonSchema.parse(definition.publicResult(value));
    },
  };
}

type ProposalRecord = {
  request: AgentRequest; approved: boolean; revision: number;
  result?: AgentExecution; execution?: Promise<AgentExecution>;
};
type BridgeOptions = {
  runtime: FluidRuntime; scope: AgentScope; principalId: string;
  getPolicy?: () => AgentPolicy | null;
  actions?: readonly (AgentLocalAction | AgentExternalAction)[];
  queries?: readonly AgentQuery[]; now?: () => number;
};
const sameScope = (a: AgentScope, b: AgentScope) => a.projectId === b.projectId && a.flowId === b.flowId;
const actionKey = (value: { componentId: string; actionId: string }) => `${value.componentId}/${value.actionId}`;
const matches = (values: AgentPolicy['actions'], step: { componentId: string; actionId: string }) => values.some(value => value.componentId === step.componentId && value.actionId === step.actionId);
function abortable<T>(pending: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new AgentBridgeError('aborted'));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    pending.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

/** Local/session bridge. Host permissions and approval methods are never model tools. */
export function createFluidAgentBridge(options: BridgeOptions) {
  const scope = AgentScopeSchema.parse(options.scope), now = options.now ?? Date.now;
  if (scope.flowId !== options.runtime.flow.id || !options.principalId.trim()) throw new AgentBridgeError('scope-denied');
  const actions = new Map<string, AgentLocalAction | AgentExternalAction>();
  for (const action of options.actions ?? []) {
    AgentActionRefSchema.parse({ componentId: action.componentId, actionId: action.id });
    const key = actionKey({ componentId: action.componentId, actionId: action.id });
    if (actions.has(key)) throw new Error('Duplicate registered agent action');
    actions.set(key, Object.freeze({ ...action }));
  }
  const queries = new Map((options.queries ?? []).map(query => [query.id, Object.freeze({ ...query })]));
  if (queries.size !== (options.queries ?? []).length) throw new Error('Duplicate registered agent query');
  const records = new Map<string, ProposalRecord>(), controllers = new Set<AbortController>();
  const actionClient = createActionClient();
  let disposed = false;
  function policy(expected?: string) {
    if (disposed) throw new AgentBridgeError('policy-denied');
    let value: AgentPolicy;
    try { value = AgentPolicySchema.parse(options.getPolicy?.()); } catch { throw new AgentBridgeError('policy-denied'); }
    if (disposed) throw new AgentBridgeError('policy-denied');
    if (expected !== undefined && value.version !== expected) throw new AgentBridgeError('policy-denied');
    return value;
  }
  function readSnapshot(value = policy()): AgentReadSnapshot {
    const snapshot = options.runtime.getSnapshot();
    const nodes = value.read.components.length ? options.runtime.getScene() : [];
    // A host projection may run while reading. Use the rights and revision
    // that still hold after that callback, before exposing any context.
    value = policy(value.version);
    if (options.runtime.getSnapshot() !== snapshot) throw new AgentBridgeError('stale-revision');
    const fields = Object.fromEntries(options.runtime.flow.fields.filter(field => value.read.fields.includes(field.id) && !field.sensitive).map(field => [field.id, snapshot.fields[field.id]]));
    const components: AgentReadSnapshot['components'] = [];
    if (value.read.components.length) {
      for (const node of nodes) {
        if (!value.read.components.includes(node.anatomy.componentId) || node.sensitive) continue;
        let component = components.find(component => component.id === node.anatomy.componentId);
        if (!component) { component = { id: node.anatomy.componentId, parts: [] }; components.push(component); }
        component.parts.push({ id: node.id, part: node.anatomy.part, behavior: node.anatomy.behavior, label: node.label, text: node.text });
      }
    }
    return AgentReadSnapshotSchema.parse({ schemaVersion: 1, scope, revision: snapshot.revision, policyVersion: value.version, ...(value.read.state ? { state: snapshot.state } : {}), fields, components });
  }
  function assertRequest(request: AgentRequest, revision: number, signal?: AbortSignal) {
    if (!sameScope(request.scope, scope)) throw new AgentBridgeError('scope-denied');
    const assertState = () => {
      if (disposed) throw new AgentBridgeError('policy-denied');
      if (signal?.aborted) throw new AgentBridgeError('aborted');
      if (options.runtime.isReplay()) throw new AgentBridgeError('replay-denied');
      if (request.expiresAt <= now()) throw new AgentBridgeError('expired');
      if (options.runtime.getSnapshot().revision !== revision) throw new AgentBridgeError('stale-revision');
      const mode = options.runtime.getSnapshot().mode;
      if (mode === 'manual') throw new AgentBridgeError('manual-mode');
      const interaction = options.runtime.getInteraction();
      if (interaction.focusedId || interaction.pressedId || interaction.composingId) throw new AgentBridgeError('interaction-active');
      return mode;
    };
    const checkPermissions = (value: AgentPolicy, mode: ReturnType<typeof assertState>) => {
      for (const step of request.steps) {
        const action = actions.get(actionKey(step));
        if (!action) throw new AgentBridgeError('unknown-action');
        if (!matches(value.actions, step)) throw new AgentBridgeError('policy-denied');
        if (mode === 'auto' && (action.kind !== 'local' || !matches(value.autoActions, step))) throw new AgentBridgeError('auto-denied');
        if (request.mode === 'atomic-local' && action.kind !== 'local') throw new AgentBridgeError('invalid-request');
      }
    };
    assertState();
    checkPermissions(policy(request.policyVersion), assertState());
    for (const step of request.steps) {
      const action = actions.get(actionKey(step))!;
      try { action.validate(step.parameters); } catch { throw new AgentBridgeError('invalid-parameters'); }
    }
    const value = policy(request.policyVersion);
    checkPermissions(value, assertState());
    return value;
  }
  function proposal(record: ProposalRecord): AgentProposal {
    return AgentProposalSchema.parse({ schemaVersion: 1, requestId: record.request.id, scope, status: 'pending', revision: record.revision,
      policyVersion: record.request.policyVersion, expiresAt: record.request.expiresAt,
      steps: record.request.steps.map(({ componentId, actionId }) => ({ componentId, actionId })),
    });
  }
  function code(error: unknown, fallback: AgentErrorCode): AgentErrorCode { return error instanceof AgentBridgeError ? error.code : fallback; }
  function controller(signal?: AbortSignal) {
    const controller = new AbortController(); controllers.add(controller);
    const combined = signal ? AbortSignal.any([controller.signal, signal]) : controller.signal;
    return { signal: combined, release: () => controllers.delete(controller) };
  }
  async function execute(record: ProposalRecord, signal?: AbortSignal): Promise<AgentExecution> {
    const request = record.request, owned = controller(signal);
    const results: AgentStepResult[] = request.steps.map((step, index) => ({ index, componentId: step.componentId, actionId: step.actionId, kind: actions.get(actionKey(step))!.kind, status: 'not-run' }));
    let failure: AgentErrorCode | undefined;
    const assertCurrent = () => { assertRequest(request, record.revision, owned.signal); };
    const local = (commands: LocalCommand[], suffix: string) => {
      assertCurrent();
      const result = options.runtime.transact({ schemaVersion: 1, id: `${request.id.slice(0, 75)}-${suffix}`, expectedRevision: record.revision, commands }, {
        source: 'ai', reason: 'ai', approved: record.approved,
        authorize() { try { assertCurrent(); return true; } catch { return false; } },
      });
      if (!result.accepted) throw new AgentBridgeError('core-rejected');
      record.revision = result.snapshot.revision;
    };
    try {
      assertCurrent();
      if (request.mode === 'atomic-local') {
        const commands = request.steps.flatMap(step => (actions.get(actionKey(step))! as AgentLocalAction).commands(step.parameters));
        local(commands, 'atomic');
        for (const result of results) result.status = 'applied';
      } else {
        for (const [index, step] of request.steps.entries()) {
          assertCurrent();
          const action = actions.get(actionKey(step))!, result = results[index]!;
          if (action.kind === 'local') { local(action.commands(step.parameters), `step-${index}`); result.status = 'applied'; }
          else {
            let started = false, completed = false;
            try {
              // Only this host-approved branch can originate a user ActionContext.
              // The result/audit retains the request's AI provenance separately.
              if (!record.approved || options.runtime.getSnapshot().mode !== 'hybrid') throw new AgentBridgeError('approval-required');
              const output = await action.execute(actionClient, step.parameters, { principalId: options.principalId, projectId: scope.projectId, origin: 'user' }, {
                idempotencyKey: `${request.id}:${index}`, signal: owned.signal, assertCurrent, onStarted() { started = true; },
              });
              completed = true; result.status = 'completed';
              assertCurrent();
              const publicOutput = action.publicResult(output);
              assertCurrent();
              if (publicOutput !== undefined) result.output = publicOutput;
            } catch (error) {
              result.status = completed ? 'completed' : started ? 'unknown' : 'rejected';
              result.code = code(error, started ? 'action-unknown' : 'action-failed');
              throw new AgentBridgeError(result.code);
            }
          }
        }
      }
    } catch (error) {
      failure = code(error, 'core-rejected');
      const next = results.find(result => result.status === 'not-run');
      if (next && !results.some(result => result.code)) { next.status = 'rejected'; next.code = failure; }
    } finally { owned.release(); }
    const status = results.some(result => result.status === 'unknown') ? 'unknown'
      : failure ? results.some(result => result.status === 'applied' || result.status === 'completed') ? 'partial' : 'rejected' : 'succeeded';
    const result = AgentExecutionSchema.parse({ schemaVersion: 1, requestId: request.id, scope, policyVersion: request.policyVersion,
      beforeRevision: request.snapshotRevision, afterRevision: options.runtime.getSnapshot().revision, status, ...(failure ? { code: failure } : {}), steps: results });
    // Only a redacted report is retained; input remains private to this bridge.
    record.result = result; return structuredClone(result);
  }
  function start(record: ProposalRecord, signal?: AbortSignal) {
    const readable = (result: AgentExecution) => {
      let current: AgentPolicy | undefined;
      try { current = policy(result.policyVersion); } catch { /* Status-only receipts remain safe after revocation. */ }
      return { ...structuredClone(result), steps: result.steps.map(step => {
        const { output, ...receipt } = step;
        return { ...receipt, ...(output !== undefined && current && matches(current.actions, step) ? { output: structuredClone(output) } : {}) };
      }) };
    };
    if (record.result) return Promise.resolve(readable(record.result));
    record.execution ??= execute(record, signal); return record.execution.then(readable);
  }
  return {
    snapshot() { return readSnapshot(); },
    async query(input: unknown, signal?: AbortSignal) {
      const parsed = AgentQueryRequestSchema.safeParse(input);
      if (!parsed.success) throw new AgentBridgeError('invalid-request');
      const request = parsed.data;
      if (!sameScope(request.scope, scope)) throw new AgentBridgeError('scope-denied');
      const owned = controller(signal);
      try {
        const assertCurrent = () => {
          if (owned.signal.aborted) throw new AgentBridgeError('aborted');
          if (options.runtime.getSnapshot().revision !== request.snapshotRevision) throw new AgentBridgeError('stale-revision');
          const value = policy(request.policyVersion);
          if (owned.signal.aborted) throw new AgentBridgeError('aborted');
          if (options.runtime.getSnapshot().revision !== request.snapshotRevision) throw new AgentBridgeError('stale-revision');
          if (!value.read.queries.includes(request.queryId)) throw new AgentBridgeError('query-denied');
          return value;
        };
        assertCurrent();
        const query = queries.get(request.queryId);
        if (!query) throw new AgentBridgeError('query-denied');
        try { query.validate(request.parameters); } catch { throw new AgentBridgeError('invalid-parameters'); }
        assertCurrent();
        const output = await abortable(query.read(request.parameters, {
          get snapshot() { const snapshot = readSnapshot(assertCurrent()); assertCurrent(); return snapshot; },
          signal: owned.signal, assertCurrent,
        }), owned.signal);
        assertCurrent();
        return { schemaVersion: 1 as const, scope: structuredClone(scope), revision: request.snapshotRevision, policyVersion: request.policyVersion, data: output };
      } catch (error) { throw new AgentBridgeError(code(error, 'query-failed')); }
      finally { owned.release(); }
    },
    async propose(input: unknown): Promise<AgentProposal | AgentExecution> {
      const parsed = AgentRequestSchema.safeParse(input);
      if (!parsed.success) throw new AgentBridgeError('invalid-request');
      const request = structuredClone(parsed.data);
      assertRequest(request, request.snapshotRevision);
      if (records.has(request.id)) throw new AgentBridgeError('duplicate-request');
      if (records.size >= 256) throw new AgentBridgeError('request-limit');
      const record: ProposalRecord = { request, approved: false, revision: request.snapshotRevision };
      records.set(request.id, record);
      return options.runtime.getSnapshot().mode === 'auto' ? start(record) : proposal(record);
    },
    approve(id: string) {
      const record = records.get(id);
      if (!record || record.execution || record.result) throw new AgentBridgeError('approval-required');
      assertRequest(record.request, record.revision);
      if (options.runtime.getSnapshot().mode !== 'hybrid') throw new AgentBridgeError('approval-required');
      record.approved = true;
    },
    executeApproved(id: string, signal?: AbortSignal) {
      const record = records.get(id);
      if (!record?.approved) return Promise.reject(new AgentBridgeError('approval-required'));
      return start(record, signal);
    },
    reject(id: string) {
      const record = records.get(id);
      if (!record || record.execution || record.result) return false;
      record.result = AgentExecutionSchema.parse({ schemaVersion: 1, requestId: id, scope, policyVersion: record.request.policyVersion, beforeRevision: record.request.snapshotRevision,
        afterRevision: options.runtime.getSnapshot().revision, status: 'rejected', code: 'approval-required', steps: [] });
      record.approved = false; return true;
    },
    export() {
      return { schemaVersion: 1 as const, scope: structuredClone(scope), origin: 'ai-proposals' as const, executable: false as const,
        reports: [...records.values()].filter(record => record.result).map(record => ({ ...structuredClone(record.result!), steps: record.result!.steps.map(({ output: _output, ...result }) => ({ ...result })) })) };
    },
    dispose() { disposed = true; for (const controller of controllers) controller.abort(); controllers.clear(); records.clear(); },
  };
}
