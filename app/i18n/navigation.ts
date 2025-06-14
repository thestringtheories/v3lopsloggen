// app/i18n/navigation.ts
import { createSharedPathnamesNavigation } from 'next-intl/navigation'; 
import {locales, localePrefix } from '@/i18n.config'; // Removed pathnames import here as it's not passed to config

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({ 
    locales,
    localePrefix
    // `pathnames` is automatically picked up from your i18n.config.ts by next-intl
  });