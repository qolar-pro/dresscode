import { NextRequest, NextResponse } from 'next/server';
import { sessions, SESSION_TTL } from '@/lib/admin-sessions';

export async function verifyAdminSession(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  // Get session cookie
  const sessionCookie = request.cookies.get('admin_session');

  if (!sessionCookie) {
    return { valid: false, error: 'Not authenticated' };
  }

  const sessionToken = sessionCookie.value;
  const session = sessions.get(sessionToken);

  if (!session) {
    return { valid: false, error: 'Invalid session' };
  }

  // Check if session expired
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(sessionToken);
    return { valid: false, error: 'Session expired' };
  }

  return { valid: true };
}

export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const auth = await verifyAdminSession(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }
  return null; // Authenticated, proceed
}
