'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { categories } from '@/data/products';

export default function Header() {
  const { getCartCount, setIsCartOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Header - Hidden on Mobile */}
      <header className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled 
          ? 'glass-nav' 
          : 'bg-transparent'
      }`}>
        {/* Top Bar with Background Image */}
        <div className={`relative overflow-hidden transition-all duration-700 ${
          scrolled ? 'h-0 opacity-0' : 'h-10'
        }`}>
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80"
              alt=""
              className="w-full h-full object-cover opacity-30 dark:opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 to-charcoal-800/80" />
          </div>
          <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/90">
              {t('header.freeShipping')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="group">
              <h1 className="font-display text-2xl tracking-tight text-charcoal-900 dark:text-pearl-50">
                DRESS CODE
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-12">
              <Link
                href="/"
                className="text-xs tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 transition-colors relative group"
              >
                {t('nav.home')}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-charcoal-900 dark:bg-pearl-50 group-hover:w-full transition-all duration-500" />
              </Link>
              {/* Categories Dropdown */}
              <div className="relative group/categories">
                <Link
                  href="/shop"
                  className="flex items-center gap-1 text-xs tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 group-hover/categories:text-charcoal-900 dark:group-hover/categories:text-pearl-50 transition-colors"
                >
                  {t('nav.shop')}
                  <ChevronDown className="w-3 h-3 transition-transform duration-300 group-hover/categories:rotate-180" />
                </Link>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/categories:opacity-100 group-hover/categories:visible transition-all duration-300 z-50">
                  <div className="bg-white dark:bg-charcoal-900 border border-neutral-200 dark:border-charcoal-800 shadow-2xl rounded-xl overflow-hidden min-w-[200px] p-2">
                    <Link
                      href="/shop"
                      className="block px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-charcoal-800 hover:text-charcoal-900 dark:hover:text-pearl-50 rounded-lg transition-all"
                    >
                      {t('shop.all')}
                    </Link>
                    {categories.filter(c => c.id !== 'all').map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.id}`}
                        className="block px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-charcoal-800 hover:text-charcoal-900 dark:hover:text-pearl-50 rounded-lg transition-all"
                      >
                        {t(`home.${cat.id}`) || cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className="text-xs tracking-[0.2em] uppercase font-medium text-neutral-600 dark:text-neutral-400 hover:text-charcoal-900 dark:hover:text-pearl-50 transition-colors relative group"
              >
                {t('nav.contact')}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-charcoal-900 dark:bg-pearl-50 group-hover:w-full transition-all duration-500" />
              </Link>
            </nav>

            {/* Controls & Cart */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
                  aria-label="Language"
                >
                  <Globe className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                </button>
                
                {showLangDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-charcoal-800 border border-neutral-200 dark:border-charcoal-700 rounded-lg shadow-xl overflow-hidden min-w-[120px] animate-fade-in">
                    <button
                      onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        language === 'en' 
                          ? 'bg-neutral-100 dark:bg-charcoal-700 font-medium' 
                          : 'hover:bg-neutral-50 dark:hover:bg-charcoal-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('gr'); setShowLangDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        language === 'gr' 
                          ? 'bg-neutral-100 dark:bg-charcoal-700 font-medium' 
                          : 'hover:bg-neutral-50 dark:hover:bg-charcoal-700'
                      }`}
                    >
                      Ελληνικά
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                ) : (
                  <Moon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
                aria-label="Open cart"
              >
                <ShoppingBag className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal-900 dark:bg-pearl-50 text-pearl-50 dark:text-charcoal-900 text-[10px] rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - Minimal */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 glass-nav">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/">
            <h1 className="font-display text-xl tracking-tight text-charcoal-900 dark:text-pearl-50">
              DRESS CODE
            </h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              )}
            </button>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-neutral-100 dark:hover:bg-charcoal-800 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal-900 dark:bg-pearl-50 text-pearl-50 dark:text-charcoal-900 text-[10px] rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Click outside to close language dropdown */}
      {showLangDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowLangDropdown(false)}
        />
      )}
    </>
  );
}
