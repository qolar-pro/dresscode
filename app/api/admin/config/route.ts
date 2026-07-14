/**
 * Admin Config Endpoint
 *
 * Returns the secret admin URL slug to client-side components.
 * This is safe to expose - the slug itself is not a secret,
 * IP whitelisting in middleware.ts handles access control.
 *
 * KNOWN TRADEOFF: this route is intentionally left unauthenticated because
 * app/[secret-slug]/layout.tsx and page.tsx (out of scope for this change)
 * fetch it BEFORE login to know which slug to redirect to. Fully gating it
 * behind requireAdmin would break that pre-login flow. Real protection for
 * the admin area comes from IP allow-listing (middleware.ts) + bcrypt login,
 * not from hiding this slug. The `emergencyEnabled` field has been removed
 * since the master-password emergency backdoor it referred to was deleted.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const secretUrl = process.env.ADMIN_SECRET_URL || 'admin';

  return NextResponse.json({
    secretUrl,
  });
}
