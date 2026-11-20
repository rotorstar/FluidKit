import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { architectureReviewModule } from '@fluidkit/cases';
import { FlowExplorer } from '../../../components/flow-explorer';
import report from '../../../generated/design-static.json';
import { readWorkspace } from '../../../lib/read-workspace';

export const metadata = { title: 'Flow Explorer · Fluid Studio', description: 'Ein ausführbarer lokaler Architektur-Review mit WebGPU-Graph, echten Workspace-Daten und Mermaid-Vertrag.' };
export default async function FlowExplorerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const [data, query] = await Promise.all([readWorkspace(), searchParams]);
  if (Array.isArray(query.module) || query.case !== undefined && query.case !== 'architecture-review') notFound();
  let module;
  try { module = architectureReviewModule(data, query.module); } catch { notFound(); }
  return <FlowExplorer key={module.id} data={data} moduleId={module.id} buildId={report.context.buildId}/>;
}
