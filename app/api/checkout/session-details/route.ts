import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy Stripe init: constructing `new Stripe(...)` at module load time throws
// if STRIPE_SECRET_KEY is missing, which crashes the build/deploy. Deferring
// construction into the handler means a missing key only fails the request.
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      metadata: session.metadata,
      status: session.status,
      payment_status: session.payment_status,
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
