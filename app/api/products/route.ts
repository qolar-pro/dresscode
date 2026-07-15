import { NextRequest, NextResponse } from 'next/server';
import { productsDb } from '@/lib/db';
import { sanitizeProductData } from '@/lib/sanitize';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET() {
  try {
    const products = await productsDb.list();
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const sanitized = sanitizeProductData(body);

    const product = await productsDb.create({
      // Server generates the id; never trust a client-supplied one.
      name: sanitized.name,
      price: sanitized.price,
      category: sanitized.category,
      description: sanitized.description,
      images: sanitized.images || [],
      sizes: sanitized.sizes || [],
      colors: sanitized.colors || [],
      is_new: sanitized.isNew ?? false,
      is_featured: sanitized.isFeatured ?? false,
      stock: sanitized.stock ?? 0,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const sanitized = sanitizeProductData(body);
    const product = await productsDb.update(id, {
      name: sanitized.name,
      price: sanitized.price,
      category: sanitized.category,
      description: sanitized.description,
      images: sanitized.images || [],
      sizes: sanitized.sizes || [],
      colors: sanitized.colors || [],
      is_new: sanitized.isNew ?? false,
      is_featured: sanitized.isFeatured ?? false,
      stock: sanitized.stock ?? 0,
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Products PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await productsDb.remove(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Products DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
