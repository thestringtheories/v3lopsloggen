// app/[locale]/løp/summary/page.tsx
export const dynamic = 'force-dynamic';

import NextDynamic from 'next/dynamic';                   // ⬅️ alias!
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/next-intl.config';

/* ---------- 1. statiske locale-paths ---------- */
export function generateStaticParams() {
  return locales.map((locale: Locale) => ({ locale }));
}

/* ---------- 2. klient­komponent ---------- */
const SummaryPageClient = NextDynamic(
  () => import('@/components/run/SummaryPageClient'),
  {
    ssr: false,
    loading: () => <p className="p-4 text-center">Loading …</p>
  }
);

/* ---------- 3. metadata ---------- */
export async function generateMetadata(
  { params: { locale } }: { params: { locale: Locale } }
) {
  const t = await getTranslations({ locale, namespace: 'SummaryPage' });
  return { title: t('title') };
}

/* ---------- 4. selve siden ---------- */
interface Props {
  params: { locale: Locale };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function SummaryPage(
  { params: { locale }, searchParams }: Props
) {
  setRequestLocale(locale);

  const raw   = searchParams?.runId;
  const runId = Array.isArray(raw) ? raw[0] : raw;

  if (!runId) notFound();

  return <SummaryPageClient runId={runId} />;
}