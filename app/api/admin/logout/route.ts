import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { sessions } from '@/lib/admin-sessions';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';

export async function POST(request: NextRequest) {
  // IP whitelist check
  const ip = getClientIP(request);
  if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  // Delete server-side session
  const sessionCookie = request.cookies.get('admin_session');
  if (sessionCookie) {
    sessions.delete(sessionCookie.value);
  }

  // Clear client cookie
  const cookie = serialize('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookie);

  return response;
}
