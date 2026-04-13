import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
