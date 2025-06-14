import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server'; 
import type {AbstractIntlMessages} from 'next-intl'; // Updated import path
import { locales } from '@/i18n.config'; // Import locales from config

// Removed redundant local definitions of locales and defaultLocale

// Define a type for your messages if you have a specific structure
type LocaleMessages = AbstractIntlMessages;

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) { // Uses locales from i18n.config.ts
    notFound();
  }

  let messages: LocaleMessages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Could not load messages for locale ${locale}:`, error);
    notFound(); 
  }

  return {
    locale,
    messages
  };
});