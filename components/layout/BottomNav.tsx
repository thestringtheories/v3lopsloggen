
// components/layout/BottomNav.tsx
"use client";

import React from 'react';
import { Link, usePathname } from '@/app/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

// SVG Icons for Navigation
const HomeIconSolid = ({ className = "w-6 h-6" } : {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.061l8.69-8.69Z" />
    <path d="M12 5.432 4.03 13.403v5.498c0 1.108.892 2.002 2 2.002h12.006a2 2 0 0 0 1.962-2.002v-5.498L12 5.432Z" />
  </svg>
);
const HomeIconOutline = ({ className = "w-6 h-6" } : {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const HistoryIconSolid = ({ className = "w-6 h-6" } : {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
  </svg>
);
const HistoryIconOutline = ({ className = "w-6 h-6" } : {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


const LogoutIcon = ({ className = "w-6 h-6" } : {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);


const BottomNav: React.FC = () => {
  const t = useTranslations(); 
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/', labelKey: 'BottomNav.home', ariaLabelKey: 'BottomNav.ariaHome', IconOutline: HomeIconOutline, IconSolid: HomeIconSolid },
    { href: '/history', labelKey: 'BottomNav.history', ariaLabelKey: 'BottomNav.ariaHistory', IconOutline: HistoryIconOutline, IconSolid: HistoryIconSolid },
  ];

  const handleLogout = async () => {
    await logout();
    // router.replace will be handled by AuthProvider/MainLayout to redirect to /login
  };

  return (
    <nav className="h-full">
      <ul className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.IconSolid : item.IconOutline;
          return (
            <li key={item.href} className="flex-1">
              <Link 
                href={item.href} 
                className={`flex flex-col items-center justify-center h-full p-2 transition-colors duration-150 ease-in-out group
                            ${isActive ? 'text-primary' : 'text-neutral-500 hover:text-primary-light'}`}
                aria-label={t(item.ariaLabelKey)}
              >
                <Icon className={`w-6 h-6 mb-0.5 transform group-hover:scale-110 transition-transform`} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-neutral-600 group-hover:text-primary-light'}`}>
                  {t(item.labelKey)}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center h-full p-2 w-full text-neutral-500 hover:text-error group transition-colors duration-150 ease-in-out"
            aria-label={t('BottomNav.ariaLogout')}
          >
            <LogoutIcon className="w-6 h-6 mb-0.5 transform group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-neutral-600 group-hover:text-error">
              {t('Auth.logoutButton')}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNav;
