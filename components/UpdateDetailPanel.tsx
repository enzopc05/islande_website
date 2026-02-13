'use client';

import { TravelUpdate } from '@/types';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface UpdateDetailPanelProps {
  update: TravelUpdate | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function UpdateDetailPanel({ 
  update, 
  onClose, 
  onNext, 
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: UpdateDetailPanelProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (update) {
      setCurrentPhotoIndex(0);
      // Bloquer le scroll du body quand le panneau est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      // R\u00e9activer le scroll quand le panneau est ferm\u00e9
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [update]);

  // Gestion clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!update) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentPhotoIndex > 0) {
            setCurrentPhotoIndex(currentPhotoIndex - 1);
          } else if (hasPrevious && onPrevious) {
            onPrevious();
          }
          break;
        case 'ArrowRight':
          if (update.photos && currentPhotoIndex < update.photos.length - 1) {
            setCurrentPhotoIndex(currentPhotoIndex + 1);
          } else if (hasNext && onNext) {
            onNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [update, currentPhotoIndex, onClose, onNext, onPrevious, hasNext, hasPrevious]);

  if (!update) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isTestPhoto = (photoUrl?: string) => (photoUrl ? photoUrl.startsWith('test-photo-') : false);

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[800px] bg-black border-l border-white/10 z-50 overflow-y-auto animate-slide-in-right-panel">
        {/* Header fixe */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl font-display font-black text-[#00BCD4] leading-none">
                {update.day.toString().padStart(2, '0')}
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white tracking-tight">
                  {update.title}
                </h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mt-1">
                  {formatDate(update.date)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-3 hover:bg-white/5 transition-colors rounded-full group"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Galerie photos */}
        {update.photos && update.photos.length > 0 && (
          <div className="relative">
            <div className="relative h-[500px] bg-black">
              {!update.photos[currentPhotoIndex]?.url ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/20 text-xs font-sans uppercase tracking-[0.4em]">Image manquante</p>
                  </div>
                </div>
              ) : isTestPhoto(update.photos[currentPhotoIndex]?.url) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/20 text-xs font-sans uppercase tracking-[0.4em]">Test Image</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={update.photos[currentPhotoIndex]?.url}
                  alt={`${update.title} - Photo ${currentPhotoIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="800px"
                  priority
                />
              )}

              {/* Navigation photos */}
              {update.photos.length > 1 && (
                <>
                  {currentPhotoIndex > 0 && (
                    <button
                      onClick={() => setCurrentPhotoIndex(currentPhotoIndex - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 rounded-full transition-all group"
                    >
                      <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {currentPhotoIndex < update.photos.length - 1 && (
                    <button
                      onClick={() => setCurrentPhotoIndex(currentPhotoIndex + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/10 rounded-full transition-all group"
                    >
                      <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  {/* Indicateur photos */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    {update.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentPhotoIndex ? 'bg-[#00BCD4] w-6' : 'bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Photo ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Contenu */}
        <div className="p-8 space-y-8">
          {/* Localisation */}
          <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-lg">
            <svg className="w-6 h-6 text-[#00BCD4] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mb-2">
                Localisation
              </p>
              <p className="text-white text-lg font-display font-bold tracking-tight">
                {update.location.name}
              </p>
              <p className="text-white/40 text-xs font-mono mt-2">
                {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}
              </p>
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${update.location.lat}&mlon=${update.location.lng}#map=13/${update.location.lat}/${update.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#00BCD4]/10 border border-[#00BCD4]/30 text-[#00BCD4] hover:bg-[#00BCD4]/20 transition-all text-[10px] uppercase tracking-wider font-sans font-bold rounded"
            >
              Voir sur OSM
            </a>
            <a
              href={`/galerie?day=${update.day}`}
              className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all text-[10px] uppercase tracking-wider font-sans font-bold rounded"
            >
              Galerie du jour
            </a>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mb-4">
              Description
            </p>
            <div className="prose prose-invert max-w-none">
              <p className="text-white/70 font-editorial leading-relaxed text-base whitespace-pre-line">
                {update.description}
              </p>
            </div>
          </div>

          {update.extras && (update.extras.microStory || update.extras.highlights?.length) && (
            <div className="space-y-6">
              {update.extras.microStory && (
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mb-4">
                    Micro-story
                  </p>
                  <p className="text-white/70 font-editorial leading-relaxed text-base whitespace-pre-line">
                    {update.extras.microStory}
                  </p>
                </div>
              )}

              {update.extras.highlights && update.extras.highlights.length > 0 && (
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mb-4">
                    Faits marquants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {update.extras.highlights.map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="px-3 py-2 border border-white/10 text-[10px] text-white/60 uppercase tracking-wider font-sans"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
              <div className="text-3xl font-display font-black text-[#00BCD4] mb-2">
                {update.photos?.length || 0}
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">
                Photo{update.photos && update.photos.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg text-center">
              <div className="text-3xl font-display font-black text-[#00BCD4] mb-2">
                {update.day}
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">
                Jour
              </p>
            </div>
          </div>
        </div>

        {/* Navigation entre étapes */}
        {(hasPrevious || hasNext) && (
          <div className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#00BCD4]/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-bold">
                  Étape précédente
                </span>
              </button>

              <button
                onClick={onNext}
                disabled={!hasNext}
                className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#00BCD4]/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-bold">
                  Étape suivante
                </span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
