import { NextRequest, NextResponse } from 'next/server';
import { sanitizeEmail } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
