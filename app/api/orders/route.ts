import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeOrderData } from '@/lib/sanitize';
import { requireAdmin } from '@/lib/auth-middleware';

// Rate limiting for order creation (IP-based, in-memory)
const orderAttempts = new Map<string, { count: number; resetTime: number; blockedUntil: number }>();

function checkOrderRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = orderAttempts.get(ip) || { count: 0, resetTime: now, blockedUntil: 0 };

  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  if (now > entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + 10 * 60 * 1000; // 10 minute window
    entry.blockedUntil = 0;
  }

  entry.count += 1;

  // Block for 10 minutes after 3 orders
  if (entry.count >= 3) {
    entry.blockedUntil = now + 10 * 60 * 1000;
    entry.count = 0;
    orderAttempts.set(ip, entry);
    return { allowed: false, retryAfter: 600 };
  }

  orderAttempts.set(ip, entry);
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // NOTE: This endpoint is used by checkout, so we don't require auth here.
  // But we validate prices server-side and rate limit to prevent abuse.

  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimit = checkOrderRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many order attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter || 600) },
      }
    );
  }

  try {
    const body = await request.json();

    // Sanitize with try/catch to handle invalid email gracefully
    let sanitized;
    try {
      sanitized = sanitizeOrderData(body);
    } catch (sanitizeError: any) {
      return NextResponse.json(
        { error: `Invalid input: ${sanitizeError.message}` },
        { status: 400 }
      );
    }

    // VALIDATE PRICES: Recalculate total from database prices
    let serverTotal = 0;
    if (sanitized.items && sanitized.items.length > 0) {
      for (const item of sanitized.items) {
        const productId = item.product?.id;
        if (!productId) continue;

        const { data: products, error: prodError } = await supabaseAdmin
          .from('products')
          .select('price')
          .eq('id', productId);

        if (!prodError && products && products.length > 0) {
          serverTotal += products[0].price * (item.quantity || 1);
        }
      }
    }

    // Use server-calculated total (never trust client-side price)
    const finalTotal = serverTotal + (sanitized.shipping || 0) + (sanitized.paymentFee || 0);

    // 1. Insert Order with server-validated total
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: sanitized.id,
        items: sanitized.items || [],
        customer: sanitized.customer,
        total: finalTotal,
        subtotal: serverTotal,
        shipping: sanitized.shipping || 0,
        payment_fee: sanitized.paymentFee || 0,
        payment_method: sanitized.paymentMethod || 'cash_on_delivery',
        payment_status: sanitized.paymentStatus || 'pending',
        status: 'pending',
        date: sanitized.date || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Decrement Stock PER SIZE for each item with optimistic retry
    if (sanitized.items && sanitized.items.length > 0) {
      for (const item of sanitized.items) {
        const productId = item.product?.id;
        const selectedSize = item.size;
        const quantity = item.quantity;

        if (!productId || !selectedSize) {
          console.warn('Missing product ID or size in order item, skipping stock update');
          continue;
        }

        // Optimistic retry loop to handle concurrent stock updates
        const MAX_RETRIES = 3;
        let stockUpdated = false;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          const { data: products, error: prodError } = await supabaseAdmin
            .from('products')
            .select('id, sizes')
            .eq('id', productId)
            .single();

          if (prodError || !products) {
            console.error(`Failed to fetch product ${productId} for stock update:`, prodError?.message);
            break;
          }

          const currentSizes = products.sizes || [];

          const updatedSizes = currentSizes.map((s: any) => {
            if (s.name === selectedSize) {
              const currentSizeStock = s.stock ?? 0;
              const newSizeStock = Math.max(0, currentSizeStock - quantity);
              console.log(`Stock update: Product ${productId}, Size ${selectedSize} -> ${currentSizeStock} - ${quantity} = ${newSizeStock}`);
              return { ...s, stock: newSizeStock };
            }
            return s;
          });

          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update({ sizes: updatedSizes })
            .eq('id', productId);

          if (!updateError) {
            stockUpdated = true;
            break;
          }

          // If update failed, retry with small delay
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
          }
        }

        if (!stockUpdated) {
          console.error(`Failed to update stock for product ${productId}, size ${selectedSize} after ${MAX_RETRIES} retries`);
        }
      }
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (error: any) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Orders DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
