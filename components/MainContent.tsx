'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import CartDrawer from '@/components/CartDrawer';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide main content on old /admin route (middleware returns fake 404 anyway)
  // Also hide on secret admin routes by checking for known admin sub-paths
  const adminSubPaths = ['dashboard', 'orders', 'products', 'sales-collections', 'admin-emergency'];
  const isSecretAdminRoute = adminSubPaths.some(sub => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    return segments.length >= 2 && segments[1] === sub;
  });

  // Check for root-level secret slug path (e.g. /abc123)
  // We detect this by checking if second segment is one of the admin sub-paths
  const isRootAdminSlug = (() => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    if (segments.length === 1) {
      // Single segment - could be the login page of secret admin
      // We can't know the slug on client, so check if path matches pattern
      return false; // login page doesn't need main content hidden (it has its own layout)
    }
    return isSecretAdminRoute;
  })();

  const isAdminPage = pathname?.startsWith('/admin') || isRootAdminSlug;

  return (
    <>
      {/* Hide main Header on admin pages */}
      {!isAdminPage && <Header />}
      <main className={isAdminPage ? '' : 'min-h-screen'}>
        {children}
      </main>
      {/* Hide Footer and BottomNav on admin pages */}
      {!isAdminPage && (
        <>
          <Footer />
          <BottomNav />
        </>
      )}
      {!isAdminPage && <CartDrawer />}
    </>
  );
}
