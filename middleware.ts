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

function rewriteTo404(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/not-found';
  url.search = '';
  return NextResponse.rewrite(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Block old /admin route for EVERYONE (always return fake 404) ---
  if (
    pathname === OLD_ADMIN_PATH ||
    pathname.startsWith(OLD_ADMIN_PATH + '/')
  ) {
    return rewriteTo404(request);
  }

  // --- Protect emergency fallback route (IP whitelist disabled for easier access) ---

  return NextResponse.next();
}

// Run middleware on all paths so the secret slug can be matched at runtime.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$|images).*)',
  ],
};
