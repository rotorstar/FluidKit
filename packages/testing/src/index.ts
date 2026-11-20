import { createFluidRuntime } from '@fluidkit/core';
import { ScenarioDefinitionSchema, type FlowDefinition, type ScenarioDefinition } from '@fluidkit/contracts';
export * from './sequence';

export function createTestClock(initial = 0) {
  let time = initial;
  return { now: () => time, advance(ms: number) { if (ms < 0) throw new Error('Clock cannot move backwards'); time += ms; }, set(ms: number) { if (ms < time) throw new Error('Clock cannot move backwards'); time = ms; } };
}
export function runScenario(flow: FlowDefinition, input: ScenarioDefinition) {
  const scenario = ScenarioDefinitionSchema.parse(input);
  if (scenario.flowId !== flow.id) throw new Error('Scenario/flow mismatch');
  const clock = createTestClock();
  const runtime = createFluidRuntime({ flow, clock, replay: true });
  const outcomes = scenario.events.map(event => { clock.set(event.timestamp); return runtime.dispatch({ ...event, source: 'replay' }); });
  const snapshot = runtime.getSnapshot();
  const failures: string[] = [];
  if (snapshot.state !== scenario.expectedState) failures.push(`Expected ${scenario.expectedState}, received ${snapshot.state}`);
  for (const [key, value] of Object.entries(scenario.expectedFields)) if (snapshot.fields[key] !== value) failures.push(`Field mismatch: ${key}`);
  if (outcomes.some(result => !result.accepted)) failures.push('At least one event was rejected');
  const result = { passed: failures.length === 0, failures, snapshot, trace: runtime.getTrace() };
  runtime.dispose(); return result;
}

export * from './workspace-qualification';
