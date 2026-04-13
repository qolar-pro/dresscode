import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Return the metadata we stored (orderId)
    return NextResponse.json({
      metadata: session.metadata,
      status: session.status,
      payment_status: session.payment_status,
    });
  } catch (error: any) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
