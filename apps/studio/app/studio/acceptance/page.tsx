import { StudioLink, StudioText } from '../../../components/studio-locale';
import { AcceptanceBrowser } from '../../../components/acceptance-browser';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { connection } from 'next/server';
import { AcceptanceLedgerSchema, QualityReportSchema } from '@fluidkit/contracts';
import { createProjectProof } from '@fluidkit/cases';
import { readWorkspace } from '../../../lib/read-workspace';
import { LifecycleProof } from '../../../components/lifecycle-proof';
import designReport from '../../../generated/design-static.json';

export default async function AcceptancePage() {
  await connection();
  const root = resolve(process.cwd(), '../..');
  const [raw, data] = await Promise.all([readFile(resolve(root, 'docs/acceptance/ledger.json'), 'utf8'), readWorkspace()]);
  const ledger = AcceptanceLedgerSchema.parse(JSON.parse(raw)), buildId = QualityReportSchema.parse(designReport).context.buildId;
  const verified = ledger.criteria.filter(item => item.status === 'verified').length;
  return <main className="acceptance-page"><StudioLink className="outline-button" href="/"><StudioText id="toShowcase"/></StudioLink><h1><StudioText id="acceptTitle"/></h1>
    <p><StudioText id="acceptCount" values={{count:ledger.criteria.length,verified}}/></p>
    <p><StudioText id="acceptHint"/> <code>{buildId}</code></p>
    <LifecycleProof flow={createProjectProof(data.name)} buildId={buildId} />
    <AcceptanceBrowser ledger={ledger} />
  </main>;
}
