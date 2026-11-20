'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@base-ui/react/button';
import { workspaceRows, type WorkspaceData } from '@fluidkit/cases';
import type { EffectSettings } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import { EFFECT_LIBRARY, effectReference } from '@fluidkit/effects';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';

const STATIONS = ['Ausgangslage', 'Silk Cascade', 'Liquid Lens', 'Particle Weave'] as const;

/** A finite demonstration of real events. Any user takeover cancels future events. */
export function EffectShowcaseTour({ runtime, data, controls }: { runtime: FluidRuntime; data: WorkspaceData; controls: SurfacePlaybackControls | null }) {
  const [active, setActive] = useState(false), [station, setStation] = useState(-1);
  const [message, setMessage] = useState('Vier Stationen. Echte Daten. Jederzeit selbst übernehmen.');
  const root = useRef<HTMLElement>(null);
  const running = useRef(false), dispatching = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollFrame = useRef<number | undefined>(undefined);
  const saved = useRef<EffectSettings | null>(null);
  const stop = useCallback((reason: string, restore = true, notify = true) => {
    if (!running.current) return;
    running.current = false;
    clearTimeout(timer.current);
    timer.current = undefined;
    if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
    const previous = saved.current;
    saved.current = null;
    if (restore && previous) {
      dispatching.current = true;
      try { runtime.configureEffects(previous); }
      finally { dispatching.current = false; }
    }
    if (notify) { setActive(false); setMessage(reason); }
  }, [runtime]);
  useEffect(() => {
    const takeOver = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-effect-tour-controls]')) return;
      stop('Du steuerst jetzt selbst. Die erreichte Ansicht bleibt erhalten.');
    };
    const hidden = () => { if (document.hidden) stop('Demo beendet: Der Tab ist nicht sichtbar.'); };
    const navigation = () => stop('Demo beendet: Navigation übernommen.');
    document.addEventListener('pointerdown', takeOver, true);
    document.addEventListener('keydown', takeOver, true);
    document.addEventListener('wheel', takeOver, { passive: true });
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('popstate', navigation);
    const domain = runtime.subscribe(() => { if (!dispatching.current) stop('Du steuerst jetzt selbst. Die erreichte Ansicht bleibt erhalten.'); });
    let settings = runtime.getVisualState().settings;
    const visual = runtime.subscribeVisual(() => {
      const next = runtime.getVisualState().settings;
      if (next !== settings && !dispatching.current) stop('Deine Effektwahl gilt. Die Demo ist beendet.', false);
      settings = next;
    });
    return () => {
      domain(); visual(); stop('', true, false);
      document.removeEventListener('pointerdown', takeOver, true);
      document.removeEventListener('keydown', takeOver, true);
      document.removeEventListener('wheel', takeOver);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('popstate', navigation);
    };
  }, [runtime, stop]);
  useEffect(() => { if (!controls) stop('Demo beendet: Die GPU-Surface ist nicht bereit.'); }, [controls, stop]);

  function start() {
    if (!controls) return;
    stop('', true, false);
    const snapshot = runtime.getSnapshot(), rows = workspaceRows(data, snapshot, runtime.getLocale());
    const selected = rows.find(module => module.id === snapshot.fields.selected) ?? rows[0];
    if (!selected) { setActive(false); setMessage('Für die Demo zuerst eine Suche mit mindestens einem Modul wählen.'); return; }
    const selectedId = selected.id;
    const recipes = ['silk-cascade', 'liquid-lens', 'particle-weave'].map(id => EFFECT_LIBRARY.find(effect => effect.id === id));
    if (recipes.some(recipe => !recipe)) { setActive(false); setMessage('Die neuen Effektversionen sind noch nicht verfügbar.'); return; }
    saved.current = runtime.getVisualState().settings;
    controls.restoreLive();
    running.current = true;
    setActive(true);
    const steps = [
      { station: 0, event: 'view.table', recipe: null, text: 'Ausgangslage: Dieselben Module, Filter und Sortierung.' },
      { station: 1, event: 'view.cards', recipe: recipes[0]!, text: 'Silk Cascade: Die Tabelle entfaltet sich in ein Kartenraster.' },
      { station: 2, event: `select.${selectedId}`, recipe: recipes[1]!, text: `Liquid Lens: ${selectedId} öffnet sich im Zusammenhang.` },
      { station: 2, event: 'view.cards', recipe: recipes[1]!, text: 'Liquid Lens: Zurück zu denselben Karten und derselben Auswahl.' },
      { station: 3, event: 'view.map', recipe: recipes[2]!, text: 'Particle Weave: Aus Karten werden sichtbare Abhängigkeiten.' },
    ];
    function advance(index: number) {
      if (!running.current || !saved.current) return;
      const step = steps[index];
      if (!step) { stop('Demo abgeschlossen. Deine Effektkonfiguration ist wieder aktiv; die Map bleibt bedienbar.'); return; }
      try {
        dispatching.current = true;
        runtime.configureEffects({ ...saved.current, enabled: Boolean(step.recipe), mode: step.recipe ? 'fixed' : 'off',
          ...(step.recipe ? { effect: effectReference(step.recipe), parameters: step.recipe.recommendedParameters } : {}), transitionRules: {} });
        const result = runtime.send(step.event, {}, 'host');
        if (!result.accepted) throw new Error(result.reason);
        setStation(step.station); setMessage(step.text);
        // Wait for the React projection, then frame a real Part, never a guessed screen point.
        scrollFrame.current = requestAnimationFrame(() => {
          scrollFrame.current = requestAnimationFrame(() => {
            if (!running.current) return;
            root.current?.closest('main')?.querySelector<HTMLElement>(`[data-fluid-node="module-${selectedId}"]`)?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
          });
        });
        timer.current = setTimeout(() => advance(index + 1), Math.max(900, runtime.getTransitionDuration() + 850));
      } catch (error) { stop(`Demo angehalten: ${error instanceof Error ? error.message : 'Übergang nicht verfügbar.'}`); }
      finally { dispatching.current = false; }
    }
    advance(0);
  }
  return <section ref={root} className="effect-showcase-tour" aria-label="Neue Effekte erleben">
    <div className="effect-tour-heading"><div><span className="eyebrow">DREI NEUE PERSPEKTIVEN</span><h2>Form. Fokus. Verbindung.</h2><p>Ein kuratierter Durchlauf von Tabelle über Karten und Detail zur Map.</p></div><div data-effect-tour-controls className="effect-tour-actions"><Button className="play-button" disabled={!controls || active} onClick={start}>Neue Effekte erleben</Button><Button className="outline-button" disabled={!active} onClick={() => stop('Demo gestoppt. Du steuerst jetzt selbst.')}>Stoppen</Button></div></div>
    <ol className="effect-tour-stations">{STATIONS.map((title, index) => <li key={title} aria-current={active && station === index ? 'step' : undefined}><span>0{index + 1}</span>{title}</li>)}</ol>
    <p className="effect-tour-status" role="status">{message}</p>
  </section>;
}
