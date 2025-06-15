import {createNavigation} from 'next-intl/navigation';
import {locales, defaultLocale} from '@/next-intl.config'; // oppdater sti hvis nødvendig

export const {Link, redirect, usePathname, useRouter} = createNavigation({
  locales,
  defaultLocale
});