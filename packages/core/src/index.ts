import { LocaleContextSchema, resolveLocaleContext, type Locale, type LocaleContext } from '@fluidkit/i18n';
import { createActor, createMachine } from 'xstate';
import { createCollectionBehavior } from './collection';
import { resolveSceneLayout } from './layout';
import { createSurfaceInteractions, defaultViewport } from './surface-interactions';
import { projectThemePaint, resolveAppearance, isFieldValue } from '@fluidkit/contracts';
import { LocalTransactionSchema, type LocalTransaction } from '@fluidkit/contracts';
export { createCollectionBehavior } from './collection';
export { resolveSceneLayout } from './layout';
export * from './agent';
import { EffectSettingsSchema, RenderCapabilitiesSchema, ResolvedEffectPlanSchema, VisualCommandSchema, type EffectSettings, type RenderCapabilities, type ResolvedEffectPlan, type VisualState } from '@fluidkit/contracts';
import { findEffect, resolveEffect, validateEffectReplay } from '@fluidkit/effects';
import { DecisionPlanSchema, FlowDefinitionSchema, RuntimeEventSchema, type ChangeReason, type ControlMode, type DecisionPlan, type FlowDefinition, type InteractionSnapshot, type RuntimeEvent, type RuntimeSnapshot, type SceneNode, type SceneNodeInput, type TraceEntry } from '@fluidkit/contracts';

export interface Clock { now(): number }
export interface TraceSink { write(entry: TraceEntry): void }
export interface RouterAdapter { navigate(path: string, replace: boolean): void }
export type Guard = (snapshot: RuntimeSnapshot, event: RuntimeEvent) => boolean;
export type Action = (context: { snapshot: RuntimeSnapshot; event: RuntimeEvent; signal: AbortSignal }) => Promise<void>;
export interface ChangeDetails {
  readonly event: RuntimeEvent;
  readonly reason: ChangeReason;
  readonly isCanceled: boolean;
  cancel(): void;
}
export interface RuntimeOptions {
  flow: FlowDefinition; locale?: Locale | LocaleContext; mode?: ControlMode; clock?: Clock; trace?: TraceSink; router?: RouterAdapter;
  guards?: Readonly<Record<string, Guard>>; actions?: Readonly<Record<string, Action>>;
  replay?: boolean; policyVersion?: string;
  effectSettings?: EffectSettings;
  effectReplay?: readonly ResolvedEffectPlan[];
  beforeChange?: (details: ChangeDetails, snapshot: RuntimeSnapshot) => void;
  projections?: Readonly<Record<string, (snapshot: RuntimeSnapshot, viewport: { width: number; height: number }, settings: EffectSettings, locale: Locale, context: LocaleContext) => SceneNodeInput[]>>;
  collectionOrder?: (snapshot: RuntimeSnapshot, collectionId: string, locale: Locale) => readonly string[];
}
export type EventResult = { accepted: true; snapshot: RuntimeSnapshot } | { accepted: false; reason: string };
/** Trusted host context, never accepted from a model's serialized request. */
export type LocalTransactionAuthority = {
  source: 'user' | 'host' | 'ai' | 'replay'; reason: ChangeReason;
  authorize(): boolean;
  /** Explicit host approval for the Hybrid AI path. */
  approved?: boolean;
};

function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

