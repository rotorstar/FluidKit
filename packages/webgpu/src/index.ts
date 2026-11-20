import type { Locale } from '@fluidkit/i18n';
import type { RestagedRecording, RecordingLanguageProfile } from '@fluidkit/contracts';
import { fetchSurfaceFontAssets } from './font-assets';
import { createResourceLedger, createResourceScope, type ResourceLedger } from './resources';
export { createResourceLedger, createResourceScope } from './resources';
export type { ResourceLedger } from './resources';
import { Color, Mesh, MeshBasicNodeMaterial, OrthographicCamera, PlaneGeometry, Renderer, Scene, StandardNodeLibrary, WebGPUBackend, WebGLBackend } from 'three/webgpu';
import { uniform, uv, vec2, vec4, mix, step, varying } from 'three/tsl';
import { glyph, msdf } from '@pmndrs/glyph';
import { ThreeConfig, defineTextMaterial, type LayoutBox, type Text } from '@pmndrs/glyph/three';
import { resolveSceneLayout } from '@fluidkit/core/layout';
import { CapturedFrameSchema, type CapturedFrame, type SceneNode, type BackendMode, type ResolvedEffectPlan, type RenderCapabilities, type TextAudit, type TextInkBox } from '@fluidkit/contracts';
import { validateEffectReplay, getTransitionQuality, createTransitionClip, sampleTransitionClip, captureTransitionSource, normalizeVisualScenario, recordTransitionClip, createClipFromRecording, type TransitionClip, type PresentationFrame } from '@fluidkit/effects';
import { createPanelShader, createLensCoordinates, createSoftShadow, verifyPanelKernel } from '@fluidkit/gpu-kernels';
import { hitTestPresentation } from './hit-testing';
import { createFocusRing, resolveFocusRing } from './focus-ring';
import { isTextSelectionVisible } from './selection-visibility';
import { redactSceneNode } from './privacy';
import { loadSurfaceFonts } from './fonts';
import { clipTextRect, glyphCaretAtOffset, textInputScroll } from './text-input';
export { deriveLocalizedRecording } from './restage';
export { DEFAULT_PRIMARY_FONT_URL, DEFAULT_FALLBACK_FONT_URLS } from './fonts';
import { createEffectLayers } from './effect-layers';
import { createCouplingLayer } from './coupling-layer';
import { createPresentationTimeline } from './timeline';
import { textRegion, overlappingText, recordingScale, TEXT_LINE_HEIGHT } from './text-layout';
import { resolveGPUPreference } from './backend-policy';
import { observeSurfaceCapabilities } from './capabilities';
export { interpolateBounds, motionProgress, transitionStages } from './motion';
export { textRegion, overlappingText, recordingScale } from './text-layout';
export { resolveGPUPreference } from './backend-policy';
export { createPresentationTimeline } from './timeline';
export type { BackendMode } from '@fluidkit/contracts';

export class CapabilityError extends Error { override name = 'CapabilityError'; }
export class SurfaceFontError extends Error { override name = 'SurfaceFontError'; }
export interface SurfaceMetrics { recordingLanguage?: Locale | null; backend: 'webgpu' | 'webgl2'; fallbackReason: string | null; frames: number; nodes: number; geometries: number; textBytes: number; lastFrameMs: number; phase: 'idle' | 'transitioning' | 'paused'; progress: number; durationMs: number; shader: 'typegpu-0.12.9'; effectId: string | null; effectPhase: 'source' | 'bridge' | 'target' | 'settled'; canReplay: boolean; kernelCheck: Awaited<ReturnType<typeof verifyPanelKernel>> | null; effectResources?: { renderTargets: number; targetBytes: number; particles: number; particleDrawCalls: number; couplingGroups?: number; couplingPieces?: number; couplingDrawCalls?: number }; qualityProfile?: 'standard' | 'compact' }
export interface SurfaceOptions {
  fontUrl: string; fallbackFontUrls?: readonly string[]; signal?: AbortSignal; resourceLedger?: ResourceLedger;
  backendMode?: BackendMode;
  /** Explicit legacy comparison only; imported recordings select their recorded version. */
  motionVersion?: 1 | 2;
  onError?: (error: Error) => void; onMetrics?: (metrics: SurfaceMetrics) => void;
  /** Initial actual backend/preferences and later browser preference changes. */
  onCapabilitiesChange?: (capabilities: RenderCapabilities) => void;
  /** Same sampled frame and scheduler as GPU/hit-testing; never a second animation loop. */
  onPresentation?: (frame: PresentationFrame) => void;
  /** Observable initialization boundaries, also used by Studio's explicit abort qualification. */
  onInitializationStage?: (value: { stage: 'renderer-ready' | 'fonts-ready'; backend: 'webgpu' | 'webgl2' }) => void;
}
export interface TextSelection { nodeId: string; start: number; end: number; direction?: 'forward' | 'backward' | 'none' }
type GlyphText = Text<typeof msdf>;
function createInputClip() {
  const bounds = uniform(vec4(-100000, -100000, 100000, 100000)), enabled = uniform(1);
  const material = defineTextMaterial(context => {
    const result = context.createDefaultMaterial(), position = varying(context.position);
    const mask = step(bounds.x, position.x).mul(step(position.x, bounds.z)).mul(step(bounds.y, position.y)).mul(step(position.y, bounds.w));
    result.opacityNode = context.shader.opacity.mul(mix(1, mask, enabled));
    return result;
  });
  return { bounds, enabled, material };
}
type Visual = {
  mesh: Mesh<PlaneGeometry, MeshBasicNodeMaterial>; text: GlyphText;
  capture: Mesh<PlaneGeometry, MeshBasicNodeMaterial>;
  shadow: Mesh<PlaneGeometry, MeshBasicNodeMaterial>;
  origin: ReturnType<typeof uniform<'vec2'>>;
  lensAmount: ReturnType<typeof uniform<'float'>>;
  shadowBlur: ReturnType<typeof uniform<'float'>>;
  shadowOpacity: ReturnType<typeof uniform<'float'>>;
  size: ReturnType<typeof uniform<'vec2'>>;
  radius: ReturnType<typeof uniform<'float'>>;
  baseColor: ReturnType<typeof uniform<'color'>>;
  fillProgress: ReturnType<typeof uniform<'float'>>;
  progressMode: ReturnType<typeof uniform<'float'>>;
  visibility: ReturnType<typeof uniform<'float'>>;
  effect: ReturnType<typeof uniform<'vec4'>>;
  seed: ReturnType<typeof uniform<'float'>>;
  exiting: boolean;
  presentedOpacity: number;
  shownText:string; textOpacity:number; presentedFontSize:number;
  inputViewport: LayoutBox | null; inputScroll: number; inputClip: ReturnType<typeof createInputClip> | null;
  from: SceneNode; target: SceneNode; dispose:()=>void;
};

