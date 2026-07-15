import { NextRequest, NextResponse } from 'next/server';
import { productsDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await productsDb.get(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Product GET by ID error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
