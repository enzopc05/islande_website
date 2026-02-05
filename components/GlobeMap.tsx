'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { TravelUpdate } from '@/types';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl').then(mod => mod.default), {
  ssr: false,
});

interface GlobeMapProps {
  updates: TravelUpdate[];
}

interface GlobePoint {
  lat: number;
  lng: number;
  size: number;
  altitude: number;
  color: string;
  label: string;
  day: number;
  title: string;
  location: string;
}

const GlobeMap = memo(function GlobeMap({ updates }: GlobeMapProps) {
  const globeEl = useRef<any>(null);
  const [globeReady, setGlobeReady] = useState(false);
  const [isZoomedToIceland, setIsZoomedToIceland] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Convertir les updates en points lumineux (plats sur la surface)
  const points: GlobePoint[] = updates.map((update, index) => {
    // Calculer taille progressive pour distinguer les étapes (très petits)
    const size = 0.12 + (index * 0.018); // Points très discrets
    
    return {
      lat: update.location.lat,
      lng: update.location.lng,
      size: size,
      altitude: 0, // Plat sur la surface
      color: '#00BCD4',
      label: `Jour ${update.day}: ${update.title}`,
      day: update.day,
      title: update.title,
      location: update.location.name,
    };
  });

  // Labels 3D avec numéros de jour - légèrement au-dessus de la surface
  const labels = updates.map((update, index) => ({
    lat: update.location.lat,
    lng: update.location.lng,
    text: update.day.toString().padStart(2, '0'),
    color: '#FFFFFF',
    altitude: 0.003, // Très proche de la surface
    size: 0.5, // Très petits
  }));

  // Créer des arcs entre les points (trajet)
  const arcs = updates.slice(0, -1).map((update, i) => ({
    startLat: update.location.lat,
    startLng: update.location.lng,
    endLat: updates[i + 1].location.lat,
    endLng: updates[i + 1].location.lng,
    color: ['rgba(0, 188, 212, 0.5)', 'rgba(77, 208, 225, 0.5)'],
  }));

  // Anneaux pulsants pour attirer l'attention sur chaque point
  const rings = updates.map((update) => ({
    lat: update.location.lat,
    lng: update.location.lng,
    maxR: 0.6, // Rayon max très réduit
    propagationSpeed: 3,
    repeatPeriod: 2000,
    color: 'rgba(0, 188, 212, 0.8)',
  }));

  useEffect(() => {
    if (!globeEl.current) return;

    // Configuration initiale : vue globale de la planète
    globeEl.current.pointOfView(
      {
        lat: 20,
        lng: 0,
        altitude: 2.5,
      },
      0
    );

    setGlobeReady(true);
  }, []);

  // Animation automatique : zoom sur l'Islande après 1 seconde
  useEffect(() => {
    if (!globeReady || !globeEl.current || isZoomedToIceland) return;

    const timer = setTimeout(() => {
      // Zoom dramatique sur l'Islande - vue d'ensemble pour voir l'île complète
      globeEl.current.pointOfView(
        {
          lat: 65.3, // Centré sur l'Islande
          lng: -18.5, // Légèrement décalé pour bien voir
          altitude: 0.45, // Vue d'ensemble: voir toute l'île + les points
        },
        3500 // 3.5 secondes d'animation fluide
      );
      setIsZoomedToIceland(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [globeReady, isZoomedToIceland]);

  // Fonction pour rezoomer sur l'Islande
  const zoomToIceland = () => {
    if (!globeEl.current) return;
    
    globeEl.current.pointOfView(
      {
        lat: 65.3,
        lng: -18.5,
        altitude: 0.45,
      },
      2000
    );
    setIsZoomedToIceland(true);
  };

  // Fonction pour vue globale
  const zoomOut = () => {
    if (!globeEl.current) return;
    
    globeEl.current.pointOfView(
      {
        lat: 20,
        lng: 0,
        altitude: 2.5,
      },
      2000
    );
    setIsZoomedToIceland(false);
  };

  return (
    <div className="relative w-full h-[700px] bg-black overflow-hidden">
      {/* Globe 3D */}
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Points lumineux sur la surface (avec tailles différentes)
        pointsData={points}
        pointAltitude={0}
        pointColor="color"
        pointRadius="size"
        pointLabel={(d: any) => `
          <div style="
            background: rgba(0,0,0,0.95);
            padding: 14px 18px;
            border-radius: 6px;
            border: 2px solid #00BCD4;
            font-family: sans-serif;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,188,212,0.3);
          ">
            <div style="color: #00BCD4; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 6px; font-weight: bold;">
              Jour ${d.day}
            </div>
            <div style="color: white; font-size: 16px; font-weight: 900; margin-bottom: 6px; letter-spacing: -0.02em;">
              ${d.title}
            </div>
            <div style="color: rgba(255,255,255,0.5); font-size: 12px;">
              📍 ${d.location}
            </div>
          </div>
        `}
        pointsMerge={false}
        onPointHover={(point: any) => setHoveredPoint(point ? point.day : null)}
        
        // Labels 3D avec numéros de jour (blancs, proches de la surface)
        labelsData={labels}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelAltitude="altitude"
        labelSize="size"
        labelColor={() => '#FFFFFF'}
        labelResolution={4}
        labelIncludeDot={false}
        
        // Anneaux pulsants autour des points
        ringsData={rings}
        ringColor={() => (t: number) => `rgba(0, 188, 212, ${1 - t})`}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        
        // Arcs entre les points (trajet)
        arcsData={arcs}
        arcColor="color"
        arcDashLength={0.5}
        arcDashGap={0.3}
        arcDashAnimateTime={3000}
        arcStroke={0.6}
        arcAltitude={0.02}
        
        // Style atmosphère
        atmosphereColor="#00BCD4"
        atmosphereAltitude={0.2}
        
        // Interaction
        enablePointerInteraction={true}
        
        // Qualité rendu
        width={typeof window !== 'undefined' ? window.innerWidth : 1200}
        height={700}
      />

      {/* Overlay gradient pour fondre dans le noir */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Contrôles overlay - style minimaliste */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
        <button
          onClick={zoomToIceland}
          className="px-8 py-4 bg-black/60 backdrop-blur-md border border-[#00BCD4]/40 text-white font-sans uppercase tracking-[0.4em] text-[10px] hover:border-[#00BCD4] hover:bg-[#00BCD4]/20 transition-all duration-500 shadow-lg shadow-[#00BCD4]/10"
        >
          Islande
        </button>
        <button
          onClick={zoomOut}
          className="px-8 py-4 bg-black/60 backdrop-blur-md border border-white/20 text-white/70 font-sans uppercase tracking-[0.4em] text-[10px] hover:border-white/40 hover:bg-white/10 hover:text-white transition-all duration-500"
        >
          Vue Globale
        </button>
      </div>

      {/* Info overlay - coin supérieur gauche */}
      <div className="absolute top-8 left-8 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-8 py-5 shadow-2xl">
          <p className="text-[10px] text-[#00BCD4]/60 uppercase tracking-[0.5em] font-sans mb-3">
            Notre Voyage
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-black text-[#00BCD4]">
              {updates.length}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-wider font-sans">
              Étapes
            </p>
          </div>
          {hoveredPoint && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[9px] text-white/50 uppercase tracking-wider font-sans mb-1">
                Au survol
              </p>
              <p className="text-sm text-[#00BCD4] font-sans font-medium">
                Jour {hoveredPoint}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Légende - coin supérieur droit */}
      <div className="absolute top-8 right-8 z-10">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-4 shadow-2xl">
          <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-sans mb-3">
            Légende
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-[#00BCD4]"></div>
                <div className="absolute inset-0 rounded-full bg-[#00BCD4] animate-ping opacity-30"></div>
              </div>
              <span className="text-[10px] text-white/70 font-sans">Points lumineux</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-gradient-to-r from-[#00BCD4] to-[#4DD0E1]"></div>
              <span className="text-[10px] text-white/70 font-sans">Trajet</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white font-sans font-black">01</span>
              <span className="text-[10px] text-white/70 font-sans">Numéro étape</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-[#00BCD4]/40"></div>
              <span className="text-[10px] text-white/70 font-sans">Halo pulsant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions initiales - disparaît après zoom */}
      {!isZoomedToIceland && globeReady && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center">
          <div className="bg-black/80 backdrop-blur-md border border-[#00BCD4]/30 px-12 py-8 animate-pulse">
            <div className="mb-3">
              <svg className="w-8 h-8 mx-auto text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-white/60 uppercase tracking-[0.5em] font-sans">
              Direction Islande...
            </p>
          </div>
        </div>
      )}

      {/* Hint interactif - apparaît après zoom */}
      {isZoomedToIceland && (
        <div className="absolute top-8 right-8 z-10 animate-fade-in">
          <div className="bg-black/40 backdrop-blur-sm border border-white/10 px-6 py-3">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-sans">
              Glissez pour explorer
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default GlobeMap;
