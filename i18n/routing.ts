// i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales:       ['en', 'nb'],
  defaultLocale: 'nb',
  localePrefix:  'always',      // '/en/about' osv.

  pathnames: {
    '/': '/',
    '/history':      {en: '/history',           nb: '/historikk'},
    '/run/summary':  {en: '/run/summary',       nb: '/løp/oppsummering'},
    '/login':        '/login'
  }
});