import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('[CHECKOUT] Request received');
  
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    console.log('[CHECKOUT] Stripe key exists:', !!stripeKey);
    
    if (!stripeKey) {
      console.error('[CHECKOUT] STRIPE_SECRET_KEY is not set');
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {});
    console.log('[CHECKOUT] Stripe client created');

    const body = await request.json();
    console.log('[CHECKOUT] Body parsed, items count:', body.items?.length);
    
    const { items, customer } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer || !customer.email || !customer.firstName || !customer.lastName || !customer.orderId) {
      return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 });
    }

    const validatedLineItems: any[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const productId = item.product?.id;
      if (!productId) {
        return NextResponse.json({ error: 'Missing product ID in cart item' }, { status: 400 });
      }

      let usePrice = item.product?.price;
      let productName = item.product?.name || 'Unknown';
      let productImages = item.product?.images || [];
      let productSizes: any[] = [];

      try {
        console.log('[CHECKOUT] Looking up product', productId, 'from Supabase');
        const { data: dbProduct, error: productError } = await supabaseAdmin
          .from('products')
          .select('id, name, images, sizes, price')
          .eq('id', productId)
          .single();

        if (productError) {
          console.warn('[CHECKOUT] Supabase error:', productError.message, 'Code:', productError.code);
        } else if (dbProduct) {
          console.log('[CHECKOUT] Product found:', dbProduct.name, 'price:', dbProduct.price);
          productName = dbProduct.name || productName;
          productImages = dbProduct.images || productImages;
          productSizes = dbProduct.sizes || [];

          if (dbProduct.price !== null && dbProduct.price !== undefined && dbProduct.price > 0) {
            usePrice = dbProduct.price;
          }
        } else {
          console.warn('[CHECKOUT] Product not found in DB');
        }
      } catch (dbError: any) {
        console.warn('[CHECKOUT] Supabase exception:', dbError?.message);
      }

      if (!usePrice || usePrice <= 0) {
        return NextResponse.json({ error: `Invalid price for product ${productName}` }, { status: 400 });
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
        orderId: customer.orderId,
        customerName: `${customer.firstName} ${customer.lastName}`,
      },
    });

    console.log('[CHECKOUT] Session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[CHECKOUT] Fatal error:', error);
    console.error('[CHECKOUT] Error stack:', error?.stack);
    console.error('[CHECKOUT] Error name:', error?.name);
    return NextResponse.json({ error: error.message || 'Failed to create Stripe session' }, { status: 500 });
  }
}
