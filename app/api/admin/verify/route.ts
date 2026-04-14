import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth-middleware';
import { getClientIP, isIPAllowed } from '@/lib/ip-whitelist';

export async function GET(request: NextRequest) {
  // IP whitelist check
  const ip = getClientIP(request);
  if (!isIPAllowed(ip, process.env.ADMIN_ALLOWED_IPS)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const auth = await verifyAdminSession(request);
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    secretUrl: process.env.ADMIN_SECRET_URL || 'admin',
  });
}
