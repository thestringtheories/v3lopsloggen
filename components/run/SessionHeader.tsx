// components/run/SessionHeader.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatDuration, calculateDistance, GeoPoint } from '@/utils/helpers';

/* ---------- Ikoner ---------- */
const ClockIcon   = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const RouteIcon   = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
  </svg>
);
const SpeedIcon   = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);
const GpsWeakIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75S7.615 6.228 12.868 2.25M21.752 15.002l1.048-3.396M21.752 15.002L18 21.75M3.322 11.022l1.048 3.396M3.322 11.022L6.75 4.275m11.252 6.747-1.048-3.396M18 4.275l-1.048 3.396m0 0L21.752 15.002M18 4.275l3.75 6.75M6.75 4.275l3.75 6.75M3.322 11.022l3.428-1.056m1.048 3.396 3.428 1.056" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" />
  </svg>
);
const GpsStrongIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
  </svg>
);

/* ---------- Props ---------- */
interface Props {
  activeDuration: number;
  route: GeoPoint[];
  gpsSignalLost: boolean;
}

/* ---------- Component ---------- */
const SessionHeader: React.FC<Props> = ({ activeDuration, route, gpsSignalLost }) => {
  const t = useTranslations('LiveStatsBar');

  const totalDistance = route.reduce((acc, p, i, arr) => {
    if (i === 0) return 0;
    const prev = arr[i - 1];
    return acc + calculateDistance(prev.lat, prev.lng, p.lat, p.lng);
  }, 0);

  const pace = totalDistance > 0 && activeDuration > 0 ? (activeDuration / 60) / totalDistance : 0;

  return (
    <div className="pointer-events-none safe-top-fixed inset-x-0 absolute z-30">
      <div className="pointer-events-auto mx-4 rounded-2xl bg-neutral-50/90 dark:bg-neutral-800/85 p-4 shadow-md backdrop-blur-md text-neutral-900 dark:text-neutral-100">
        <div className="flex justify-around text-center">
          {/* TIME */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs uppercase text-neutral-400 mb-0.5">
              <ClockIcon /> {t('time')}
            </div>
            <div className="text-xl font-semibold tabular-nums">{formatDuration(activeDuration)}</div>
          </div>

          {/* DISTANCE */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs uppercase text-neutral-400 mb-0.5">
              <RouteIcon /> {t('distance')}
            </div>
            <div className="text-xl font-semibold tabular-nums">
              {totalDistance.toFixed(2)} <span className="text-sm font-normal">{t('km')}</span>
            </div>
          </div>

          {/* PACE */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-xs uppercase text-neutral-400 mb-0.5">
              <SpeedIcon /> {t('pace')}
            </div>
            <div className="text-xl font-semibold tabular-nums">
              {pace > 0 ? pace.toFixed(2) : '--'}{' '}
              {pace > 0 && <span className="text-sm font-normal">{t('minKm')}</span>}
            </div>
          </div>

          {/* GPS */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-1 text-xs uppercase mb-0.5 ${gpsSignalLost ? 'text-warning' : 'text-neutral-400'}`}>
              {gpsSignalLost ? <GpsWeakIcon className="text-warning" /> : <GpsStrongIcon />} {t('gpsStatus')}
            </div>
            <div className={`text-xl font-semibold ${gpsSignalLost ? 'text-warning animate-pulse' : 'text-neutral-900 dark:text-neutral-100'}`}>
              {gpsSignalLost ? t('gpsPoor') : 'OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;