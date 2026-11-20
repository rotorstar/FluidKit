'use client';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { defineCatalog, resolveLocaleContext, type Locale, type LocaleContext as FluidLocaleContext } from '@fluidkit/i18n';
import type { FluidRuntime } from '@fluidkit/core';
import { ThemePreferencesSchema, type ThemePreferences, type ChangeReason, type SceneNode } from '@fluidkit/contracts';
import { DEFAULT_PRIMARY_FONT_URL, DEFAULT_FALLBACK_FONT_URLS, deriveLocalizedRecording, createFluidSurface, createResourceScope, type ResourceLedger, type FluidSurfaceHandle, type SurfaceMetrics, type BackendMode, type SurfacePlaybackControls } from '@fluidkit/webgpu';

const Context = createContext<FluidRuntime | null>(null);
const localeCopy = defineCatalog({
  surface: {de:'Fluid GPU-Oberfläche', en:'Fluid GPU surface', fr:'Surface GPU Fluid'},
  controls: {de:'Fluid-Steuerung', en:'Fluid controls', fr:'Commandes Fluid'},
  recording: {de:'Aufzeichnung · Original-Layout an Fenster angepasst', en:'Recording · Original layout fitted to window', fr:'Enregistrement · Mise en page adaptée à la fenêtre'},
  live: {de:'Live-Ansicht', en:'Live view', fr:'Vue en direct'},
  unavailable: {de:'GPU-Renderer nicht bereit', en:'GPU renderer unavailable', fr:'Moteur de rendu GPU indisponible'},
  retry: {de:'GPU erneut starten', en:'Restart GPU renderer', fr:'Relancer le rendu GPU'},
});
const LocaleContext = createContext<Locale | FluidLocaleContext | undefined>(undefined);
export function FluidLocaleProvider({locale, children}: {locale: Locale | FluidLocaleContext; children: ReactNode}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}
const ThemeContext = createContext<ThemePreferences | null>(null);
/** Host-owned appearance; absent providers preserve independently configured runtimes. */
export function FluidThemeProvider({ preferences, children }: { preferences: ThemePreferences; children: ReactNode }) {
  return <ThemeContext.Provider value={preferences}>{children}</ThemeContext.Provider>;
}
export function FluidProvider({ runtime, children }: { runtime: FluidRuntime; children: ReactNode }) {
  const preferences = useContext(ThemeContext);
  const locale = useContext(LocaleContext);
  useLayoutEffect(() => { if (locale) runtime.setLocale(locale); }, [runtime, locale]);
  useEffect(() => {
    if (!preferences) return;
    const theme = ThemePreferencesSchema.parse(preferences);
    if (JSON.stringify(runtime.getVisualState().settings.theme) !== JSON.stringify(theme)) runtime.configureEffects({ ...runtime.getVisualState().settings, theme });
  }, [runtime, preferences]);
  return <Context.Provider value={runtime}>{children}</Context.Provider>;
}
/** Named public boundary keeps generated declarations independent of Core internals. */
export type FluidContextValue = {
  runtime: FluidRuntime;
  locale: Locale;
  localeContext: FluidLocaleContext;
  snapshot: ReturnType<FluidRuntime['getSnapshot']>;
  interaction: ReturnType<FluidRuntime['getInteraction']>;
  visual: ReturnType<FluidRuntime['getVisualState']>;
};
export function useFluid(): FluidContextValue {
  const runtime = useContext(Context);
  if (!runtime) throw new Error('useFluid requires FluidProvider');
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const interaction = useSyncExternalStore(runtime.subscribeInteraction, runtime.getInteraction, runtime.getInteraction);
  const visual = useSyncExternalStore(runtime.subscribeVisual, runtime.getVisualState, runtime.getVisualState);
  const localeContext = useSyncExternalStore(runtime.subscribeLocale, runtime.getLocaleContext, runtime.getLocaleContext);
  return { runtime, snapshot, interaction, visual, locale:localeContext.language, localeContext };
}
const bridgeStyle: CSSProperties = { position: 'absolute', opacity: 0, color: 'transparent', background: 'transparent', border: 0, margin: 0, padding: 0, caretColor: 'transparent', pointerEvents: 'none' };
type PresentedFrame = NonNullable<ReturnType<FluidSurfaceHandle['getPresentation']>>;
type FocusIdentity = Pick<SceneNode, 'id' | 'anatomy' | 'collection'>;
const isControl = (node: SceneNode) => ['button', 'checkbox', 'textbox'].includes(node.anatomy.behavior);

