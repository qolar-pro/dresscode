import { NextRequest, NextResponse } from 'next/server';
import { collectionsDb } from '@/lib/db';
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

    // Public users only see active collections.
    const collections = await collectionsDb.list(!adminView);
    return NextResponse.json({ collections });
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

    const collection = await collectionsDb.create({
      name: body.name || 'Unnamed Collection',
      description: body.description || '',
      discount_percentage: discount,
      image_url: body.image_url || '',
      product_ids: Array.isArray(body.product_ids) ? body.product_ids : [],
      is_active: body.is_active !== false,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error: any) {
    console.error('Sales Collections POST error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
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

    const collection = await collectionsDb.update(id, updates);
    return NextResponse.json({ collection });
  } catch (error: any) {
    console.error('Sales Collections PATCH error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    let id = body?.id;
    if (!id) {
      const queryId = request.nextUrl.searchParams.get('id');
      if (queryId) id = queryId;
    }

    if (!id) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    await collectionsDb.remove(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Sales Collections DELETE error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
