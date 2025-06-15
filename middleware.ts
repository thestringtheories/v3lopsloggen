import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, pathnames, localePrefix } from '@/next-intl.config'; // Updated imports

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix, // Added from next-intl.config.ts
  pathnames     // Added from next-intl.config.ts
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/'],
};