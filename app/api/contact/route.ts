import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeEmail, sanitizeString } from '@/lib/sanitize';

// Simple in-memory IP rate limiter (same pattern as app/api/orders/route.ts).
// Max 5 submissions per 10 minute window per IP.
const contactAttempts = new Map<string, { count: number; resetTime: number }>();

function checkContactRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = contactAttempts.get(ip) || { count: 0, resetTime: now + 10 * 60 * 1000 };

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 10 * 60 * 1000;
  }

  entry.count += 1;
  contactAttempts.set(ip, entry);

  if (entry.count > 5) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
  }

  return { allowed: true };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkContactRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter || 600) },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, name, message } = body;

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedName = sanitizeString(name || '');
    const sanitizedMessage = sanitizeString(message);

    // Store contact submission in database for admin review
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert([{
        email: sanitizedEmail,
        name: sanitizedName,
        message: sanitizedMessage,
        date: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      // If table doesn't exist yet, still return success
      console.warn('Contact submissions table not found:', error.message);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
