import { NextRequest, NextResponse } from 'next/server';
import { ordersDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Order records contain full customer PII (name, address, phone, email).
  // Require admin auth so order IDs can't be brute-forced/guessed to read PII.
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await ordersDb.get(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Order GET error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { id } = params;
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await ordersDb.updateStatus(id, status);
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
