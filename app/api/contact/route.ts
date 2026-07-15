import { NextRequest, NextResponse } from 'next/server';
import { contactsDb } from '@/lib/db';
import { sanitizeEmail, sanitizeString } from '@/lib/sanitize';
import { getClientIP } from '@/lib/ip-whitelist';

// IP rate limiter, pinned to globalThis so it's shared across route bundles.
// Max 5 submissions per 10 minute window per IP.
const contactAttempts: Map<string, { count: number; resetTime: number }> =
  (globalThis as any).__saContactAttempts ?? ((globalThis as any).__saContactAttempts = new Map());

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
  const ip = getClientIP(request);
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

    // Store contact submission for admin review (Supabase or local store).
    await contactsDb.add({
      email: sanitizedEmail,
      name: sanitizedName,
      message: sanitizedMessage,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
