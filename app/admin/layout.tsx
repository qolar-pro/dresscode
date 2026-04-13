'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { ShoppingBag, Package, LogOut, ArrowLeft, Globe, Sun, Moon, Shield, Tag } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { toggleTheme, isDark } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Check authentication via server-side cookie verification
  useEffect(() => {
    if (pathname === '/admin') {
      setIsLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/verify');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/admin');
        }
      } catch {
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Check session every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Logout anyway
    }
    router.push('/admin');
  };

  // Show login page without layout
  if (pathname === '/admin') {
    return <>{children}</>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-pearl-50 mx-auto mb-4 animate-pulse" />
          <div className="text-pearl-50 text-lg">Verifying session...</div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', icon: Package, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/sales-collections', icon: Tag, label: 'Sales Collections' },
  ];

  return (
    <div className="min-h-screen bg-charcoal-950">
      {/* Admin Header */}
      <header className="bg-charcoal-900 border-b border-charcoal-800 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-neutral-400 hover:text-pearl-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden md:inline text-sm">Back to Store</span>
            </Link>
            <div className="h-6 w-px bg-charcoal-700" />
            <h1 className="font-display text-xl text-pearl-50">DRESS CODE</h1>
            <span className="text-xs bg-charcoal-800 text-neutral-400 px-2 py-1 rounded flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="p-2 hover:bg-charcoal-800 rounded-lg transition-colors"
                aria-label="Language"
              >
                <Globe className="w-5 h-5 text-neutral-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-charcoal-800 border border-charcoal-700 rounded-lg shadow-xl overflow-hidden min-w-[120px] animate-fade-in z-50">
                  <button
                    onClick={() => { setLanguage('en'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      language === 'en'
                        ? 'bg-charcoal-700 text-pearl-50 font-medium'
                        : 'text-neutral-400 hover:bg-charcoal-700'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('gr'); setShowLangDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      language === 'gr'
                        ? 'bg-charcoal-700 text-pearl-50 font-medium'
                        : 'text-neutral-400 hover:bg-charcoal-700'
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
              className="p-2 hover:bg-charcoal-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-neutral-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-400" />
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-neutral-400 hover:text-red-400 transition-colors ml-2 px-3 py-2 hover:bg-charcoal-800 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-sm">Logout</span>
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

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 bg-charcoal-900 border-r border-charcoal-800 min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-charcoal-800 text-pearl-50'
                      : 'text-neutral-400 hover:bg-charcoal-800 hover:text-pearl-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Security Info */}
          <div className="mt-8 pt-8 border-t border-charcoal-800">
            <div className="text-xs text-neutral-500 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>bcrypt Encrypted</span>
              </div>
              <p>Session expires after 30 min</p>
              <p>Server-side authentication</p>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-charcoal-900 border-t border-charcoal-800 px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive ? 'text-pearl-50' : 'text-neutral-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
