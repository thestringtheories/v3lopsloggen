import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames, localePrefix } from '@/i18n.config'; // Updated imports

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix, // Added from i18n.config.ts
  pathnames     // Added from i18n.config.ts
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};