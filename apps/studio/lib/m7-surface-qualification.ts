import { EffectSettingsSchema, M7SurfaceQualificationSchema, SceneNodeSchema, type M7SurfaceCase, type M7SurfaceQualification, type SceneNode } from '@fluidkit/contracts';
import { EFFECT_LIBRARY, resolveEffect } from '@fluidkit/effects';
import { createFluidSurface, createResourceLedger, DEFAULT_FALLBACK_FONT_URLS, type FluidSurfaceHandle, type SurfaceOptions } from '@fluidkit/webgpu';

const RECIPES = ['silk-cascade', 'liquid-lens', 'particle-weave'] as const;
// Deliberately synthetic; never accept user secrets as a qualification fixture.
const PRIVATE_MARKER = 'SYNTHETIC-SENSITIVE-M7-5842';
class Interrupted extends Error {}
const message = (error: unknown) => (error instanceof Error ? error.message : String(error)).replaceAll(PRIVATE_MARKER, '[redacted-fixture]');
const namedError = (error: unknown, name: string) => typeof error === 'object' && error !== null && 'name' in error && error.name === name;
function bounded<T>(operation: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([operation, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(`Keine bestätigte Operation innerhalb von ${ms} ms.`)), ms); })]).finally(() => clearTimeout(timer));
}
export function qualificationScene(width: number, variant: number, sensitive = false): SceneNode[] {
  const cardWidth = Math.max(64, Math.min(180, (width - 64) / 3));
  return ['Alpha', 'Beta', 'Gamma'].map((title, index) => SceneNodeSchema.parse({
    id: `fixture-${index}`, kind: 'card', anatomy: { componentId: `fixture-${index}`, part: 'root', behavior: 'presentation' },
    x: 16 + index * (cardWidth + 16), y: 36 + (variant % 2 ? (2 - index) * 72 : index * 36),
    width: cardWidth, height: 66, text: sensitive && index === 0 ? PRIVATE_MARKER : title,
    label: sensitive && index === 0 ? PRIVATE_MARKER : title, sensitive: sensitive && index === 0,
    color: ['#245f54', '#204656', '#38456e'][index], fontSize: 16, textLines: 2, textInset: 10,
  }));
}
export function resourcesAreEmpty(snapshot: M7SurfaceCase['afterDispose']) {
  return snapshot.owners === 0 && Object.values(snapshot.live).every(count => count === 0) && snapshot.disposalErrors.length === 0;
}

