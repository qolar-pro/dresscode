import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve metadata we stored during session creation
    const orderId = session.metadata?.orderId;
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    // In a real app, you'd retrieve line items via Stripe API here to build the 'items' array
    // For now, we save the core order record with 'completed' status
    if (orderId) {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'completed',
          payment_method: 'stripe',
          total: totalAmount,
          subtotal: totalAmount, // simplified
          shipping: 0,
          payment_fee: 0,
          customer: {
            email: customerEmail,
            name: customerName,
          },
        })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order status:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
