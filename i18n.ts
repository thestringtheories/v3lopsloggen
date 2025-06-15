
import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server'; 
// import type { AbstractIntlMessages } from 'next-intl'; // Removed due to import error
import { locales } from '@/next-intl.config'; // Import locales from renamed config

// Removed redundant local definitions of locales and defaultLocale

// Define a type for your messages if you have a specific structure
// type LocaleMessages = AbstractIntlMessages; // Removed

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) { // Uses locales from next-intl.config.ts
    notFound();
  }

  let messages; // Type will be inferred
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale ${locale}:`, error);
    notFound(); 
  }

  return {
    locale: locale!,
    messages
  };
});