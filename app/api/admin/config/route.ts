/**
 * Admin Config Endpoint
 * 
 * Returns the secret admin URL slug to client-side components.
 * This is safe to expose - the slug itself is not a secret,
 * IP whitelisting in middleware.ts handles access control.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const secretUrl = process.env.ADMIN_SECRET_URL || 'admin';

  return NextResponse.json({
    secretUrl,
    emergencyEnabled: !!process.env.ADMIN_MASTER_PASSWORD,
  });
}
