import { ProjectSchema, QualityReportSchema } from '@fluidkit/contracts';
import designReport from '../generated/design-static.json';
import { createProjectProof, createWorkspaceFlow } from '@fluidkit/cases';
import { StudioShowcase } from './studio-showcase';
import { readWorkspace } from '../lib/read-workspace';
import { connection } from 'next/server';

export default async function WorkspacePage({ workshop = false }: { workshop?: boolean }) {
  await connection();
  const data = await readWorkspace();
  const project = ProjectSchema.parse({ schemaVersion: 1, id: 'fluidkit-pro', name: data.name, revision: 0, flows: [createProjectProof(data.name), createWorkspaceFlow(data)], scenarios: [] });
  return <StudioShowcase workshop={workshop} data={data} project={project} staticReport={QualityReportSchema.parse(designReport)} />;
}
