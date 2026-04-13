import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ collections: data || [] });
  } catch (error: any) {
    console.error('Sales Collections GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .insert([{
        name: body.name,
        description: body.description || '',
        discount_percentage: body.discount_percentage || 0,
        image_url: body.image_url || '',
        is_active: body.is_active ?? true,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (error: any) {
    console.error('Sales Collections POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ collection: data });
  } catch (error: any) {
    console.error('Sales Collections PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('sales_collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sales Collections DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
