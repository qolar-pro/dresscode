import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeOrderData } from '@/lib/sanitize';
import { requireAdmin } from '@/lib/auth-middleware';

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
  // But we validate prices server-side (see price validation below).
  try {
    const body = await request.json();
    const sanitized = sanitizeOrderData(body);

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

    // 2. Decrement Stock PER SIZE for each item
    if (sanitized.items && sanitized.items.length > 0) {
      for (const item of sanitized.items) {
        const productId = item.product?.id;
        const selectedSize = item.size;
        const quantity = item.quantity;

        if (!productId || !selectedSize) {
          console.warn('Missing product ID or size in order item, skipping stock update');
          continue;
        }

        const { data: products, error: prodError } = await supabaseAdmin
          .from('products')
          .select('id, sizes')
          .eq('id', productId);

        if (!prodError && products && products.length > 0) {
          const currentSizes = products[0].sizes || [];

          const updatedSizes = currentSizes.map((s: any) => {
            if (s.name === selectedSize) {
              const currentSizeStock = s.stock ?? 0;
              const newSizeStock = Math.max(0, currentSizeStock - quantity);
              console.log(`Stock update: Product ${productId}, Size ${selectedSize} -> ${currentSizeStock} - ${quantity} = ${newSizeStock}`);
              return { ...s, stock: newSizeStock };
            }
            return s;
          });

          await supabaseAdmin
            .from('products')
            .update({ sizes: updatedSizes })
            .eq('id', productId);
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
