import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe env var at request time
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {});

    const body = await request.json();
    const { items, customer } = body;

    // Validate required fields
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

      // Try to get price from DB, fall back to client price if DB lookup fails
      let usePrice = item.product?.price;
      let productName = item.product?.name || 'Unknown';
      let productImages = item.product?.images || [];
      let productSizes: any[] = [];

      try {
        const { data: dbProduct, error: productError } = await supabaseAdmin
          .from('products')
          .select('id, name, images, sizes, price')
          .eq('id', productId)
          .single();

        if (productError) {
          console.warn(`Checkout: Supabase error for product ${productId}:`, productError.message, 'Code:', productError.code);
        } else if (dbProduct) {
          productName = dbProduct.name || productName;
          productImages = dbProduct.images || productImages;
          productSizes = dbProduct.sizes || [];

          // Use server price if available and positive
          if (dbProduct.price !== null && dbProduct.price !== undefined && dbProduct.price > 0) {
            usePrice = dbProduct.price;
          }

          // Soft stock check
          const selectedSize = item.size;
          if (selectedSize && productSizes.length > 0) {
            const sizeObj = productSizes.find((s: any) => s.name === selectedSize);
            if (sizeObj && sizeObj.stock !== undefined && sizeObj.stock <= 0) {
              console.warn(`Checkout: Size ${selectedSize} for product ${productId} is out of stock, allowing checkout anyway`);
            }
          }
        } else {
          console.warn(`Checkout: Product ${productId} not found in Supabase, using client data`);
        }
      } catch (dbError: any) {
        console.warn('Checkout: Supabase lookup exception:', dbError?.message || dbError);
      }

      if (!usePrice || usePrice <= 0) {
        return NextResponse.json({ error: `Invalid price for product ${productName}` }, { status: 400 });
      }

      serverSubtotal += usePrice * (item.quantity || 1);
      const selectedSize = item.size || '';

      validatedLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: productName,
            images: productImages?.[0] ? [productImages[0]] : [],
          },
          unit_amount: Math.round(usePrice * 100),
          metadata: {
            productId: String(productId),
            size: selectedSize,
          },
        },
        quantity: item.quantity || 1,
      });
    }

    // Calculate shipping
    const shippingCost = serverSubtotal >= 100 ? 0 : 9.99;
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
        serverSubtotal: serverSubtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Stripe session' }, { status: 500 });
  }
}
