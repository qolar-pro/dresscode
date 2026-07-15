'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowUpRight } from 'lucide-react';
import { defaultImages } from '@/data/products';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  const total = getCartTotal();
  const shipping = total >= 100 ? 0 : 9.99;
  const grandTotal = total + shipping;
  const remaining = Math.max(0, 100 - total);

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-void/70 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />

      <div className="absolute right-0 top-0 h-full w-full max-w-lg animate-slide-in-right border-l border-fog/8 bg-carbon shadow-2xl">
        <div className="flex h-full flex-col">
          {/* header */}
          <div className="flex items-center justify-between border-b border-fog/8 p-7">
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-fog">{t('cart.title')}</h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ghost">
                {cart.length} {cart.length === 1 ? t('cart.item') : t('cart.items')}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              data-cursor="link"
              className="rounded-full p-2 text-mist transition-colors hover:bg-fog/5 hover:text-fog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* items */}
          <div className="flex-1 overflow-y-auto p-7">
            {cart.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-fog/10">
                  <ShoppingBag className="h-8 w-8 text-ghost" />
                </div>
                <p className="font-display text-xl uppercase tracking-tight text-fog">{t('cart.empty')}</p>
                <p className="mt-2 text-mist">{t('cart.emptyDesc')}</p>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-8 inline-block rounded-full bg-neon px-8 py-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
                >
                  {t('cart.startShopping')}
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-5 border-b border-fog/8 pb-6">
                    <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl panel-glass">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images?.[0] || defaultImages[item.product.category] || defaultImages.running}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ghost">{item.product.category}</p>
                      <h3 className="truncate font-display text-fog">{item.product.name}</h3>
                      <p className="mt-1 font-mono text-[11px] text-mist">
                        EU {item.size} · {item.color}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-fog/12">
                          <button onClick={() => updateQuantity(index, item.quantity - 1)} className="p-2 text-mist transition-colors hover:text-fog" aria-label="Decrease">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-[12px] text-fog">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, item.quantity + 1)} className="p-2 text-mist transition-colors hover:text-fog" aria-label="Increase">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-mono text-sm text-fog">€{(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      data-cursor="link"
                      className="self-start p-1 text-ghost transition-colors hover:text-flare"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* footer */}
          {cart.length > 0 && (
            <div className="space-y-5 border-t border-fog/8 p-7">
              <div className="space-y-2.5 font-mono text-[12px]">
                <div className="flex justify-between">
                  <span className="text-mist">{t('cart.subtotal')}</span>
                  <span className="text-fog">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mist">{t('cart.shipping')}</span>
                  <span className="text-fog">{shipping === 0 ? t('cart.complimentary') : `€${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between border-t border-fog/8 pt-3">
                  <span className="uppercase tracking-[0.15em] text-mist">{t('cart.total')}</span>
                  <span className="font-display text-xl text-fog">€{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {shipping === 0 ? (
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.15em] text-volt">
                  {t('cart.complimentaryShipping')}
                </p>
              ) : (
                <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-ghost">
                  {t('cart.freeShippingProgress').replace('${amount}', remaining.toFixed(2))}
                </p>
              )}

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                data-cursor="link"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-neon py-4 font-mono text-[12px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
              >
                {t('cart.proceedToCheckout')} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ghost transition-colors hover:text-fog"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
