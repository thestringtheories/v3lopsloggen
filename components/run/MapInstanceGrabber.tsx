// components/run/MapInstanceGrabber.tsx
"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';

interface MapInstanceGrabberProps {
  onMapInstance: (map: LeafletMap) => void;
}

const MapInstanceGrabber: React.FC<MapInstanceGrabberProps> = ({ onMapInstance }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapInstance(map);
    }
  }, [map, onMapInstance]);

  return null; // This component does not render anything itself
};

export default MapInstanceGrabber;