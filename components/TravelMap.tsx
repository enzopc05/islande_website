'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { TravelUpdate, TravelSpot } from '@/types';
import 'leaflet/dist/leaflet.css';

interface TravelMapProps {
  updates: TravelUpdate[];
  spots?: TravelSpot[];
  showSpots?: boolean;
  focusDay?: number | null;
}

const TravelMap = memo(function TravelMap({ updates, spots = [], showSpots = true, focusDay = null }: TravelMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mémoriser le centre de la carte
  const icelandCenter: LatLngExpression = useMemo(() => [64.9631, -19.0208], []);
  
  // Mémoriser les points de la polyline pour éviter les recalculs
  const visibleUpdates = useMemo(
    () => (focusDay ? updates.filter((update) => update.day === focusDay) : updates),
    [updates, focusDay]
  );

  const pathPoints = useMemo<LatLngExpression[]>(() => 
    visibleUpdates
      .sort((a, b) => a.day - b.day)
      .map((update) => [update.location.lat, update.location.lng]),
    [visibleUpdates]
  );

  const spotPoints = useMemo<TravelSpot[]>(() => spots.filter((spot) => spot.location), [spots]);

  const focusTarget = useMemo<LatLngExpression | null>(() => {
    if (!focusDay) return null;
    const target = updates.find((update) => update.day === focusDay);
    if (!target) return null;
    return [target.location.lat, target.location.lng];
  }, [updates, focusDay]);

  function MapFocusUpdater({ target }: { target: LatLngExpression | null }) {
    const map = useMap();
    useEffect(() => {
      if (target) {
        map.setView(target, 10, { animate: true });
      }
    }, [map, target]);
    return null;
  }

  // Custom icon pour les markers (mémorisé) - DOIT être avant le early return
  const createCustomIcon = useMemo(() => (day: number) => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
          <path fill="#00D4FF" d="M16 0C7.2 0 0 7.2 0 16c0 8.8 16 24 16 24s16-15.2 16-24C32 7.2 24.8 0 16 0z"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" text-anchor="middle" font-size="10" font-weight="bold" fill="#00D4FF">${day}</text>
        </svg>
      `)}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-[var(--charcoal)] rounded-lg flex items-center justify-center border border-white/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--glacier-blue)] mx-auto mb-4"></div>
          <div className="text-white/70 font-serif">Chargement de la carte...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={icelandCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polyline pour tracer le chemin */}
        {pathPoints.length > 1 && (
          <Polyline
            positions={pathPoints}
            color="#00D4FF"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Markers pour chaque étape */}
        <MapFocusUpdater target={focusTarget} />

        {visibleUpdates.map((update) => {
          const coverPhoto = update.photos?.[0];
          const isTestPhoto = coverPhoto?.url?.startsWith('test-photo-');
          
          return (
            <Marker
              key={update.id}
              position={[update.location.lat, update.location.lng]}
              icon={createCustomIcon(update.day)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-1">{update.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Jour {update.day}</p>
                  <p className="text-sm mb-2">{update.location.name}</p>
                  {update.photos && update.photos.length > 0 && coverPhoto && !isTestPhoto && (
                    <img
                      src={coverPhoto.url}
                      alt={update.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  {isTestPhoto && (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
                      <p className="text-white text-xs">📷 Photo de test</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Spots intermediaires */}
        {showSpots &&
          spotPoints.map((spot) => (
            <CircleMarker
              key={spot.id}
              center={[spot.location.lat, spot.location.lng]}
              radius={5}
              pathOptions={{ color: '#FFB347', fillColor: '#FFB347', fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-1">{spot.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">Spot - Jour {spot.day}</p>
                  {spot.description && <p className="text-xs">{spot.description}</p>}
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
});

export default TravelMap;
