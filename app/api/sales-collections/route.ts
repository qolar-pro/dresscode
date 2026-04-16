import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminView = searchParams.get('admin') === 'true';

    // If admin view is requested, require admin authentication
    if (adminView) {
      const auth = await requireAdmin(request);
      if (auth) return auth;
    }

    let query = supabaseAdmin
      .from('sales_collections')
      .select('*');

    // Public users only see active collections
    if (!adminView) {
      query = query.eq('is_active', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.warn('Sales collections table error:', error.message);
      return NextResponse.json({ collections: [] });
    }

    const safeData = (data || []).map((c: any) => ({
      ...c,
      product_ids: Array.isArray(c.product_ids) ? c.product_ids : [],
    }));

    return NextResponse.json({ collections: safeData });
  } catch (error: any) {
    console.error('Sales Collections GET error:', error);
    return NextResponse.json({ collections: [] });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();

    // Validate discount percentage
    const discount = parseFloat(body.discount_percentage);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: 'Discount percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const collectionData = {
      name: body.name || 'Unnamed Collection',
      description: body.description || '',
      discount_percentage: discount,
      image_url: body.image_url || '',
      product_ids: Array.isArray(body.product_ids) ? body.product_ids : [],
      is_active: body.is_active !== false,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
    };

    const { data, error } = await supabaseAdmin
      .from('sales_collections')
      .insert([collectionData])
      .select()
      .single();

    if (error) {
      console.error('Sales Collections insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collection: data }, { status: 201 });
  } catch (error: any) {
    console.error('Sales Collections POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    // Validate discount percentage if being updated
    if (updates.discount_percentage !== undefined) {
      const discount = parseFloat(updates.discount_percentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return NextResponse.json(
          { error: 'Discount percentage must be between 0 and 100' },
          { status: 400 }
        );
      }
      updates.discount_percentage = discount;
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
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    let id = body?.id;
  if (!id && request.method === 'DELETE') {
    const queryId = request.nextUrl.searchParams.get('id');
    if (queryId) id = queryId;
  }

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
