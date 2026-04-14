'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { defaultImages } from '@/data/products';
import Link from 'next/link';
import Image from 'next/image';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const total = getCartTotal();
  const shipping = total >= 100 ? 0 : 9.99;
  const grandTotal = total + shipping;

  const emojiMap: Record<string, string> = {
    dresses: '👗',
    tops: '👚',
    pants: '👖',
    skirts: '👗',
    outerwear: '🧥',
    accessories: '👜',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-charcoal-900 shadow-2xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-neutral-200 dark:border-charcoal-800">
            <div>
              <h2 className="font-display text-2xl tracking-tight text-charcoal-900 dark:text-pearl-50">{t('cart.title')}</h2>
              <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400 mt-1">
                {cart.length} {cart.length === 1 ? t('cart.item') : t('cart.items')}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-8">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 border border-neutral-200 dark:border-charcoal-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="font-display text-xl tracking-tight text-charcoal-900 dark:text-pearl-50 mb-2">{t('cart.empty')}</p>
                <p className="text-neutral-500 dark:text-neutral-400 font-light mb-8">{t('cart.emptyDesc')}</p>
                <Link
                  href="/shop"
                  className="inline-block btn-luxury"
                  onClick={() => setIsCartOpen(false)}
                >
                  {t('cart.startShopping')}
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-6 pb-8 border-b border-neutral-200 dark:border-charcoal-800">
                    <div className="w-24 h-28 relative flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-charcoal-800">
                      <Image
                        src={item.product.images?.[0] || defaultImages[item.product.category] || defaultImages.dresses}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400 mb-1">{item.product.category}</p>
                      <h3 className="font-medium text-charcoal-900 dark:text-pearl-50 mb-2 truncate">{item.product.name}</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {item.size} / {item.color}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-neutral-300 dark:border-charcoal-700">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-charcoal-900 dark:text-pearl-50">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                          </button>
                        </div>
                        <p className="font-medium text-charcoal-900 dark:text-pearl-50">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors self-start p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t border-neutral-200 dark:border-charcoal-800 p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{t('cart.subtotal')}</span>
                  <span className="font-medium text-charcoal-900 dark:text-pearl-50">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{t('cart.shipping')}</span>
                  <span className="font-medium text-charcoal-900 dark:text-pearl-50">{shipping === 0 ? t('cart.complimentary') : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-neutral-300 dark:border-charcoal-700 pt-3 flex justify-between">
                  <span className="font-medium text-charcoal-900 dark:text-pearl-50">{t('cart.total')}</span>
                  <span className="text-xl font-display text-charcoal-900 dark:text-pearl-50">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {shipping === 0 ? (
                <p className="text-xs text-center text-neutral-600 dark:text-neutral-400">
                  {t('cart.complimentaryShipping')}
                </p>
              ) : (
                <p className="text-xs text-center text-neutral-600 dark:text-neutral-400">
                  {t('cart.freeShippingProgress').replace('${amount}', (100 - total > 0 ? (100 - total) : 0).toFixed(2))}
                </p>
              )}
              
              <Link
                href="/checkout"
                className="block w-full btn-luxury text-center"
                onClick={() => setIsCartOpen(false)}
              >
                {t('cart.proceedToCheckout')}
              </Link>
              <Link
                href="/shop"
                className="text-center block text-xs tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 transition-colors py-2"
                onClick={() => setIsCartOpen(false)}
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
