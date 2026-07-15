/**
 * SNEAKER AIR — Edge Middleware for Admin Security
 *
 * Layered admin protection (all failures return a fake 404 so nothing about the
 * admin area is discoverable):
 *   1. /admin (and any subpath) is ALWAYS a fake 404 for everyone.
 *   2. The secret admin slug + every /api/admin/* route require a valid trusted-
 *      device cookie (set via /api/admin/enroll?key=…). Without it → fake 404,
 *      so even someone who learns the slug can't reach the login screen or any
 *      admin API from a non-enrolled device.
 *   3. Optional IP allowlist (ADMIN_ALLOWED_IPS) as an additional layer.
 *   4. /api/admin/enroll is exempt from 2 & 3 (it authenticates via the secret
 *      key itself + rate limiting) so new devices can be bootstrapped anywhere.
 *
 * The /admin-emergency master-password backdoor was removed entirely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';
import { ADMIN_DEVICE_COOKIE, deviceCookieValid } from '@/lib/admin-device';

const OLD_ADMIN_PATH = '/admin';
const ENROLL_PATH = '/api/admin/enroll';

function rewriteTo404(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/not-found';
  url.search = '';
  // Serve the not-found UI but with a real 404 status so a blocked admin slug
  // is byte-for-byte indistinguishable from any genuinely missing route.
  return NextResponse.rewrite(url, { status: 404 });
}

function json404() {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

function deviceAllowed(request: NextRequest): boolean {
  return deviceCookieValid(request.cookies.get(ADMIN_DEVICE_COOKIE)?.value);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Old /admin route → fake 404 for everyone.
  if (pathname === OLD_ADMIN_PATH || pathname.startsWith(OLD_ADMIN_PATH + '/')) {
    return rewriteTo404(request);
  }

  // 4. Enrollment endpoint bootstraps new devices — it authenticates itself via
  //    the secret key, so it must NOT be gated by device/IP here.
  if (pathname === ENROLL_PATH || pathname.startsWith(ENROLL_PATH + '/')) {
    return NextResponse.next();
  }

  const ip = getClientIP(request);

  // 2/3. Secret admin slug (pages).
  const secretSlug = process.env.ADMIN_SECRET_URL || '';
  if (secretSlug) {
    if (pathname === `/${secretSlug}` || pathname.startsWith(`/${secretSlug}/`)) {
      if (!deviceAllowed(request)) return rewriteTo404(request);
      if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) return rewriteTo404(request);
    }
  }

  // 2/3. Admin API routes.
  if (pathname.startsWith('/api/admin/')) {
    if (!deviceAllowed(request)) return json404();
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) return json404();
  }

  return NextResponse.next();
}

// Run middleware on all paths so the secret slug can be matched at runtime.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$|images/).*)',
  ],
};
