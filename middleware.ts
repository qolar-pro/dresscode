/**
 * DRESS CODE - Edge Middleware for Admin Security
 *
 * - Blocks ALL access to the old /admin route with a fake 404
 * - Blocks access to the secret admin URL for non-whitelisted IPs
 * - Allowed IPs proceed normally; everyone else sees "Page Not Found"
 * - Also blocks /admin-emergency for non-whitelisted IPs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';

// Paths to protect
const OLD_ADMIN_PATH = '/admin';
const EMERGENCY_PATH = '/admin-emergency';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Block old /admin route for EVERYONE (always return fake 404) ---
  if (
    pathname === OLD_ADMIN_PATH ||
    pathname.startsWith(OLD_ADMIN_PATH + '/')
  ) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // --- Protect secret admin URL ---
  const secretSlug = process.env.ADMIN_SECRET_URL || '';
  if (secretSlug && pathname === `/${secretSlug}`) {
    const ip = getClientIP(request);
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }

  // --- Protect all sub-routes under the secret admin URL ---
  if (secretSlug && pathname.startsWith(`/${secretSlug}/`)) {
    const ip = getClientIP(request);
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }

  // --- Protect emergency fallback route ---
  if (
    pathname === EMERGENCY_PATH ||
    pathname.startsWith(EMERGENCY_PATH + '/')
  ) {
    const ip = getClientIP(request);
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
  }

  // --- Protect admin API routes ---
  if (pathname.startsWith('/api/admin/')) {
    const ip = getClientIP(request);
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.json(
        { error: 'Not Found' },
        { status: 404 }
      );
    }
  }

  return NextResponse.next();
}

// Run middleware on all paths so the secret slug can be matched at runtime.
// The secret slug is only known at runtime via env var, so we can't
// statically list it in the matcher array.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};
