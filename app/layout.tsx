
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.className}>
      <head />
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider> {/* Wrap with AuthProvider */}
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
