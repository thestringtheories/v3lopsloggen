// components/run/RunHomeClient.tsx
'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Fragment,
} from 'react';
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
import Button from '@/components/ui/Button';

import L, { DivIcon, Map as LeafletMap } from 'leaflet';
import type {
  MapContainerProps,
  TileLayerProps,
  MarkerProps,
  PolylineProps,
  ZoomControlProps,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- dynamiske Leaflet-importer (SSR off) ---
const MapContainer = dynamic<MapContainerProps>(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<TileLayerProps>(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic<MarkerProps>(
  () => import('react-leaflet').then((m) => m.Marker),
  { ssr: false }
);
const Polyline = dynamic<PolylineProps>(
  () => import('react-leaflet').then((m) => m.Polyline),
  { ssr: false }
);
const ZoomControl = dynamic<ZoomControlProps>(
  () => import('react-leaflet').then((m) => m.ZoomControl),
  { ssr: false }
);

// --- enkle SVG-ikoner (Play/Pause/Stop) ---
const PlayIcon   = ({ className='w-8 h-8' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />
  </svg>
);
const PauseIcon  = ({ className='w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" />
  </svg>
);
const StopIcon   = ({ className='w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" />
  </svg>
);

// --- hjelpefunksjon til pulsikon ---
const createPulseIcon = (): DivIcon | null =>
  typeof window === 'undefined'
    ? null
    : L.divIcon({
        className: 'custom-pulse-icon',
        html: `<div class="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl animate-pulse ring-4 ring-primary/30"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

// ---------- HOVEDKOMPONENT ----------
const RunHomeClient: React.FC = () => {
  const { state, dispatch } = useRunSession();
  const t                   = useTranslations();
  const router              = useRouter();
  const params              = useParams();
  const locale              = params.locale as AppLocale;
  const { user }            = useAuth();
  const { addToast }        = useToast();

  const [showPermOverlay, setShowPermOverlay] = useState(false);
  const [pulseIcon, setPulseIcon]             = useState<DivIcon | null>(null);

  const watchIdRef      = useRef<number | null>(null);
  const timerRef        = useRef<number | null>(null);
  const mapRef          = useRef<LeafletMap | null>(null);
  const gpsToastIdRef   = useRef<string | null>(null);

  // --- opprett Leaflet-ikon én gang ---
  useEffect(() => setPulseIcon(createPulseIcon()), []);

  // --- hent Leaflet-instans når MapInstanceGrabber fyrer ---
  const handleMapInstance = useCallback(
    (m: LeafletMap) => {
      mapRef.current = m;
      if (state.currentPosition)
        m.setView(
          [state.currentPosition.lat, state.currentPosition.lng],
          16
        );
    },
    [state.currentPosition]
  );

  // ---------- geolokasjonstillatelse ----------
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({ type: 'LOCATION_ERROR', payload: 'Geolocation unsupported' });
      addToast('Geolocation is not supported by your browser.', 'error');
      setShowPermOverlay(false);
      return;
    }
    dispatch({ type: 'REQUEST_LOCATION' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: GeoPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp,
        };
        dispatch({ type: 'LOCATION_SUCCESS', payload: p });
        setShowPermOverlay(false);
        mapRef.current?.setView([p.lat, p.lng], 16);
      },
      (err) => {
        dispatch({ type: 'LOCATION_ERROR', payload: err.message });
        if (err.code === err.PERMISSION_DENIED) setShowPermOverlay(true);
        else addToast(err.message || t('Auth.errorGeneric'), 'error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [dispatch, addToast, t]);

  useEffect(() => { requestLocationPermission(); }, [requestLocationPermission]);

  // ---------- timer + GPS-watch ----------
  useEffect(() => {
    if (state.status === 'running') {
      // start / restart timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(
        () => dispatch({ type: 'INCREMENT_DURATION' }),
        1000
      );

      // start / restart watch
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          if (state.gpsSignalLost) {
            dispatch({ type: 'GPS_SIGNAL_REACQUIRED' });
            if (gpsToastIdRef.current)
              addToast(t('HomePage.infoGpsSignalRestored'), 'success', {
                id: gpsToastIdRef.current,
              });
            else addToast(t('HomePage.infoGpsSignalRestored'), 'success');
            gpsToastIdRef.current = null;
          }
          const p: GeoPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            timestamp: pos.timestamp,
          };
          dispatch({ type: 'ADD_ROUTE_POINT', payload: p });
          mapRef.current?.panTo([p.lat, p.lng]);
        },
        (err) => {
          if (!state.gpsSignalLost) {
            dispatch({ type: 'GPS_SIGNAL_LOST' });
            gpsToastIdRef.current = addToast(
              t('HomePage.errorGpsSignalLost'),
              'warning',
              { duration: 10000 }
            );
          }
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    } else {
      // **vi er IKKE i running → stopp alt**
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);

      if (state.gpsSignalLost) {
        if (gpsToastIdRef.current) addToast('', 'blank', { id: gpsToastIdRef.current });
        gpsToastIdRef.current = null;
      }
    }

    // opprydding ved unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [state.status, state.gpsSignalLost, dispatch, addToast, t]);

  // ---------- handlers ----------
  const handleStartRun = () => {
    if (state.currentPosition) {
      dispatch({ type: 'START_RUN', payload: state.currentPosition });
    } else {
      addToast(t('HomePage.fetchingLocation'), 'info');
      requestLocationPermission();
    }
  };

  const handleSaveRun = async () => {
    if (!state.startTime || state.route.length < 2) {
      addToast(t('HomePage.errorNoDataToSave'), 'error');
      return dispatch({ type: 'RESET_RUN' });
    }
    if (!user) {
      addToast(t('Auth.errorGeneric'), 'error');
      return;
    }
    dispatch({ type: 'PREPARE_SAVE' });

    const totalDist = state.route.reduce((acc, p, i, arr) => {
      if (i === 0) return 0;
      const prev = arr[i - 1];
      return acc + calculateDistance(prev.lat, prev.lng, p.lat, p.lng);
    }, 0);

    try {
      const docRef = await addDoc(collection(db, 'runs'), {
        userId: user.uid,
        startTime: state.startTime,
        duration: state.activeDuration,
        route: state.route,
        distance: totalDist,
        createdAt: new Date().toISOString(),
      });
      addToast(t('Firebase.saveSuccess'), 'success');
      dispatch({ type: 'SAVE_RUN_SUCCESS' });
      router.push(`/løp/summary?runId=${docRef.id}`);
      dispatch({ type: 'RESET_RUN' });
    } catch {
      addToast(t('Firebase.saveError'), 'error');
      dispatch({ type: 'RESET_RUN' });
    }
  };

  const polyline = state.route.map((p) => [p.lat, p.lng] as [number, number]);

  // ---------- render ----------
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100">
      {/* topp-statistikk vises KUN når økten er i gang/pauset */}
      {(state.status === 'running' || state.status === 'paused') && (
        <SessionHeader
          activeDuration={state.activeDuration}
          route={state.route}
          gpsSignalLost={state.gpsSignalLost}
        />
      )}

      <main className="flex-grow pb-[calc(var(--nav-h)_+_1rem)]">
        <div className="flex flex-col h-full bg-neutral-200">
          {/* overlays */}
          {(state.status === 'locating' || state.status === 'saving') && (
            <div className="pointer-events-none fixed inset-0 z-40 flex flex-col items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-light" />
              <p className="mt-4 text-neutral-100 font-semibold text-lg">
                {state.status === 'locating'
                  ? t('HomePage.fetchingLocation')
                  : t('RunControls.saving')}
              </p>
            </div>
          )}

          {showPermOverlay && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-900/70 backdrop-blur-md p-6">
              <div className="rounded-xl bg-neutral-800 p-6 shadow-2xl max-w-xs w-full text-center">
                <h3 className="mb-3 text-xl font-semibold text-neutral-100">
                  {t('HomePage.permissionNeeded')}
                </h3>
                <p className="mb-6 text-sm text-neutral-300">
                  {t('Auth.errorGeneric')}
                </p>
                <Button variant="primary" onClick={requestLocationPermission} className="w-full">
                  {t('HomePage.grantPermission')}
                </Button>
              </div>
            </div>
          )}

          {/* kartet */}
          <MapContainer
            center={
              state.currentPosition
                ? [state.currentPosition.lat, state.currentPosition.lng]
                : [59.9139, 10.7522] /* fallback = Oslo */
            }
            zoom={15}
            className="w-full h-full"
            zoomControl={false}
          >
            <MapInstanceGrabber onMapInstance={handleMapInstance} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <ZoomControl position="bottomright" />
            {state.currentPosition && pulseIcon && (
              <Marker
                position={[
                  state.currentPosition.lat,
                  state.currentPosition.lng,
                ]}
                icon={pulseIcon}
              />
            )}
            {polyline.length > 1 && (
              <Polyline
                positions={polyline}
                pathOptions={{ color: '#14b8a6', weight: 5, opacity: 0.8 }}
              />
            )}
          </MapContainer>
        </div>

        {/* FAB – alltid øverst i stacking-contexten */}
        <FABwrapper>
          {state.status === 'idle' && !state.error && state.currentPosition && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<PlayIcon />}
              onClick={handleStartRun}
              aria-label={t('RunControls.start')}
            >
              {t('RunControls.start')}
            </Button>
          )}

          {state.status === 'running' && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              icon={<PauseIcon />}
              onClick={() => dispatch({ type: 'PAUSE_RUN' })}
              aria-label={t('RunControls.pause')}
            >
              {t('RunControls.pause')}
            </Button>
          )}

          {state.status === 'paused' && (
            <div className="flex gap-4 w-full">
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                icon={<PlayIcon />}
                onClick={() => dispatch({ type: 'RESUME_RUN' })}
                aria-label={t('RunControls.resume')}
              >
                {t('RunControls.resume')}
              </Button>
              <Button
                variant="neutral"
                size="lg"
                className="flex-1"
                icon={<StopIcon />}
                onClick={handleSaveRun}
                aria-label={t('RunControls.endAndSave')}
              >
                {t('RunControls.endAndSave')}
              </Button>
            </div>
          )}
        </FABwrapper>
      </main>

      {/* globale Leaflet + puls-styles */}
      <style jsx global>{`
        .custom-pulse-icon div {
          animation: customPulse 1.75s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes customPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.7;
          }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 8px rgb(0 0 0 / 0.2) !important;
        }
        .leaflet-control-zoom a {
          background: white !important;
          color: #334155 !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};

export default RunHomeClient;