
import dynamic from 'next/dynamic';
import { setRequestLocale } from 'next-intl/server'; // Changed unstable_setRequestLocale
import { getTranslations } from 'next-intl/server';
import { RunSessionProvider } from '@/components/run/RunSessionProvider'; // Corrected import

// Dynamically import client components that use Leaflet or extensive client-side logic
const RunHomeClient = dynamic(() => import('@/components/run/RunHomeClient'), { 
  ssr: false,
  loading: () => <p className="text-center p-4">Loading map and controls...</p> 
});

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'RootLayout'});
  return {
    title: t('title'), 
  };
}

interface RunHomePageProps {
  params: { locale: string };
}

export default function RunHomePage({ params: { locale } }: RunHomePageProps) {
  setRequestLocale(locale); // Changed unstable_setRequestLocale

  return (
    <RunSessionProvider>
      <RunHomeClient />
    </RunSessionProvider>
  );
}