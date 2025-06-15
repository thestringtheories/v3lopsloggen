// i18n/request.ts
import { getRequestConfig, type GetRequestConfigParams } from 'next-intl/server';
import { routing } from './routing';          // <-- én eksport
// routing.locales er readonly ['en','nb'] og routing.defaultLocale er 'nb'

type AppLocale = (typeof routing.locales)[number];

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
  // Bruk fallback hvis locale er undefined
  const l = (locale ?? routing.defaultLocale) as AppLocale;

  return {
    locale: l,  // MÅ returneres
    messages: (await import(`../messages/${l}.json`)).default
  };
});