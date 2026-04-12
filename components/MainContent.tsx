'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import CartDrawer from '@/components/CartDrawer';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

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
