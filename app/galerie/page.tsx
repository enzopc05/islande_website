'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { TravelUpdate } from '@/types';
import Image from 'next/image';

interface GalleryPhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  date: string;
  source?: 'update' | 'gallery'; // from travel update or direct upload
  updateDay?: number;
  updateTitle?: string;
}

export default function GaleriePage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);

  useEffect(() => {
    loadAllPhotos();
  }, []);

  const loadAllPhotos = () => {
    try {
      // Charger les photos des updates
      const localData = localStorage.getItem('test_travel_updates');
      const updates: TravelUpdate[] = localData ? JSON.parse(localData) : [];
      
      const updatePhotos: GalleryPhoto[] = updates.flatMap(update => 
        (update.photos || []).map((photoUrl, index) => ({
          id: `update-${update.id}-${index}`,
          url: photoUrl,
          title: `${update.title}`,
          description: update.description,
          date: update.date,
          source: 'update' as const,
          updateDay: update.day,
          updateTitle: update.title,
        }))
      );

      // Charger les photos de la galerie directe
      const galleryData = localStorage.getItem('gallery_photos');
      const directPhotos: GalleryPhoto[] = galleryData ? JSON.parse(galleryData) : [];

      // Fusionner et trier par date
      const allPhotos = [...updatePhotos, ...directPhotos].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPhotos(allPhotos);
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTestPhoto = (url: string) => url.startsWith('test-photo-');

  const openPhoto = (photo: GalleryPhoto, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setSelectedPhotoIndex(-1);
  };

  const navigatePrevious = () => {
    if (selectedPhotoIndex > 0) {
      const newIndex = selectedPhotoIndex - 1;
      setSelectedPhoto(photos[newIndex]);
      setSelectedPhotoIndex(newIndex);
    }
  };

  const navigateNext = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      const newIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(photos[newIndex]);
      setSelectedPhotoIndex(newIndex);
    }
  };

  // Gestion navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;

      switch (e.key) {
        case 'Escape':
          closePhoto();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, selectedPhotoIndex, photos]);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section - minimaliste nordique */}
      <section className="relative pt-32 pb-20 px-6 bg-black">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center animate-fade-in">
            <span className="text-[10px] font-sans uppercase tracking-[0.6em] text-[#00BCD4] mb-8 block">
              Galerie
            </span>
            <h1 className="text-7xl md:text-9xl font-display font-black text-white mb-8 tracking-tighter leading-[0.85]">
              Nos<br/>Souvenirs
            </h1>
            <p className="text-sm font-editorial text-white/40 max-w-2xl mx-auto italic tracking-wide">
              Une collection de moments capturés lors de notre voyage en Islande
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid - masonry minimaliste */}
      <section className="py-20 px-6 bg-black">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="relative bg-black border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-32">
              <svg className="w-24 h-24 mx-auto text-white/10 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40 font-editorial text-lg italic">Aucune photo pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {photos.map((photo, index) => {
                // Pattern masonry: alternance de tailles
                const isLarge = index % 7 === 0;
                const isWide = index % 5 === 0 && !isLarge;
                const isTall = index % 4 === 0 && !isLarge && !isWide;
                
                return (
                  <div
                    key={photo.id}
                    onClick={() => openPhoto(photo, index)}
                    className={`group relative overflow-hidden cursor-pointer border border-white/5 hover:border-[#00BCD4] transition-all duration-500 ${
                      isLarge ? 'col-span-2 row-span-2' : isWide ? 'col-span-2' : isTall ? 'row-span-2' : ''
                    }`}
                  >
                  {isTestPhoto(photo.url) ? (
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto text-white/10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-white/20 text-[10px] uppercase tracking-wider">Test</p>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      fill
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                    />
                  )}

                  {/* Overlay minimaliste au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    {photo.updateDay && (
                      <div className="mb-2">
                        <span className="text-[10px] font-sans uppercase tracking-[0.4em] text-[#00BCD4]">
                          Jour {photo.updateDay}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}

          {/* Stats minimalistes */}
          {photos.length > 0 && (
            <div className="mt-24 text-center">
              <div className="inline-flex items-center gap-12 px-12 py-6 border border-white/10">
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">
                    {photos.length}
                  </div>
                  <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">
                    Photos
                  </div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">
                    {photos.filter(p => p.source === 'update').length}
                  </div>
                  <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">
                    Voyage
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modal Photo - minimaliste nordique */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-4"
          onClick={closePhoto}
        >
          {/* Close Button */}
          <button
            onClick={closePhoto}
            className="absolute top-6 right-6 z-10 text-white/50 hover:text-[#00BCD4] transition-colors p-2"
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Previous */}
          {selectedPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-[#00BCD4] transition-all p-3"
              aria-label="Photo précédente"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Navigation Next */}
          {selectedPhotoIndex < photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/50 hover:text-[#00BCD4] transition-all p-3"
              aria-label="Photo suivante"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Counter */}
            <div className="text-center mb-6">
              <span className="text-white/40 text-[10px] font-sans uppercase tracking-[0.4em]">
                {selectedPhotoIndex + 1} / {photos.length}
              </span>
            </div>

            <div className="relative aspect-video mb-8">
              {isTestPhoto(selectedPhoto.url) ? (
                <div className="absolute inset-0 bg-black flex items-center justify-center border border-white/5">
                  <div className="text-center">
                    <svg className="w-32 h-32 mx-auto text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider">Test</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title || 'Photo'}
                  fill
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  className="object-contain"
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  priority
                />
              )}
            </div>

            <div className="p-8 border border-white/10 bg-black">
              {selectedPhoto.updateDay && (
                <span className="text-[10px] font-sans uppercase tracking-[0.4em] text-[#00BCD4] block mb-3">
                  Jour {selectedPhoto.updateDay}
                </span>
              )}
              <h2 className="text-3xl font-display font-black text-white mb-4 tracking-tight">
                {selectedPhoto.title || 'Sans titre'}
              </h2>
              {selectedPhoto.description && (
                <p className="text-white/60 font-editorial leading-relaxed text-base">
                  {selectedPhoto.description}
                </p>
              )}
              <div className="mt-6 text-[10px] text-white/30 font-sans uppercase tracking-[0.4em]">
                {new Date(selectedPhoto.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Miniatures - ultra-minimalistes */}
            <div className="mt-8 overflow-x-auto">
              <div className="flex gap-2 justify-center min-w-max px-4">
                {photos.slice(
                  Math.max(0, selectedPhotoIndex - 5),
                  Math.min(photos.length, selectedPhotoIndex + 6)
                ).map((photo, idx) => {
                  const actualIndex = Math.max(0, selectedPhotoIndex - 5) + idx;
                  const isActive = actualIndex === selectedPhotoIndex;
                  return (
                    <button
                      key={photo.id}
                      onClick={() => openPhoto(photo, actualIndex)}
                      className={`relative w-16 h-16 overflow-hidden transition-all border ${
                        isActive
                          ? 'border-[#00BCD4] opacity-100 scale-110'
                          : 'border-white/10 opacity-40 hover:opacity-100'
                      }`}
                    >
                      {isTestPhoto(photo.url) ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      ) : (
                        <Image
                          src={photo.url}
                          alt={photo.title || 'Thumbnail'}
                          fill
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          className="object-cover"
                          sizes="64px"
                          loading="lazy"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
