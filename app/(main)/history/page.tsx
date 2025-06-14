
// app/(main)/history/page.tsx
import dynamic from 'next/dynamic';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { locales } from '@/i18n.config';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const HistoryPageClient = dynamic(() => import('@/components/run/HistoryPageClient'), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
      <p className="text-neutral-600">Loading history...</p>
    </div>
  )
});

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'HistoryPage'});
  return {
    title: t('title'),
  };
}

interface HistoryPageProps {
  params: { locale: string };
}

export default function HistoryPage({ params: { locale } }: HistoryPageProps) {
  setRequestLocale(locale);
  
  return <HistoryPageClient />;
}
