import { connection } from 'next/server';
import { BehaviorComparison } from '../../../components/behavior-comparison';
import { readWorkspace } from '../../../lib/read-workspace';
import report from '../../../generated/design-static.json';

export default async function Page() {
  await connection();
  const data = await readWorkspace();
  return <BehaviorComparison data={data} buildId={report.context.buildId} />;
}
