
// app/(main)/layout.tsx
"use client"; 

import React, { useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/app/i18n/navigation';
import { useLocale } from 'next-intl';
import { ToastProvider } from '@/components/ui/ToastProvider'; // Import ToastProvider

interface MainLayoutProps {
  children: React.ReactNode;
  params: { locale: string }; 
}

export default function MainLayout({ children, params }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); 
  const locale = useLocale(); 

  useEffect(() => {
    if (!loading && !user) {
      // Construct the redirect query parameter carefully
      const currentPath = pathname; // pathname already includes the locale
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, pathname, locale]);


  if (loading || (!loading && !user)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <ToastProvider> {/* Wrap with ToastProvider */}
      <div className="flex flex-col min-h-screen bg-neutral-100">
        <main className="flex-grow pb-[calc(var(--nav-h)_+_1rem)]">
          {children}
        </main>
        <footer
          style={{ height: 'var(--nav-h)' }}
          className="fixed bottom-0 left-0 right-0 bg-neutral-50 border-t border-neutral-300 shadow-top-lg z-50"
        >
          <BottomNav />
        </footer>
      </div>
    </ToastProvider>
  );
}
