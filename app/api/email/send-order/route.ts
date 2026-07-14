import { Resend } from 'resend';
import { requireAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

// Escape any customer/order-derived value before interpolating into the HTML
// email body, so a crafted product/order name can't inject markup.
function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BRAND = 'Sneaker Air';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@sneakerair.com';
const FROM_EMAIL = process.env.ORDERS_FROM_EMAIL || 'orders@sneakerair.com';
const CONTACT_ADDRESS = '88 Sneaker Boulevard, Athens 10552, Greece';

export async function POST(request: NextRequest) {
  // Only admin or webhook can trigger this endpoint
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { order } = await request.json();

    // Validate order object structure
    if (!order || !order.customer?.email || !order.id) {
      return NextResponse.json({ error: 'Invalid order data: missing customer email or order ID' }, { status: 400 });
    }

    if (!order.items || !Array.isArray(order.items)) {
      return NextResponse.json({ error: 'Invalid order data: missing items array' }, { status: 400 });
    }

    const total = Number(order.total) || 0;
    const dateStr = order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString();

    const { data, error } = await resend.emails.send({
      from: `${BRAND} <${FROM_EMAIL}>`,
      to: [order.customer.email, ADMIN_EMAIL],
      subject: `Order Confirmation #${escapeHtml(order.id)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
          <h1 style="text-align: center; font-size: 24px; letter-spacing: 2px;">${BRAND}</h1>
          <p style="text-align: center; color: #525252;">Thanks for your order — your kicks are on the way!</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
            <p><strong>Date:</strong> ${escapeHtml(dateStr)}</p>
            <p><strong>Total:</strong> €${total.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul style="list-style: none; padding: 0;">
            ${order.items.map((item: any) => `
              <li style="border-bottom: 1px solid #e5e5e5; padding: 10px 0; display: flex; justify-content: space-between;">
                <span>${escapeHtml(item?.product?.name)} (x${escapeHtml(item?.quantity)})${item?.size ? ` — EU ${escapeHtml(item.size)}` : ''}</span>
                <span>€${((Number(item?.product?.price) || 0) * (Number(item?.quantity) || 0)).toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #737373;">
            <p>If you have any questions, reply to this email.</p>
            <p>${BRAND} | ${CONTACT_ADDRESS}</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
