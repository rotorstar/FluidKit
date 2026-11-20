import type { DecisionPlan, RuntimeSnapshot } from '@fluidkit/contracts';
/** Implementations run outside Core. M1 uses explicit simulated plans, never a live model. */
export interface DecisionProvider {
  propose(context: { snapshot: RuntimeSnapshot; allowedEvents: readonly string[]; signal: AbortSignal }): Promise<DecisionPlan | null>;
}
