// components/run/RunHomeClient.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRunSession } from './RunSessionProvider';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { AppLocale } from '@/next-intl.config';
import { useRouter } from '@/app/i18n/navigation';
import dynamic from 'next/dynamic';
import SessionHeader from './SessionHeader';
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { GeoPoint } from '@/utils/helpers';
import { calculateDistance } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import MapInstanceGrabber from './MapInstanceGrabber';
import FABwrapper from './FABWrapper';
import Button from '@/components/ui/Button';            // ← NY delt komponent ✅

import L, { DivIcon, Map as LeafletMap } from 'leaflet';
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PolylineProps,
  ZoomControlProps,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic<MapContainerProps>(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<TileLayerProps>(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic<MarkerProps>(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic<PolylineProps>(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);
const ZoomControl = dynamic<ZoomControlProps>(
  () => import('react-leaflet').then((mod) => mod.ZoomControl),
  { ssr: false }
);

// ---------- SVG ICONS ----------
const PlayIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
      clipRule="evenodd"
    />
  </svg>
);
const PauseIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
      clipRule="evenodd"
    />
  </svg>
);
const StopIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path
      fillRule="evenodd"
      d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
      clipRule="evenodd"
    />
  </svg>
);

// ---------- HELPERS ----------
const createPulseIcon = (): DivIcon | null => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'custom-pulse-icon',
    html: `<div class="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl animate-pulse ring-4 ring-primary/30"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// ---------- COMPONENT ----------
const RunHomeClient: React.FC = () => {
  const { state, dispatch } = useRunSession();
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as AppLocale;
  const { user } = useAuth();
  const { addToast } = useToast();

  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
  const [pulseIcon, setPulseIcon] = useState<DivIcon | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const gpsToastIdRef = useRef<string | null>(null);

  // ---------- EFFECTS ----------
  useEffect(() => setPulseIcon(createPulseIcon()), []);

  const handleMapInstance = useCallback(
    (mapInstance: LeafletMap) => {
      mapRef.current = mapInstance;
      if (state.currentPosition && mapRef.current) {
        mapRef.current.setView([state.currentPosition.lat, state.currentPosition.lng], 16);
      }
    },
    [state.currentPosition]
  );

  /* ---------- rest of original effects & handlers  (uendret) ---------- */

  const requestLocationPermission = useCallback(() => {
    /* ... original kode ... */
  }, [dispatch, addToast, t]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    /* ... original GPS-watch + timer-effect ... */
  }, [state.status, state.gpsSignalLost, dispatch, addToast, t]);

  // ---------- HANDLERS ----------
  const handleStartRun = () => {
    /* ... original kode ... */
  };

  const handleSaveRun = async () => {
    /* ... original kode ... */
  };

  const polylinePositions = state.route.map((p) => [p.lat, p.lng] as [number, number]);

  // ---------- RENDER ----------
  return (
    <div className="flex flex-col h-full bg-neutral-200">
      {(state.status === 'running' || state.status === 'paused') && (
        <SessionHeader
          activeDuration={state.activeDuration}
          route={state.route}
          gpsSignalLost={state.gpsSignalLost}
        />
      )}

      <div className="flex-grow relative">
        {/* overlays + kart (alt det gamle) */}

        {/* FAB-wrapper – alltid over BottomNav og Home-indikator */}
        <FABwrapper>
          {/* IDLE → START */}
          {state.status === 'idle' && !state.error && state.currentPosition && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<PlayIcon className="w-8 h-8" />}
              onClick={handleStartRun}
              aria-label={t('RunControls.start')}
            >
              <span className="uppercase tracking-wider text-sm">
                {t('RunControls.start')}
              </span>
            </Button>
          )}

          {/* RUNNING → PAUSE */}
          {state.status === 'running' && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<PauseIcon className="w-6 h-6" />}
              onClick={() => dispatch({ type: 'PAUSE_RUN' })}
              aria-label={t('RunControls.pause')}
            >
              <span className="uppercase tracking-wider text-sm">
                {t('RunControls.pause')}
              </span>
            </Button>
          )}

          {/* PAUSED → RESUME & STOP */}
          {state.status === 'paused' && (
            <div className="flex gap-4 justify-center w-full">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                icon={<PlayIcon className="w-6 h-6" />}
                onClick={() => dispatch({ type: 'RESUME_RUN' })}
                aria-label={t('RunControls.resume')}
              >
                <span className="uppercase tracking-wider text-sm">
                  {t('RunControls.resume')}
                </span>
              </Button>
              <Button
                variant="neutral"
                size="lg"
                className="flex-1"
                icon={<StopIcon className="w-6 h-6" />}
                onClick={handleSaveRun}
                aria-label={t('RunControls.endAndSave')}
              >
                <span className="uppercase tracking-wider text-sm">
                  {t('RunControls.endAndSave')}
                </span>
              </Button>
            </div>
          )}
        </FABwrapper>
      </div>

      {/* global styles for leaflet + pulse */}
      {/* ... samme CSS som før ... */}
    </div>
  );
};

export default RunHomeClient;