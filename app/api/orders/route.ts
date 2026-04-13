import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeOrderData } from '@/lib/sanitize';

export async function GET() {
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
  try {
    const body = await request.json();
    const sanitized = sanitizeOrderData(body);

    // 1. Insert Order
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: sanitized.id,
        items: sanitized.items || [],
        customer: sanitized.customer,
        total: sanitized.total || 0,
        subtotal: sanitized.subtotal || 0,
        shipping: sanitized.shipping || 0,
        payment_fee: sanitized.paymentFee || 0,
        payment_method: sanitized.paymentMethod || 'cash_on_delivery',
        payment_status: sanitized.paymentStatus || 'pending',
        status: 'pending', // Default order status
        date: sanitized.date || new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Decrement Stock for each item
    if (sanitized.items && sanitized.items.length > 0) {
      for (const item of sanitized.items) {
        // Fetch current product
        const { data: product, error: prodError } = await supabaseAdmin
          .from('products')
          .select('id, stock')
          .eq('id', item.product.id)
          .single();

        if (!prodError && product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product.id);
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
