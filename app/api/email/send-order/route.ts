import { Resend } from 'resend';
import { requireAdmin } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Only admin or webhook can trigger this endpoint
  const auth = await requireAdmin(request);
  if (auth) return auth;

  try {
    const { order } = await request.json();

    // Validate order object structure
    if (!order || !order.customer?.email || !order.id) {
      return NextResponse.json({ error: 'Invalid order data: missing customer email or order ID' }, { status: 400 });
    }

    if (!order.items || !Array.isArray(order.items)) {
      return NextResponse.json({ error: 'Invalid order data: missing items array' }, { status: 400 });
    }

    // FIX: Changed 'from' address to match the verified domain 'blancographics.xyz'
    // Previously it was 'onboarding@resend.dev' which causes a 500 error on custom domains.
    const { data, error } = await resend.emails.send({
      from: 'DRESS CODE <orders@blancographics.xyz>',
      to: [order.customer.email, 'admin@blancographics.xyz'],
      subject: `Order Confirmation #${order.id}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #171717;">
          <h1 style="text-align: center; font-family: serif; font-size: 24px;">DRESS CODE</h1>
          <p style="text-align: center; color: #525252;">Thank you for your order!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

          <h3>Items Ordered:</h3>
          <ul style="list-style: none; padding: 0;">
            ${order.items.map((item: any) => `
              <li style="border-bottom: 1px solid #e5e5e5; padding: 10px 0; display: flex; justify-content: space-between;">
                <span>${item.product.name} (x${item.quantity})</span>
                <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            `).join('')}
          </ul>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #737373;">
            <p>If you have any questions, reply to this email.</p>
            <p>DRESS CODE | 123 Fashion Street, Style District, NY 10001</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
