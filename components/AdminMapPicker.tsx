'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type MapCenter = [number, number];

type AdminMapPickerProps = {
  center: MapCenter;
  zoom: number;
  hasCoords: boolean;
  coords: { lat: number; lng: number };
  hasSpotCoords: boolean;
  spotCoords: { lat: number; lng: number };
  onSelect: (lat: number, lng: number) => void;
};

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapViewUpdater({ center, zoom }: { center: MapCenter; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

export default function AdminMapPicker({
  center,
  zoom,
  hasCoords,
  coords,
  hasSpotCoords,
  spotCoords,
  onSelect,
}: AdminMapPickerProps) {
  const markerIcon = new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path fill="#00D4FF" d="M14 0C6.3 0 0 6.3 0 14c0 7.7 14 22 14 22s14-14.3 14-22C28 6.3 21.7 0 14 0z"/>
        <circle cx="14" cy="14" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewUpdater center={center} zoom={zoom} />
      <MapClickHandler onSelect={onSelect} />
      {hasCoords && <Marker position={[coords.lat, coords.lng]} icon={markerIcon} />}
      {hasSpotCoords && (
        <CircleMarker
          center={[spotCoords.lat, spotCoords.lng]}
          radius={6}
          pathOptions={{ color: '#FFB347', fillColor: '#FFB347', fillOpacity: 0.9 }}
        />
      )}
    </MapContainer>
  );
}
