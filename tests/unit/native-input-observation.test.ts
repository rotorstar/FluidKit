import { describe, expect, it } from 'vitest';
import { NativeInputObservationSchema, NativeInputProtocolSchema, type NativeInputObservation } from '@fluidkit/contracts';
import { summarizeNativeInput } from '../../apps/studio/lib/native-input-observation';

const entry = (patch: Partial<NativeInputObservation> = {}): NativeInputObservation => NativeInputObservationSchema.parse({ type: 'input', elapsedMs: 1, nodeId: 'project-name', isTrusted: true,
  inputType: 'insertText', isComposing: false, valueLength: 1, dataLength: 1, selectionStart: 1, selectionEnd: 1, selectionDirection: 'none',
  focusedId: 'project-name', composingId: null, revision: 1, ...patch });

describe('native input evidence boundaries', () => {
  it('never interprets trusted fill/input or untrusted composition as a native IME proof', () => {
    expect(summarizeNativeInput([entry(), entry({ type: 'compositionstart', isTrusted: false, composingId: 'project-name' }), entry({ type: 'compositionend', isTrusted: false })]))
      .toEqual({ trustedStarts: 0, confirmedCompositions: 0, emptyCompositions: 0, untrustedEvents: 2, openCompositions: 0 });
  });
  it('requires an ordered trusted lifecycle, active Core protection, preserved focus and nonempty commit', () => {
    const start = entry({ type: 'compositionstart', composingId: 'project-name' });
    expect(summarizeNativeInput([entry({ type: 'compositionend' })]).confirmedCompositions).toBe(0);
    expect(summarizeNativeInput([start, entry({ type: 'compositionend', composingId: 'project-name' })]).confirmedCompositions).toBe(0);
    expect(summarizeNativeInput([start, entry({ type: 'blur', focusedId: null }), entry({ type: 'compositionend' })]).confirmedCompositions).toBe(0);
    expect(summarizeNativeInput([start, entry({ type: 'compositionupdate', composingId: 'project-name' }), entry({ type: 'compositionend' })]).confirmedCompositions).toBe(1);
    expect(summarizeNativeInput([start, entry({ type: 'compositionend', dataLength: 0 })]).emptyCompositions).toBe(1);
  });
  it('fails closed if raw input or clipboard/composition content is added to the protocol', () => {
    expect(NativeInputObservationSchema.safeParse({ ...entry(), value: 'secret' }).success).toBe(false);
    expect(NativeInputObservationSchema.safeParse({ ...entry(), data: 'secret' }).success).toBe(false);
    const protocol = { schemaVersion: 1, buildId: 'test', createdAt: '2026-11-04T00:00:00Z', context: 'synthetic-qa-fixture', scope: 'opt-in-observed-dom-events', contentPolicy: 'lengths-and-selection-only-no-input-content', truncated: false, events: [entry()] };
    expect(NativeInputProtocolSchema.safeParse(protocol).success).toBe(true);
    expect(NativeInputProtocolSchema.safeParse({ ...protocol, snapshot: { value: 'secret' } }).success).toBe(false);
    expect(NativeInputProtocolSchema.safeParse({ ...protocol, events: Array(501).fill(entry()) }).success).toBe(false);
  });
});
