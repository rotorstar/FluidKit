import type { DecisionPlan, RuntimeSnapshot } from '@fluidkit/contracts';
export * from './workspace-intent';

/** Providers suggest actions. The host and Core retain control of the transition. */
export interface DecisionProvider {
  propose(context: { snapshot: RuntimeSnapshot; allowedEvents: readonly string[]; signal: AbortSignal }): Promise<DecisionPlan | null>;
}
