import { z } from 'zod';
import { AuthoringRequestSchema } from '@fluidkit/contracts';
import { AUTHORING_POLICY, getLocalStudioAccess, getLocalProjectStore, workspaceDatasetHash, createDevelopmentProposal, DevelopmentProposalRequestSchema, getConfiguredAuthoring, readBoundedJSON, ReviewError } from '@fluidkit/server';
import { readWorkspace } from '../../../lib/read-workspace';

export const runtime = 'nodejs';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const RequestSchema = z.discriminatedUnion('operation', [
  z.strictObject({ operation: z.literal('generate'), input: AuthoringRequestSchema, datasetHash: z.string().regex(/^[a-f0-9]{64}$/) }),
  z.strictObject({ operation: z.literal('preflight'), input: DevelopmentProposalRequestSchema, datasetHash: z.string().regex(/^[a-f0-9]{64}$/) }),
]);

export async function GET(request: Request) {
  try {
    const session = getLocalStudioAccess().open(request);
    return Response.json({ configured: Boolean(process.env.OPENAI_API_KEY), token: session.token, policy: AUTHORING_POLICY, budget: getLocalProjectStore().budget(session.id) }, { headers: { ...headers, 'Set-Cookie': session.cookie } });
  } catch { return Response.json({ error: 'Lokale Studio-Session nicht verfügbar.' }, { status: 403, headers }); }
}

export async function POST(request: Request) {
  try {
    const sessionId = getLocalStudioAccess().authorize(request);
    const body = RequestSchema.parse(await readBoundedJSON(request, 64000));
    const data = await readWorkspace();
    if (body.datasetHash !== workspaceDatasetHash(data)) throw new ReviewError('Workspace-Daten haben sich geändert. Bitte Studio neu laden; deinen Entwurf vorher lokal speichern.', 409);
    if (body.operation === 'preflight') return Response.json(createDevelopmentProposal({ ...body.input, data }), { headers });
    const controller = new AbortController(), signal = AbortSignal.any([request.signal, controller.signal]);
    const iterator = getConfiguredAuthoring().generate(sessionId, body.input, {
      datasetHash: body.datasetHash, moduleCount: data.modules.length, sourceCount: data.modules.reduce((sum, item) => sum + item.files, 0),
      dependencyCount: new Set(data.modules.flatMap(item => item.dependencies)).size,
    }, signal);
    const encoder = new TextEncoder();
    let canceled = false;
    const stream = new ReadableStream<Uint8Array>({
      async pull(output) {
        try {
          const next = await iterator.next();
          if (canceled) return;
          if (next.done) output.close();
          else output.enqueue(encoder.encode(`${JSON.stringify(next.value)}\n`));
        } catch (error) {
          if (canceled) return;
          output.enqueue(encoder.encode(`${JSON.stringify({ type: 'error', requestId: body.input.id, status: error instanceof ReviewError ? error.status : 502,
            message: error instanceof ReviewError ? error.message.slice(0, 300) : 'Authoring fehlgeschlagen oder abgebrochen. Kein Entwurf übernommen.' })}\n`));
          output.close();
        }
      },
      async cancel() { canceled = true; controller.abort(); await iterator.return(undefined); },
    });
    return new Response(stream, { headers: { ...headers, 'Content-Type': 'application/x-ndjson; charset=utf-8' } });
  } catch (error) {
    return Response.json({ error: error instanceof ReviewError ? error.message : 'Authoring-Anfrage konnte nicht verarbeitet werden.' },
      { status: error instanceof ReviewError ? error.status : error instanceof z.ZodError ? 422 : 502, headers });
  }
}
