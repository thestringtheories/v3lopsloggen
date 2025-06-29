"use client";
import dynamic from 'next/dynamic';
import { LatLngTuple } from 'leaflet';
import { PolylineProps, TileLayerProps, MapContainerProps } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic<MapContainerProps>(() =>
  import('react-leaflet').then(m => m.MapContainer), { ssr:false });
const TileLayer = dynamic<TileLayerProps>(() =>
  import('react-leaflet').then(m => m.TileLayer), { ssr:false });
const Polyline = dynamic<PolylineProps>(() =>
  import('react-leaflet').then(m => m.Polyline), { ssr:false });

export default function RunMapPreview({ points }:{ points: LatLngTuple[] }) {
  const bounds = points.length ? [points[0], points[points.length-1]] as [LatLngTuple,LatLngTuple] : undefined;
  return (
    <MapContainer
      bounds={bounds}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-48 rounded-lg overflow-hidden"
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      touchZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={points} weight={4} />
    </MapContainer>
  );
}