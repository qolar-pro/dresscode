'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag, Globe, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { categories } from '@/data/products';
import Magnetic from '@/components/Magnetic';
import TextRoll from '@/components/TextRoll';

export default function Header() {
  const { getCartCount, setIsCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLink =
    'group relative font-mono text-[11px] uppercase tracking-[0.28em] text-mist transition-colors hover:text-fog';
  const underline =
    'pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-neon transition-all duration-500 group-hover:w-full';

  return (
    <>
      {/* ============================= DESKTOP ============================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 hidden transition-all duration-500 md:block ${
          scrolled ? 'panel-glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]' : 'bg-transparent'
        }`}
      >
        {/* announcement rail */}
        <div
          className={`overflow-hidden border-b border-fog/5 transition-all duration-500 ${
            scrolled ? 'h-0 opacity-0' : 'h-9 opacity-100'
          }`}
        >
          <div className="flex h-9 items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-ghost">
            <span className="h-1 w-1 rounded-full bg-flare shadow-[0_0_8px_#ff4fd8]" />
            {t('header.freeShipping')}
          </div>
        </div>

        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between px-6 md:px-12">
          {/* wordmark */}
          <Magnetic strength={0.25}>
            <Link href="/" data-cursor="link" className="roll-trigger flex items-baseline gap-[3px]">
              <span className="font-display text-xl font-semibold uppercase tracking-tight text-fog">
                Sneaker
              </span>
              <span className="font-display text-xl font-semibold uppercase tracking-tight text-neon">
                Air
              </span>
            </Link>
          </Magnetic>

          {/* nav */}
          <nav className="flex items-center gap-11">
            <Link href="/" data-cursor="link" className={navLink}>
              <TextRoll text={t('nav.home')} />
              <span className={underline} />
            </Link>

            {/* categories dropdown */}
            <div className="group/cat relative">
              <Link
                href="/shop"
                data-cursor="link"
                className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-mist transition-colors group-hover/cat:text-fog"
              >
                <TextRoll text={t('nav.shop')} />
                <ChevronDown className="h-3 w-3 transition-transform duration-300 group-hover/cat:rotate-180" />
              </Link>

              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-5 opacity-0 transition-all duration-300 group-hover/cat:visible group-hover/cat:opacity-100">
                <div className="min-w-[220px] overflow-hidden rounded-2xl panel-glass p-2">
                  <Link
                    href="/shop"
                    data-cursor="link"
                    className="block rounded-xl px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mist transition-colors hover:bg-fog/5 hover:text-fog"
                  >
                    {t('shop.all')}
                  </Link>
                  {categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.id}`}
                        data-cursor="link"
                        className="flex items-center justify-between rounded-xl px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-mist transition-colors hover:bg-fog/5 hover:text-fog"
                      >
                        {t(`home.${cat.id}`) !== `home.${cat.id}` ? t(`home.${cat.id}`) : cat.name}
                        <span className="h-1 w-1 rounded-full bg-plasma opacity-0 transition-opacity duration-300 group-hover/cat:opacity-60" />
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            <Link href="/contact" data-cursor="link" className={navLink}>
              <TextRoll text={t('nav.contact')} />
              <span className={underline} />
            </Link>
          </nav>

          {/* controls */}
          <div className="flex items-center gap-2">
            {/* language */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown((v) => !v)}
                data-cursor="link"
                className="flex items-center gap-1.5 rounded-full border border-fog/10 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist transition-colors hover:border-fog/30 hover:text-fog"
                aria-label="Language"
              >
                <Globe className="h-3.5 w-3.5" />
                {language === 'en' ? 'EN' : 'GR'}
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 top-full mt-2 min-w-[130px] overflow-hidden rounded-xl panel-glass">
                  {(['en', 'gr'] as const).map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        setLanguage(lng);
                        setShowLangDropdown(false);
                      }}
                      className={`block w-full px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.2em] transition-colors hover:bg-fog/5 ${
                        language === lng ? 'text-neon' : 'text-mist hover:text-fog'
                      }`}
                    >
                      {lng === 'en' ? 'English' : 'Ελληνικά'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* cart */}
            <Magnetic strength={0.35}>
              <button
                onClick={() => setIsCartOpen(true)}
                data-cursor="link"
                className="relative flex items-center gap-2 rounded-full bg-neon px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-[filter] hover:brightness-110"
                aria-label="Open cart"
              >
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden lg:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[9px] font-semibold text-plasma">
                    {cartCount}
                  </span>
                )}
              </button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* ============================== MOBILE ============================== */}
      <header className="fixed inset-x-0 top-0 z-40 panel-glass md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-baseline gap-[2px]">
            <span className="font-display text-lg font-semibold uppercase tracking-tight text-fog">Sneaker</span>
            <span className="font-display text-lg font-semibold uppercase tracking-tight text-neon">Air</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'gr' : 'en')}
              className="rounded-full border border-fog/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist"
              aria-label="Toggle language"
            >
              {language === 'en' ? 'EN' : 'GR'}
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full bg-neon p-2.5 text-white"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-white text-[9px] font-semibold text-plasma">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showLangDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowLangDropdown(false)} />
      )}
    </>
  );
}
