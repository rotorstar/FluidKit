import type { NativeInputObservation } from '@fluidkit/contracts';

/** Trusted input/fill alone is never evidence of a native composition lifecycle. */
export function summarizeNativeInput(events: readonly NativeInputObservation[]) {
  const active = new Set<string>();
  let trustedStarts = 0, confirmedCompositions = 0, emptyCompositions = 0, untrustedEvents = 0;
  for (const event of events) {
    if (!event.isTrusted) { untrustedEvents++; continue; }
    if (event.type === 'compositionstart' && event.composingId === event.nodeId && event.focusedId === event.nodeId) {
      active.add(event.nodeId); trustedStarts++;
    }
    if (event.type === 'compositionend') {
      if (active.has(event.nodeId) && event.composingId === null && event.focusedId === event.nodeId) {
        if ((event.dataLength ?? 0) > 0) confirmedCompositions++; else emptyCompositions++;
      }
      active.delete(event.nodeId);
    }
    if (event.type === 'blur') active.delete(event.nodeId);
  }
  return { trustedStarts, confirmedCompositions, emptyCompositions, untrustedEvents, openCompositions: active.size };
}
