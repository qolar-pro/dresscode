import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';
import { productsDb } from '@/lib/db';

// Lazy Stripe init: constructing `new Stripe(...)` at module load time throws
// if STRIPE_SECRET_KEY is missing, which crashes the build/deploy. Deferring
// construction into the handler means a missing key only fails the request.
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe not configured');
  return new Stripe(key, { apiVersion: '2026-03-25.dahlia' as any });
}

export async function POST(request: NextRequest) {
  console.log('[CHECKOUT] Request received');

  try {
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch {
      console.error('[CHECKOUT] STRIPE_SECRET_KEY is not set');
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }
    console.log('[CHECKOUT] Stripe client created');

    const body = await request.json();
    console.log('[CHECKOUT] Body parsed, items count:', body.items?.length);
    
    const { items, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
      return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 });
    }

    // Server-authoritative, unguessable order ID. Never trust a client-supplied
    // orderId (client used to send `ORD-${Date.now()}`, which is guessable).
    const orderId = 'ORD-' + randomUUID();

    const validatedLineItems: any[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const productId = item.product?.id;
      if (!productId) {
        return NextResponse.json({ error: 'Missing product ID in cart item' }, { status: 400 });
      }

      let usePrice = 0;
      let productName = 'Unknown';
      let productImages: string[] = [];

      try {
        const dbProduct = await productsDb.get(productId);

        if (!dbProduct) {
          console.error('[CHECKOUT] Product validation failed: not found', productId);
          return NextResponse.json({ error: `Product not found or unavailable: ${item.product?.name || productId}` }, { status: 404 });
        }

        productName = dbProduct.name;
        productImages = dbProduct.images || [];

        if (dbProduct.price === null || dbProduct.price === undefined || dbProduct.price <= 0) {
          return NextResponse.json({ error: `Invalid price for product ${productName}` }, { status: 400 });
        }

        usePrice = dbProduct.price;
      } catch (dbError: any) {
        console.error('[CHECKOUT] Database exception during validation:', dbError?.message);
        return NextResponse.json({ error: 'Failed to verify product information' }, { status: 500 });
      }

      serverSubtotal += usePrice * (item.quantity || 1);

      validatedLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            images: productImages?.[0] ? [productImages[0]] : [],
          },
          unit_amount: Math.round(usePrice * 100),
        },
        quantity: item.quantity || 1,
        metadata: {
          productId: String(productId),
          size: item.size || '',
        },
      });
    }

    const shippingCost = serverSubtotal >= 100 ? 0 : 9.99;
    console.log('[CHECKOUT] Subtotal:', serverSubtotal, 'Shipping:', shippingCost, 'Line items:', validatedLineItems.length);
    
    if (shippingCost > 0) {
      validatedLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';
    console.log('[CHECKOUT] Creating Stripe session for', siteUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: validatedLineItems,
      mode: 'payment',
      success_url: `${siteUrl}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
      customer_email: customer.email,
      metadata: {
        orderId,
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
    });

    console.log('[CHECKOUT] Session created:', session.id);
    return NextResponse.json({ url: session.url, orderId });
  } catch (error: any) {
    console.error('[CHECKOUT] Fatal error:', error);
    console.error('[CHECKOUT] Error stack:', error?.stack);
    console.error('[CHECKOUT] Error name:', error?.name);
    return NextResponse.json({ error: error.message || 'Failed to create Stripe session' }, { status: 500 });
  }
}
