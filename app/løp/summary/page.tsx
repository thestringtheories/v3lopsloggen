
// app/løp/summary/page.tsx
// To match i18n.config.ts pathnames, this directory should be app/run/summary for English canonical, or app/løp/oppsummering for Norwegian.
// For simplicity, sticking to `app/løp/summary/page.tsx` as the file path and letting next-intl handle URL localization.
// The actual URL will depend on `pathnames` in `i18n.config.ts`.
// If `pathnames` has `/løp/summary`: { en: '/run/summary', nb: '/løp/oppsummering' }, then this file serves both.

import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server'; // Changed unstable_setRequestLocale
import { getTranslations } from 'next-intl/server';
import { locales } from '@/i18n.config';

export function generateStaticParams() {
  // If this page can be accessed with different runIds, static generation might be complex or undesirable.
  // For now, just params for locales. RunId will be a query param.
  return locales.map((locale) => ({ locale }));
}

const SummaryPageClient = dynamic(() => import('@/components/run/SummaryPageClient'), { 
  ssr: false,
  loading: () => <p className="text-center p-4">Loading summary...</p> 
});

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'SummaryPage'});
  return {
    title: t('title'),
  };
}

interface SummaryPageProps {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function SummaryPage({ params: { locale }, searchParams }: SummaryPageProps) {
  setRequestLocale(locale); // Changed unstable_setRequestLocale
  const runId = searchParams?.runId as string | undefined;

  if (!runId) {
    // This could be a server-side redirect or a message component.
    // For now, SummaryPageClient will handle the "not found" state.
  }
  
  return <SummaryPageClient runId={runId} />;
}