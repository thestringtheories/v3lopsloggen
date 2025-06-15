// app/[locale]/(main)/history/page.tsx
export const dynamic = 'force-dynamic';   // fortell Next.js at siden er dynamisk

import NextDynamic from 'next/dynamic';   // 👈 alias for å unngå navnekonflikt
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/next-intl.config';

/* ----------  Static params  ---------- */
export function generateStaticParams() {
  return locales.map((locale: Locale) => ({ locale }));
}

/* ----------  Klient-komponent  ---------- */
const HistoryPageClient = NextDynamic(
  () => import('@/components/run/HistoryPageClient'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
        <p className="text-neutral-600">Loading history…</p>
      </div>
    )
  }
);

/* ----------  <head>-metadata  ---------- */
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations({ locale, namespace: 'HistoryPage' });
  return { title: t('title') };
}

/* ----------  Page  ---------- */
interface HistoryPageProps {
  params: { locale: Locale };
}

export default function HistoryPage({ params: { locale } }: HistoryPageProps) {
  // Setter locale for denne forespørselen
  setRequestLocale(locale);

  return <HistoryPageClient />;
}