'use client';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function LeafletResizeFix() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  return null;
}