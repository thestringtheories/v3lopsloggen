// app/(main)/layout.tsx
'use client';

import React, { useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import Header from '@/components/layout/Header';           // ① NY import
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from '@/app/i18n/navigation';
import type { AppLocale } from '@/next-intl.config';
import { ToastProvider } from '@/components/ui/ToastProvider';

interface MainLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function MainLayout({ children, params }: MainLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = params.locale as AppLocale;

  /* -------------------------------------------------------------- */
  /*  Redirect til /login hvis bruker ikke er logget inn            */
  /* -------------------------------------------------------------- */
  useEffect(() => {
    if (!loading && !user) {
      const currentPath = pathname; // pathname inkluderer locale
      router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, pathname, locale]);

  /* -------------------------------------------------------------- */
  /*  Loading-spinner                                               */
  /* -------------------------------------------------------------- */
  if (loading || (!loading && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  /* -------------------------------------------------------------- */
  /*  Layout                                                        */
  /* -------------------------------------------------------------- */
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-neutral-100">
        {/* ② HEADER – vises på alle hovedsider */}
        <Header />

        {/* ③ Innholdet flyttes ned tilsvarende header-høyden */}
        <main className="flex-grow pt-[var(--header-h)] pb-[calc(var(--nav-h)_+_1rem)]">
          {children}
        </main>

        {/* ④ Bottom navigation (bar) */}
        <footer
          style={{ height: 'var(--nav-h)' }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-300 bg-neutral-50 shadow-top-lg"
        >
          <BottomNav />
        </footer>
      </div>
    </ToastProvider>
  );
}