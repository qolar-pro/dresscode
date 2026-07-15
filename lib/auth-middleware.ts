import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/admin-sessions';

export async function verifyAdminSession(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const sessionCookie = request.cookies.get('admin_session');
  if (!sessionCookie) {
    return { valid: false, error: 'Not authenticated' };
  }

  // getSession returns null for missing OR expired sessions (it self-cleans).
  const session = await getSession(sessionCookie.value);
  if (!session) {
    return { valid: false, error: 'Invalid session' };
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
