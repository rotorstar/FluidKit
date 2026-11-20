import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, LOCALE_HEADER, pathLocale, requestLocale, studioHref } from './lib/locale-routing';

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const explicit = pathLocale(url.pathname);
  if (explicit) {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, explicit);
    return NextResponse.next({ request: { headers } });
  }
  const locale = requestLocale(request.cookies.get(LOCALE_COOKIE)?.value, request.headers.get('accept-language'));
  url.pathname = studioHref(url.pathname, locale);
  const response = NextResponse.redirect(url, 307);
  response.headers.set('Vary', 'Accept-Language, Cookie');
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

// All Studio pages live under /studio; assets, APIs, handbooks and unknown
// language prefixes take their normal routes (including the localized 404 link).
export const config = { matcher: ['/', '/studio/:path*', '/:locale(de|en|fr)', '/:locale(de|en|fr)/studio/:path*'] };