export function createFluidRuntime(options: RuntimeOptions) {
  const parseLocale = (input: Locale | LocaleContext) => freeze(typeof input === 'string' ? resolveLocaleContext(input) : LocaleContextSchema.parse(input));
  let localeContext = parseLocale(options.locale ?? 'de');
  let pendingLocale: LocaleContext | undefined;
  const localeListeners = new Set<() => void>();
  const flow = freeze(FlowDefinitionSchema.parse(options.flow));
  const clock = options.clock ?? { now: () => Date.now() };
  const policyVersion = options.policyVersion ?? 'policy-1';
  const guards = Object.freeze({ ...options.guards });
  const actions = Object.freeze({ ...options.actions });
  for (const state of Object.values(flow.states)) if (state.projection && !options.projections?.[state.projection]) throw new Error(`Missing scene projection: ${state.projection}`);
  for (const state of Object.values(flow.states)) for (const transition of Object.values(state.on)) {
    if (transition.guard && !guards[transition.guard]) throw new Error(`Missing guard: ${transition.guard}`);
    if (transition.action && !actions[transition.action] && !options.replay) throw new Error(`Missing action: ${transition.action}`);
  }
  const stateKeys = Object.fromEntries(Object.keys(flow.states).map((id, index) => [id, `s${index}`]));
  const stateNames = Object.fromEntries(Object.entries(stateKeys).map(([name, key]) => [key, name]));
  const states = Object.fromEntries(Object.entries(flow.states).map(([id, state]) => [stateKeys[id]!, {
    on: Object.fromEntries(Object.entries(state.on).map(([event, transition]) => [event, { target: stateKeys[transition.target]! }])),
  }]));
  let actor = createActor(createMachine({ id: flow.id, initial: stateKeys[flow.initial]!, states }));
  actor.start();
  let snapshot: RuntimeSnapshot = freeze({ schemaVersion: 1, flowId: flow.id, state: flow.initial, revision: 0, mode: options.mode ?? 'manual', fields: Object.fromEntries(flow.fields.map(field => [field.id, field.initial])) });
  const interactions = createSurfaceInteractions();
  let transitionDuration = 0;
  let disposed = false;
  let sequence = 0;
  let counter = 0;
  const seen = new Set<string>();
  const listeners = new Set<() => void>();
  const interactionListeners = new Set<() => void>();
  const traceListeners = new Set<() => void>();
  const visualListeners = new Set<() => void>();
  let visual: VisualState = freeze({ revision: 0,
    settings: EffectSettingsSchema.parse(options.effectSettings ?? flow.visualEffects ?? { mode: 'off' }),
    capabilities: { backend: 'unavailable', typegpu: false, compute: false, reducedMotion: false }, plans: [], current: null,
  });
  const recordedEffects = new Map((options.effectReplay ?? []).map(plan => { const parsed = ResolvedEffectPlanSchema.parse(plan); return [parsed.eventId, parsed] as const; }));
  const pendingActions = new Set<AbortController>();
  let traces: readonly TraceEntry[] = Object.freeze([]);
  let suggestion: DecisionPlan | null = null;
  let settingsRevision = 0;
  const sceneCache = new Map<string, SceneNode[]>();
  const collectionBehaviors = new Map<string, ReturnType<typeof createCollectionBehavior>>();
  function project(value: RuntimeSnapshot, viewport = { width: 1000, height: 700 }, language: Locale | LocaleContext = localeContext): SceneNode[] {
    const state = flow.states[value.state];
    if (!state) throw new Error('Unknown scene state');
    const context = typeof language === 'string' ? resolveLocaleContext(language) : language;
    const nodes = state.projection ? options.projections![state.projection]!(value, viewport, visual.settings, context.language, context) : state.nodes;
    const validated = state.projection ? FlowDefinitionSchema.parse({ ...flow, states: { ...flow.states, [value.state]: { ...state, nodes } } }).states[value.state]!.nodes : nodes as SceneNode[];
    const palette = resolveAppearance(visual.settings.theme).gpu;
    return resolveSceneLayout(validated.map(node => {
      const collection = node.collection && flow.collections.find(item => item.id === node.collection?.id);
      const keys = collection ? value.fields[collection.field] : undefined;
      const collectionItem = collection?.items.find(item => item.id === node.collection?.itemId);
      return { ...projectThemePaint(node, visual.settings.theme, palette), ...(node.collection ? { checked: Array.isArray(keys) && keys.includes(node.collection.itemId), disabled: node.disabled || collectionItem?.disabled === true } : {}), sensitive: node.sensitive || flow.fields.some(field => field.id === node.binding && field.sensitive), text: node.binding ? String(value.fields[node.binding] ?? '') : node.text };
    }), viewport);
  }
  function flushLocale() {
    if (pendingLocale && !interactions.get().composingId) setLocale(pendingLocale);
  }
  function setLocale(next: Locale | LocaleContext) {
    if (disposed) throw new Error('Runtime disposed');
    const requested = parseLocale(next);
    if (interactions.get().composingId) { pendingLocale = requested; return; }
    pendingLocale = undefined;
    if (Object.entries(requested).every(([key,value]) => localeContext[key as keyof LocaleContext] === value)) return;
    localeContext = requested;
    sceneCache.clear();
    observers(localeListeners, 'locale observer');
  }
  function getScene(viewport = { width: 1000, height: 700 }): SceneNode[] {
    if (disposed) throw new Error('Runtime disposed');
    const key = `${snapshot.revision}:${settingsRevision}:${viewport.width}:${viewport.height}`;
    let nodes = sceneCache.get(key);
    if (!nodes) { nodes = freeze(project(snapshot, viewport)); sceneCache.set(key, nodes); if (sceneCache.size > 4) sceneCache.delete(sceneCache.keys().next().value ?? ''); }
    return nodes;
  }
  function appendTrace(kind: TraceEntry['kind'], event: RuntimeEvent, detail: string, committed = snapshot) {
    const entry = freeze({ schemaVersion: 1 as const, sequence: sequence++, timestamp: clock.now(), kind, eventId: event.id, eventType: event.type, source: event.source, reason: event.reason, revision: committed.revision, state: committed.state, detail });
    traces = Object.freeze([...traces.slice(-999), entry]);
    return entry;
  }
  function callObserver(callback: () => void, boundary: string, event?: RuntimeEvent) {
    try { callback(); } catch {
      // Record locally only: reporting to the same failing sink/listener would
      // recurse. No arbitrary host exception or payload enters the trace.
      const diagnostic = event ?? { id: `observer-${sequence}`, type: 'observer.failure', source: 'host' as const, reason: 'programmatic' as const, timestamp: clock.now(), payload: {} };
      appendTrace('error', diagnostic, `Host ${boundary} callback failed; committed state is retained`);
    }
  }
  function observers(values: Iterable<() => void>, boundary: string, event?: RuntimeEvent) {
    for (const listener of [...values]) callObserver(listener, boundary, event);
  }
  function trace(kind: TraceEntry['kind'], event: RuntimeEvent, detail: string, committed = snapshot) {
    const entry = appendTrace(kind, event, detail, committed);
    if (options.trace) callObserver(() => options.trace!.write(entry), 'trace sink', event);
    observers(traceListeners, 'trace observer', event);
  }
  function notify(event?: RuntimeEvent) { observers(listeners, 'state observer', event); }
  function setInteraction(patch: Partial<Omit<InteractionSnapshot, 'revision'>>, viewport: { width: number; height: number } = defaultViewport, owner?: symbol) {
    if (!disposed && interactions.set(patch, getScene(viewport), viewport, owner)) {
      observers(interactionListeners, 'interaction observer');
      flushLocale();
    }
  }
  function allowChange(event: RuntimeEvent, value = snapshot): string | null {
    if (!options.beforeChange) return null;
    let canceled = false;
    const revision = snapshot.revision;
    const details: ChangeDetails = Object.freeze({ event: freeze(event), reason: event.reason ?? 'programmatic', get isCanceled() { return canceled; }, cancel() { canceled = true; } });
    try { options.beforeChange(details, value); }
    catch (error) { return error instanceof Error ? error.message : 'Change callback failed'; }
    if (disposed || snapshot.revision !== revision) return 'Change invalidated by a reentrant host event';
    return canceled ? 'Host canceled change request' : null;
  }
  function reject(event: RuntimeEvent, reason: string): EventResult { trace('rejected', event, reason); return { accepted: false, reason }; }
  function prepare(patch: Partial<RuntimeSnapshot>, event?: RuntimeEvent, duration = 0) {
    const basis = snapshot;
    const candidate = freeze({ ...snapshot, ...patch, revision: snapshot.revision + 1 });
    for (const field of flow.fields) if (!isFieldValue(field, candidate.fields[field.id])) throw new Error(`Invalid value: ${field.id}`);
    for (const collection of flow.collections) {
      const keys = candidate.fields[collection.field];
      if (!Array.isArray(keys) || keys.some(key => !collection.items.some(item => item.id === key && !item.disabled))) throw new Error('Invalid collection selection');
    }
    const scene = freeze(project(candidate));
    let plan: ResolvedEffectPlan | null = null;
    const transition = event ? flow.states[snapshot.state]?.on[event.type] : undefined;
    if (event && (transition || event.type === 'navigation.restore' || event.type === 'transaction.local')) {
      if (options.replay && options.effectReplay) {
        const recorded = recordedEffects.get(event.id);
        // Earlier Core recordings did not create presentation plans for history.
        // Preserve that immediate restoration; never reroll a missing old plan.
        if (!recorded && event.type !== 'navigation.restore') throw new Error('Recorded effect plan missing');
        if (recorded) {
          plan = validateEffectReplay(recorded, visual.capabilities);
          if (plan.sourceRevision !== snapshot.revision || plan.targetRevision !== candidate.revision || plan.sourceState !== snapshot.state || plan.targetState !== candidate.state || plan.caseId !== flow.id) throw new Error('Recorded transition does not match replay');
        }
      } else plan = resolveEffect({ settings: visual.settings, capabilities: visual.capabilities,
        eventId: event.id, eventType: event.type, caseId: flow.id, sourceState: snapshot.state, targetState: candidate.state,
        sourceRevision: snapshot.revision, targetRevision: candidate.revision, baseDuration: duration, nodeCount: scene.length,
        transitionRule: transition?.effect, protectedNodeIds: interactions.protectedIds(),
      });
    }
    const projected = new Map([[defaultViewport.width + ':' + defaultViewport.height, scene]]);
    const lanes = interactions.prepare(viewport => {
      const key = viewport.width + ':' + viewport.height;
      const cached = projected.get(key);
      if (cached) return cached;
      const nodes = freeze(project(candidate, viewport));
      projected.set(key, nodes);
      return nodes;
    }, event?.type === 'navigation.restore');
    if (disposed || snapshot !== basis) throw new Error('Change invalidated during scene projection');
    return { candidate, projected, lanes, plan };
  }
  function commit(patch: Partial<RuntimeSnapshot>, event: RuntimeEvent, detail: string, duration = 0, prepared?: ReturnType<typeof prepare>): EventResult {
    try { prepared ??= prepare(patch, event, duration); } catch (error) { return reject(event, error instanceof Error ? error.message : 'Invalid scene projection'); }
    transitionDuration = prepared.plan?.parameters.durationMs ?? duration;
    snapshot = prepared.candidate;
    sceneCache.clear();
    for (const [size, nodes] of prepared.projected) sceneCache.set(`${snapshot.revision}:${settingsRevision}:${size}`, nodes);
    const previousInteraction = interactions.get();
    for (const { owner, viewport, nodes, patch } of prepared.lanes) interactions.set(patch, nodes, viewport, owner);
    suggestion = null;
    visual = freeze({ ...visual, revision: visual.revision + 1, current: prepared.plan, plans: prepared.plan ? [...visual.plans.slice(-499), prepared.plan] : visual.plans });
    // Publish only after all owned state is consistent. Observers can then send
    // newer host events without a later assignment from this commit undoing them.
    trace('accepted', event, detail, prepared.candidate);
    if (prepared.plan) trace('effect', event, `${prepared.plan.selected?.id ?? 'basis'}@${prepared.plan.selected?.version ?? '1'} · seed ${prepared.plan.seed} · ${prepared.plan.policySource}${prepared.plan.fallbackReason ? ` · ${prepared.plan.fallbackReason}` : ''}`, prepared.candidate);
    if (interactions.get() !== previousInteraction) { observers(interactionListeners, 'interaction observer', event); flushLocale(); }
    observers(visualListeners, 'visual observer', event);
    for (const behavior of collectionBehaviors.values()) callObserver(() => behavior.sync(), 'collection observer', event);
    notify(event);
    return { accepted: true, snapshot: prepared.candidate };
  }
  function dispatch(input: RuntimeEvent): EventResult {
    const parsed = RuntimeEventSchema.safeParse(input);
    if (!parsed.success) return { accepted: false, reason: parsed.error.message };
    const event = parsed.data;
    if (disposed) return { accepted: false, reason: 'Runtime disposed' };
    if (seen.has(event.id)) return reject(event, 'Duplicate event');
    if (event.expectedRevision !== undefined && event.expectedRevision !== snapshot.revision) return reject(event, 'Stale revision');
    if (event.source === 'ai') return reject(event, 'AI events require a validated decision plan');
    if (event.source === 'replay' && !options.replay) return reject(event, 'Replay event requires replay runtime');
    seen.add(event.id);
    if (seen.size > 10000) seen.delete(seen.values().next().value ?? '');
    if (event.type === 'visual.command') {
      const parsed = VisualCommandSchema.safeParse(event.payload.command);
      if (!parsed.success) return reject(event, 'Invalid visual command');
      const command = parsed.data;
      let settings = visual.settings;
      if (command.type === 'effect.select') {
        if (!findEffect(command.effect)) return reject(event, 'Unknown effect version');
        settings = EffectSettingsSchema.parse(settings.mode === 'case' ? { ...settings, caseRules: { ...settings.caseRules, [flow.id]: { mode: 'fixed', effect: command.effect } } } : { ...settings, mode: 'fixed', enabled: true, effect: command.effect });
      } else if (command.type === 'effect.mode') settings = EffectSettingsSchema.parse({ ...settings, mode: command.mode, enabled: command.mode !== 'off' });
      else settings = EffectSettingsSchema.parse({ ...settings, seed: (settings.seed + 1) >>> 0 });
      try { updateEffectSettings(settings, event); }
      catch (error) { return reject(event, error instanceof Error ? error.message : 'Invalid visual projection'); }
      return { accepted: true, snapshot };
    }
    if (event.type === 'field.change') {
      const field = flow.fields.find(item => item.id === event.payload.fieldId);
      const value = event.payload.value;
      if (!field) return reject(event, 'Unknown field');
      if (!isFieldValue(field, value)) return reject(event, 'Invalid field value');
      const denied = allowChange(event); if (denied) return reject(event, denied);
      return commit({ fields: { ...snapshot.fields, [field.id]: value } }, event, field.sensitive ? 'Sensitive field changed (value redacted)' : `Field changed: ${field.id}`);
    }
    if (event.type === 'collection.change') {
      const definition = flow.collections.find(item => item.id === event.payload.collectionId);
      const field = flow.fields.find(item => item.id === definition?.field);
      if (!definition || !field || !isFieldValue(field, event.payload.keys)) return reject(event, 'Invalid collection request');
      const denied = allowChange(event); if (denied) return reject(event, denied);
      return commit({ fields: { ...snapshot.fields, [field.id]: event.payload.keys } }, event, `Selection changed: ${definition.id}`);
    }
    if (event.type === 'focus.set') {
      const id = event.payload.nodeId;
      if (id !== null && (typeof id !== 'string' || !getScene().some(node => node.id === id))) return reject(event, 'Unknown focus target');
      try { setInteraction({ focusedId: id }); } catch { return reject(event, 'Invalid focus target'); }
      trace('interaction', event, 'Focus updated without domain commit');
      return { accepted: true, snapshot };
    }
    if (event.type === 'mode.set') {
      const mode = event.payload.mode;
      if (mode !== 'manual' && mode !== 'hybrid' && mode !== 'auto') return reject(event, 'Invalid mode');
      const denied = allowChange(event); if (denied) return reject(event, denied);
      return commit({ mode }, event, `Control mode: ${mode}`);
    }
    if (event.type === 'navigation.restore') {
      if (event.source !== 'host') return reject(event, 'Navigation requires host authority');
      const target = event.payload.state;
      if (typeof target !== 'string' || !Object.hasOwn(flow.states, target)) return reject(event, 'Unknown navigation state');
      const fields = { ...snapshot.fields };
      if (event.payload.fields !== undefined) {
        const restored = event.payload.fields;
        if (typeof restored !== 'object' || restored === null || Array.isArray(restored)) return reject(event, 'Invalid restored fields');
        for (const [id, value] of Object.entries(restored)) {
          const field = flow.fields.find(item => item.id === id);
          if (!field || !isFieldValue(field, value)) return reject(event, 'Invalid restored field');
          fields[id] = value;
        }
      }
      const denied = allowChange(event); if (denied) return reject(event, denied);
      let prepared: ReturnType<typeof prepare>;
      try { prepared = prepare({ state: target, fields }, event, 0); } catch { return reject(event, 'Invalid restored scene or presentation plan'); }
      actor.stop();
      actor = createActor(createMachine({ id: flow.id, initial: stateKeys[target]!, states }));
      actor.start();
      // Navigation restores a state without executing transition actions.
      const result = commit({ state: target, fields }, event, 'History restored', 0, prepared);
      return result;
    }
    const basis = snapshot;
    const transition = flow.states[snapshot.state]?.on[event.type];
    if (!transition) return reject(event, 'Event not allowed in current state');
    try {
      if (transition.guard && !guards[transition.guard]?.(snapshot, event)) return reject(event, 'Guard rejected event');
    } catch (error) { return reject(event, `Guard failed: ${error instanceof Error ? error.message : 'Host guard error'}`); }
    if (disposed || snapshot !== basis) return reject(event, 'Change invalidated during guard');
    const denied = allowChange(event); if (denied) return reject(event, denied);
    const fields = { ...snapshot.fields, ...transition.assign };
    let prepared: ReturnType<typeof prepare>;
    try { prepared = prepare({ state: transition.target, fields }, event, transition.duration); } catch { return reject(event, 'Invalid transition scene or effect plan'); }
    actor.send({ type: event.type });
    const actorValue = actor.getSnapshot().value;
    const targetName = typeof actorValue === 'string' ? stateNames[actorValue] : undefined;
    const target = targetName ? flow.states[targetName] : undefined;
    if (!target || !targetName) return reject(event, 'Unknown target');
    const result = commit({ state: targetName, fields }, event, `Transition to ${targetName}`, transition.duration, prepared);
    const route = target.route;
    if (!disposed && result.accepted && snapshot === result.snapshot && route && !options.replay) callObserver(() => options.router?.navigate(route, false), 'router', event);
    if (result.accepted && !disposed && transition.action && !options.replay) {
      const action = actions[transition.action];
      const controller = new AbortController();
      pendingActions.add(controller);
      // Promise's executor preserves immediate execution and also captures
      // synchronous host exceptions after the logical commit.
      if (action) void new Promise<void>(resolve => resolve(action({ snapshot: result.snapshot, event, signal: controller.signal }))).then(() => {
        if (!disposed) { trace('effect', event, 'Action completed'); notify(); }
      }).catch((error: unknown) => {
        if (!disposed) { trace('error', event, error instanceof Error ? error.message : 'Action failed'); notify(); }
      }).finally(() => pendingActions.delete(controller));
    }
    return result;
  }
  function send(type: string, payload: RuntimeEvent['payload'] = {}, source: RuntimeEvent['source'] = 'user', reason: ChangeReason = source === 'replay' ? 'replay' : source === 'ai' ? 'ai' : 'programmatic'): EventResult {
    return dispatch({ id: `${flow.id.slice(0, 70)}-${++counter}`, type, source, reason, timestamp: clock.now(), expectedRevision: snapshot.revision, payload });
  }
  function transact(input: LocalTransaction, authority: LocalTransactionAuthority): EventResult {
    const parsed = LocalTransactionSchema.safeParse(input);
    if (!parsed.success) return { accepted: false, reason: 'Invalid local transaction' };
    const transaction = parsed.data;
    const event: RuntimeEvent = { id: transaction.id, type: 'transaction.local', source: authority.source, reason: authority.reason, timestamp: clock.now(), expectedRevision: transaction.expectedRevision, payload: {} };
    if (disposed) return { accepted: false, reason: 'Runtime disposed' };
    if (seen.has(event.id)) return reject(event, 'Duplicate event');
    const base = snapshot;
    const current = () => {
      if (disposed || snapshot !== base || transaction.expectedRevision !== snapshot.revision) return false;
      if (authority.source === 'replay' && !options.replay) return false;
      if (authority.source === 'ai' && (options.replay || snapshot.mode === 'manual' || (snapshot.mode === 'hybrid' && !authority.approved))) return false;
      const interaction = interactions.get();
      if (authority.source === 'ai' && (interaction.focusedId || interaction.pressedId || interaction.composingId)) return false;
      return true;
    };
    const authorized = () => {
      if (!current()) return false;
      // Host authorization is a callback and can synchronously reenter Core.
      // Its true return never grants permission to overwrite a newer snapshot.
      try { return authority.authorize() === true && current(); } catch { return false; }
    };
    if (!authorized()) return reject(event, 'Transaction authority or revision rejected');
    let candidate = base, duration = 0, navigated = false;
    try {
      for (const [index, command] of transaction.commands.entries()) {
        if (!authorized()) return reject(event, 'Transaction authority changed');
        const step: RuntimeEvent = { ...event, id: `${transaction.id.slice(0, 90)}-${index}`, type: command.type === 'event' ? command.eventType : command.type === 'field' ? 'field.change' : 'collection.change',
          payload: command.type === 'event' ? command.payload : command.type === 'field' ? { fieldId: command.fieldId, value: command.value } : { collectionId: command.collectionId, keys: command.keys } };
        let fields = { ...candidate.fields }, state = candidate.state;
        if (command.type === 'field') {
          const field = flow.fields.find(field => field.id === command.fieldId);
          if (!field || !isFieldValue(field, command.value) || (authority.source === 'ai' && field.sensitive)) return reject(event, 'Invalid transaction field');
          fields[field.id] = command.value;
        } else if (command.type === 'collection') {
          const collection = flow.collections.find(collection => collection.id === command.collectionId);
          const field = flow.fields.find(field => field.id === collection?.field);
          if (!collection || !field || !isFieldValue(field, command.keys) || (authority.source === 'ai' && field.sensitive) || command.keys.some(key => !collection.items.some(item => item.id === key && !item.disabled))) return reject(event, 'Invalid transaction collection');
          fields[field.id] = command.keys;
        } else {
          const transition = flow.states[candidate.state]?.on[command.eventType];
          if (!transition || transition.action || !transition.reversible) return reject(event, 'Transaction requires a reversible local transition');
          if (authority.source === 'ai' && !transition.aiAllowed) return reject(event, 'Transition is outside the AI allowlist');
          if (transition.guard && !guards[transition.guard]?.(candidate, step)) return reject(event, 'Transaction guard rejected');
          if (authority.source === 'ai' && Object.keys(transition.assign).some(id => flow.fields.find(field => field.id === id)?.sensitive)) return reject(event, 'Sensitive assignment is not an agent command');
          fields = { ...fields, ...transition.assign }; state = transition.target;
          duration = transition.duration; navigated = true;
        }
        if (allowChange(step, candidate)) return reject(event, 'Transaction canceled by host');
        candidate = freeze({ ...candidate, state, fields });
        // Intermediate references and field invariants must also hold. No actor,
        // scene cache, listener, route or host action is touched by this projection.
        for (const field of flow.fields) if (!isFieldValue(field, candidate.fields[field.id])) return reject(event, 'Invalid transaction field');
        for (const collection of flow.collections) {
          const keys = candidate.fields[collection.field];
          if (!Array.isArray(keys) || keys.some(key => !collection.items.some(item => item.id === key && !item.disabled))) return reject(event, 'Invalid transaction selection');
        }
        project(candidate);
      }
    } catch { return reject(event, 'Invalid local transaction candidate'); }
    let prepared: ReturnType<typeof prepare>;
    try { prepared = prepare({ state: candidate.state, fields: candidate.fields }, event, duration); }
    catch { return reject(event, 'Invalid local transaction projection'); }
    if (!authorized()) return reject(event, 'Transaction authority changed before commit');
    seen.add(event.id);
    if (seen.size > 10000) seen.delete(seen.values().next().value ?? '');
    actor.stop();
    actor = createActor(createMachine({ id: flow.id, initial: stateKeys[candidate.state]!, states })); actor.start();
    const result = commit({ state: candidate.state, fields: candidate.fields }, event, 'Local transaction committed', duration, prepared);
    const route = flow.states[candidate.state]?.route;
    if (!disposed && result.accepted && snapshot === result.snapshot && navigated && route && !options.replay) callObserver(() => options.router?.navigate(route, false), 'router', event);
    return result;
  }
  function collection(id: string) {
    if (disposed) throw new Error('Runtime disposed');
    const definition = flow.collections.find(item => item.id === id);
    if (!definition) throw new Error('Unknown collection');
    let behavior = collectionBehaviors.get(id);
    if (!behavior) {
      behavior = createCollectionBehavior({
        getKeys: () => { const value = snapshot.fields[definition.field]; return Array.isArray(value) ? value : []; },
        setKeys: (keys, reason) => send('collection.change', { collectionId: id, keys }, 'user', reason).accepted,
        getLocale: () => localeContext.language,
        getOrder: () => options.collectionOrder?.(snapshot, id, localeContext.language) ?? definition.items.map(item => item.id),
        getLabel: key => definition.items.find(item => item.id === key)?.label ?? '',
        isSelectable: key => definition.items.some(item => item.id === key && !item.disabled), now: clock.now,
      });
      collectionBehaviors.set(id, behavior);
    }
    return behavior;
  }
  /** Pointer, native keyboard activation and approved command adapters use one authority. */
  function activatePart(nodeId: string, reason: ChangeReason, modifiers: { shiftKey?: boolean; from?: string | null } = {}, viewport?: { width: number; height: number }): boolean {
    const node = getScene(viewport).find(node => node.id === nodeId);
    if (!node || node.disabled || node.opacity <= 0.05) return false;
    if (node.collection) {
      const behavior = collection(node.collection.id);
      return modifiers.shiftKey ? behavior.range(node.collection.itemId, { reason, from: modifiers.from }) : behavior.toggle(node.collection.itemId, reason);
    }
    if (node.onCollection) {
      if (node.onCollection.operation === 'all') return collection(node.onCollection.id).selectAll(reason);
      return send('collection.change', { collectionId: node.onCollection.id, keys: [] }, 'user', reason).accepted;
    }
    if (node.onVisual) return send('visual.command', { command: node.onVisual }, 'user', reason).accepted;
    if (node.onActivate) return send(node.onActivate, {}, 'user', reason).accepted;
    return false;
  }
  function updateEffectSettings(settings: EffectSettings, event: RuntimeEvent) {
    const previous = visual;
    visual = freeze({ ...visual, settings, revision: visual.revision + 1 });
    try { project(snapshot); } catch (error) { visual = previous; throw error; }
    settingsRevision++; sceneCache.clear();
    trace('effect', event, `Effect policy: ${settings.mode}`);
    observers(visualListeners, 'visual observer', event);
  }
  function validatePlan(input: unknown): DecisionPlan {
    if (disposed) throw new Error('Runtime disposed');
    const plan = DecisionPlanSchema.parse(input);
    if (snapshot.mode === 'manual') throw new Error('Manual mode does not accept AI plans');
    if (plan.flowId !== flow.id || plan.snapshotRevision !== snapshot.revision || plan.expiresAt <= clock.now() || plan.policyVersion !== policyVersion) throw new Error('Expired or stale decision plan');
    const interaction = interactions.get();
    if (interaction.focusedId || interaction.pressedId || interaction.composingId) throw new Error('Adaptation deferred during active interaction');
    const transition = flow.states[snapshot.state]?.on[plan.eventType];
    if (!transition?.aiAllowed || transition.action || !transition.reversible) throw new Error('Transition is outside the AI allowlist');
    return freeze(plan);
  }
  function subscribeTo(store: Set<() => void>, listener: () => void) {
    if (disposed) throw new Error('Runtime disposed');
    store.add(listener); return () => { store.delete(listener); };
  }
  return {
    flow,
    getSnapshot: () => snapshot,
    getLocale: () => localeContext.language, getLocaleContext: () => localeContext, setLocale,
    subscribeLocale(listener: () => void) { return subscribeTo(localeListeners, listener); },
    projectScene: project,
    getInteraction: interactions.get,
    releaseSurface(owner: symbol) { if (interactions.release(owner)) { observers(interactionListeners, 'interaction observer'); flushLocale(); } },
    getTransitionDuration: () => transitionDuration,
    getVisualState: () => visual,
    getDiagnostics: () => ({ disposed, subscriptions: localeListeners.size + listeners.size + interactionListeners.size + traceListeners.size + visualListeners.size, pendingActions: pendingActions.size, cachedScenes: sceneCache.size }),
    configureEffects(input: unknown) {
      if (disposed) throw new Error('Runtime disposed');
      const settings = freeze(EffectSettingsSchema.parse(input));
      updateEffectSettings(settings, { id: `${flow.id.slice(0, 70)}-config-${++counter}`, type: 'visual.policy.change', source: 'host', timestamp: clock.now(), payload: {} });
    },
    setRenderCapabilities(input: RenderCapabilities) {
      if (disposed) return;
      const capabilities = RenderCapabilitiesSchema.parse(input);
      if (JSON.stringify(capabilities) === JSON.stringify(visual.capabilities)) return;
      visual = freeze({ ...visual, capabilities, revision: visual.revision + 1 });
      observers(visualListeners, 'visual observer');
    },
    getTrace: () => [...traces],
    getTraceSnapshot: () => traces,
    getSuggestion: () => suggestion,
    subscribe(listener: () => void) { return subscribeTo(listeners, listener); },
    subscribeInteraction(listener: () => void) { return subscribeTo(interactionListeners, listener); },
    subscribeTrace(listener: () => void) { return subscribeTo(traceListeners, listener); },
    subscribeVisual(listener: () => void) { return subscribeTo(visualListeners, listener); },
    setInteraction,
    dispatch, send, activatePart, collection, transact,
    isReplay: () => Boolean(options.replay),
    propose(input: unknown): EventResult {
      try {
        const plan = validatePlan(input);
        suggestion = plan;
        if (snapshot.mode === 'auto') { suggestion = null; return send(plan.eventType, {}, 'system', 'ai'); }
        trace('decision', { id: plan.id, type: plan.eventType, source: 'ai', timestamp: clock.now(), payload: {} }, plan.explanation);
        notify(); return { accepted: true, snapshot };
      } catch (error) { return { accepted: false, reason: error instanceof Error ? error.message : 'Invalid plan' }; }
    },
    acceptSuggestion(): EventResult {
      if (!suggestion) return { accepted: false, reason: 'No suggestion' };
      try { const plan = validatePlan(suggestion); suggestion = null; return send(plan.eventType, {}, 'user', 'ai'); }
      catch (error) { suggestion = null; notify(); return { accepted: false, reason: error instanceof Error ? error.message : 'Invalid plan' }; }
    },
    rejectSuggestion() { suggestion = null; notify(); },
    getScene,
    dispose() { disposed = true; interactions.clear(); actor.stop(); for (const behavior of collectionBehaviors.values()) behavior.destroy(); collectionBehaviors.clear(); for (const controller of pendingActions) controller.abort(); pendingActions.clear();sceneCache.clear();localeListeners.clear();seen.clear();recordedEffects.clear(); listeners.clear(); interactionListeners.clear(); traceListeners.clear(); visualListeners.clear(); },
  };
}
export type FluidRuntime = ReturnType<typeof createFluidRuntime>;

export function flowToMermaid(flow: FlowDefinition): string {
  const ids = Object.fromEntries(Object.keys(flow.states).map((id, index) => [id, `s${index}`]));
  const lines = ['stateDiagram-v2', `    [*] --> ${ids[flow.initial]}`];
  for (const [id, state] of Object.entries(flow.states)) {
    lines.push(`    state "${state.label.replace(/["\n\r]/g, ' ')}" as ${ids[id]}`);
    for (const [event, transition] of Object.entries(state.on)) lines.push(`    ${ids[id]} --> ${ids[transition.target]}: ${event}`);
  }
  return lines.join('\n');
}
