'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Button } from '@base-ui/react/button';
import type { WorkspaceData } from '@fluidkit/cases';
import type { FluidRuntime } from '@fluidkit/core';
import type { SurfacePlaybackControls } from '@fluidkit/webgpu';
import { createWorkspaceIntentController } from '../lib/workspace-intent';
import { useStudioMessages } from './studio-locale';
import styles from './structural-workspace.module.css';

const editingSelector = 'textarea, input:not([type]), input:is([type=text],[type=search],[type=email],[type=password],[type=url],[type=tel],[type=number]), [contenteditable]:not([contenteditable=false]), [role=textbox]';

export function useWorkspaceIntent(runtime: FluidRuntime, data: WorkspaceData, controls: SurfacePlaybackControls | null, enabled: boolean) {
  const session = useMemo(() => createWorkspaceIntentController(runtime, data.modules.map(module => module.id)), [data, runtime]);
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!enabled || !controls) return;
    function editing() {
      const { composingId, focusedId } = runtime.getInteraction();
      return Boolean(composingId || document.activeElement?.closest(editingSelector) ||
        (focusedId && runtime.getScene().some(node => node.id === focusedId && node.anatomy.behavior === 'textbox')));
    }
    const disconnect = session.connect(() => controls.getPresentationMode() === 'live' && !runtime.isReplay() && !editing());
    const hold = () => { if (session.getSnapshot().offerRevision !== null && editing()) session.abandonOffer(); };
    document.addEventListener('focusin', hold);
    document.addEventListener('compositionstart', session.abandonOffer);
    const stop = runtime.subscribeInteraction(hold);
    return () => {
      document.removeEventListener('focusin', hold);
      document.removeEventListener('compositionstart', session.abandonOffer);
      stop();
      disconnect();
    };
  }, [session, runtime, controls, enabled]);
  return { state, session, toggle };
}
type IntentControls = ReturnType<typeof useWorkspaceIntent>;

export function IntentSwitch({ intent, runtime, ready }: { intent: IntentControls; runtime: FluidRuntime; ready: boolean }) {
  const t = useStudioMessages();
  const on = runtime.getSnapshot().mode === 'hybrid';
  return <Button ref={intent.toggle} className={styles.intentSwitch} aria-pressed={on} disabled={!ready} title={t('intentSwitchHint')}
    onClick={() => runtime.send('mode.set', { mode: on ? 'manual' : 'hybrid' })}>
    <span className={styles.switchTrack} aria-hidden="true" />{t('intentAssistance')}
  </Button>;
}

export function IntentOffer({ intent, live }: { intent: IntentControls; live: boolean }) {
  const t = useStudioMessages();
  const { offerRevision, result } = intent.state;
  if (offerRevision === null || !result.suggestion || !live) return null;
  const [first, second] = result.suggestion.moduleIds;
  return <div className={styles.intentOffer}>
    <span role="status">{t('intentOffer', {first, second})}</span>
    <Button className="play-button" onClick={() => { intent.session.accept(offerRevision); intent.toggle.current?.focus({ preventScroll: true }); }}>
      {t('intentCompare')}
    </Button>
    <Button className="outline-button" onClick={() => { intent.session.dismiss(offerRevision); intent.toggle.current?.focus({ preventScroll: true }); }}>
      {t('intentDismiss')}
    </Button>
  </div>;
}

export function IntentEvidence({ intent }: { intent: IntentControls }) {
  const t = useStudioMessages();
  const { result, response, offerRevision } = intent.state;
  const status = response === 'accepted' ? 'intentAccepted' : response === 'unavailable' ? 'intentUnavailable'
    : result.reason === 'dismissed' ? 'intentQuiet' : offerRevision !== null ? 'intentDetected' : 'intentUnclear';
  return <details className={styles.more}>
    <summary>{t('intentEvidence')}</summary>
    <p>{t('intentGuide')}</p>
    <p role="status">{t(status)}</p>
    {result.visits.length > 0 && <ol className={styles.intentVisits} aria-label={t('intentVisits')}>
      {result.visits.map(({ moduleId }, index) => <li key={index}><code>{moduleId}</code></li>)}
    </ol>}
  </details>;
}
