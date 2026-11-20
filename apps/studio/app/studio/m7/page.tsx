import { StudioText } from '../../../components/studio-locale';
import { connection } from 'next/server';
import { M7WorkspaceQualification } from '../../../components/m7-workspace-qualification';
import { M7SurfaceQualification } from '../../../components/m7-surface-qualification';
import { readWorkspace } from '../../../lib/read-workspace';
import report from '../../../generated/design-static.json';
import '../../../components/rehearsal-workshop.css';
import './qualification.css';

export default async function Page() {
  await connection();
  return <main className="m7-qualification">
    <header><p className="eyebrow"><StudioText id="m7Header"/></p><h1><StudioText id="m7Heading"/></h1><p><StudioText id="m7Intro"/></p></header>
    <M7WorkspaceQualification data={await readWorkspace()} buildId={report.context.buildId}/>
    <M7SurfaceQualification buildId={report.context.buildId}/>
  </main>;
}
