'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/shop', icon: ShoppingBag, label: t('nav.shop') },
    { href: '/shop?category=accessories', icon: Heart, label: t('home.accessories') },
    { href: '/contact', icon: User, label: t('nav.contact') },
  ];

  return (
    <>
      {/* Desktop: Hidden */}
      <nav className="hidden md:block">
        {/* Desktop navigation stays in Header */}
      </nav>

      {/* Mobile: Fixed Bottom Glass Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="glass-nav mx-4 mb-4 rounded-2xl px-6 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'text-charcoal-900 dark:text-pearl-50' 
                      : 'text-neutral-500 dark:text-charcoal-500'
                  }`}
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-charcoal-900/10 dark:bg-pearl-50/10' : ''
                  }`}>
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-charcoal-900/5 dark:bg-pearl-50/5 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[10px] tracking-wider uppercase font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom spacing for mobile */}
      <div className="md:hidden h-24" />
    </>
  );
}
