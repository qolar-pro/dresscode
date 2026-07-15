import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { serialize } from 'cookie';
import { createSession, SESSION_TTL, generateSessionToken } from '@/lib/admin-sessions';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';

// Password hash read from environment variable at request time (not module load)

// Rate limiting for login attempts (IP-based). Pinned to globalThis so the
// 5-attempt lockout is shared across route-bundle instances in one process.
const loginAttempts: Map<string, { count: number; resetTime: number; blockedUntil: number }> =
  (globalThis as any).__saLoginAttempts ?? ((globalThis as any).__saLoginAttempts = new Map());

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetTime: now, blockedUntil: 0 };

  // If blocked and block period hasn't ended
  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  // Reset if window expired
  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 15 * 60 * 1000; // 15 minute window
    entry.blockedUntil = 0;
  }

  entry.count += 1;

  // Block for 15 minutes after 5 failed attempts
  if (entry.count >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000;
    entry.count = 0;
    loginAttempts.set(ip, entry);
    return { allowed: false, retryAfter: 900 };
  }

  loginAttempts.set(ip, entry);
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    // IP whitelist check
    const ip = getClientIP(request);
    if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
    if (!ADMIN_PASSWORD_HASH) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Rate limiting (reuse ip from whitelist check above)
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfter || 900) },
        }
      );
    }

    // Verify password using bcrypt (secure, slow by design)
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Create secure session token (durable in Supabase, in-memory in local dev)
    const sessionToken = generateSessionToken();
    await createSession(sessionToken);

    // Set HttpOnly, Secure, SameSite cookie
    const cookie = serialize('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_TTL / 1000,
      path: '/',
    });

    // Do NOT return the slug — the client already knows it from the URL it's on.
    const response = NextResponse.json({ success: true });
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
