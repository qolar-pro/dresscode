'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Home, ShoppingBag, Sparkles, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/shop', icon: ShoppingBag, label: t('nav.shop') },
    { href: '/shop?category=limited', icon: Sparkles, label: t('home.limited') !== 'home.limited' ? t('home.limited') : 'Limited' },
    { href: '/contact', icon: User, label: t('nav.contact') },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div className="mx-4 mb-4 rounded-2xl panel-glass px-4 py-2.5">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.href.split('?')[0];
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-1.5 transition-colors duration-300 ${
                    isActive ? 'text-fog' : 'text-ghost'
                  }`}
                >
                  <div className={`rounded-xl p-2 transition-colors duration-300 ${isActive ? 'bg-neon text-white' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="h-24 md:hidden" />
    </>
  );
}