export function layoutScene(nodes: readonly SceneNode[], width: number, height: number): SceneNode[] {
  return resolveSceneLayout(nodes, { width, height });
}

export function visibleRange(count: number, rowHeight: number, scrollTop: number, viewportHeight: number, overscan = 2) {
  if (rowHeight <= 0 || count < 0) throw new Error('Invalid virtual list dimensions');
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  return { start, end: Math.min(count, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan) };
}

let surfaceId = 0;
export async function createFluidSurface(canvas: HTMLCanvasElement, options: SurfaceOptions) {
  const ledger = options.resourceLedger ?? createResourceLedger();
  const scope=createResourceScope(ledger);
  let disposed = false;
  scope.track('surface',()=>{});
  const checkInitialization = () => { if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError'); };
  try {
  checkInitialization();
  const mode = options.backendMode ?? 'webgpu-first';
  let { device, fallbackReason } = await resolveGPUPreference(mode, async () => {
      if (!globalThis.isSecureContext || !navigator.gpu) throw new CapabilityError('WebGPU-API oder sicherer Kontext nicht verfügbar.');
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new CapabilityError('Kein nutzbarer WebGPU-Adapter verfügbar.');
      return adapter.requestDevice();
  });
  let releaseDevice:()=>void=()=>{};
  if(device){const ownedDevice=device;releaseDevice=scope.track('device',()=>ownedDevice.destroy());}
  if (options.signal?.aborted) { throw new DOMException('Aborted', 'AbortError'); }
  const backend = device ? new WebGPUBackend({ canvas, device }) : new WebGLBackend({ canvas });
  const renderer = new Renderer(backend, { alpha: false, antialias: true, getFallback: mode === 'webgpu-only' ? null : () => {
    fallbackReason = 'Three.js konnte das WebGPU-Backend nicht initialisieren.';
    releaseDevice(); device = undefined;
    return new WebGLBackend({ canvas });
  } });
  scope.track('renderer',()=>renderer.dispose());
  renderer.library = new StandardNodeLibrary();
  // A backend that logs a shader failure must not publish a successful frame.
  renderer.debug.onShaderError = (gl, _program, vertex, fragment) => {
    const detail = [gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment)].filter(Boolean).join(' ').slice(0, 1500);
    throw new Error(`WebGL2-Shader konnte nicht kompiliert werden: ${detail}`);
  };
  await renderer.init();
  if (!(renderer.backend instanceof WebGPUBackend) && !(renderer.backend instanceof WebGLBackend)) throw new CapabilityError('Unbekanntes Rendering-Backend.');
  options.onInitializationStage?.({ stage: 'renderer-ready', backend: renderer.backend instanceof WebGPUBackend ? 'webgpu' : 'webgl2' });
  checkInitialization();
  const fontAssets = await fetchSurfaceFontAssets([options.fontUrl, ...(options.fallbackFontUrls ?? [])], options.signal);
  const loadedFonts = await loadSurfaceFonts(fontAssets[0]!.blob, fontAssets.slice(1).map(asset => asset.blob), options.signal).catch((error: unknown) => {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    throw new SurfaceFontError(`GPU-Schrift konnte nicht geladen werden: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  });
  const releaseFonts = scope.track('font', () => loadedFonts.dispose());
  options.onInitializationStage?.({ stage: 'fonts-ready', backend: renderer.backend instanceof WebGPUBackend ? 'webgpu' : 'webgl2' });
  checkInitialization();
  const textHandle = glyph.handle(`fluid-surface-${++surfaceId}`, ThreeConfig);
  scope.track('glyph-handle', () => { try { releaseFonts(); } finally { textHandle.dispose(); } });
  const font = loadedFonts.createSelection(textHandle);
  const scene = new Scene(); scene.background = new Color('#0b1520');
  const effectLayers = createEffectLayers(scope, scene);
  const couplingLayer = createCouplingLayer(scope, scene);
  const camera = new OrthographicCamera(0, 1000, 0, -620, 0.1, 100);
  camera.position.z = 10;
  const geometry = new PlaneGeometry(1, 1);
  scope.track('geometry',()=>geometry.dispose());
  const focusRing = createFocusRing(scope, scene, geometry);
  const visuals = new Map<string, Visual>();
  let nodes: SceneNode[] = [];
  let sceneDefinition: readonly SceneNode[] = [], sourceDefinition: readonly SceneNode[] = [];
  let presentationOverrides = new Map<string, SceneNode>();
  let frame = 0;
  let releaseFrame:(()=>void)|null=null;
  function stopFrame(){releaseFrame?.();releaseFrame=null;frame=0;}
  let frames = 0;
  let currentMetrics: SurfaceMetrics | null = null;
  let lastMotionTime: number | null = null;
  let frameTimings: number[] = [];
  const frameWaiters=new Set<{resolve:()=>void;reject:(error:Error)=>void}>();
  function rejectFrameWaiters(error:Error){for(const waiter of frameWaiters)waiter.reject(error);frameWaiters.clear();}
  let duration = 0;
  const timeline = createPresentationTimeline(() => performance.now());
  let activePlan: ResolvedEffectPlan | null = null;
  let clip: TransitionClip | null = null;
  let lastPresentation: PresentationFrame | null = null;
  let liveWriting: RecordingLanguageProfile['context'] | undefined;
  let replayRecord: TransitionClip | null = null;
  let replayViewport:{width:number;height:number}|null=null;
  let kernelCheck: Awaited<ReturnType<typeof verifyPanelKernel>> | null = null;
  let lastPublished = -Infinity, lastPhase = '', forcePublish = false;
  let lost = false;
  let selection: TextSelection | null = null;
  let focusedId: string | null = null;
  let hoveredId: string | null = null;
  let pressedId: string | null = null;
  const selectionMeshes: {mesh:Mesh<PlaneGeometry, MeshBasicNodeMaterial>;dispose:()=>void}[] = [];
  const abort = () => dispose();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function invalidate() { if (!disposed && !lost && !frame && !document.hidden) { const requested=requestAnimationFrame(draw);frame=requested;releaseFrame=scope.track('animation-frame',()=>cancelAnimationFrame(requested)); } }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(rect.width, rect.height, false);
    const scale=replayViewport?recordingScale(replayViewport,rect):1;
    camera.right = rect.width/scale; camera.bottom = -rect.height/scale; camera.updateProjectionMatrix();
    if (!replayViewport && clip && (clip.viewport.width !== rect.width || clip.viewport.height !== rect.height)) {
      const wasRecorded = replayRecord === clip;
      nodes = layoutScene(sceneDefinition, rect.width, rect.height);
      clip = createTransitionClip({ ...clip, source: layoutScene(sourceDefinition, rect.width, rect.height), target: nodes, viewport: { width: rect.width, height: rect.height } });
      activePlan = clip.plan;
      if (wasRecorded) replayRecord = clip;
    }
    for (const node of nodes) { const visual = visuals.get(node.id); if (visual) visual.target = node; }
    invalidate();
  }
  function createVisual(node: SceneNode): Visual {
    const material = new MeshBasicNodeMaterial({ transparent: true, depthTest: false, color: node.color });
    const releaseMaterial=scope.track('material',()=>material.dispose());
    const size = uniform(vec2(node.width, node.height));
    const radius = uniform(node.radius);
    const baseColor = uniform(new Color(node.color));
    const fillProgress = uniform(node.progress);
    const progressMode = uniform(node.kind === 'progress' ? 1 : 0);
    const visibility = uniform(node.opacity);
    const effect = uniform(vec4(0, 1, 0, 2.5));
    const seed = uniform(0);
    const origin = uniform(vec2(node.x, node.y)), lensAmount = uniform(0);
    const shadowBlur = uniform(0), shadowOpacity = uniform(0);
    const shader = createPanelShader({ size, radius, visibility, effect, seed });
    const base = mix(baseColor, baseColor.mul(1.65), step(uv().x, fillProgress).mul(progressMode).add(shader.highlight));
    const lens = createLensCoordinates({ origin, size, viewport: effectLayers.viewport, lens: effectLayers.lens, phase: effectLayers.lensPhase, amount: lensAmount });
    material.colorNode = mix(base, effectLayers.backdrop.sample(lens.coordinates).rgb, lens.mask).add(lens.glint);
    material.opacityNode = shader.alpha;
    const mesh = new Mesh(geometry, material); mesh.renderOrder = node.layer * 2 + 200;
    // This separate capture material never samples its own render attachment.
    const captureMaterial = new MeshBasicNodeMaterial({ transparent: true, depthTest: false });
    captureMaterial.colorNode = base; captureMaterial.opacityNode = shader.alpha;
    const releaseCapture = scope.track('material', () => captureMaterial.dispose());
    const capture = new Mesh(geometry, captureMaterial); capture.renderOrder = mesh.renderOrder;
    effectLayers.background.add(capture);
    const shadowMaterial = new MeshBasicNodeMaterial({ transparent: true, depthTest: false, color: '#000000' });
    shadowMaterial.opacityNode = createSoftShadow({ size, radius, blur: shadowBlur, opacity: shadowOpacity });
    const releaseShadow = scope.track('material', () => shadowMaterial.dispose());
    const shadow = new Mesh(geometry, shadowMaterial); shadow.renderOrder = mesh.renderOrder - .25; shadow.visible = false;
    const text = textHandle.createText({ font, text: node.text, style: { fontSize: node.fontSize, color: node.foreground }, layout: { wrap: 'word', overflow: 'ellipsis', maxLines: Math.max(1, Math.floor(node.height / (node.fontSize * 1.3))) }, constraints: { width: { mode: 'at-most', size: Math.max(1, node.width - node.textInset * 2) } } });
    const releaseText=scope.track('text',()=>text.dispose());
    text.onError = error => options.onError?.(error instanceof Error ? error : new Error('GPU text failed'));
    text.renderOrder = mesh.renderOrder + 1;
    scene.add(shadow, mesh, text);
    return { dispose(){scene.remove(shadow,mesh,text);effectLayers.background.remove(capture);try{releaseText();}finally{releaseMaterial();releaseCapture();releaseShadow();}},mesh, capture, shadow, origin, lensAmount, shadowBlur, shadowOpacity, text, size, radius, baseColor, fillProgress, progressMode, visibility, effect, seed, exiting: false, presentedOpacity: node.opacity, shownText:node.text,textOpacity:node.opacity,presentedFontSize:node.fontSize, inputViewport: null, inputScroll: 0, inputClip: null, from: node, target: node };
  }
  function clearSelection() { for (const item of selectionMeshes) { scene.remove(item.mesh); item.dispose(); } selectionMeshes.length = 0; }
  function presentedHitTargets() {
    return (lastPresentation?.nodes ?? []).flatMap(node => {
      const visual = visuals.get(node.id);
      return visual ? [{ presented: { ...node, text: visual.shownText }, target: visual.target, panelOpacity: visual.visibility.value, textOpacity: visual.textOpacity, renderOrder: visual.mesh.renderOrder, exiting: visual.exiting }] : [];
    });
  }
  function draw(now: number) {
    stopFrame();
    if (disposed || lost || document.hidden) return;
    const begin = performance.now();
    const reduce = capabilityObserver.getCapabilities().reducedMotion;
    const playback = timeline.sample(reduce);
    const progress = playback.progress;
    if (playback.phase === 'transitioning' || (lastMotionTime !== null && progress === 1)) {
      if (lastMotionTime !== null) frameTimings.push(now - lastMotionTime);
      lastMotionTime = playback.phase === 'transitioning' ? now : null;
    } else lastMotionTime = null;
    if (!clip) return;
    try {
    const writing = replayViewport ? clip.languageProfile?.context : liveWriting;
    const sampled = sampleTransitionClip(clip, progress, { reducedMotion: reduce });
    const presented = presentationOverrides.size ? { ...sampled, nodes: sampled.nodes.map(node => presentationOverrides.get(node.id) ?? node) } : sampled;
    lastPresentation = presented;
    const states = new Map(presented.nodeStates.map(state => [state.id, state]));
    const targetById = new Map(clip.target.map(node => [node.id, node]));
    const targetIds = new Set(targetById.keys());
    // V2 exact endpoints contain only their real scene membership. Retained GPU
    // objects remain reusable for backward seek but must not keep old pixels.
    const presentedIds = new Set(presented.nodes.map(node => node.id));
    for (const [id, visual] of visuals) if (!presentedIds.has(id)) {
      visual.mesh.visible = false; visual.capture.visible = false; visual.shadow.visible = false;
      visual.presentedOpacity = 0; visual.textOpacity = 0; visual.shownText = ''; visual.text.text = ''; visual.inputViewport = null;
    }
    for (const node of presented.nodes) {
      let visual = visuals.get(node.id);
      if (!visual && progress === 1 && !targetIds.has(node.id)) continue;
      if (!visual) { visual = createVisual(node); visuals.set(node.id, visual); }
      const state = states.get(node.id)!;
      const { mesh, text } = visual;
      const { x, y, width, height, radius, rotation, opacity } = node;
      visual.exiting = !targetIds.has(node.id);
      visual.target = presentationOverrides.get(node.id) ?? targetById.get(node.id) ?? { ...node, opacity: 0 };
      mesh.scale.set(width, height, 1); mesh.position.set(x + width / 2, -y - height / 2, 0);
      mesh.rotation.z = -rotation;
      mesh.renderOrder = node.layer * 2 + 200;
      mesh.material.color.set(node.color);
      visual.baseColor.value.copy(mesh.material.color);
      visual.baseColor.value.multiplyScalar(1 + state.shadow.opacity * .35);
      visual.fillProgress.value = node.progress;
      visual.progressMode.value = node.kind === 'progress' ? 1 : 0;
      visual.size.value.set(Math.max(1, width), Math.max(1, height)); visual.radius.value = Math.max(0, radius);
      visual.presentedOpacity = Math.max(0, Math.min(1, opacity));
      visual.visibility.value = state.panelOpacity;
      visual.effect.value.set(state.shader.effectId, state.shader.progress, state.shader.intensity, state.shader.frequency);
      visual.seed.value = state.shader.seed;
      visual.origin.value.set(x, y);
      visual.lensAmount.value = state.protected ? 0 : presented.lens?.opacity ?? 0;
      mesh.visible = opacity > 0;
      visual.capture.position.copy(mesh.position); visual.capture.rotation.copy(mesh.rotation); visual.capture.scale.copy(mesh.scale); visual.capture.visible = mesh.visible && !state.protected; visual.capture.renderOrder = mesh.renderOrder;
      visual.shadowBlur.value = state.shadow.blur; visual.shadowOpacity.value = state.shadow.opacity;
      visual.shadow.visible = state.shadow.opacity > .001;
      visual.shadow.scale.set(width + state.shadow.blur * 2, height + state.shadow.blur * 2, 1);
      visual.shadow.position.set(mesh.position.x + state.shadow.offsetX, mesh.position.y - state.shadow.offsetY, 0);
      visual.shadow.renderOrder = mesh.renderOrder - .25;
      visual.shownText = node.text; visual.textOpacity = state.textOpacity;
      const region=textRegion(node,width,height,node.fontSize);
      const input = node.anatomy.behavior === 'textbox';
      visual.inputViewport = input ? { x: x + region.insetX, y: y + region.insetY, width: region.width, height: region.height } : null;
      if (input) {
        if (!visual.inputClip) { visual.inputClip = createInputClip(); text.material = visual.inputClip.material; }
        visual.inputClip.bounds.value.set(x + region.insetX, -y - region.insetY - region.height, x + region.insetX + region.width, -y - region.insetY);
      } else visual.inputScroll = 0;
      if (visual.inputClip) visual.inputClip.enabled.value = input ? 1 : 0;
      text.text=visual.shownText;visual.presentedFontSize=region.fontSize;
      text.style = { language:node.textLanguage ?? writing?.language, direction: node.textDirection ?? (input ? 'auto' : writing?.direction ?? 'auto'), fontSize:region.fontSize,lineHeight:TEXT_LINE_HEIGHT,color: node.foreground, opacity:visual.textOpacity };
      text.layout=input ? {wrap:'none',overflow:'visible',maxLines:1} : {wrap:'word',overflow:'ellipsis',maxLines:region.maxLines};
      text.position.set(x + region.insetX, -y - region.insetY, 1);
      text.renderOrder = mesh.renderOrder + 1;
      // Empty decorative meshes include sub-pixel edges. They have no text box;
      // imposing their mesh height on a font paragraph is an invalid Glyph request.
      text.constraints = { width: input ? { mode: 'unconstrained' } : { mode: 'at-most', size:region.width },height:visual.shownText||input?{mode:'at-most',size:region.height}:{mode:'unconstrained'} };
    }
      // Glyph selectionRects reads the committed revision only. Commit the text
      // updates once before deriving both overlays from that exact drawn layout.
      glyph.shape();
      // Shaping retains the complete native value. Scroll only its projection;
      // Glyph's public scene traversal synchronizes this transform for rendering.
      for (const visual of visuals.values()) {
        const viewport = visual.inputViewport;
        if (!viewport) continue;
        const active = selection?.nodeId === visual.target.id && isTextSelectionVisible(visual);
        const caret = active ? glyphCaretAtOffset(visual.text, visual.shownText, selection!.direction === 'backward' ? selection!.start : selection!.end) : undefined;
        const contentWidth = visual.text.measure().width;
        visual.inputScroll = caret ? textInputScroll(visual.inputScroll, viewport.width, contentWidth, caret.rect.x)
          : Math.min(visual.inputScroll, Math.max(0, contentWidth - viewport.width));
        visual.text.position.x = viewport.x - visual.inputScroll;
      }
      effectLayers.update({ lens: presented.lens, particles: presented.particles, nodes: presented.nodes, width: camera.right, height: -camera.bottom, targetEdge: getTransitionQuality(clip).targetEdge });
      couplingLayer.update(presented.couplings ?? []);
      clearSelection();
      const selected = selection ? visuals.get(selection.nodeId) : undefined;
      if (selection && selected?.inputViewport && isTextSelectionVisible(selected)) {
        const viewport = selected.inputViewport;
        const rects = selected.text.selectionRects(selection.start, selection.end) ?? [];
        for (const rect of rects) {
          const visible = clipTextRect({ x: selected.text.position.x + rect.x, y: -selected.text.position.y + rect.y, width: rect.width, height: rect.height }, viewport);
          if (!visible) continue;
          const material = new MeshBasicNodeMaterial({ color: selected.target.foreground, opacity: 0.3, transparent: true, depthTest: false });
          const mark = new Mesh(geometry, material);
          mark.scale.set(visible.width, visible.height, 1); mark.position.set(visible.x + visible.width / 2, -visible.y - visible.height / 2, 0.5); mark.renderOrder = selected.mesh.renderOrder + 0.75;
          scene.add(mark); selectionMeshes.push({mesh:mark,dispose:scope.track('material',()=>material.dispose())});
        }
        if (selection.start === selection.end) {
          const position = glyphCaretAtOffset(selected.text, selected.shownText, selection.start)?.rect;
          const visible = clipTextRect({ x: selected.text.position.x + (position?.x ?? 0), y: -selected.text.position.y + (position?.y ?? 0), width: 1.5,
            height: position?.height || selected.presentedFontSize * TEXT_LINE_HEIGHT }, viewport);
          if (visible) {
            const material = new MeshBasicNodeMaterial({ color: selected.target.foreground, transparent: true, depthTest: false });
            const caret = new Mesh(geometry, material);
            caret.scale.set(visible.width, visible.height, 1);
            caret.position.set(visible.x + visible.width / 2, -visible.y - visible.height / 2, 2);
            caret.renderOrder = selected.text.renderOrder + 0.25; scene.add(caret); selectionMeshes.push({mesh:caret,dispose:scope.track('material',()=>material.dispose())});
          }
        }
      }
      focusRing.update(resolveFocusRing(replayViewport ? null : focusedId, presentedHitTargets(), { width: camera.right, height: -camera.bottom }), visuals.get(focusedId ?? '')?.target.foreground);
      if (hoveredId) visuals.get(hoveredId)?.baseColor.value.multiplyScalar(1.12);
      if (pressedId) visuals.get(pressedId)?.baseColor.value.multiplyScalar(0.82);
      // Retain only this clip's bounded union for seeking/replay. Outgoing nodes
      // have zero sampled opacity at the endpoint. A new clip retires unused IDs;
      // replay does not recompile every panel/text material on its first frame.
      effectLayers.renderBackground(renderer, camera); renderer.render(scene, camera);
      options.onPresentation?.(presented);
    }
    catch (error) { failSurface(error instanceof Error ? error : new Error('GPU-Rendering fehlgeschlagen')); return; }
    frames++;
    const activeBackend = renderer.backend instanceof WebGPUBackend ? 'webgpu' : 'webgl2';
    canvas.dataset.backend = activeBackend; canvas.dataset.frames = String(frames); canvas.dataset.nodes = String(visuals.size); canvas.dataset.shader = 'typegpu-0.12.9'; canvas.dataset.effect = activePlan?.selected?.id ?? 'basis'; canvas.dataset.progress = String(progress);
    currentMetrics = { recordingLanguage: replayRecord ? replayRecord.languageProfile?.context.language ?? null : undefined, backend: activeBackend, fallbackReason: activeBackend === 'webgl2' ? fallbackReason : null, frames, nodes: visuals.size, geometries: 1 + effectLayers.metrics().particleDrawCalls + couplingLayer.metrics().couplingDrawCalls, textBytes: textHandle.gpuBytes, lastFrameMs: performance.now() - begin, phase: playback.phase, progress, durationMs: duration, shader: 'typegpu-0.12.9', effectId: activePlan?.selected?.id ?? null, effectPhase: progress >= 1 ? 'settled' : progress < 0.2 ? 'source' : progress < 0.8 ? 'bridge' : 'target', canReplay: Boolean(replayRecord), kernelCheck, effectResources: { ...effectLayers.metrics(), ...couplingLayer.metrics() }, qualityProfile: getTransitionQuality(clip).quality };
    if (forcePublish || playback.phase !== lastPhase || now - lastPublished > 80 || frames < 4) {
      options.onMetrics?.(currentMetrics);
      lastPublished = now; lastPhase = playback.phase; forcePublish = false;
    }
    for(const waiter of frameWaiters)waiter.resolve();frameWaiters.clear();
    if (playback.phase === 'transitioning') invalidate();
  }
  function setScene(next: SceneNode[], animate = true, durationMs = 420, effectPlan: ResolvedEffectPlan | null = null, record = true, viewport:{width:number;height:number}|null=null,
    recordingLocale?: { context: RecordingLanguageProfile['context']; catalogFingerprint?: string | null; buildId?: string | null }) {
    replayViewport=viewport;
    liveWriting = recordingLocale?.context;
    const rect = canvas.getBoundingClientRect();
    const logical=viewport??{width:rect.width||1000,height:rect.height||620};
    const previousPresentation = lastPresentation;
    // Several state commits may arrive before the next frame. The pending
    // clip's target is not the last painted scene and must never filter it.
    const captured = previousPresentation ? captureTransitionSource(previousPresentation) : null;
    const source = captured?.source ?? [];
    sceneDefinition = next; sourceDefinition = source;
    nodes = layoutScene(next, logical.width, logical.height);
    const sourceById = new Map(source.map(node => [node.id, node]));
    const changed = source.length !== nodes.length || nodes.some(node => { const from = sourceById.get(node.id); return !from || ['x','y','width','height','color','radius','opacity','rotation','text'].some(key => from[key as keyof SceneNode] !== node[key as keyof SceneNode]); });
    duration = (changed || effectPlan?.selected) && animate && !capabilityObserver.getCapabilities().reducedMotion ? durationMs : 0;
    clip = createTransitionClip({ source, target: nodes, plan: effectPlan, durationMs: duration, viewport: logical,
      ...(recordingLocale && fontAssets.every(asset => asset.sha256 !== null) ? { languageProfile: {
        context: recordingLocale.context, catalogFingerprint: recordingLocale.catalogFingerprint ?? null,
        fontFingerprints: fontAssets.map(asset => asset.sha256!), buildId: recordingLocale.buildId ?? null,
      } } : {}), motionVersion: options.motionVersion ?? 2,
      sourceCheckpoint: animate && previousPresentation && previousPresentation.progress < 1 ? captured?.sourceCheckpoint ?? null : null,
      protectedNodeIds: [focusedId, selection?.nodeId].filter((id): id is string => Boolean(id)),
    });
    activePlan = clip.plan; presentationOverrides.clear();
    const retained = new Set([...source, ...nodes].map(node => node.id));
    for (const [id, visual] of visuals) {
      if (!retained.has(id)) { visual.dispose(); visuals.delete(id); }
      else visual.from = sourceById.get(id) ?? visual.target;
    }
    // A new immediate live scene supersedes the previous run just as an
    // animated commit does. Never export an old clip as the new live state.
    if (record) replayRecord = animate && duration > 0 ? clip : null;
    frameTimings = []; lastMotionTime = null; timeline.start(duration); resize(); forcePublish = true; invalidate();
  }
  /** Reproject the two endpoints at the current clock position, including paused clips. */
  function localizeScene(source: SceneNode[], target: SceneNode[], context: RecordingLanguageProfile['context'], catalogFingerprint?: string) {
    if (!clip || replayViewport) return;
    liveWriting = context;
    const localizedSource = new Map(source.map(node => [node.id, node]));
    const localizedTarget = new Map(target.map(node => [node.id, node]));
    sourceDefinition = clip.source.map(node => {
      const localized = localizedSource.get(node.id) ?? localizedTarget.get(node.id);
      // Interrupted sources keep their sampled geometry. Parts left over from
      // earlier transitions have no current translation and keep their baked ink.
      return localized ? { ...node, text: localized.text, label: localized.label } : node;
    });
    sceneDefinition = target;
    nodes = layoutScene(target, clip.viewport.width, clip.viewport.height);
    clip = createTransitionClip({ ...clip, source: [...sourceDefinition], target: nodes,
      languageProfile: clip.languageProfile ? { ...clip.languageProfile, context, catalogFingerprint: catalogFingerprint ?? null } : undefined });
    activePlan = clip.plan;
    presentationOverrides.clear();
    forcePublish = true;
    invalidate();
  }
  // Policy controls are a separate presentation projection. Updating them must
  // not restart, reroll or replace a transition that is already being shown.
  function updatePresentation(next: SceneNode[]) {
    const rect = canvas.getBoundingClientRect();
    const projected = layoutScene(next, rect.width || 1000, rect.height || 620);
    const groups = new Set(projected.filter(node => node.onVisual).map(node => node.anatomy.componentId));
    const replacements = new Map(projected.filter(node => groups.has(node.anatomy.componentId)).map(node => [node.id,node]));
    presentationOverrides = replacements;
    nodes = nodes.map(node => replacements.get(node.id) ?? node);
    for (const node of replacements.values()) {
      const visual = visuals.get(node.id);
      if (!visual || visual.exiting) continue;
      visual.target = node;
      visual.from = { ...visual.from, color:node.color, foreground:node.foreground };
      visual.text.text = node.text;
    }
    forcePublish = true; invalidate();
  }
  function dispose() {
    if (disposed) return; disposed = true;rejectFrameWaiters(new Error('Surface disposed'));
    stopFrame();
    // The scope is the single cleanup owner and attempts every real disposer,
    // including when one resource fails. Do not stop at the first visual error.
    selectionMeshes.length=0;
    visuals.clear();scene.clear();effectLayers.background.clear();
    try { couplingLayer.dispose(); } finally { scope.dispose(); }
  }
  function failSurface(error: Error) {
    if (disposed || lost) return;
    lost = true; rejectFrameWaiters(error); stopFrame();
    let reported = error;
    try { dispose(); }
    catch (cleanup) { reported = new AggregateError([error, cleanup], `${error.message}; Ressourcenfreigabe fehlgeschlagen`); }
    options.onError?.(reported);
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);scope.track('observer',()=>observer.disconnect());
  const visibilityChanged = () => {
    lastMotionTime = null;
    if (document.hidden) { timeline.suspend(); stopFrame(); rejectFrameWaiters(new Error('Surface ist nicht sichtbar.')); }
    else { timeline.resume(); forcePublish = true; invalidate(); }
  };
  if (document.hidden) timeline.suspend();
  document.addEventListener('visibilitychange', visibilityChanged);scope.track('listener',()=>document.removeEventListener('visibilitychange',visibilityChanged));
  if(options.signal){const signal=options.signal;signal.addEventListener('abort',abort,{once:true});scope.track('listener',()=>signal.removeEventListener('abort',abort));}
  function reportDeviceLoss(message: string) {
    failSurface(new CapabilityError(`GPU-Gerät verloren: ${message}. Wiederherstellung aus dem Snapshot.`));
  }
  renderer.onDeviceLost = info => reportDeviceLoss(info.message);
  if (device) {
    const ownedDevice = device;
    const shaderError = (event: GPUUncapturedErrorEvent) => {
      const error = new Error(`WebGPU-Validierung fehlgeschlagen: ${event.error.message}`);
      failSurface(error);
    };
    ownedDevice.addEventListener('uncapturederror', shaderError);
    scope.track('listener', () => ownedDevice.removeEventListener('uncapturederror', shaderError));
  }
  // Three intentionally ignores reason="destroyed". We own the device and also
  // observe it directly: external destruction while mounted is a real loss.
  if (device) void device.lost.then(info => reportDeviceLoss(info.message || info.reason));
  const contextLost = (event: Event) => { event.preventDefault(); reportDeviceLoss('WebGL2-Kontext verloren'); };
  canvas.addEventListener('webglcontextlost', contextLost);scope.track('listener',()=>canvas.removeEventListener('webglcontextlost',contextLost));
  const capabilityObserver = observeSurfaceCapabilities({
    backend: renderer.backend instanceof WebGPUBackend ? 'webgpu' : 'webgl2', motion: reducedMotion,
    onChange(capabilities, initial) {
      if (!initial && capabilities.reducedMotion) timeline.seek(1);
      options.onCapabilitiesChange?.(capabilities);
      if (!initial) { forcePublish = true; invalidate(); }
    },
    onError: failSurface,
  });
  if (options.signal?.aborted) { capabilityObserver.dispose(); throw new DOMException('Surface initialization aborted', 'AbortError'); }
  scope.track('listener', capabilityObserver.dispose);
  resize();
  return {
    setScene, localizeScene, updatePresentation, dispose, invalidate,
    setFocus(id: string | null) { focusedId = id; invalidate(); },
    setInteraction(value: { focusedId: string | null; hoveredId: string | null; pressedId: string | null }) { focusedId = value.focusedId; hoveredId = value.hoveredId; pressedId = value.pressedId; invalidate(); },
    setSelection(value: TextSelection | null) { selection = value; invalidate(); },
    textOffsetAt(nodeId: string, x: number, y: number): number | null {
      const visual = visuals.get(nodeId);
      if (!visual?.inputViewport || !isTextSelectionVisible(visual) || !Number.isFinite(x) || !Number.isFinite(y)) return null;
      const scale = replayViewport ? recordingScale(replayViewport, canvas.getBoundingClientRect()) : 1;
      const caret = visual.text.caretAt(x / scale - visual.text.position.x, y / scale + visual.text.position.y);
      return caret ? Math.max(0, Math.min(visual.shownText.length, caret.offset)) : null;
    },
    getLayout: () => nodes,
    getPresentation: () => lastPresentation,
    getMetrics: () => currentMetrics,
    getResources: () => ledger.snapshot(),
    getFrameTimings: () => [...frameTimings],
    getCapabilities: capabilityObserver.getCapabilities,
    setMotionPreference: capabilityObserver.setMotionPreference,
    canRestageRecording() { return Boolean(replayRecord?.languageProfile && !replayRecord.sourceCheckpoint); },
    getRecording() {
      if (!replayRecord) return null;
      return recordTransitionClip({ ...replayRecord, source: replayRecord.source.map(redactSceneNode), target: replayRecord.target.map(redactSceneNode) },
        replayRecord.plan?.caseId ?? 'visual-surface', [...replayRecord.source, ...replayRecord.target].some(node => node.sensitive));
    },
    loadRecording(input: unknown) {
      if(typeof input==='object'&&input!==null&&'schemaVersion' in input&&input.schemaVersion===1)throw new Error('Diese ältere Aufzeichnung enthält keine Viewport-Größe. Bitte den Übergang erneut aufzeichnen.');
      const recording = normalizeVisualScenario(input);
      if (recording.schemaVersion === 5 && JSON.stringify(recording.languageProfile.fontFingerprints) !== JSON.stringify(fontAssets.map(asset => asset.sha256))) {
        throw new Error('This recording requires its original font assets.');
      }
      if (recording.plan) validateEffectReplay(recording.plan, capabilityObserver.getCapabilities());
      replayRecord = createClipFromRecording(recording);
    },
    pause() { timeline.pause(); forcePublish = true; invalidate(); },
    play() { timeline.play(); forcePublish = true; invalidate(); },
    seek(progress: number) { timeline.seek(progress); forcePublish = true; invalidate(); },
    replay() {
      const saved = replayRecord;
      if (!saved || disposed) return;
      stopFrame();
      const keep = new Set([...saved.source, ...saved.target].map(node => node.id));
      for (const [id, visual] of visuals) if (!keep.has(id)) { visual.dispose(); visuals.delete(id); }
      clip = saved; activePlan = saved.plan; nodes = [...saved.target]; replayViewport = saved.viewport;
      presentationOverrides.clear(); lastPresentation = null; duration = saved.durationMs;
      frameTimings = []; lastMotionTime = null; timeline.start(duration); resize(); forcePublish = true; invalidate();
    },
    async inspectText():Promise<TextAudit> {
      if(disposed||lost||document.hidden)throw new Error('Eine sichtbare, bereite Surface ist für die Prüfung erforderlich.');
      let releaseWaiter:()=>void=()=>{};
      await new Promise<void>((resolve,reject)=>{releaseWaiter=scope.track('pending-job',()=>reject(new Error('Surface disposed')));frameWaiters.add({resolve,reject});invalidate();}).finally(()=>releaseWaiter());
      const display=canvas.getBoundingClientRect(),scale=replayViewport?recordingScale(replayViewport,display):1;
      const issues:TextAudit['issues']=[],boxes:TextInkBox[]=[],textStyles:TextAudit['textStyles']=[];let checkedNodes=0,hiddenDuringMotion=0;
      for(const visual of visuals.values()){
        if(visual.textOpacity<=.01||!visual.shownText){if(visual.target.text)hiddenDuringMotion++;continue;}
        checkedNodes++;const id=visual.target.id;textStyles.push({id,componentId:visual.target.anatomy.componentId,part:visual.target.anatomy.part,fontSize:visual.presentedFontSize*scale});
        let measured:ReturnType<GlyphText['measure']>;
        try{measured=visual.text.measure();}catch(error){throw new Error(`Textmessung ${id}: ${error instanceof Error?error.message:'fehlgeschlagen'}`);}
        if(measured.missingGlyphCount)issues.push({kind:'missing-glyphs',nodes:[id],detail:`${measured.missingGlyphCount} fehlende Glyphen`,severity:'error'});
        if(measured.overflowed)issues.push({kind:'truncated',nodes:[id],detail:'Text nutzt Ellipsis/Clipping',severity:'warning'});
        const committed=visual.text.measureGlyphs();
        if(!committed)throw new Error(`Keine gezeichneten Glyphen für ${id} verfügbar`);
        const rows=new Map<number,{minX:number;minY:number;maxX:number;maxY:number}>();
        for(const glyph of committed){
          const ink=glyph.localInkBounds;if(ink.isEmpty()||ink.max.x===ink.min.x||ink.max.y===ink.min.y)continue;
          const baseline=Math.round(glyph.shapedOrigin.y*1000)/1000;
          const row=rows.get(baseline)??{minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
          row.minX=Math.min(row.minX,ink.min.x);row.minY=Math.min(row.minY,ink.min.y);row.maxX=Math.max(row.maxX,ink.max.x);row.maxY=Math.max(row.maxY,ink.max.y);rows.set(baseline,row);
        }
        let line=0;
        for(const ink of rows.values()){
          const box={id,line:line++,x:visual.text.position.x+ink.minX,y:-visual.text.position.y-ink.maxY,width:ink.maxX-ink.minX,height:ink.maxY-ink.minY};
          const visible=visual.inputViewport?clipTextRect(box,visual.inputViewport):box;
          if(!visible)continue;
          boxes.push({...box,x:visible.x*scale,y:visible.y*scale,width:visible.width*scale,height:visible.height*scale});
          const left=visual.mesh.position.x-visual.mesh.scale.x/2,top=-visual.mesh.position.y-visual.mesh.scale.y/2;
          if(visible.x<left-1||visible.y<top-1||visible.x+visible.width>left+visual.mesh.scale.x+1||visible.y+visible.height>top+visual.mesh.scale.y+1)issues.push({kind:'outside-node',nodes:[id],detail:'Glyphen überschreiten die Textregion',severity:'error'});
        }
      }
      if(checkedNodes>0&&boxes.length===0&&[...visuals.values()].some(visual=>!visual.inputViewport&&visual.textOpacity>.01&&visual.shownText.trim()))issues.push({kind:'outside-node',nodes:['surface'],detail:'Keine positionierten Glyphenmesswerte verfügbar; Prüfung nicht bestanden',severity:'error'});
      for(const pair of overlappingText(boxes))issues.push({kind:'overlap',nodes:pair,detail:'Sichtbare Textzeilen überschneiden sich',severity:'error'});
      return {scale,viewport:{width:display.width,height:display.height},backend:renderer.backend instanceof WebGPUBackend?'webgpu':'webgl2',progress:timeline.sample(capabilityObserver.getCapabilities().reducedMotion).progress,checkedNodes,hiddenDuringMotion,boxes,textStyles,issues};
    },
    async captureFrame(): Promise<CapturedFrame> {
      if (disposed || lost || document.hidden) throw new Error('Aufnahme benötigt eine sichtbare, bereite Surface.');
      // Fail closed before reading pixels, including outgoing content during morphs.
      const containsSensitive = () => Boolean(clip && [...clip.source, ...clip.target].some(node => node.sensitive));
      if (containsSensitive()) throw new Error('Sensitive Parts: Bildaufnahme nicht freigegeben.');
      if (!canvas.width || !canvas.height || canvas.width > 4096 || canvas.height > 4096 || canvas.width * canvas.height > 8_000_000) throw new Error('Surface überschreitet das Bildbudget.');
      let release: () => void = () => {};
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let waiter: { resolve: () => void; reject: (error: Error) => void } | undefined;
      try {
        return await new Promise<CapturedFrame>((resolve, reject) => {
          const fail = (error: Error) => { if (waiter) frameWaiters.delete(waiter); reject(error); };
          release = scope.track('pending-job', () => fail(new Error('Surface disposed')));
          waiter = { reject: fail, resolve: () => {
            try {
              if (disposed || lost || document.hidden || containsSensitive()) throw new Error('Aufnahmevoraussetzungen geändert.');
              const display = canvas.getBoundingClientRect();
              // Read canvas pixels in the render callback, before another scene/frame or
              // compositor turn. This is a selected canvas image, not a film/FPS proof.
              const image = canvas.toDataURL('image/png');
              resolve(CapturedFrameSchema.parse({ schemaVersion: 1, id: `frame-${surfaceId}-${frames}-${Date.now()}`, surfaceFrame: frames,
                capturedAt: new Date().toISOString(), renderTimeMs: performance.now(),
                backend: renderer.backend instanceof WebGPUBackend ? 'webgpu' : 'webgl2', progress: Number(canvas.dataset.progress),
                viewport: { width: display.width, height: display.height, dpr: canvas.width / display.width },
                pixelWidth: canvas.width, pixelHeight: canvas.height, image,
                parts: [...visuals.values()].filter(visual => visual.presentedOpacity > .01 && !visual.exiting).map(visual => ({ id: visual.target.id, ...visual.target.anatomy })).map(({ id, componentId, part }) => ({ id, componentId, part })),
                redaction: 'no-sensitive-parts', coverage: 'selected-frame',
              }));
            } catch (error) { fail(error instanceof Error ? error : new Error('Bildaufnahme fehlgeschlagen')); }
          } };
          frameWaiters.add(waiter); timeout = setTimeout(() => fail(new Error('Kein Renderframe für Aufnahme eingetroffen.')), 3000); invalidate();
        });
      } finally { clearTimeout(timeout); if (waiter) frameWaiters.delete(waiter); release(); }
    },
    async verifyKernels() { if (!device) throw new Error('GPU-Readback erfordert WebGPU. Der WebGL2-Renderpfad wird separat geprüft.'); kernelCheck = await verifyPanelKernel(device); forcePublish = true; invalidate(); return kernelCheck; },
    hitTest(x: number, y: number) {
      return hitTestPresentation(presentedHitTargets(), x, y);
    },
    simulateDeviceLoss() {
      if (device) device.destroy();
      else { const context = renderer.getContext(); if (context instanceof WebGL2RenderingContext) context.getExtension('WEBGL_lose_context')?.loseContext(); }
    },
  };
  } catch(error) {
    disposed = true;
    try{scope.dispose();}catch(disposalError){throw new AggregateError([error,disposalError],'Surface initialization and disposal failed');}
    throw error;
  }
}
export type FluidSurfaceHandle = Awaited<ReturnType<typeof createFluidSurface>>;
export type SurfacePlaybackControls = Pick<FluidSurfaceHandle, 'pause' | 'play' | 'seek' | 'replay' | 'verifyKernels' | 'getRecording' | 'getPresentation' | 'getMetrics' | 'getResources' | 'getFrameTimings' | 'inspectText' | 'captureFrame'> & { canRestage?(): boolean; getRestagedRecording?(locale: Locale): Promise<RestagedRecording | null>; getPresentationMode(): 'live' | 'replay'; importRecording(input: unknown): void; restoreLive(): void };
