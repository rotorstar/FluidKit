import { workspaceDatasetHash } from '@fluidkit/server';
import { connection } from 'next/server';
import { AuthoringWorkshop } from '../../../components/authoring-workshop';
import { readWorkspace } from '../../../lib/read-workspace';
export default async function Page() {
  await connection();
  const data = await readWorkspace();
  return <AuthoringWorkshop data={data} datasetHash={workspaceDatasetHash(data)} />;
}
