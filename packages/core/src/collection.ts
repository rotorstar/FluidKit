import { createSelection, definePrimitive } from '@ui-sdk/core';
import type { Locale } from '@fluidkit/i18n';
import type { ChangeReason } from '@fluidkit/contracts';

/** Callbacks always read the authoritative Core snapshot; this adapter owns no domain values. */
export type CollectionBehaviorConfig = {
  getKeys(): readonly string[];
  setKeys(keys: string[], reason: ChangeReason): boolean;
  /** The currently visible order, after sorting and filtering. */
  getOrder(): readonly string[];
  getLabel(key: string): string;
  getLocale?(): Locale;
  isSelectable?(key: string): boolean;
  now?(): number;
};

export type CollectionTypeaheadInput = {
  currentKey?: string | null;
  time?: number;
  composing?: boolean;
  editing?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
};

const TYPEAHEAD_TIMEOUT_MS = 500;
const MAX_QUERY_LENGTH = 128;
const sameKeys = (left: readonly string[], right: readonly string[]) => left.length === right.length && left.every((key, index) => key === right[index]);
const normalize = (value: string, locale: Locale) => value.toLocaleLowerCase(locale).normalize('NFKD').replace(/\p{M}/gu, '').trim();

/**
 * Public UI SDK selection rules behind a controlled projection.
 * definePrimitive supplies the public Store/lifecycle context; no parts bind to DOM.
 * Only setKeys can commit. sync() publishes authoritative values to the SDK and
 * resets an external selection's range anchor. Call it after every Core update;
 * operations also synchronize themselves, including hosts that omit notification.
 *
 * Upstream createTypeahead unconditionally schedules global setTimeout and has no
 * clock adapter. It is intentionally not used: this bounded implementation takes
 * explicit time, owns no timer and is reproducible in replay/server environments.
 */
export function createCollectionBehavior(config: CollectionBehaviorConfig) {
  let disposed = false;
  let operationAccepted = true;
  let operationActive = false;
  let query = '';
  let lastCharacter = '';
  let stepping = false;
  let lastInputAt: number | null = null;

  function selectable(key: string) {
    return config.getOrder().includes(key) && (config.isSelectable?.(key) ?? true);
  }

  function makeProjection() {
    const primitive = definePrimitive({
      name: 'fluid-collection-selection',
      options: { value: 'list' },
      state: (options: { value: string[] }) => ({ value: options.value }),
      sync: (options) => ({ value: options.value }),
      api: (context) => createSelection(context, {
        key: 'value',
        multiple: () => true,
        order: () => config.getOrder(),
        selectable,
        set(next, details: { reason: ChangeReason }) {
          // A true return is synchronous acknowledgment, not an optimistic request.
          operationAccepted = config.setKeys([...next], details.reason) && sameKeys(config.getKeys(), next);
          if (operationAccepted) sync();
          return operationAccepted;
        },
      }),
      slots: () => ({}),
    });
    return primitive({ id: 'fluid-collection-selection', value: [...config.getKeys()] });
  }

  let projection = makeProjection();

  function resetProjection() {
    projection.destroy();
    projection = makeProjection();
  }

  function sync() {
    if (disposed) return;
    projection.setOptions({ id: 'fluid-collection-selection', value: [...config.getKeys()] });
    const anchor = projection.api.anchor();
    if (!operationActive && anchor !== null && !selectable(anchor)) resetProjection();
  }

  function execute(action: () => void) {
    if (disposed || operationActive) return false;
    sync();
    const anchor = projection.api.anchor();
    operationAccepted = true;
    operationActive = true;
    try {
      action();
      return operationAccepted;
    } catch (error) {
      operationAccepted = false;
      throw error;
    } finally {
      operationActive = false;
      // The SDK can establish an initial range anchor before asking set(). A
      // rejected first range must not retain that tentative interaction state.
      if (!disposed) {
        if (!operationAccepted && projection.api.anchor() !== anchor) resetProjection();
        sync();
      }
    }
  }

  function resetTypeahead() {
    query = '';
    lastCharacter = '';
    stepping = false;
    lastInputAt = null;
  }

  return {
    sync,
    select(key: string, reason: ChangeReason = 'keyboard') {
      if (disposed || !selectable(key)) return false;
      return execute(() => projection.api.choose(key, { reason }));
    },
    toggle(key: string, reason: ChangeReason = 'keyboard') {
      if (disposed || !selectable(key)) return false;
      return execute(() => projection.api.toggle(key, { reason }));
    },
    range(key: string, options: { from?: string | null; additive?: boolean; reason?: ChangeReason } = {}) {
      if (disposed || !selectable(key)) return false;
      return execute(() => projection.api.extend(key, {
        reason: options.reason ?? 'keyboard',
        from: options.from && selectable(options.from) ? options.from : null,
        additive: options.additive ?? false,
      }));
    },
    selectAll(reason: ChangeReason = 'keyboard') {
      return execute(() => {
        const keys = config.getKeys();
        if (config.getOrder().filter(selectable).some(key => !keys.includes(key))) projection.api.toggleAll({ reason });
      });
    },
    getAnchor() {
      sync();
      return disposed ? null : projection.api.anchor();
    },
    resetTypeahead,
    /** Returns a focus candidate only; it never changes selection or browser focus. */
    typeahead(key: string, input: CollectionTypeaheadInput = {}): string | null {
      if (disposed) return null;
      if (input.composing || input.editing) { resetTypeahead(); return null; }
      if (input.ctrlKey || input.metaKey || input.altKey || Array.from(key).length !== 1) return null;
      const time = input.time ?? config.now?.();
      if (time === undefined || !Number.isFinite(time)) throw new Error('Collection typeahead requires a finite explicit clock value');
      if (lastInputAt !== null && (time < lastInputAt || time - lastInputAt >= TYPEAHEAD_TIMEOUT_MS)) resetTypeahead();
      if (key === ' ' && !query) return null;
      const language = config.getLocale?.() ?? 'de';
      const character = normalize(key,language) || (key === ' ' ? ' ' : '');
      if (!character) return null;
      if (query.length + character.length > MAX_QUERY_LENGTH) resetTypeahead();
      stepping = character === lastCharacter && (stepping || query.length === 1);
      lastCharacter = character;
      query += character;
      lastInputAt = time;
      const keys = config.getOrder().filter(selectable);
      const current = input.currentKey ? keys.indexOf(input.currentKey) : -1;
      function scan(prefix: string, start: number) {
        for (let offset = 0; offset < keys.length; offset++) {
          const candidate = keys[((start + offset) % keys.length + keys.length) % keys.length];
          if (candidate !== undefined && normalize(config.getLabel(candidate),language).startsWith(prefix)) return candidate;
        }
        return null;
      }
      return stepping
        ? scan(query, Math.max(current, 0)) ?? scan(character, current + 1)
        : scan(query, query.length === 1 ? current + 1 : Math.max(current, 0));
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      resetTypeahead();
      projection.destroy();
    },
  };
}