export function FluidSurface({ buildId, catalogFingerprint, fontUrl = DEFAULT_PRIMARY_FONT_URL, fallbackFontUrls, onMetrics, onControls, height, motionVersion, deviceLossToken = 0, backendMode = 'webgpu-first', resourceLedger, onError }: { buildId?:string; catalogFingerprint?: (locale: Locale) => string; fontUrl?: string; fallbackFontUrls?: readonly string[]; resourceLedger?: ResourceLedger; onError?: (error:Error)=>void; onMetrics?: (metrics: SurfaceMetrics) => void; onControls?: (controls: SurfacePlaybackControls | null) => void; height?: number; motionVersion?: 1 | 2; deviceLossToken?: number; backendMode?: BackendMode }) {
  const { runtime, snapshot, visual, locale, localeContext } = useFluid();
  const build = useRef(buildId); build.current=buildId;
  const fingerprint = useRef(catalogFingerprint);
  fingerprint.current = catalogFingerprint;
  const recordingLocale = () => ({context:runtime.getLocaleContext(), buildId:build.current, catalogFingerprint:fingerprint.current?.(runtime.getLocale())});
  const tr = (key: Parameters<typeof localeCopy>[1]) => localeCopy(locale,key);
  const owner = useRef(Symbol('fluid-surface')).current;
  const interaction = useSyncExternalStore(runtime.subscribeInteraction, () => runtime.getInteraction(owner), () => runtime.getInteraction(owner));
  useEffect(() => () => runtime.releaseSurface(owner), [runtime, owner]);
  const resolvedFallbacks = fallbackFontUrls ?? (fontUrl === DEFAULT_PRIMARY_FONT_URL ? DEFAULT_FALLBACK_FONT_URLS : undefined);
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const surface = useRef<FluidSurfaceHandle | null>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const focusIdentity = useRef<FocusIdentity | null>(null);
  const focusReturn = useRef<string | null>(null);
  const collectionFocus = useRef(new Map<string, string>());
  const onPresentationRef = useRef<(frame: PresentedFrame) => void>(() => {});
  const pointerSelection = useRef<{ nodeId: string; anchor: number } | null>(null);
  const publishNativeSelection = (nodeId: string, input: HTMLInputElement) => surface.current?.setSelection({ nodeId, start: input.selectionStart ?? 0, end: input.selectionEnd ?? 0, direction: input.selectionDirection ?? 'none' });
  const onErrorRef=useRef(onError);onErrorRef.current=onError;
  const onMetricsRef = useRef(onMetrics); onMetricsRef.current = onMetrics;
  const onControlsRef = useRef(onControls); onControlsRef.current = onControls;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  const replayActive=useRef(false);
  const [importedReplay, setImportedReplay] = useState(false);
  const [viewport, setViewport] = useState({ width: 1000, height: 700 });
  const viewportRef=useRef(viewport);viewportRef.current=viewport;
  function setSurfaceInteraction(patch: Parameters<FluidRuntime['setInteraction']>[0]) { runtime.setInteraction(patch, viewportRef.current, owner); }
  const recoveryAttempts = useRef(0);
  const presentedScene = useRef<{ surface: FluidSurfaceHandle; snapshot: typeof snapshot; source: typeof snapshot; origins?: ReadonlyMap<string, typeof snapshot>; context: FluidLocaleContext; width:number; height:number } | null>(null);
  const localRecording = useRef<{source:typeof snapshot; target:typeof snapshot} | null>(null);
  const transitioning = useRef(false);
  const paintedTheme = useRef<{ surface: FluidSurfaceHandle; key: string } | null>(null);
  useEffect(() => {
    if (!canvas.current) return;
    const observer = new ResizeObserver(entries => { const rect = entries[0]?.contentRect; if (rect?.width && rect.height) setViewport({ width: rect.width, height: rect.height }); });
    const resourceScope=resourceLedger?createResourceScope(resourceLedger):null;
    resourceScope?.track('observer',()=>observer.disconnect());
    observer.observe(canvas.current); return () => {if(resourceScope)resourceScope.dispose();else observer.disconnect();};
  }, [generation, backendMode, motionVersion, resourceLedger]);
  useEffect(() => { if (deviceLossToken > 0) surface.current?.simulateDeviceLoss(); }, [deviceLossToken]);
  useEffect(() => {
    if (!canvas.current) return;
    const controller = new AbortController();
    setReady(false); setError(null);
    let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
    void createFluidSurface(canvas.current, { fontUrl, fallbackFontUrls: resolvedFallbacks, backendMode, motionVersion, resourceLedger, signal: controller.signal,
      onCapabilitiesChange: capabilities => runtime.setRenderCapabilities(capabilities),
      onPresentation: frame => { if (!controller.signal.aborted && !replayActive.current) onPresentationRef.current(frame); }, onError: e => {
      setError(e.message);setReady(false);onControlsRef.current?.(null);onErrorRef.current?.(e);
      if (e.name === 'CapabilityError' && e.message.includes('Gerät verloren') && recoveryAttempts.current < 3) {
        recoveryAttempts.current++; recoveryTimer = setTimeout(() => setGeneration(value => value + 1), 200 * recoveryAttempts.current);
      }
    }, onMetrics: metrics => { transitioning.current = metrics.phase === 'transitioning'; onMetricsRef.current?.(metrics); } }).then(value => {
      if (controller.signal.aborted) { value.dispose(); return; }
      localRecording.current=null; surface.current = value;replayActive.current=false;setImportedReplay(false);
      value.setMotionPreference(runtime.getVisualState().settings.motionPreference);
      value.setScene(runtime.getScene(viewportRef.current), false, 0, null, false, null, recordingLocale());
      onControlsRef.current?.({ ...value,
        canRestage() { return localRecording.current !== null && value.canRestageRecording(); },
        async getRestagedRecording(language) {
          const original=value.getRecording(), basis=localRecording.current;
          if (!basis || !original || original.schemaVersion!==5) return null;
          const profile={...original.languageProfile,context:resolveLocaleContext(language),catalogFingerprint:fingerprint.current?.(language) ?? null,buildId:build.current ?? null};
          return deriveLocalizedRecording(original,runtime.projectScene(basis.source,original.viewport,language),runtime.projectScene(basis.target,original.viewport,language),profile);
        },
        getPresentationMode: () => replayActive.current ? 'replay' : 'live',
        replay() { replayActive.current=true;setImportedReplay(true); value.replay(); },
        importRecording(input) { value.loadRecording(input);localRecording.current=null;replayActive.current=true; setImportedReplay(true); value.replay(); },
        restoreLive() { replayActive.current=false;transitioning.current=false;setImportedReplay(false); value.setScene(runtime.getScene(viewportRef.current), false, 0, null, false, null, recordingLocale()); },
      });
      setReady(true);
    }).catch((e: unknown) => { if (!controller.signal.aborted) {const error=e instanceof Error?e:new Error('WebGPU-Initialisierung fehlgeschlagen');setError(error.message);setReady(false);onControlsRef.current?.(null);onErrorRef.current?.(error);} });
    return () => { if (recoveryTimer) clearTimeout(recoveryTimer); onControlsRef.current?.(null); controller.abort(); surface.current?.dispose(); surface.current = null; };
  }, [runtime, fontUrl, resolvedFallbacks, generation, backendMode, motionVersion, resourceLedger]);
  useEffect(() => {
    const value = surface.current;
    if (!value || importedReplay) return;
    // The host may change canvas height in this same commit. ResizeObserver
    // publishes later; its notification must never replace the newly recorded clip.
    const rect = canvas.current?.getBoundingClientRect();
    const size = rect?.width && rect.height ? { width: rect.width, height: rect.height } : viewport;
    const previous = presentedScene.current;
    const sameSurface = previous?.surface === value;
    const nextRevision = sameSurface && previous.snapshot.revision !== snapshot.revision;
    if (sameSurface && !nextRevision && previous.context !== localeContext) {
      const resolvedSource = new Map(runtime.projectScene(previous.source, size).map(node => [node.id,node]));
      if (previous.origins) {
        for (const origin of new Set(previous.origins.values())) {
          for (const node of runtime.projectScene(origin,size)) {
            if (previous.origins.get(node.id) === origin) resolvedSource.set(node.id,node);
          }
        }
      }
      value.localizeScene([...resolvedSource.values()], runtime.getScene(size), localeContext, fingerprint.current?.(locale));
      presentedScene.current = {...previous, context:localeContext, ...size};
      return;
    }
    if (sameSurface && !nextRevision && previous.width === size.width && previous.height === size.height) return;
    // Only currently painted parts can outlive an interrupted source. Track
    // their originating snapshots by ID so a language switch can translate
    // even a label that disappeared two commits ago without retaining a clip chain.
    let origins = previous?.origins;
    if (nextRevision) {
      origins = undefined;
      const frame = value.getPresentation();
      if (frame && frame.progress < 1) {
        const priorTarget = new Map(runtime.projectScene(previous.snapshot,size,previous.context).map(node => [node.id,node]));
        const retained = new Map<string,typeof snapshot>();
        for (const part of frame.nodes) {
          const target = priorTarget.get(part.id);
          if (target && target.text === part.text && target.label === part.label) continue;
          retained.set(part.id, previous.origins?.get(part.id) ?? previous.source);
        }
        if (retained.size) origins=retained;
      }
    }
    const plan = runtime.getVisualState().current;
    value.setScene(runtime.getScene(size), nextRevision || (sameSurface && transitioning.current), runtime.getTransitionDuration(), plan?.targetRevision === snapshot.revision ? plan : null, nextRevision, null, recordingLocale());
    if (nextRevision) localRecording.current={source:previous.snapshot,target:snapshot};
    presentedScene.current = { surface: value, snapshot, source: nextRevision ? previous.snapshot : previous?.source ?? snapshot, origins, context:localeContext, ...size };
  }, [runtime, snapshot, ready, viewport, importedReplay, locale, localeContext]);
  useEffect(() => {
    surface.current?.setMotionPreference(visual.settings.motionPreference);
  }, [visual.settings.motionPreference, ready]);
  useEffect(() => {
    if (importedReplay || !surface.current) return;
    const value = surface.current, key = JSON.stringify(visual.settings.theme);
    if (paintedTheme.current?.surface === value && paintedTheme.current.key !== key) {
      // An explicit palette edit settles the live presentation. Saved clips retain
      // their baked paint, and imported replay is never recolored by preferences.
      value.setScene(runtime.getScene(viewport), false, 0, null, false, null, recordingLocale());
    } else value.updatePresentation(runtime.getScene(viewport));
    paintedTheme.current = { surface: value, key };
  }, [runtime, visual.settings, viewport, ready, importedReplay]);
  useEffect(() => {
    if(!replayActive.current)return;
    replayActive.current=false;transitioning.current=false;setImportedReplay(false);
    const value=surface.current;
    if(value){value.setScene(runtime.getScene(viewportRef.current),false,0,null,false,null,recordingLocale());presentedScene.current={surface:value,snapshot,source:snapshot,context:runtime.getLocaleContext(),...viewportRef.current};}
  }, [runtime,snapshot]);
  useEffect(() => { surface.current?.setInteraction(interaction); }, [interaction, ready]);
  const nodes = runtime.getScene(viewport);
  const nodesRef = useRef(nodes); nodesRef.current = nodes;

  function collectionNodes(id: string) {
    return nodesRef.current.filter(node => node.collection?.id === id && !node.disabled && node.opacity > 0.05 && isControl(node));
  }
  function focusNode(id: string) {
    const element = elements.current.get(id);
    if (!element || !element.isConnected || element.inert) return false;
    element.focus({ preventScroll: true });
    return document.activeElement === element;
  }
  function rovingId(id: string) {
    const candidates = collectionNodes(id).filter(node => !elements.current.get(node.id)?.inert);
    const focusedId = runtime.getInteraction(owner).focusedId;
    return candidates.find(node => node.id === focusedId)?.id
      ?? candidates.find(node => node.collection?.itemId === collectionFocus.current.get(id))?.id
      ?? candidates.find(node => node.checked)?.id ?? candidates[0]?.id;
  }
  function applyPresentation(frame: PresentedFrame) {
    const presented = new Map(frame.nodes.map(node => [node.id, node]));
    const states = new Map(frame.nodeStates.map(state => [state.id, state]));
    const current = new Map(nodesRef.current.map(node => [node.id, node]));
    const bounds = viewportRef.current;
    for (const [id, element] of elements.current) {
      const node = presented.get(id), target = current.get(id), state = states.get(id);
      const alpha = node?.kind === 'text' ? state?.textOpacity ?? node.opacity : Math.max(state?.panelOpacity ?? node?.opacity ?? 0, state?.textOpacity ?? 0);
      const visible = Boolean(node && target && alpha > 0.05 && node.x + node.width > 0 && node.y + node.height > 0 && node.x < bounds.width && node.y < bounds.height);
      if (node) {
        element.style.left = `${node.x}px`; element.style.top = `${node.y}px`;
        element.style.width = `${node.width}px`; element.style.height = `${node.height}px`;
        element.style.transform = `rotate(${node.rotation}rad)`; element.style.transformOrigin = '50% 50%';
      }
      const control = target && isControl(target);
      const centreVisible = node && node.x + node.width / 2 >= 0 && node.y + node.height / 2 >= 0 && node.x + node.width / 2 < bounds.width && node.y + node.height / 2 < bounds.height;
      const reachable = visible && node && (!control || (centreVisible && !target.disabled && surface.current?.hitTest(node.x + node.width / 2, node.y + node.height / 2)?.id === id));
      element.inert = !reachable;
      if (!visible || (control && !target.disabled && !reachable)) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
      if (control) element.tabIndex = reachable ? 0 : -1;
    }
    // One keyboard entry per collection; all controls still retain native semantics.
    for (const node of nodesRef.current) {
      const element = elements.current.get(node.id);
      if (node.collection && element && !element.inert) element.tabIndex = rovingId(node.collection.id) === node.id ? 0 : -1;
    }
  }
  function restoreFocus() {
    const previous = focusIdentity.current;
    if (!previous && !focusReturn.current) return;
    if (document.activeElement !== document.body && !container.current?.contains(document.activeElement)) return;
    const current = nodesRef.current;
    const destination = focusReturn.current
      ?? current.find(node => node.id === previous?.id)?.id
      ?? current.find(node => node.anatomy.componentId === previous?.anatomy.componentId && node.anatomy.part === previous?.anatomy.part)?.id
      ?? (previous?.collection ? collectionNodes(previous.collection.id).find(node => node.collection?.itemId === previous.collection?.itemId)?.id
        ?? collectionNodes(previous.collection.id)[0]?.id : undefined);
    if (!destination) { focusIdentity.current = null; focusReturn.current = null; return; }
    if (document.activeElement === elements.current.get(destination) || focusNode(destination)) focusReturn.current = null;
    // An entering destination may still be inert. Retry after the Surface's next
    // own presentation, without another timer/RAF or a per-frame React update.
  }
  onPresentationRef.current = frame => { applyPresentation(frame); restoreFocus(); };

  useEffect(() => {
    function outside(event: Event) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) { focusIdentity.current = null; focusReturn.current = null; }
    }
    document.addEventListener('focusin', outside, true);
    document.addEventListener('pointerdown', outside, true);
    return () => { document.removeEventListener('focusin', outside, true); document.removeEventListener('pointerdown', outside, true); };
  }, []);
  useLayoutEffect(() => {
    if (!ready || importedReplay) { if (importedReplay) focusIdentity.current = null; return; }
    const frame = surface.current?.getPresentation?.();
    if (frame) applyPresentation(frame);
    // Only restore focus that this Surface owned. Editing Studio controls wins.
    restoreFocus();
  });

  function activate(node: SceneNode, reason: ChangeReason, modifiers: { shiftKey?: boolean } = {}) {
    if (replayActive.current || elements.current.get(node.id)?.inert) return false;
    const returnsFocus = node.focusReturn && node.onActivate && node.onActivate === node.onEscape;
    if (returnsFocus) focusReturn.current = node.focusReturn!;
    const accepted = runtime.activatePart(node.id, reason, modifiers, viewportRef.current);
    if (!accepted && returnsFocus) focusReturn.current = null;
    return accepted;
  }

  function collectionKey(event: ReactKeyboardEvent<HTMLElement>, node: SceneNode) {
    if (!node.collection || replayActive.current || node.anatomy.behavior === 'textbox' || event.nativeEvent.isComposing || runtime.getInteraction(owner).composingId) return;
    const candidates = collectionNodes(node.collection.id).filter(candidate => !elements.current.get(candidate.id)?.inert);
    const current = candidates.findIndex(candidate => candidate.id === node.id);
    if (current < 0) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && !event.altKey) {
      event.preventDefault(); runtime.collection(node.collection.id).selectAll('keyboard'); return;
    }
    const step = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 0;
    const target = event.key === 'Home' ? candidates[0] : event.key === 'End' ? candidates.at(-1)
      : step ? candidates[Math.max(0, Math.min(candidates.length - 1, current + step))] : undefined;
    if (target) {
      event.preventDefault();
      if (event.shiftKey) runtime.activatePart(target.id, 'keyboard', { shiftKey: true, from: node.collection.itemId }, viewportRef.current);
      focusNode(target.id); return;
    }
    // Space is native checkbox/button activation; printable labels navigate only.
    if (event.key === ' ') return;
    const key = runtime.collection(node.collection.id).typeahead(event.key, { currentKey: node.collection.itemId, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey });
    const match = candidates.find(candidate => candidate.collection?.itemId === key);
    if (match) { event.preventDefault(); focusNode(match.id); }
  }
  function escape(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.key !== 'Escape' || event.nativeEvent.isComposing || runtime.getInteraction(owner).composingId || replayActive.current) return;
    const element = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-fluid-node]') : null;
    let node = nodesRef.current.find(candidate => candidate.id === element?.dataset.fluidNode);
    if (node?.anatomy.behavior === 'textbox') return;
    const visited = new Set<string>();
    while (node && !node.onEscape && !visited.has(node.id)) {
      visited.add(node.id); const parent = node.semantics?.parentId;
      node = nodesRef.current.find(candidate => candidate.id === parent);
    }
    if (!node?.onEscape) return;
    event.preventDefault();
    focusReturn.current = node.focusReturn ?? null;
    if (!runtime.send(node.onEscape, {}, 'user', 'keyboard').accepted) focusReturn.current = null;
  }
  function semanticNode(node: SceneNode): ReactNode {
    const position = { ...bridgeStyle, left: node.x, top: node.y, width: node.width, height: node.height, transform: `rotate(${node.rotation}rad)`, transformOrigin: '50% 50%' };
    const ref = (element: HTMLElement | null) => { if (element) elements.current.set(node.id, element); else elements.current.delete(node.id); };
    const focus = () => {
      focusIdentity.current = { id: node.id, anatomy: node.anatomy, collection: node.collection };
      if (node.collection) collectionFocus.current.set(node.collection.id, node.collection.itemId);
      setSurfaceInteraction({ focusedId: node.id });
    };
    const blur = (relatedTarget: EventTarget | null) => {
      // A deliberate Tab/click focus transfer must win even before focusin fires.
      if (relatedTarget) { focusIdentity.current = null; focusReturn.current = null; }
      pointerSelection.current = null; setSurfaceInteraction({ focusedId: null, composingId: null }); surface.current?.setSelection(null);
    };
    const key = `${node.anatomy.componentId}:${node.anatomy.part}`;
    const attributes = { lang: node.textLanguage, dir: node.textDirection, 'data-fluid-node': node.id, 'data-component': node.anatomy.componentId, 'data-part': node.anatomy.part, 'data-behavior': node.anatomy.behavior };
    let control: ReactNode;
    const tabIndex = node.collection ? rovingId(node.collection.id) === node.id ? 0 : -1 : undefined;
    if (node.anatomy.behavior === 'textbox') control = <input ref={ref} {...attributes} dir={node.textDirection ?? 'auto'} aria-label={node.label ?? node.id} style={position} disabled={node.disabled} maxLength={runtime.flow.fields.find(field => field.id === node.binding)?.maxLength} value={node.text} onFocus={event => { focus(); publishNativeSelection(node.id, event.currentTarget); }} onBlur={event => blur(event.relatedTarget)} onCompositionStart={() => setSurfaceInteraction({ composingId: node.id })} onCompositionEnd={() => setSurfaceInteraction({ composingId: null })} onChange={event => { if (node.binding) runtime.send('field.change', { fieldId: node.binding, value: event.currentTarget.value }, 'user', 'input'); publishNativeSelection(node.id, event.currentTarget); }} onSelect={event => publishNativeSelection(node.id, event.currentTarget)} />;
    else if (node.anatomy.behavior === 'checkbox') control = <input ref={ref} {...attributes} type="checkbox" aria-label={node.label ?? node.text} style={position} disabled={node.disabled} checked={Boolean(node.checked)} tabIndex={tabIndex} onFocus={focus} onBlur={event => blur(event.relatedTarget)} onKeyDown={event => collectionKey(event, node)} onChange={event => {
      const native = event.nativeEvent;
      activate(node, native instanceof MouseEvent && native.detail > 0 ? 'pointer' : 'keyboard', { shiftKey: native instanceof MouseEvent && native.shiftKey });
    }} />;
    else if (node.anatomy.behavior === 'button' && (node.onActivate || node.onVisual || node.onCollection)) { control = <button ref={ref} {...attributes} style={position} disabled={node.disabled} tabIndex={tabIndex} aria-pressed={node.pressed} onFocus={focus} onBlur={event => blur(event.relatedTarget)} onKeyDown={event => collectionKey(event, node)} onClick={event => {
      activate(node, event.detail === 0 ? 'keyboard' : 'pointer', { shiftKey: event.shiftKey });
    }}>{node.label ?? node.text}</button>; }
    else {
      const role = node.anatomy.behavior === 'progressbar' ? 'progressbar' : node.anatomy.behavior === 'status' ? 'status' : undefined;
      control = <span ref={ref} {...attributes} style={position} role={role} aria-label={role === 'progressbar' ? node.label ?? node.text : undefined} aria-valuemin={role === 'progressbar' ? 0 : undefined} aria-valuemax={role === 'progressbar' ? 100 : undefined} aria-valuenow={role === 'progressbar' ? node.progress * 100 : undefined}>{node.label ?? node.text}</span>;
    }
    const childNodes = nodes.filter(child => child.semantics?.parentId === node.id);
    if (node.semantics?.role === 'row') childNodes.sort((left, right) => (left.semantics?.columnIndex ?? Number.MAX_SAFE_INTEGER) - (right.semantics?.columnIndex ?? Number.MAX_SAFE_INTEGER));
    const children = childNodes.map(semanticNode);
    const semanticStyle: CSSProperties = { position: 'static', opacity: 0, border: 0, padding: 0 };
    if (node.semantics?.role === 'table') return <table key={key} aria-label={node.label} style={semanticStyle}><tbody>{children}</tbody></table>;
    if (node.semantics?.role === 'row') return <tr key={key} style={semanticStyle}>{children}</tr>;
    if (node.semantics?.role === 'columnheader') return <th key={key} scope="col" aria-sort={node.semantics.sort} style={semanticStyle}>{control}{children}</th>;
    if (node.semantics?.role === 'cell') return <td key={key} style={semanticStyle}>{control}{children}</td>;
    if (node.semantics?.role === 'region' || node.semantics?.role === 'group' || node.semantics?.role === 'dialog') return <div key={key} role={node.semantics.role} aria-label={node.label} style={{ display: 'contents' }}>{control}{children}</div>;
    return <div key={key} style={{ display: 'contents' }}>{control}{children}</div>;
  }
  return <div ref={container} className="fluid-surface" style={{position:'relative',overflow:'hidden',height}} data-testid="fluid-surface" data-status={error ? 'error' : ready ? 'ready' : 'initializing'}>
    <canvas key={`${backendMode}-${generation}`} ref={canvas} style={{display:'block',width:'100%',height:'100%',touchAction:'manipulation'}} data-recovery-generation={generation} aria-label={tr('surface')} onPointerDown={event => {
      if (importedReplay) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const node = surface.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (!node) return;
      if (node.anatomy.behavior === 'textbox') {
        const input = elements.current.get(node.id);
        if (input instanceof HTMLInputElement) {
          event.preventDefault(); input.focus();
          const offset = surface.current?.textOffsetAt(node.id, event.clientX - rect.left, event.clientY - rect.top);
          if (offset !== null && offset !== undefined) {
            input.setSelectionRange(offset, offset); publishNativeSelection(node.id, input);
            pointerSelection.current = { nodeId: node.id, anchor: offset };
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        }
      }
      else if (node.anatomy.behavior === 'button' || node.anatomy.behavior === 'checkbox') {
        event.preventDefault(); focusNode(node.id);
        event.currentTarget.setPointerCapture(event.pointerId);
        setSurfaceInteraction({ pressedId: node.id });
      }
    }} onPointerMove={event => {
      if (importedReplay) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const drag = pointerSelection.current;
      if (drag) {
        const input = elements.current.get(drag.nodeId);
        const offset = surface.current?.textOffsetAt(drag.nodeId, event.clientX - rect.left, event.clientY - rect.top);
        if (input instanceof HTMLInputElement && offset !== null && offset !== undefined) {
          input.setSelectionRange(Math.min(drag.anchor, offset), Math.max(drag.anchor, offset), offset < drag.anchor ? 'backward' : 'forward');
          publishNativeSelection(drag.nodeId, input);
        }
        return;
      }
      const node = surface.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      setSurfaceInteraction({ hoveredId: node?.id ?? null });
    }} onPointerLeave={() => setSurfaceInteraction({ hoveredId: null })} onPointerCancel={() => { pointerSelection.current = null; setSurfaceInteraction({ pressedId: null }); }} onPointerUp={event => {
      if (importedReplay) return;
      if (pointerSelection.current) {
        pointerSelection.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      const pressedId = runtime.getInteraction(owner).pressedId;
      setSurfaceInteraction({ pressedId: null });
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      const rect = event.currentTarget.getBoundingClientRect();
      const node = surface.current?.hitTest(event.clientX - rect.left, event.clientY - rect.top);
      if (node?.id === pressedId) {
        activate(node, 'pointer', { shiftKey: event.shiftKey });
      }
    }} />
    {ready && !error && !importedReplay && <div className="fluid-semantics" style={{position:'absolute',inset:0,pointerEvents:'none'}} aria-label={tr('controls')} lang={locale} dir={localeContext.direction} onKeyDown={escape}>
      {nodes.filter(node => !node.semantics?.parentId).map(semanticNode)}
    </div>}
    {importedReplay && <div className="replay-banner" role="status">{tr('recording')} <button onClick={() => { replayActive.current=false;transitioning.current=false;setImportedReplay(false); surface.current?.setScene(runtime.getScene(viewport), false,0,null,false,null,recordingLocale()); }}>{tr('live')}</button></div>}
    {error && <div className="surface-diagnostic" role="alert"><strong>{tr('unavailable')}</strong><p>{error}</p><button onClick={() => setGeneration(value => value + 1)}>{tr('retry')}</button></div>}
    {!ready && !error && <div className="surface-diagnostic" role="status">GPU-Backend und Schrift werden initialisiert…</div>}
  </div>;
}
