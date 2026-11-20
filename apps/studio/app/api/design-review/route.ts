import { getLocalStudioAccess, getLocalProjectStore, getConfiguredReview, readBoundedJSON, ReviewError, REVIEW_POLICY, reviewProviderLabel } from '@fluidkit/server';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export async function GET(request: Request) {
  try {
    const session = getLocalStudioAccess().open(request);
    try {
      const configured = await getConfiguredReview();
      return Response.json({ configured: true, token: session.token, provider: reviewProviderLabel(), model: configured.quote.id, reservationUsd: configured.quote.reservationMicros / 1e6, policy: REVIEW_POLICY, scope: 'local-project', budget: getLocalProjectStore().budget(session.id) }, { headers: { ...headers, 'Set-Cookie': session.cookie } });
    } catch (error) {
      return Response.json({ configured: false, token: session.token, reason: error instanceof ReviewError ? error.message : 'Modellkonfiguration konnte nicht qualifiziert werden.', provider: reviewProviderLabel(), model: null, policy: REVIEW_POLICY, scope: 'local-project', budget: getLocalProjectStore().budget(session.id) }, { headers: { ...headers, 'Set-Cookie': session.cookie } });
    }
  } catch { return Response.json({ error: 'Studio-Session nicht verfügbar.' }, { status: 403, headers }); }
}
export async function POST(request: Request) {
  try {
    const sessionId = getLocalStudioAccess().authorize(request);
    const input = await readBoundedJSON(request);
    const configured = await getConfiguredReview();
    const result = await configured.service.review(sessionId, input, request.signal);
    return Response.json(result, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof ReviewError ? error.message : error instanceof ZodError ? 'Review-Vertrag ungültig.' : 'AI-Review fehlgeschlagen oder abgebrochen. Keine automatische Änderung ausgeführt.' }, { status: error instanceof ReviewError ? error.status : error instanceof ZodError ? 422 : 502, headers });
  }
}
