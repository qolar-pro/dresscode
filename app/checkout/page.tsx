'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, CreditCard, Banknote, Wallet, Loader2, ArrowUpRight } from 'lucide-react';
import { getEnabledPaymentMethods, calculatePaymentFee, PaymentMethod } from '@/lib/payment-config';
import { defaultImages } from '@/data/products';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const inputClass =
  'w-full rounded-xl border border-fog/12 bg-void/40 px-4 py-3.5 font-mono text-[13px] text-fog outline-none transition-colors placeholder:text-ghost focus:border-plasma';
const labelClass = 'mb-2.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-ghost';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { cart, getCartTotal, clearCart } = useCart();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    notes: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash_on_delivery');
  const [processing, setProcessing] = useState(false);
  const [usedPaymentMethod, setUsedPaymentMethod] = useState<string>('cash_on_delivery');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      async function fetchSessionDetails() {
        try {
          const res = await fetch(`/api/checkout/session-details?id=${sessionId}`);
          const data = await res.json();
          setOrderId(data.metadata?.orderId || 'STRIPE-PAID');
          setUsedPaymentMethod('stripe');
          clearCart();
          setOrderPlaced(true);
        } catch (error) {
          console.error('Failed to fetch session details:', error);
          setOrderId('STRIPE-PAID');
          clearCart();
          setOrderPlaced(true);
        }
      }
      fetchSessionDetails();
    }
  }, [searchParams, clearCart]);

  const total = getCartTotal();
  const shipping = total >= 100 ? 0 : 9.99;
  const paymentFee = calculatePaymentFee(total, selectedPayment);
  const grandTotal = total + shipping + paymentFee;
  const enabledPaymentMethods = getEnabledPaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const order = {
      items: cart,
      customer: formData,
      total: grandTotal,
      date: new Date().toISOString(),
      paymentMethod: selectedPayment,
      paymentStatus: 'pending',
      subtotal: total,
      shipping,
      paymentFee,
    };

    if (selectedPayment === 'stripe' && stripePromise) {
      try {
        const res = await fetch('/api/checkout/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: { ...formData, total: grandTotal } }),
        });
        const data = await res.json();
        if (data.url) {
          setUsedPaymentMethod('stripe');
          window.location.href = data.url;
        } else {
          alert(data.error || 'Failed to initialize Stripe checkout');
          setProcessing(false);
        }
      } catch (error) {
        console.error('Stripe checkout error:', error);
        alert('Failed to initialize Stripe checkout');
        setProcessing(false);
      }
      return;
    }

    // COD — the server generates the authoritative order id.
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      if (res.ok && data.order?.id) {
        setOrderId(data.order.id);
        try {
          await fetch('/api/email/send-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: { ...order, id: data.order.id } }),
          });
        } catch { /* email is best-effort */ }
      } else {
        setOrderId('ORD-' + Date.now());
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setOrderId('ORD-' + Date.now());
    }

    setUsedPaymentMethod(selectedPayment);
    clearCart();
    setOrderPlaced(true);
    setProcessing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-void px-6 text-center">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight text-hollow">{t('checkout.emptyCart')}</h1>
          <Link
            href="/shop"
            className="mt-8 inline-block rounded-full bg-neon px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
          >
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void py-12">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="aura-blob aura-blob-b left-1/2 top-1/3 h-[50vh] w-[50vh] -translate-x-1/2 opacity-30" />
          <div className="absolute inset-0 grid-overlay opacity-40" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-full bg-neon text-white">
            <Check className="h-9 w-9" />
          </div>
          <h1 className="font-display text-5xl font-semibold uppercase tracking-tight md:text-6xl">
            {t('checkout.thankYou')}
          </h1>
          <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.15em] text-mist">
            {t('checkout.orderId')}: <span className="text-neon">{orderId}</span>
          </p>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-mist">{t('checkout.confirmationDesc')}</p>

          <div className="mx-auto mt-10 max-w-md rounded-2xl panel-glass p-8 text-left">
            <h2 className="mb-6 font-display text-xl uppercase tracking-tight text-fog">{t('checkout.orderSummary')}</h2>
            <div className="space-y-3 font-mono text-[13px]">
              <Row label={t('cart.total')} value={<span className="font-display text-xl text-fog">€{grandTotal.toFixed(2)}</span>} />
              <Row label={t('checkout.paymentMethod')} value={usedPaymentMethod === 'stripe' ? 'Card (Stripe)' : t('checkout.cashOnDelivery')} />
              <Row label={t('checkout.items')} value={String(cart.reduce((s, i) => s + i.quantity, 0))} />
            </div>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/" className="rounded-full bg-neon px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110">
              {t('checkout.backToHome')}
            </Link>
            <Link href="/shop" className="rounded-full border border-fog/15 px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-fog transition-colors hover:border-fog/40">
              {t('checkout.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const iconMap: Record<string, any> = {
    cash_on_delivery: Banknote,
    stripe: CreditCard,
    paypal: Wallet,
    viva_wallet: CreditCard,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-void text-fog">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aura-blob aura-blob-a right-[-6%] top-[6%] h-[42vh] w-[42vh] opacity-25" />
        <div className="absolute inset-0 grid-overlay opacity-40" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 pb-24 pt-32 md:px-12">
        <div className="mb-12 border-b border-fog/8 pb-8">
          <h1 className="font-display text-5xl font-semibold uppercase tracking-tight md:text-6xl">{t('checkout.title')}</h1>
          <p className="mt-3 text-mist">{t('checkout.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-3">
          {/* FORM */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-12">
              <section>
                <h2 className="mb-7 font-mono text-[12px] uppercase tracking-[0.25em] text-plasma">{t('checkout.customerInfo')}</h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label={`${t('checkout.firstName')} *`}>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className={inputClass} placeholder="Jane" />
                  </Field>
                  <Field label={`${t('checkout.lastName')} *`}>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className={inputClass} placeholder="Doe" />
                  </Field>
                  <Field label={`${t('checkout.email')} *`}>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="jane@example.com" />
                  </Field>
                  <Field label={`${t('checkout.phone')} *`}>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+30 210 555 0199" />
                  </Field>
                </div>
              </section>

              <section>
                <h2 className="mb-7 font-mono text-[12px] uppercase tracking-[0.25em] text-plasma">{t('checkout.deliveryAddress')}</h2>
                <div className="space-y-5">
                  <Field label={`${t('checkout.address')} *`}>
                    <input type="text" name="address" required value={formData.address} onChange={handleChange} className={inputClass} placeholder="88 Sneaker Blvd, Apt 4B" />
                  </Field>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label={`${t('checkout.city')} *`}>
                      <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputClass} placeholder="Athens" />
                    </Field>
                    <Field label={`${t('checkout.zipCode')} *`}>
                      <input type="text" name="zipCode" required value={formData.zipCode} onChange={handleChange} className={inputClass} placeholder="10552" />
                    </Field>
                  </div>
                  <Field label={t('checkout.notes')}>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={`${inputClass} resize-none`} placeholder={t('checkout.notesPlaceholder')} />
                  </Field>
                </div>
              </section>

              <section>
                <h2 className="mb-7 font-mono text-[12px] uppercase tracking-[0.25em] text-plasma">{t('checkout.paymentMethod')}</h2>
                <div className="space-y-3">
                  {enabledPaymentMethods.map((method) => {
                    const isSelected = selectedPayment === (method.id as PaymentMethod);
                    const fee = calculatePaymentFee(total, method.id);
                    const Icon = iconMap[method.id] || CreditCard;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                        data-cursor="link"
                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                          isSelected ? 'border-plasma bg-plasma/5' : 'border-fog/10 hover:border-fog/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`grid h-10 w-10 place-items-center rounded-xl ${isSelected ? 'bg-neon text-white' : 'bg-fog/5 text-mist'}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-display text-fog">{method.name}</p>
                              {fee > 0 && <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ghost">+€{fee.toFixed(2)} fee</p>}
                            </div>
                          </div>
                          <div className={`grid h-5 w-5 place-items-center rounded-full border ${isSelected ? 'border-plasma' : 'border-fog/20'}`}>
                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-plasma" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <button
                type="submit"
                disabled={processing}
                data-cursor="link"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-neon py-5 font-mono text-[12px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    {t('checkout.placeOrder')} — €{grandTotal.toFixed(2)} <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl panel-glass p-8">
              <h2 className="mb-8 font-display text-xl uppercase tracking-tight text-fog">{t('checkout.orderSummary')}</h2>

              <div className="mb-8 space-y-5 border-b border-fog/8 pb-8">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl panel-glass">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images?.[0] || defaultImages[item.product.category] || defaultImages.lifestyle}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm text-fog">{item.product.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-mist">EU {item.size} · {item.color}</p>
                      <p className="font-mono text-[10px] text-ghost">Qty {item.quantity}</p>
                    </div>
                    <p className="font-mono text-sm text-fog">€{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 font-mono text-[13px]">
                <Row label={t('cart.subtotal')} value={`€${total.toFixed(2)}`} />
                <Row label={t('cart.shipping')} value={shipping === 0 ? t('cart.complimentary') : `€${shipping.toFixed(2)}`} />
                {paymentFee > 0 && <Row label="Processing" value={`€${paymentFee.toFixed(2)}`} />}
                <div className="flex justify-between border-t border-fog/8 pt-3">
                  <span className="uppercase tracking-[0.15em] text-mist">{t('cart.total')}</span>
                  <span className="font-display text-xl text-fog">€{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ghost">
                {shipping === 0
                  ? t('checkout.complimentaryShipping')
                  : t('checkout.freeShippingProgress').replace('${amount}', Math.max(0, 100 - total).toFixed(2))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-mist">{label}</span>
      <span className="text-fog">{value}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-void">
          <Loader2 className="h-8 w-8 animate-spin text-plasma" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
