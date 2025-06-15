
// components/run/HistoryPageClient.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'; // Changed from useLocale
import type { AppLocale } from '@/next-intl.config'; // Added for type safety
import { Link } from '@/app/i18n/navigation';
import { db } from '@/utils/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { type RunData } from './SummaryPageClient'; // Reuse RunData type
import { formatDuration, formatDate } from '@/utils/helpers';

// Simple SVG Icons
const CalendarIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);
const DistanceIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const DurationIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);


const HistoryPageClient: React.FC = () => {
  const t = useTranslations('HistoryPage');
  const params = useParams(); // Changed
  const locale = params.locale as AppLocale; // Changed
  const { user } = useAuth();
  const [runs, setRuns] = useState<RunData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Should be redirected by MainLayout, but good to have a fallback
      setError(t('errorLoadingRuns')); // Or a more specific auth error
      setLoading(false);
      return;
    }

    const fetchRuns = async () => {
      setLoading(true);
      setError(null);
      try {
        const runsCollectionRef = collection(db, 'runs');
        const q = query(
          runsCollectionRef, 
          where('userId', '==', user.uid), 
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedRuns: RunData[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          // Ensure createdAt is consistently handled, Firestore might return Timestamp
          const data = doc.data();
          const runItem: RunData = { 
            id: doc.id,
            ...data,
            // Convert Firestore Timestamp to ISO string if necessary
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            startTime: data.startTime instanceof Timestamp ? data.startTime.toMillis() : data.startTime,
          } as RunData;
          fetchedRuns.push(runItem);
        });
        setRuns(fetchedRuns);
      } catch (err) {
        console.error("Error fetching run history:", err);
        setError(t('errorLoadingRuns'));
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [user, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[calc(100vh-150px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-neutral-700">{t('loadingRuns')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg shadow-md max-w-md mx-auto my-10">
        <h2 className="text-xl font-semibold mb-2">{t('errorLoadingRuns')}</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center p-8 mt-10">
        <svg className="mx-auto h-16 w-16 text-neutral-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.188V12.03M19.5 12h.008v.008H19.5V12zm0 3.75h.008v.008H19.5v-.008zm0 3.75h.008v.008H19.5v-.008z" />
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        </svg>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-2">{t('noRuns')}</h2>
        <p className="text-neutral-500">
          <Link href="/" className="text-primary hover:text-primary-dark font-medium">
            Start your first run
          </Link> to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark">{t('title')}</h1>
      </header>
      <div className="space-y-4">
        {runs.map((run: RunData) => (
          <Link 
            href={{ pathname: '/løp/summary', query: { runId: run.id } }}
            key={run.id} 
            className="block bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 ease-in-out group"
            aria-label={`${t('viewSummary')} for run on ${formatDate(new Date(run.createdAt), locale)}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-primary group-hover:text-primary-dark">
                  {t('runOn')} {formatDate(new Date(run.createdAt), locale)}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-neutral-600 mt-1">
                  <span className="flex items-center gap-1.5">
                    <DistanceIcon className="text-neutral-500" />
                    {run.distance.toFixed(2)} km
                  </span>
                  <span className="flex items-center gap-1.5 mt-1 sm:mt-0">
                    <DurationIcon className="text-neutral-500" />
                    {formatDuration(run.duration)}
                  </span>
                </div>
              </div>
              <ChevronRightIcon className="text-neutral-400 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HistoryPageClient;