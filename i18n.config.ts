// i18n.config.ts
import type { Pathnames } from 'next-intl/navigation'; // Updated import path

export const locales = ['en', 'nb'] as const;
export const defaultLocale = 'nb' as const;
export const localePrefix = 'always' as const; // Options: 'as-needed', 'always', 'never'

export const pathnames = {
  '/': '/',
  '/løp/summary': {
    en: '/run/summary',
    nb: '/løp/oppsummering'
  },
  '/history': {
    en: '/history',
    nb: '/historikk'
  },
  // Adding login path, though default handling would also work as /en/login, /nb/login
  '/login': {
    en: '/login',
    nb: '/login' // Or '/logg-inn' if you want a different path for Norwegian
  }
} satisfies Pathnames<typeof locales>;


export type AppLocale = typeof locales[number];