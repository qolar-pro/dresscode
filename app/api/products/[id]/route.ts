import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error('Product GET by ID error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