/** A visible Studio tool using real Surface instances, isolated from host state. */
export async function qualifyM7Surfaces(options: {
  host: HTMLElement; buildId: string; backend: 'webgpu-only' | 'webgl2'; cycles: 3 | 100; signal: AbortSignal;
  onProgress: (completed: number, total: number, label: string) => void;
}): Promise<M7SurfaceQualification> {
  const startedAt = new Date().toISOString(), cases: M7SurfaceCase[] = [], ledger = createResourceLedger();
  const width = Math.max(1, Math.round(options.host.getBoundingClientRect().width)), height = 340, dpr = devicePixelRatio;
  let cancelled = false;
  const assertLive = () => {
    if (options.signal.aborted) { cancelled = true; throw new Interrupted('Prüfung abgebrochen.'); }
    if (document.hidden) throw new Interrupted('Prüfung pausiert nicht im Hintergrund: Lauf unvollständig.');
    if (Math.abs(options.host.getBoundingClientRect().width - width) > 1 || devicePixelRatio !== dpr) throw new Interrupted('Viewport oder DPR hat sich geändert; Lauf unvollständig.');
  };
  async function runCase(kind: M7SurfaceCase['kind'], cycle: number | null, operation: (env: {
    create: (patch?: Partial<SurfaceOptions>) => Promise<FluidSurfaceHandle>;
    render: (surface: FluidSurfaceHandle, recipe: string, variant: number, phase: number, sensitive?: boolean) => Promise<void>;
    errors: Error[]; result: M7SurfaceCase;
  }) => Promise<void>) {
    const canvas = document.createElement('canvas'); canvas.style.width = '100%'; canvas.style.height = `${height}px`;
    canvas.setAttribute('aria-label', 'Synthetische M7-Prüffläche'); options.host.append(canvas);
    const local = new AbortController(), errors: Error[] = [];
    const abort = () => local.abort(); options.signal.addEventListener('abort', abort, { once: true });
    const surfaces = new Set<FluidSurfaceHandle>();
    let abandoned = false;
    const result: M7SurfaceCase = { id: `${kind}-${cycle ?? cases.length}`, kind, cycle, result: 'passed', backend: null,
      observedEffects: [], frames: 0, textBytes: 0, progressAtDispose: null, beforeDispose: ledger.snapshot(), afterDispose: ledger.snapshot(), detail: [], privacyAttempts: [] };
    async function create(patch: Partial<SurfaceOptions> = {}) {
      assertLive();
      const pending = createFluidSurface(canvas, { fontUrl: '/fonts/inter.font.glb', fallbackFontUrls: DEFAULT_FALLBACK_FONT_URLS, backendMode: options.backend, signal: local.signal,
        resourceLedger: ledger, onError: error => errors.push(error), ...patch }).then(surface => {
          if (abandoned) { surface.dispose(); throw new Interrupted('Initialisierung endete nach der Prüfdeadline.'); }
          surfaces.add(surface);
          const actualBackend = surface.getCapabilities().backend;
          if (actualBackend === 'unavailable') throw new Error('Kein bestätigtes Backend.');
          result.backend = actualBackend; return surface;
        });
      const surface = await bounded(pending, 15000);
      if (result.backend !== (options.backend === 'webgpu-only' ? 'webgpu' : 'webgl2')) throw new Error('Angefordertes und tatsächliches Backend stimmen nicht überein.');
      return surface;
    }
    async function render(surface: FluidSurfaceHandle, recipe: string, variant: number, phase: number, sensitive = false) {
      assertLive();
      const definition = EFFECT_LIBRARY.find(effect => effect.id === recipe)!;
      const plan = resolveEffect({ settings: EffectSettingsSchema.parse({ effect: { id: recipe, version: definition.version }, parameters: definition.recommendedParameters, seed: 73 }),
        capabilities: surface.getCapabilities(), eventId: `${result.id}-${variant}`, eventType: 'fixture.transition', caseId: 'm7-surface-fixture',
        sourceState: 'source', targetState: 'target', sourceRevision: 0, targetRevision: 1, baseDuration: definition.recommendedParameters.durationMs, nodeCount: 3 });
      surface.setScene(qualificationScene(width, variant, sensitive), true, definition.recommendedParameters.durationMs, plan);
      surface.seek(phase); await bounded(surface.inspectText(), 5000); assertLive();
      const metrics = surface.getMetrics();
      if (!metrics || metrics.effectId !== recipe || Math.abs(metrics.progress - phase) > .0001) throw new Error(`Kein bestätigter ${recipe}-Frame bei ${phase}. Reduced Motion muss für diesen Effektlauf ausgeschaltet sein.`);
      result.observedEffects.push(recipe); result.frames = metrics.frames; result.textBytes = metrics.textBytes; result.progressAtDispose = phase;
      if (errors.length) throw errors[0];
    }
    try { assertLive(); await operation({ create, render, errors, result }); }
    catch (error) { result.result = error instanceof Interrupted ? 'inconclusive' : 'failed'; result.detail.push(message(error)); }
    finally {
      result.beforeDispose = ledger.snapshot();
      abandoned = true;
      for (const surface of surfaces) { try { surface.dispose(); } catch (error) { result.result = 'failed'; result.detail.push(`Disposal: ${message(error)}`); } }
      local.abort(); options.signal.removeEventListener('abort', abort); canvas.remove();
      result.afterDispose = ledger.snapshot();
      if (!resourcesAreEmpty(result.afterDispose)) { result.result = 'failed'; result.detail.push('Verwaltete Ressourcen bleiben nach Disposal zurück.'); }
    }
    cases.push(result); options.onProgress(cases.length, options.cycles + 5, result.id);
    return result.result === 'passed';
  }
  for (let cycle = 1; cycle <= options.cycles; cycle++) {
    const passed = await runCase('cycle', cycle, async ({ create, render, result }) => {
      const surface = await create(); surface.setScene(qualificationScene(width, 0), false); await bounded(surface.inspectText(), 5000);
      const order = RECIPES.map((_, index) => RECIPES[(index + cycle - 1) % RECIPES.length]!);
      for (const [index, recipe] of order.entries()) {
        await render(surface, recipe, index + 1, .5);
        if (index < order.length - 1) { surface.seek(1); await bounded(surface.inspectText(), 5000); }
      }
      result.detail.push('Drei echte Effektpfade; letzter bestätigter Mittelzustand wird unmittelbar disposed.');
    });
    if (!passed) break;
  }
  const cyclesComplete = cases.length === options.cycles && cases.every(item => item.result === 'passed');
  if (cyclesComplete) {
    await runCase('init-abort', null, async ({ create, result }) => {
      const aborter = new AbortController(); let reached = false;
      try { await create({ signal: aborter.signal, onInitializationStage: stage => { if (stage.stage === 'renderer-ready') { reached = true; result.backend = stage.backend; aborter.abort(); } } }); throw new Error('Abgebrochene Initialisierung lieferte eine aktive Surface.'); }
      catch (error) { if (!reached || !namedError(error, 'AbortError')) throw error; }
      result.detail.push('Abort nach bestätigter Rendererinitialisierung; erwarteter AbortError.');
    });
    await runCase('invalid-font', null, async ({ create, result }) => {
      const url = URL.createObjectURL(new Blob(['intentionally-invalid-font-fixture'], { type: 'application/octet-stream' }));
      let rejected = false, reached = false;
      try { await create({ fontUrl: url, onInitializationStage: stage => { if (stage.stage === 'renderer-ready') { reached = true; result.backend = stage.backend; } } }); }
      catch (error) { if (!namedError(error, 'SurfaceFontError')) throw error; rejected = true; result.detail.push(`Kontrollierte ungültige Fontdatei: ${message(error)}`); }
      finally { URL.revokeObjectURL(url); }
      if (!rejected || !reached) throw new Error('Der injizierte Fontfehler wurde nicht nach Rendererinitialisierung bestätigt.');
    });
    await runCase('device-loss', null, async ({ create, render, errors, result }) => {
      const surface = await create(); surface.setScene(qualificationScene(width, 0), false); await bounded(surface.inspectText(), 5000);
      await render(surface, 'liquid-lens', 1, .5);
      surface.simulateDeviceLoss();
      const start = performance.now();
      while (!errors.length && performance.now() - start < 5000) { assertLive(); await new Promise(resolve => setTimeout(resolve, 20)); }
      if (!errors.some(error => error.name === 'CapabilityError' && error.message.includes('verloren'))) throw new Error('Kontrollierter Geräte-/Kontextverlust wurde nicht gemeldet.');
      if (!resourcesAreEmpty(ledger.snapshot())) throw new Error('Verlorene Surface wurde nicht vollständig freigegeben.');
      result.detail.push(options.backend === 'webgpu-only' ? 'GPUDevice.destroy() bewusst ausgelöst; kein zufälliger Hardwarefehler.' : 'WEBGL_lose_context bewusst ausgelöst; kein zufälliger Hardwarefehler.');
    });
    await runCase('privacy', null, async ({ create, render, result }) => {
      const surface = await create();
      async function inspect(recipe: string, stage: string) {
        assertLive();
        let blocked = false;
        try { await bounded(surface.captureFrame(), 5000); }
        catch (error) { if (error instanceof Error && error.message.includes('Sensitive Parts')) blocked = true; else throw error; }
        const recording = surface.getRecording();
        const markerAbsent = !JSON.stringify(recording).includes(PRIVATE_MARKER);
        result.privacyAttempts.push({ recipe, stage, capture: blocked ? 'blocked' : 'unexpected-success', recordingRedacted: Boolean(recording?.redacted), markerAbsent, recording: markerAbsent ? recording : null });
        if (!blocked || !markerAbsent || !recording?.redacted) throw new Error('Sensitive Fixture wurde nicht vollständig von Capture und Export geschützt.');
      }
      for (const recipe of RECIPES) {
        surface.setScene(qualificationScene(width, 0, true), false); await bounded(surface.inspectText(), 5000);
        await render(surface, recipe, 1, .25); await inspect(recipe, 'sensitive-source');
        await render(surface, recipe, 2, .5, true); await inspect(recipe, 'sensitive-target');
        await render(surface, recipe, 3, .75); await inspect(recipe, 'interruption-1');
        await render(surface, recipe, 4, .25); await inspect(recipe, 'interruption-2');
        surface.seek(1); await bounded(surface.inspectText(), 5000);
      }
      await render(surface, 'silk-cascade', 5, 1);
      const frame = await bounded(surface.captureFrame(), 5000), recording = surface.getRecording();
      if (recording?.redacted || JSON.stringify(recording).includes(PRIVATE_MARKER)) throw new Error('Öffentlicher Folgeclip ist nicht sauber.');
      result.privacyAttempts.push({ recipe: 'silk-cascade', stage: 'public-followup', capture: 'public-success', markerAbsent: true, recordingRedacted: false, recording });
      result.detail.push(`Öffentliche Folgeaufnahme bestätigt: ${frame.id}. Kein privates Bild wurde gespeichert.`);
    });
    await runCase('public-recovery', null, async ({ create, render, result }) => {
      const surface = await create(); surface.setScene(qualificationScene(width, 0), false); await bounded(surface.inspectText(), 5000);
      await render(surface, 'particle-weave', 1, 1); const frame = await bounded(surface.captureFrame(), 5000);
      result.detail.push(`Neue öffentliche Surface nach Fehler-/Privacy-Fällen bestätigt: ${frame.id}.`);
    });
  }
  const complete = cases.length === options.cycles + 5 && cases.filter(item => item.kind === 'cycle').length === options.cycles;
  return M7SurfaceQualificationSchema.parse({ schemaVersion: 1, scope: 'm7-imperative-surface-qualification', buildId: options.buildId, startedAt,
    completedAt: new Date().toISOString(), browser: navigator.userAgent, requestedBackend: options.backend, viewport: { width, height, dpr }, requestedCycles: options.cycles,
    cases, aborted: cancelled || options.signal.aborted, result: cases.some(item => item.result === 'failed') ? 'failed' : complete && !cancelled && !options.signal.aborted && cases.every(item => item.result === 'passed') ? 'passed' : 'inconclusive',
    limitations: ['Synthetische ausdrücklich markierte Inhalte auf echten GPU-Surfaces; keine Hostdaten oder externen Aktionen.',
      'Imperativer Surface-Mount/Dispose, kein neuer React-Mountnachweis. M6 bleibt ein getrennter Bericht.',
      'Verwaltete Objekt-/Jobbestände und Glyph-Bytes; kein Treiber-/Prozessspeicher und keine geräteübergreifende Freigabe.',
      'Device-/Context-Loss und ungültiges Fontartefakt werden absichtlich ausgelöst; keine Behauptung eines zufälligen Hardwarefehlers.'] });
}
