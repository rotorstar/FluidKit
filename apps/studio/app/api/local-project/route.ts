import { z } from 'zod';
import { LocalDraftInputSchema, LocalReviewEvidenceSchema } from '@fluidkit/contracts';
import { getLocalStudioAccess, getLocalProjectStore, readBoundedJSON, ReviewError } from '@fluidkit/server';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const Input = z.discriminatedUnion('operation', [
  z.strictObject({ operation: z.literal('save-draft'), input: LocalDraftInputSchema }),
  z.strictObject({ operation: z.literal('save-review'), input: LocalReviewEvidenceSchema }),
  z.strictObject({ operation: z.literal('read-review'), id: z.string().min(1).max(200) }),
]);
export async function GET(request: Request) {
  try { const session = getLocalStudioAccess().open(request), store = getLocalProjectStore(); return Response.json({ token: session.token, drafts: store.drafts(), budget: store.budget(session.id), reviews: store.reviews() }, { headers: { ...headers, 'Set-Cookie': session.cookie } }); }
  catch { return Response.json({ error: 'Lokaler Projektspeicher nicht verfügbar. Bestehende Daten bleiben erhalten.' }, { status: 503, headers }); }
}
export async function POST(request: Request) {
  try {
    getLocalStudioAccess().authorize(request);
    const body = Input.parse(await readBoundedJSON(request)), store = getLocalProjectStore();
    return Response.json(body.operation === 'save-draft' ? store.saveDraft(body.input) : body.operation === 'save-review' ? store.saveReview(body.input) : store.review(body.id), { headers });
  } catch (error) { return Response.json({ error: error instanceof ReviewError ? error.message : 'Lokaler Vertrag oder Speicher ungültig. Kein gültiger Stand wurde überschrieben.' }, { status: error instanceof ReviewError ? error.status : error instanceof z.ZodError ? 422 : 503, headers }); }
}
