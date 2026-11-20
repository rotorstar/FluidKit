import { readFile } from 'node:fs/promises';
import { ProjectSchema } from '@fluidkit/contracts';
import { runScenario } from '@fluidkit/testing';
const [command, file] = process.argv.slice(2);
if (!file || (command !== 'validate' && command !== 'test')) {
  console.info('Fluid contract preview\nUsage: npm run fluid -- <validate|test> project.json');
  process.exitCode = 1;
} else {
  try {
    const project = ProjectSchema.parse(JSON.parse(await readFile(file, 'utf8')));
    if (command === 'validate') console.info(`Valid project: ${project.name} (${project.flows.length} flows)`);
    else {
      const results = project.scenarios.map(scenario => {
        const flow = project.flows.find(item => item.id === scenario.flowId);
        if (!flow) throw new Error(`Missing flow ${scenario.flowId}`);
        return { id: scenario.id, ...runScenario(flow, scenario) };
      });
      console.info(JSON.stringify(results, null, 2));
      if (results.length === 0 || results.some(result => !result.passed)) process.exitCode = 1;
    }
  } catch (error) { console.error(error instanceof Error ? error.message : 'Invalid project'); process.exitCode = 1; }
}
