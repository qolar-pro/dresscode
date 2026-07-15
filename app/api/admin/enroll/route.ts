import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { ADMIN_DEVICE_COOKIE, timingSafeEqual } from '@/lib/admin-device';

export const runtime = 'nodejs';

// Enrollment is rate-limited per-IP as a backstop (the secret is high-entropy,
// so brute force is already infeasible, but this bounds abuse).
const attempts: Map<string, { count: number; resetTime: number }> =
  (globalThis as any).__saEnrollAttempts ?? ((globalThis as any).__saEnrollAttempts = new Map());
function limited(ip: string): boolean {
  const now = Date.now();
  const e = attempts.get(ip) || { count: 0, resetTime: now + 10 * 60 * 1000 };
  if (now > e.resetTime) {
    e.count = 0;
    e.resetTime = now + 10 * 60 * 1000;
  }
  e.count += 1;
  attempts.set(ip, e);
  return e.count > 10;
}

/**
 * GET /api/admin/enroll?key=<ADMIN_DEVICE_SECRET>
 * On the correct key, sets the trusted-device cookie on THIS device.
 * Always returns a bland 404 on any failure so the endpoint's existence and the
 * validity of the key are never revealed.
 */
export async function GET(request: NextRequest) {
  const notFound = () => new NextResponse('Not Found', { status: 404 });

  const secret = process.env.ADMIN_DEVICE_SECRET || '';
  const token = process.env.ADMIN_DEVICE_TOKEN || '';
  if (!secret || !token) return notFound(); // gate not configured

  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown';
  if (limited(ip)) return notFound();

  const key = request.nextUrl.searchParams.get('key') || '';
  if (!timingSafeEqual(key, secret)) return notFound();

  const cookie = serialize(ADMIN_DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Device enrolled</title></head><body style="font-family:system-ui,-apple-system,sans-serif;background:#030309;color:#f2f2f7;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center;max-width:340px;padding:24px"><div style="font-size:40px">✓</div><h1 style="font-weight:600;margin:12px 0 6px">Device enrolled</h1><p style="color:#9a9aaf;line-height:1.6;margin:0">This device can now reach the admin area. You can close this tab.</p></div></body></html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
