'use client';
import { useDiagnosticMessages } from './diagnostic-locale';

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from 'react';
import { Button } from '@base-ui/react/button';
import { NativeInputContextSchema, NativeInputObservationSchema, NativeInputProtocolSchema, type NativeInputObservation, type NativeInputProtocol } from '@fluidkit/contracts';
import type { FluidRuntime } from '@fluidkit/core';
import { StudioSelect } from './studio-controls';
import { summarizeNativeInput } from '../lib/native-input-observation';

export function NativeInputObserver({ runtime, buildId, children }: { runtime: FluidRuntime; buildId: string; children: ReactNode }) {
  const tr = useDiagnosticMessages();
  const [enabled, setEnabled] = useState(false), [events, setEvents] = useState<NativeInputObservation[]>([]), [truncated, setTruncated] = useState(false);
  const [context, setContext] = useState<NativeInputProtocol['context']>('unspecified');
  const active = useRef(false), generation = useRef(0), start = useRef(0), count = useRef(0);
  useEffect(() => () => { active.current = false; generation.current++; }, []);
  function toggle() {
    active.current = !active.current; generation.current++;
    if (active.current) { count.current = 0; setEvents([]); setTruncated(false); start.current = performance.now(); }
    setEnabled(active.current);
  }
  function observe(event: SyntheticEvent) {
    if (!active.current || !(event.target instanceof HTMLInputElement)) return;
    const nodeId = event.target.dataset.fluidNode;
    if (!nodeId) return;
    const type = event.type === 'focusin' ? 'focus' : event.type === 'focusout' ? 'blur' : event.type;
    const native = event.nativeEvent, input = event.target, token = generation.current;
    // Capture only scalar lengths and coordinates; never retain raw content/event objects.
    const interaction = runtime.getInteraction();
    const sample = { focusedId: interaction.focusedId, composingId: interaction.composingId, type, elapsedMs: performance.now() - start.current, nodeId, isTrusted: native.isTrusted,
      inputType: native instanceof InputEvent ? native.inputType : null,
      isComposing: native instanceof InputEvent ? native.isComposing : null,
      valueLength: input.value.length, dataLength: native instanceof CompositionEvent ? native.data.length : native instanceof InputEvent ? native.data?.length ?? null : null,
      selectionStart: input.selectionStart, selectionEnd: input.selectionEnd, selectionDirection: input.selectionDirection };
    // Capture interaction at parent bubbling, after the bridge handler. Do not delay
    // it: a native task can emit both compositionstart and compositionend. Queue only
    // publication/revision so React's input/change plugins have finished.
    queueMicrotask(() => {
      if (!active.current || generation.current !== token) return;
      if (count.current >= 500) { setTruncated(true); return; }
      const entry = NativeInputObservationSchema.parse({ ...sample, revision: runtime.getSnapshot().revision });
      count.current++; setEvents(current => [...current, entry]);
    });
  }
  function download() {
    const protocol = NativeInputProtocolSchema.parse({ schemaVersion: 1, buildId, createdAt: new Date().toISOString(), context,
      scope: 'opt-in-observed-dom-events', contentPolicy: 'lengths-and-selection-only-no-input-content', truncated, events });
    const url = URL.createObjectURL(new Blob([JSON.stringify(protocol, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fluid-native-input-protocol.json'; link.click(); URL.revokeObjectURL(url);
  }
  const summary = summarizeNativeInput(events);
  return <>
    <div onCompositionStart={observe} onCompositionUpdate={observe} onCompositionEnd={observe} onInput={observe} onSelect={observe} onFocus={observe} onBlur={observe}>{children}</div>
    <section aria-label={tr('native')} style={{ padding: '16px', borderTop: '1px solid var(--border, #dce4e8)' }}>
      <h3>{tr('native')}</h3>
      <p className="inspector-copy">{tr('nativeScope')}</p>
      <label>{tr('inputContext')} <StudioSelect aria-label={tr('inputLabel')} value={context} disabled={enabled || events.length > 0} onChange={event => setContext(NativeInputContextSchema.parse(event.target.value))}>
        <option value="unspecified">{tr('unspecified')}</option><option value="native-dead-key">{tr('deadKey')}</option><option value="native-japanese-ime">{tr('japanese')}</option><option value="synthetic-qa-fixture">{tr('synthetic')}</option>
      </StudioSelect></label>
      <div className="quality-actions"><Button className="outline-button" onClick={toggle}>{tr(enabled ? 'stopInput' : 'startInput')}</Button><Button className="outline-button" disabled={enabled || !events.length} onClick={download}>{tr('exportInput')}</Button><Button className="outline-button" disabled={enabled || !events.length} onClick={() => { count.current = 0; setEvents([]); setTruncated(false); }}>{tr('clearLog')}</Button></div>
      <p role="status">{tr('inputReport',{enabled:enabled?'on':'off',events:events.length,starts:summary.trustedStarts,confirmed:summary.confirmedCompositions,empty:summary.emptyCompositions,untrusted:summary.untrustedEvents})}{truncated ? ' · '+tr('inputLimit') : ''}</p>
      <ol className="event-list">{events.slice(-8).map((event, index) => <li key={`${event.elapsedMs}:${index}`}><code>{event.type}</code><small>{event.isTrusted ? 'trusted' : 'untrusted'} · {event.inputType ?? '–'} · nativeComposing {String(event.isComposing)} · Core {event.composingId ?? 'none'} · Fokus {event.focusedId ?? 'none'} · Länge {event.valueLength} · Auswahl {event.selectionStart}:{event.selectionEnd}</small></li>)}</ol>
    </section>
  </>;
}
