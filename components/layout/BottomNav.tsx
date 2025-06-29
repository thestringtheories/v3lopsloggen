// components/layout/BottomNav.tsx
'use client';

import React from 'react';
import { Link, usePathname } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Home, List, Play } from 'lucide-react';

/* ------------------------------------------------------------------
   Bottom navigation bar
   – Venstre : Hjem      (/)
   – Midten  : Start CTA (/ – peker foreløpig til samme side)
   – Høyre   : Historikk (/history)
-------------------------------------------------------------------*/
const BottomNav: React.FC = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const tabs = [
    {
      href: '/',
      label: t('BottomNav.home'),
      aria: t('BottomNav.ariaHome'),
      Icon: Home,
    },
    {
      href: '/history',
      label: t('BottomNav.history'),
      aria: t('BottomNav.ariaHistory'),
      Icon: List,
    },
  ];

  const isActive = (href: string) => pathname === href;

  /* --- hent ikon-komponentene i variabler ------------------------------ */
  const LeftIcon = tabs[0].Icon;
  const RightIcon = tabs[1].Icon;

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-50
                 bg-white/95 backdrop-blur-sm
                 border-t border-neutral-200 shadow-top-md
                 pb-[env(safe-area-inset-bottom)]"
      style={{ height: 'var(--nav-h)' }}
    >
      <nav className="h-full">
        <ul className="flex h-full items-center justify-around">
          {/* Venstre tab -------------------------------------------------- */}
          <li className="flex-1">
            <Link
              href={tabs[0].href}
              aria-label={tabs[0].aria}
              className={`group flex h-full flex-col items-center justify-center p-2 transition-colors
                          duration-150 ${
                            isActive(tabs[0].href)
                              ? 'text-primary'
                              : 'text-neutral-500 hover:text-neutral-700'
                          }`}
            >
              <LeftIcon className="h-6 w-6 mb-0.5" />
              <span className="text-xs font-medium">{tabs[0].label}</span>
            </Link>
          </li>

          {/* Midt-CTA – bare ikon ---------------------------------------- */}
          <li className="flex-1">
            <Link
              href="/"
              aria-label={t('BottomNav.ariaStart', { defaultValue: 'Start' })}
              className="flex h-full flex-col items-center justify-center p-2
                         text-primary hover:text-primary-light transition-colors duration-150"
            >
              <Play className="h-6 w-6" />
            </Link>
          </li>

          {/* Høyre tab --------------------------------------------------- */}
          <li className="flex-1">
            <Link
              href={tabs[1].href}
              aria-label={tabs[1].aria}
              className={`group flex h-full flex-col items-center justify-center p-2 transition-colors
                          duration-150 ${
                            isActive(tabs[1].href)
                              ? 'text-primary'
                              : 'text-neutral-500 hover:text-neutral-700'
                          }`}
            >
              <RightIcon className="h-6 w-6 mb-0.5" />
              <span className="text-xs font-medium">{tabs[1].label}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </footer>
  );
};

export default BottomNav;