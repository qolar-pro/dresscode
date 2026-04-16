import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as any,
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
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // Fetch line items from Stripe to reconstruct order items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });

      const items = lineItems.data.map((item) => ({
        product: {
          id: parseInt(item.price?.metadata?.productId || '0'),
          name: item.description || 'Unknown',
          price: (item.amount_total || 0) / 100 / (item.quantity || 1),
          image: (item as any).images?.[0] || '',
        },
        quantity: item.quantity || 1,
        size: item.price?.metadata?.size || 'M',
        color: item.price?.metadata?.color || '',
      }));

      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

      // IDEMPOTENT: Check if order already exists (webhook may fire multiple times)
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();

      if (existingOrder) {
        // Order exists, just update payment status (don't duplicate)
        const { error } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'completed',
            payment_method: 'stripe',
          })
          .eq('id', orderId);

        if (error) {
          console.error('Failed to update order payment status:', error);
          return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }
      } else {
        // Order doesn't exist, create it
        const { error } = await supabaseAdmin
          .from('orders')
          .insert([{
            id: orderId,
            items: items,
            customer: {
              email: session.customer_details?.email,
              name: session.customer_details?.name,
              phone: session.customer_details?.phone || '',
              address: session.customer_details?.address?.line1 || '',
              city: session.customer_details?.address?.city || '',
              zipCode: session.customer_details?.address?.postal_code || '',
            },
            total: totalAmount,
            subtotal: totalAmount,
            shipping: 0,
            payment_fee: 0,
            payment_method: 'stripe',
            payment_status: 'completed',
            status: 'pending',
            date: new Date().toISOString(),
          }]);

        if (error) {
          console.error('Failed to create order from webhook:', error);
          // Don't return 500 — Stripe will retry. Just log and acknowledge.
        }
      }
    }
  }

  // Always return 200 to acknowledge receipt (even for unhandled events)
  return NextResponse.json({ received: true });
}
