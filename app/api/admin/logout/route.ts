import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { sessions } from '@/lib/admin-sessions';

export async function POST(request: NextRequest) {
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
