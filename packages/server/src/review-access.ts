import { randomBytes, timingSafeEqual } from 'node:crypto';
import { ReviewError } from './review-policy';

export function createLocalReviewAccess(now = Date.now, scope = { cookie: 'fluid_review', path: '/api/design-review', header: 'x-fluid-review-token' }, store?: { get(id: string): { token: string; expires: number } | undefined; set(id: string, value: { token: string; expires: number }): void }) {
  if (!/^[a-z_]+$/.test(scope.cookie) || !/^\/api(?:\/[a-z-]+)?$/.test(scope.path) || !/^x-fluid-[a-z-]+$/.test(scope.header)) throw new Error('Invalid local access scope');
  const sessions = new Map<string, { token: string; expires: number }>();
  function origin(request: Request, write: boolean) {
    const url = new URL(request.url), supplied = request.headers.get('origin');
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new ReviewError('Dieser Reviewadapter ist nur für das lokale Studio freigegeben.', 403);
    // NextURL normalizes 127.0.0.1/[::1] to localhost. The browser Origin still
    // uses the actual Host authority. Only a strict loopback Host on this port
    // is accepted; forwarded headers never grant access or widen the allowlist.
    const authority = request.headers.get('host') ?? url.host;
    let browserURL: URL;
    try { browserURL = new URL(`${url.protocol}//${authority}`); } catch { throw new ReviewError('Host rejected', 403); }
    if (browserURL.host !== authority || !['127.0.0.1', 'localhost', '[::1]'].includes(browserURL.hostname) || browserURL.port !== url.port) throw new ReviewError('Host rejected', 403);
    if ((write && supplied !== browserURL.origin) || (supplied && supplied !== browserURL.origin) || request.headers.get('sec-fetch-site') === 'cross-site') throw new ReviewError('Origin rejected', 403);
  }
  function cookieId(request: Request) { return request.headers.get('cookie')?.split(';').map(part => part.trim()).find(part => part.startsWith(`${scope.cookie}=`))?.slice(scope.cookie.length + 1); }
  return {
    open(request: Request) {
      origin(request, false);
      for (const [id, session] of sessions) if (session.expires <= now()) sessions.delete(id);
      let id = cookieId(request), session = id ? (store ?? sessions).get(id) : undefined;
      if (session && session.expires <= now()) session = undefined;
      if (!session) {
        if (sessions.size >= 4096) throw new ReviewError('Sessionlimit erreicht.', 429);
        id = randomBytes(24).toString('hex'); session = { token: randomBytes(24).toString('hex'), expires: now() + 3_600_000 }; (store ?? sessions).set(id, session);
      }
      return { id: id!, token: session.token, cookie: `${scope.cookie}=${id}; HttpOnly; SameSite=Strict; Path=${scope.path}; Max-Age=${Math.max(0, Math.floor((session.expires - now()) / 1000))}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}` };
    },
    authorize(request: Request) {
      origin(request, true);
      const id = cookieId(request), session = id ? (store ?? sessions).get(id) : undefined;
      const token = request.headers.get(scope.header) ?? '';
      if (!id || !session || session.expires <= now() || !/^[a-f0-9]{48}$/.test(token) || !timingSafeEqual(Buffer.from(token), Buffer.from(session.token))) throw new ReviewError('Review-Session fehlt oder ist abgelaufen.', 403);
      return id;
    },
  };
}
export async function readBoundedJSON(request: Request, maxBytes = 8_500_000): Promise<unknown> {
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ReviewError('JSON erforderlich.', 415);
  if (!request.body) throw new ReviewError('Leerer Request.', 400);
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
  try {
    for (;;) {
      const result = await reader.read(); if (result.done) break;
      bytes += result.value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); throw new ReviewError('Bildbudget überschritten.', 413); }
      chunks.push(result.value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ReviewError('Ungültiges JSON.', 400); }
  } finally { reader.releaseLock(); }
}
