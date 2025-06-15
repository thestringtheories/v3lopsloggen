
// app/[locale]/login/page.tsx
import LoginClient from '@/components/auth/LoginClient';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}) {
  const t = await getTranslations({locale, namespace: 'Auth'});
  return {
    title: t('loginTitle'),
  };
}

interface LoginPageProps {
  params: { locale: string };
}

export default function LoginPage({ params: { locale } }: LoginPageProps) {
  setRequestLocale(locale);

  return <LoginClient />;
}
