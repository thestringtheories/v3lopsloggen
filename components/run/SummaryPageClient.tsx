// components/run/SummaryPageClient.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl'; // Updated import path
import dynamic from 'next/dynamic';
import { db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GeoPoint, formatDuration, formatDate } from '@/utils/helpers';
import MapInstanceGrabber from './MapInstanceGrabber'; // Import the new component

import L, { Map as LeafletMap } from 'leaflet'; // Updated import for Map
import type { MapContainerProps, TileLayerProps, PolylineProps, ZoomControlProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import leaflet CSS


const MapContainer = dynamic<MapContainerProps>(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic<TileLayerProps>(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic<PolylineProps>(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const ZoomControl = dynamic<ZoomControlProps>(() => import('react-leaflet').then(mod => mod.ZoomControl), { ssr: false });


export interface RunData { 
  id: string;
  userId?: string; 
  startTime: number;
  duration: number; 
  route: GeoPoint[];
  distance: number; 
  createdAt: string; 
}

interface SummaryPageClientProps {
  runId?: string;
}

const SummaryPageClient: React.FC<SummaryPageClientProps> = ({ runId }) => {
  const t = useTranslations('SummaryPage');
  const locale = useLocale();
  const [runData, setRunData] = useState<RunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMapInstance = useCallback((mapInstance: LeafletMap) => {
    mapRef.current = mapInstance;
  }, []);

  useEffect(() => {
    if (!runId) {
      setError(t('runNotFound')); 
      setLoading(false);
      return;
    }

    const fetchRunData = async () => {
      setLoading(true);
      setError(null);
      try {
        const runDocRef = doc(db, 'runs', runId);
        const runDocSnap = await getDoc(runDocRef);

        if (runDocSnap.exists()) {
          setRunData({ id: runDocSnap.id, ...runDocSnap.data() } as RunData);
        } else {
          setError(t('runNotFound')); 
        }
      } catch (err: any) { 
        console.error("Error fetching run data:", err);
        if (err.code === 'permission-denied') {
             setError("You don't have permission to view this run."); 
        } else {
            setError(t('errorLoadingDetails')); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRunData();
  }, [runId, t]);
  
  useEffect(() => {
    if (mapRef.current && runData && runData.route.length > 0) {
      if (typeof window !== 'undefined') {
        const bounds = L.latLngBounds(runData.route.map((p: GeoPoint) => [p.lat, p.lng]));
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else if (runData.route.length === 1) {
           mapRef.current.setView([runData.route[0].lat, runData.route[0].lng], 15);
        }
      }
    }
  }, [runData, mapRef.current]); // Add mapRef.current to dependency array if map instance could change


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        {t('loadingRun')}
      </div>
    );
  }

  if (error || !runData) {
     return (
        <div className="text-center p-8 text-error bg-red-50 rounded-lg shadow-md max-w-md mx-auto my-10">
          <h2 className="text-xl font-semibold mb-2">{t('runNotFound')}</h2>
          <p>{error}</p>
        </div>
    );
  }

  const polylinePositions = runData.route.map((p: GeoPoint) => [p.lat, p.lng] as [number, number]);
  const avgPace = runData.distance > 0 ? (runData.duration / 60) / runData.distance : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary-dark">{t('title')}</h1>
        <p className="text-neutral-600">{t('yourRun')} - {formatDate(new Date(runData.createdAt), locale)}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-primary">{t('map')}</h2>
          <div className="h-80 md:h-96 rounded-lg overflow-hidden border border-neutral-200">
            <MapContainer 
                center={polylinePositions.length > 0 ? polylinePositions[0] : [59.9139, 10.7522]} 
                zoom={13} 
                className="w-full h-full"
                zoomControl={false}
                // whenCreated prop removed
            >
              <MapInstanceGrabber onMapInstance={handleMapInstance} />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <ZoomControl position="bottomright" />
              {polylinePositions.length > 0 && (
                <Polyline pathOptions={{ color: '#14b8a6', weight: 5, opacity: 0.9 }} positions={polylinePositions} />
              )}
            </MapContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-primary">Stats</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">{t('distance')}:</span>
              <span className="text-neutral-900 font-semibold">{runData.distance.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">{t('duration')}:</span>
              <span className="text-neutral-900 font-semibold">{formatDuration(runData.duration)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-100">
              <span className="font-medium text-neutral-700">{t('avgPace')}:</span>
              <span className="text-neutral-900 font-semibold">{avgPace > 0 ? `${avgPace.toFixed(2)} min/km` : '--'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-neutral-700">{t('date')}:</span>
              <span className="text-neutral-900 font-semibold">{formatDate(new Date(runData.startTime), locale)}</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-200">
            <h3 className="text-lg font-semibold text-primary mb-2">AI Feedback</h3>
            <p className="text-neutral-500 italic bg-neutral-50 p-4 rounded-md text-sm">{t('aiFeedbackPlaceholder')}</p>
          </div>
        </div>
      </div>
       <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default SummaryPageClient;