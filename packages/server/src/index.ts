import { FlowDefinitionSchema } from '@fluidkit/contracts';
export * from './ai-review';
export * from './review-access';
export * from './ai-authoring';
export * from './development-proposal';
export function validateFlow(input: unknown) {
  const flow = FlowDefinitionSchema.parse(input);
  return { valid: true as const, states: Object.keys(flow.states).length, transitions: Object.values(flow.states).reduce((sum, state) => sum + Object.keys(state.on).length, 0) };
}
export * from './local-project';
export * from './local-access';
export * from './evidence-files';
