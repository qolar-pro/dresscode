import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sanitizeProductData } from '@/lib/sanitize';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ products: data || [] });
  } catch (error: any) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sanitized = sanitizeProductData(body);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{
        id: sanitized.id || Date.now(),
        name: sanitized.name,
        price: sanitized.price,
        category: sanitized.category,
        description: sanitized.description,
        images: sanitized.images || [],
        sizes: sanitized.sizes || [],
        colors: sanitized.colors || [],
        is_new: sanitized.isNew ?? false,
        is_featured: sanitized.isFeatured ?? false,
        stock: sanitized.stock ?? 100,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error: any) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const sanitized = sanitizeProductData({ ...updates, id });
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name: sanitized.name,
        price: sanitized.price,
        category: sanitized.category,
        description: sanitized.description,
        images: sanitized.images || [],
        sizes: sanitized.sizes || [],
        colors: sanitized.colors || [],
        is_new: sanitized.isNew ?? false,
        is_featured: sanitized.isFeatured ?? false,
        stock: sanitized.stock ?? 100,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error('Products PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
