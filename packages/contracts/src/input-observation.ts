import { z } from 'zod';

export const NativeInputContextSchema = z.enum(['unspecified', 'native-dead-key', 'native-japanese-ime', 'synthetic-qa-fixture']);
export const NativeInputObservationSchema = z.strictObject({
  type: z.enum(['compositionstart', 'compositionupdate', 'compositionend', 'input', 'select', 'focus', 'blur']),
  elapsedMs: z.number().nonnegative(), nodeId: z.string(), isTrusted: z.boolean(),
  inputType: z.string().nullable(), isComposing: z.boolean().nullable(),
  valueLength: z.number().int().nonnegative(), dataLength: z.number().int().nonnegative().nullable(),
  selectionStart: z.number().int().nonnegative().nullable(), selectionEnd: z.number().int().nonnegative().nullable(),
  selectionDirection: z.enum(['forward', 'backward', 'none']).nullable(),
  focusedId: z.string().nullable(), composingId: z.string().nullable(), revision: z.number().int().nonnegative(),
});
export type NativeInputObservation = z.infer<typeof NativeInputObservationSchema>;
export const NativeInputProtocolSchema = z.strictObject({
  schemaVersion: z.literal(1), buildId: z.string(), createdAt: z.iso.datetime(),
  context: NativeInputContextSchema, scope: z.literal('opt-in-observed-dom-events'),
  contentPolicy: z.literal('lengths-and-selection-only-no-input-content'), truncated: z.boolean(),
  events: z.array(NativeInputObservationSchema).max(500),
});
export type NativeInputProtocol = z.infer<typeof NativeInputProtocolSchema>;
