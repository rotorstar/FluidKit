import { StudioText } from '../../../components/studio-locale';
import { connection } from 'next/server';
import { M8WorkspaceQualification } from '../../../components/m8-workspace-qualification';
import { readWorkspace } from '../../../lib/read-workspace';
import report from '../../../generated/design-static.json';
import '../../../components/rehearsal-workshop.css';
import '../m7/qualification.css';

export default async function Page() {
  await connection();
  return <main className="m7-qualification">
    <header><p className="eyebrow"><StudioText id="m8Header"/></p><h1><StudioText id="m8Heading"/></h1><p><StudioText id="m8Intro"/></p></header>
    <M8WorkspaceQualification data={await readWorkspace()} buildId={report.context.buildId}/>
  </main>;
}
