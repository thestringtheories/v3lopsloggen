// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  // Gjør gjeldende locale tilgjengelig for alle under-komponenter
  setRequestLocale(locale);
  return children;
}