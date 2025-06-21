// components/run/RunHomeClient.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRunSession } from './RunSessionProvider';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import type { AppLocale } from '@/next-intl.config';
import { useRouter } from '@/app/i18n/navigation';
import dynamic from 'next/dynamic';
import LiveStatsBar from './LiveStatsBar';
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { GeoPoint } from '@/utils/helpers';
import { calculateDistance } from '@/utils/helpers';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/ToastProvider';
import MapInstanceGrabber from './MapInstanceGrabber';
import FABwrapper from './FABWrapper';

import L, { DivIcon, Map as LeafletMap } from 'leaflet';
import type { MapContainerProps, TileLayerProps, MarkerProps, PolylineProps, ZoomControlProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic<MapContainerProps>(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic<TileLayerProps>(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic<MarkerProps>(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Polyline = dynamic<PolylineProps>(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const ZoomControl = dynamic<ZoomControlProps>(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });

// SVG Icons for Controls
const PlayIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);
const PauseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
  </svg>
);
const StopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const createPulseIcon = (): DivIcon | null => {
  if (typeof window === 'undefined') return null;
  return L.divIcon({
    className: 'custom-pulse-icon',
    html: `<div class="w-5 h-5 bg-primary rounded-full border-2 border-white shadow-xl animate-pulse ring-4 ring-primary/30"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

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

  useEffect(() => {
    setPulseIcon(createPulseIcon());
  }, []);

  const handleMapInstance = useCallback((mapInstance: LeafletMap) => {
    mapRef.current = mapInstance;
    if (state.currentPosition && mapRef.current) {
      mapRef.current.setView([state.currentPosition.lat, state.currentPosition.lng], 16);
    }
  }, [state.currentPosition]);

  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({ type: 'LOCATION_ERROR', payload: 'Geolocation is not supported by your browser.' });
      addToast('Geolocation is not supported by your browser.', 'error');
      setShowPermissionOverlay(false);
      return;
    }
    dispatch({ type: 'REQUEST_LOCATION' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const geoPoint: GeoPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: position.timestamp,
        };
        dispatch({ type: 'LOCATION_SUCCESS', payload: geoPoint });
        setShowPermissionOverlay(false);
        if (mapRef.current) {
          mapRef.current.setView([geoPoint.lat, geoPoint.lng], 16);
        }
      },
      (error) => {
        dispatch({ type: 'LOCATION_ERROR', payload: error.message });
        if (error.code === error.PERMISSION_DENIED) {
          setShowPermissionOverlay(true);
        } else {
          addToast(error.message || t('Auth.errorGeneric'), 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [dispatch, addToast, t]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    if (state.status === 'running') {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        dispatch({ type: 'INCREMENT_DURATION' });
      }, 1000);

      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          if (state.gpsSignalLost) {
            dispatch({ type: 'GPS_SIGNAL_REACQUIRED' });
            if (gpsToastIdRef.current) addToast(t('HomePage.infoGpsSignalRestored'), 'success', { id: gpsToastIdRef.current });
            else addToast(t('HomePage.infoGpsSignalRestored'), 'success');
            gpsToastIdRef.current = null;
          }
          const newPoint: GeoPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: position.timestamp,
          };
          dispatch({ type: 'ADD_ROUTE_POINT', payload: newPoint });
          if (mapRef.current) {
            mapRef.current.panTo([newPoint.lat, newPoint.lng]);
          }
        },
        (error) => {
          console.error("Error watching position:", error);
          if (!state.gpsSignalLost) {
            dispatch({ type: 'GPS_SIGNAL_LOST' });
            gpsToastIdRef.current = addToast(t('HomePage.errorGpsSignalLost'), 'warning', { duration: 10000 });
          }
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (state.gpsSignalLost && (state.status === 'paused' || state.status === 'idle')) {
        if (gpsToastIdRef.current) addToast('', 'blank', { id: gpsToastIdRef.current });
        gpsToastIdRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [state.status, dispatch, state.gpsSignalLost, addToast, t]);

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
      dispatch({ type: 'RESET_RUN' });
      return;
    }
    if (!user) {
      addToast(t('Auth.errorGeneric'), 'error');
      return;
    }
    dispatch({ type: 'PREPARE_SAVE' });

    const totalDistance = state.route.reduce((acc: number, point: GeoPoint, index: number, arr: GeoPoint[]) => {
      if (index === 0) return 0;
      const prevPoint = arr[index - 1];
      return acc + calculateDistance(prevPoint.lat, prevPoint.lng, point.lat, point.lng);
    }, 0);

    const runData = {
      userId: user.uid,
      startTime: state.startTime,
      duration: state.activeDuration,
      route: state.route,
      distance: totalDistance,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "runs"), runData);
      addToast(t('Firebase.saveSuccess'), 'success');
      dispatch({ type: 'SAVE_RUN_SUCCESS' });
      router.push(`/løp/summary?runId=${docRef.id}`);
      dispatch({ type: 'RESET_RUN' });
    } catch (e) {
      console.error("Error adding document: ", e);
      addToast(t('Firebase.saveError'), 'error');
      dispatch({ type: 'RESET_RUN' });
    }
  };

  const polylinePositions = state.route.map((p: GeoPoint) => [p.lat, p.lng] as [number, number]);

  return (
    <div className="flex flex-col h-full bg-neutral-200">
      {(state.status === 'running' || state.status === 'paused') &&
        <LiveStatsBar activeDuration={state.activeDuration} route={state.route} gpsSignalLost={state.gpsSignalLost} />
      }
      <div className="flex-grow relative">
        {(state.status === 'locating' || state.status === 'saving') && (
          <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-center p-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-light mb-4"></div>
            <p className="text-lg text-neutral-100 font-semibold">
              {state.status === 'locating' ? t('HomePage.fetchingLocation') : t('RunControls.saving')}
            </p>
          </div>
        )}
        {showPermissionOverlay && (
          <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center">
            <div className="p-6 bg-neutral-800 rounded-xl shadow-2xl">
              <h3 className="text-xl font-semibold text-neutral-100 mb-3">{t('HomePage.permissionNeeded')}</h3>
              <p className="text-neutral-300 mb-6 text-sm">{t('Auth.errorGeneric')}</p>
              <button
                onClick={requestLocationPermission}
                className="btn-primary w-full"
              >
                {t('HomePage.grantPermission')}
              </button>
            </div>
          </div>
        )}
        {state.error && !showPermissionOverlay && state.status !== 'locating' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 p-3 bg-error text-white text-center text-sm z-30 shadow-md rounded-md max-w-sm w-11/12">
            {t('HomePage.permissionNeeded')} {state.error}
          </div>
        )}

        <MapContainer
          center={state.currentPosition ? [state.currentPosition.lat, state.currentPosition.lng] : [59.9139, 10.7522]}
          zoom={15}
          className="w-full h-[calc(100dvh-var(--header-h)-var(--safe-bottom))] z-0"
          zoomControl={false}
        >
          <MapInstanceGrabber onMapInstance={handleMapInstance} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ZoomControl position="bottomright" />
          {state.currentPosition && pulseIcon && (
            <Marker position={[state.currentPosition.lat, state.currentPosition.lng]} icon={pulseIcon} />
          )}
          {polylinePositions.length > 1 && (
            <Polyline pathOptions={{ color: '#14b8a6', weight: 5, opacity: 0.8 }} positions={polylinePositions} />
          )}
        </MapContainer>

        {/* FAB-wrapper – alltid over BottomNav og Home-indikator */}
        <FABwrapper>
          {state.status === 'idle' && !state.error && state.currentPosition && (
            <button
              onClick={handleStartRun}
              className="flex items-center justify-center w-20 h-20 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl transition-transform duration-150 ease-in-out active:scale-95"
              aria-label={t('RunControls.start')}
            >
              <PlayIcon className="w-10 h-10" />
            </button>
          )}
          {state.status === 'running' && (
            <button
              onClick={() => dispatch({ type: 'PAUSE_RUN' })}
              className="flex items-center justify-center w-16 h-16 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-transform duration-150 ease-in-out active:scale-95"
              aria-label={t('RunControls.pause')}
            >
              <PauseIcon />
            </button>
          )}
          {state.status === 'paused' && (
            <div className="flex gap-4">
              <button
                onClick={() => dispatch({ type: 'RESUME_RUN' })}
                className="flex items-center justify-center w-16 h-16 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg transition-transform duration-150 ease-in-out active:scale-95"
                aria-label={t('RunControls.resume')}
              >
                <PlayIcon className="w-8 h-8" />
              </button>
              <button
                onClick={handleSaveRun}
                className="flex items-center justify-center w-16 h-16 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full shadow-lg transition-transform duration-150 ease-in-out active:scale-95"
                aria-label={t('RunControls.endAndSave')}
              >
                <StopIcon />
              </button>
            </div>
          )}
        </FABwrapper>
      </div>
      <style jsx global>{`
        .custom-pulse-icon div {
          animation: customPulse 1.75s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes customPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
        .leaflet-control-zoom { 
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #334155 !important; 
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f1f5f9 !important; 
        }
      `}</style>
    </div>
  );
};

export default RunHomeClient;