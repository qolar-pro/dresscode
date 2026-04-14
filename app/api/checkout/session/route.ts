import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!customer || !customer.email || !customer.firstName || !customer.lastName || !customer.orderId) {
      return NextResponse.json({ error: 'Missing required customer information' }, { status: 400 });
    }

    // SERVER-SIDE PRICE VALIDATION: Look up prices from database, never trust client
    const validatedLineItems: any[] = [];
    let serverSubtotal = 0;

    for (const item of items) {
      const productId = item.product?.id;
      if (!productId) {
        return NextResponse.json({ error: `Missing product ID in cart item` }, { status: 400 });
      }

      const { data: products, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, name, images, sizes, price')
        .eq('id', productId)
        .single();

      if (productError || !products) {
        return NextResponse.json({ error: `Product ${productId} not found` }, { status: 400 });
      }

      // Check stock for selected size
      const selectedSize = item.size;
      const sizes = products.sizes || [];
      const sizeObj = sizes.find((s: any) => s.name === selectedSize);

      if (!sizeObj || !sizeObj.available) {
        return NextResponse.json({ error: `Size ${selectedSize} not available for ${products.name}` }, { status: 400 });
      }

      if (sizeObj.stock !== undefined && sizeObj.stock < (item.quantity || 1)) {
        return NextResponse.json({ error: `Only ${sizeObj.stock} left in stock for ${products.name} (${selectedSize})` }, { status: 400 });
      }

      // Use SERVER price, not client price
      const serverPrice = products.price;
      if (!serverPrice || serverPrice <= 0) {
        return NextResponse.json({ error: `Invalid price for product ${products.name}` }, { status: 400 });
      }

      serverSubtotal += serverPrice * (item.quantity || 1);

      validatedLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: products.name,
            images: products.images?.[0] ? [products.images[0]] : [],
          },
          unit_amount: Math.round(serverPrice * 100), // Stripe uses cents
          metadata: {
            productId: String(productId),
            size: selectedSize,
          },
        },
        quantity: item.quantity || 1,
      });
    }

    // Calculate shipping based on SERVER subtotal
    const shippingCost = serverSubtotal >= 100 ? 0 : 9.99;
    if (shippingCost > 0) {
      validatedLineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Use environment variable for site URL, fallback to origin header
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Create Checkout Session
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
