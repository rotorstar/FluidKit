import { connection } from 'next/server';
import { QualityReportSchema } from '@fluidkit/contracts';
import { RehearsalWorkshop } from '../../../components/rehearsal-workshop';
import { readWorkspace } from '../../../lib/read-workspace';
import report from '../../../generated/design-static.json';

export default async function Page() {
  await connection();
  return <RehearsalWorkshop data={await readWorkspace()} staticReport={QualityReportSchema.parse(report)}/>;
}
