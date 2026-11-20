import { z } from 'zod';
import { findLocalProjectRoot, getLocalStudioAccess, readAcceptanceEvidence, ReviewError } from '@fluidkit/server';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" };
export async function GET(request: Request) {
  try {
    getLocalStudioAccess().open(request); // loopback host/origin boundary, no arbitrary URL proxy
    const query = new URL(request.url).searchParams;
    const id = z.string().regex(/^[A-Z0-9-]+$/).parse(query.get('criterion'));
    const index = z.coerce.number().int().nonnegative().max(1000).parse(query.get('index'));
    const file = await readAcceptanceEvidence(findLocalProjectRoot(), id, index);
    return new Response(new Uint8Array(file.bytes), { headers: { ...headers, 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename="${file.filename}"`, 'X-Fluid-Evidence-Sha256': file.sha256 } });
  } catch (error) { return Response.json({ error: error instanceof ReviewError ? error.message : 'Nachweis nicht lesbar oder ungültig.' }, { status: error instanceof ReviewError ? error.status : 404, headers }); }
}
