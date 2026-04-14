/**
 * Admin Emergency Endpoint
 *
 * POST: Emergency login with master password
 * PATCH: Update IP whitelist with new IPs
 *
 * Both operations verify the master password first.
 * IP whitelisting is handled by middleware.
 */

import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { sessions, SESSION_TTL, generateSessionToken } from '@/lib/admin-sessions';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';

export async function POST(request: NextRequest) {
  try {
    const { masterPassword } = await request.json();

    if (!masterPassword) {
      return NextResponse.json({ error: 'Master password is required' }, { status: 400 });
    }

    // Verify master password
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return NextResponse.json({ error: 'Invalid master password' }, { status: 401 });
    }

    // Create session
    const sessionToken = generateSessionToken();
    sessions.set(sessionToken, { createdAt: Date.now() });

    const cookie = serialize('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL / 1000,
      path: '/',
    });

    const response = NextResponse.json({
      success: true,
      secretUrl: process.env.ADMIN_SECRET_URL || 'admin',
    });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { masterPassword, newIPs } = await request.json();

    if (!masterPassword) {
      return NextResponse.json({ error: 'Master password is required' }, { status: 400 });
    }

    // Verify master password
    if (masterPassword !== process.env.ADMIN_MASTER_PASSWORD) {
      return NextResponse.json({ error: 'Invalid master password' }, { status: 401 });
    }

    if (!newIPs) {
      return NextResponse.json({ error: 'New IPs are required' }, { status: 400 });
    }

    // Note: In serverless (Vercel), env vars can't be modified at runtime.
    // This endpoint logs the new IPs for the admin to manually add to Vercel dashboard.
    // For production, use a database or Redis to store the whitelist.
    console.log('🚨 EMERGENCY IP WHITELIST UPDATE REQUEST');
    console.log('New IPs to add:', newIPs);
    console.log('Please add these IPs to ADMIN_ALLOWED_IPS in Vercel dashboard');

    return NextResponse.json({
      success: true,
      message: 'IPs logged for manual update. Add them to Vercel environment variables.',
      newIPs,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
