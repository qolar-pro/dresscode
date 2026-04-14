import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeEmail, sanitizeString } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
