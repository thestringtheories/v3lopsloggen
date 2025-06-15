// next-intl.config.ts
import type { Pathnames } from 'next-intl/routing';

/* 1. Hvilke språk du støtter */
export const locales       = ['en', 'nb'] as const;

/* 2. Språket som brukes hvis ikke annet er spesifisert */
export const defaultLocale = 'nb'  as const;

/* 3. Hvordan prefikse URL-ene */
export const localePrefix  = 'always' as const; // eller 'as-needed', 'never'

/* 4. Dine URL-aliaser per språk */
export const pathnames     = {
  '/': '/',
  '/history':      { en: '/history',      nb: '/historikk' },
  '/run/summary':  { en: '/run/summary',  nb: '/løp/oppsummering' },
  '/login':        '/login',
} satisfies Pathnames<typeof locales>;

/* 5. Legg til disse to linjene med type-eksport: */
export type AppLocale = (typeof locales)[number];
export type Locale    = AppLocale;

/* 6. Dette er det pluginet leser ved runtime */
export default {
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
  // sti til i18n/request.ts (uten .ts-suffix):
  requestConfigPath: './i18n/request'
} as const;