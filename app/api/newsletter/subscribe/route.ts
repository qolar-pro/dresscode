import { NextRequest, NextResponse } from 'next/server';
import { sanitizeEmail } from '@/lib/sanitize';

// Simple in-memory IP rate limiter (same pattern as app/api/contact/route.ts).
// Max 5 subscribe attempts per 10 minute window per IP.
const subscribeAttempts = new Map<string, { count: number; resetTime: number }>();

function checkSubscribeRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = subscribeAttempts.get(ip) || { count: 0, resetTime: now + 10 * 60 * 1000 };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 10 * 60 * 1000;
  }

  entry.count += 1;
  subscribeAttempts.set(ip, entry);

  if (entry.count > 5) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }

  return { allowed: true };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = checkSubscribeRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter || 600) } }
    );
  }

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);

    // Store newsletter subscription in Supabase
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert([{
        email: sanitizedEmail,
        subscribed_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      // If email already exists, that's fine
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed' });
      }
      // If table doesn't exist, log but still return success
      console.warn('Newsletter subscribers table not found:', error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
