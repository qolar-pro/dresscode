'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShoppingBag, CreditCard, Banknote, Wallet } from 'lucide-react';
import { PAYMENT_CONFIG, getEnabledPaymentMethods, calculatePaymentFee, PaymentMethod } from '@/lib/payment-config';
import { defaultImages } from '@/data/products';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
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

  const total = getCartTotal();
  const shipping = total >= 100 ? 0 : 9.99;
  const paymentFee = calculatePaymentFee(total, selectedPayment);
  const grandTotal = total + shipping + paymentFee;
  
  const enabledPaymentMethods = getEnabledPaymentMethods();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrderId = `ORD-${Date.now()}`;
    setOrderId(newOrderId);
    
    const order = {
      id: newOrderId,
      items: cart,
      customer: formData,
      total: grandTotal,
      date: new Date().toISOString(),
      paymentMethod: selectedPayment,
      paymentStatus: 'pending',
      subtotal: total,
      shipping: shipping,
      paymentFee: paymentFee,
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Send Email Notification
    try {
      await fetch('/api/email/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order }),
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }

    clearCart();
    setOrderPlaced(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-tight text-neutral-900 dark:text-white mb-4">{t('checkout.emptyCart')}</h1>
          <Link href="/shop" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors inline-block">
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 py-12 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-5 dark:opacity-3"
          />
        </div>
        
        <div className="max-w-2xl mx-auto text-center px-4 relative z-10">
          <div className="w-20 h-20 border-2 border-neutral-900 dark:border-white rounded-full flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-neutral-900 dark:text-white" />
          </div>
          <h1 className="font-display text-5xl font-light tracking-tight text-neutral-900 dark:text-white mb-4">{t('checkout.thankYou')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-light mb-2">{t('checkout.orderId')}: <span className="font-medium text-neutral-900 dark:text-white">{orderId}</span></p>
          <p className="text-neutral-600 dark:text-neutral-400 mb-12 font-light leading-relaxed max-w-md mx-auto">
            {t('checkout.confirmationDesc')}
          </p>
          <div className="border border-neutral-200 dark:border-neutral-800 p-8 mb-12 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
            <h2 className="font-display text-xl tracking-tight text-neutral-900 dark:text-white mb-6">{t('checkout.orderSummary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">{t('cart.total')}</span>
                <span className="font-medium text-xl text-neutral-900 dark:text-white">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">{t('checkout.paymentMethod')}</span>
                <span className="font-medium text-neutral-900 dark:text-white">{t('checkout.cashOnDelivery')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">{t('checkout.items')}</span>
                <span className="font-medium text-neutral-900 dark:text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
              {t('checkout.backToHome')}
            </Link>
            <Link href="/shop" className="border border-neutral-900 dark:border-white text-neutral-900 dark:text-white px-10 py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-neutral-900 transition-all">
              {t('checkout.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const emojiMap: Record<string, string> = {
    dresses: '👗',
    tops: '👚',
    pants: '👖',
    skirts: '👗',
    outerwear: '🧥',
    accessories: '👜',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 relative overflow-hidden">
      {/* Subtle Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.02]"
        />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-800">
          <h1 className="font-display text-5xl font-light tracking-tight text-neutral-900 dark:text-white mb-2">{t('checkout.title')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 font-light">{t('checkout.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Customer Information */}
              <div>
                <h2 className="font-display text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-8">{t('checkout.customerInfo')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.firstName')} *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.lastName')} *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.email')} *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.phone')} *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="font-display text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-8">{t('checkout.deliveryAddress')}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.address')} *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.city')} *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.zipCode')} *</label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase font-medium mb-3 text-neutral-500 dark:text-neutral-400">{t('checkout.notes')}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="input-field resize-none"
                      rows={3}
                      placeholder={t('checkout.notesPlaceholder')}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="font-display text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-8">{t('checkout.paymentMethod')}</h2>
                <div className="space-y-3">
                  {enabledPaymentMethods.map((method) => {
                    const isSelected = selectedPayment === method.id as PaymentMethod;
                    const fee = calculatePaymentFee(total, method.id);
                    
                    const iconMap: Record<string, any> = {
                      cash_on_delivery: Banknote,
                      stripe: CreditCard,
                      paypal: Wallet,
                      viva_wallet: CreditCard,
                    };
                    const Icon = iconMap[method.id] || CreditCard;
                    
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? 'border-charcoal-900 dark:border-pearl-50 bg-charcoal-50 dark:bg-charcoal-800' 
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isSelected ? 'bg-charcoal-900 dark:bg-pearl-50' : 'bg-neutral-100 dark:bg-neutral-800'
                            }`}>
                              <Icon className={`w-5 h-5 ${
                                isSelected ? 'text-pearl-50 dark:text-charcoal-900' : 'text-neutral-600 dark:text-neutral-400'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 dark:text-white">{method.name}</p>
                              {fee > 0 && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  +${fee.toFixed(2)} processing fee
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-charcoal-900 dark:border-pearl-50' : 'border-neutral-300 dark:border-neutral-600'
                          }`}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-charcoal-900 dark:bg-pearl-50" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-5 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                {t('checkout.placeOrder')} — ${grandTotal.toFixed(2)}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-neutral-200 dark:border-neutral-800 p-8 sticky top-24 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
              <h2 className="font-display text-xl tracking-tight text-neutral-900 dark:text-white mb-8">{t('checkout.orderSummary')}</h2>
              
              <div className="space-y-6 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-16 h-20 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.product.images?.[0] || defaultImages[item.product.category] || defaultImages.dresses}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = defaultImages[item.product.category] || defaultImages.dresses;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 dark:text-white truncate mb-1">{item.product.name}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                        {item.size} / {item.color}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm text-neutral-900 dark:text-white">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{t('cart.subtotal')}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{t('cart.shipping')}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{shipping === 0 ? t('cart.complimentary') : `$${shipping.toFixed(2)}`}</span>
                </div>
                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Payment Processing</span>
                    <span className="font-medium text-neutral-900 dark:text-white">${paymentFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-300 dark:border-neutral-700 pt-3 flex justify-between">
                  <span className="font-medium text-neutral-900 dark:text-white">{t('cart.total')}</span>
                  <span className="text-xl font-display text-neutral-900 dark:text-white">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 ? (
                <p className="text-xs text-center text-neutral-600 dark:text-neutral-400 mt-6">
                  {t('checkout.complimentaryShipping')}
                </p>
              ) : (
                <p className="text-xs text-center text-neutral-600 dark:text-neutral-400 mt-6">
                  {t('checkout.freeShippingProgress').replace('${amount}', (100 - total > 0 ? (100 - total) : 0).toFixed(2))}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
