import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { productsDb, ordersDb } from '@/lib/db';
import { sanitizeOrderData } from '@/lib/sanitize';
import { requireAdmin } from '@/lib/auth-middleware';
import { getClientIP } from '@/lib/ip-whitelist';

// Rate limiting for order creation (IP-based). Pinned to globalThis so all
// route-bundle instances in one process share it (see lib/admin-sessions.ts).
const orderAttempts: Map<string, { count: number; resetTime: number; blockedUntil: number }> =
  (globalThis as any).__saOrderAttempts ?? ((globalThis as any).__saOrderAttempts = new Map());

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
    const orders = await ordersDb.list();
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // NOTE: This endpoint is used by checkout, so we don't require auth here.
  // But we validate prices server-side and rate limit to prevent abuse.

  // Rate limiting — use the trusted client IP (prefers Vercel's x-real-ip),
  // not the client-spoofable x-forwarded-for, so buckets can't be reset per req.
  const ip = getClientIP(request);
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

    const items = Array.isArray(sanitized.items) ? sanitized.items : [];

    // Normalize + hard-validate quantities BEFORE any pricing/stock math. A
    // client-supplied negative/huge/non-integer quantity would otherwise drive
    // the total negative and (via Math.max(0, stock - qty)) *increase* stock.
    const MAX_QTY_PER_ITEM = 25;
    const normalizedItems: { productId: any; size: any; quantity: number; raw: any }[] = [];
    for (const item of items) {
      const productId = item?.product?.id;
      const quantity = Math.floor(Number(item?.quantity));
      if (!productId) {
        return NextResponse.json({ error: 'Invalid item: missing product' }, { status: 400 });
      }
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }
      normalizedItems.push({ productId, size: item?.size, quantity, raw: item });
    }

    // VALIDATE PRICES: recompute the total from stored prices only.
    let serverTotal = 0;
    for (const it of normalizedItems) {
      const price = await productsDb.priceOf(it.productId);
      if (price != null && price > 0) serverTotal += price * it.quantity;
    }

    // Shipping + payment fee are recomputed server-side too — never trusted
    // from the client. Payment method is whitelisted; payment status is ALWAYS
    // 'pending' here (only the Stripe webhook may mark an order paid).
    const ALLOWED_METHODS = ['cash_on_delivery', 'stripe', 'paypal', 'viva_wallet'];
    const paymentMethod = ALLOWED_METHODS.includes(sanitized.paymentMethod)
      ? sanitized.paymentMethod
      : 'cash_on_delivery';
    const shipping = serverTotal >= 100 ? 0 : 9.99;
    const paymentFee = 0; // COD has no processing fee; Stripe fees are handled by Stripe.
    const finalTotal = serverTotal + shipping + paymentFee;

    // Server-authoritative, unguessable order ID.
    const orderId = 'ORD-' + randomUUID();

    const order = await ordersDb.create({
      id: orderId,
      items,
      customer: sanitized.customer,
      total: finalTotal,
      subtotal: serverTotal,
      shipping,
      payment_fee: paymentFee,
      payment_method: paymentMethod,
      payment_status: 'pending',
      status: 'pending',
      date: new Date().toISOString(),
    });

    // Decrement per-size stock using the validated quantities.
    for (const it of normalizedItems) {
      if (!it.size) continue;
      try {
        await productsDb.decrementSize(it.productId, it.size, it.quantity);
      } catch (e) {
        console.error(`Stock decrement failed for product ${it.productId}/${it.size}`);
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
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

    await ordersDb.remove(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Orders DELETE error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
