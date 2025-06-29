// components/layout/BottomNav.tsx
'use client';

import React from 'react';
import { Link, usePathname } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Home, List, PlayCircle } from 'lucide-react';

/* ------------------------------------------------------------------
   Bottom navigation bar
   – Venstre: Feed          (/)
   – Midten : Start-knapp   (/run)
   – Høyre  : Historikk     (/history)
-------------------------------------------------------------------*/
const BottomNav: React.FC = () => {
  const t = useTranslations();
  const pathname = usePathname();

  /** Ikon-tabs på hver side av CTA-knappen */
  const navItems = [
    {
      href: '/',
      labelKey: 'BottomNav.home',
      ariaLabelKey: 'BottomNav.ariaHome',
      Icon: Home,
    },
    {
      href: '/history',
      labelKey: 'BottomNav.history',
      ariaLabelKey: 'BottomNav.ariaHistory',
      Icon: List,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-50
                 bg-white/95 backdrop-blur-sm
                 border-t border-neutral-200 shadow-top-md
                 pb-[env(safe-area-inset-bottom)]"
      style={{ height: 'var(--nav-h)' }}
    >
      <nav className="h-full">
        <ul className="flex items-center justify-around h-full">
          {/* Venstre fane(r) -------------------------------------------------- */}
          {navItems.slice(0, 1).map(({ href, Icon, labelKey, ariaLabelKey }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={t(ariaLabelKey)}
                className={`group flex h-full flex-col items-center justify-center p-2 transition-colors
                            duration-150 ease-in-out ${
                              isActive(href)
                                ? 'text-primary'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
              >
                <Icon className="h-6 w-6 mb-0.5 transition-transform group-hover:scale-110" />
                <span className="text-xs font-medium">{t(labelKey)}</span>
              </Link>
            </li>
          ))}

          {/* Midt-CTA (Start) -------------------------------------------------- */}
          <li className="-translate-y-3">
            <Link
              href="/run"
              aria-label={t('BottomNav.ariaStart', { defaultValue: 'Start run' })}
              className="flex h-16 w-16 items-center justify-center rounded-full
                         bg-primary text-white shadow-lg
                         hover:bg-primary-light active:scale-95 transition"
            >
              <PlayCircle className="h-8 w-8" />
            </Link>
          </li>

          {/* Høyre fane(r) ---------------------------------------------------- */}
          {navItems.slice(1).map(({ href, Icon, labelKey, ariaLabelKey }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={t(ariaLabelKey)}
                className={`group flex h-full flex-col items-center justify-center p-2 transition-colors
                            duration-150 ease-in-out ${
                              isActive(href)
                                ? 'text-primary'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
              >
                <Icon className="h-6 w-6 mb-0.5 transition-transform group-hover:scale-110" />
                <span className="text-xs font-medium">{t(labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
};

export default BottomNav;