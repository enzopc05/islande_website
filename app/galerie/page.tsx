'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import { TravelUpdate } from '@/types';
import { getGalleryPhotos, getTravelUpdates, GalleryPhoto } from '@/lib/supabase-service';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams } from 'next/navigation';

export default function GaleriePage() {
  const searchParams = useSearchParams();
  const dayFilter = Number.parseInt(searchParams.get('day') || '', 10);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(-1);
  const [sortMode, setSortMode] = useState<'latest' | 'top'>('latest');
  const [user, setUser] = useState<any>(null);
  const [authMessage, setAuthMessage] = useState('');
  const [photoLikes, setPhotoLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const scrollRestoreRef = useRef<{ y: number } | null>(null);
  const isUuid = (value?: string) =>
    Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

  useEffect(() => {
    void loadAllPhotos();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadAllPhotos = async () => {
    try {
      const localUpdatesData = localStorage.getItem('test_travel_updates');
      const localUpdates: TravelUpdate[] = localUpdatesData ? JSON.parse(localUpdatesData) : [];
      const remoteUpdates = await getTravelUpdates();
      const updates = [...remoteUpdates, ...localUpdates];

      const updatePhotos: GalleryPhoto[] = updates.flatMap((update) =>
        (update.photos || []).map((photo, index) => ({
          id: `update-${photo.id}-${index}`,
          url: photo.url,
          title: update.title,
          description: update.description,
          date: update.date,
          source: 'update' as const,
          updateDay: update.day,
          updateTitle: update.title,
          updateId: update.id,
          photoId: photo.id,
        }))
      );

      const localGalleryData = localStorage.getItem('gallery_photos');
      const localGallery: GalleryPhoto[] = localGalleryData ? JSON.parse(localGalleryData) : [];
      const remoteGallery = await getGalleryPhotos();

      const allPhotos = [...updatePhotos, ...remoteGallery, ...localGallery].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPhotos(allPhotos);
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoKey = (photo: GalleryPhoto) => photo.photoId || photo.id;

  useEffect(() => {
    const loadLikes = async () => {
      if (photos.length === 0) return;
      const photoIds = photos.map(getPhotoKey).filter((id): id is string => isUuid(id));
      if (photoIds.length === 0) return;

      const { data, error } = await supabase
        .from('photo_likes')
        .select('photo_id, user_id')
        .in('photo_id', photoIds);

      if (error || !data) return;

      const likeCounts: Record<string, number> = {};
      const liked = new Set<string>();
      data.forEach((row: any) => {
        likeCounts[row.photo_id] = (likeCounts[row.photo_id] ?? 0) + 1;
        if (user?.id && row.user_id === user.id) liked.add(row.photo_id);
      });

      setPhotoLikes(likeCounts);
      setUserLikes(liked);
    };

    void loadLikes();
  }, [photos, user]);

  const filteredPhotos = useMemo(() => {
    if (!Number.isNaN(dayFilter) && dayFilter > 0) {
      return photos.filter((photo) => photo.updateDay === dayFilter);
    }
    return photos;
  }, [photos, dayFilter]);

  const displayedPhotos = useMemo(() => {
    const sorted = [...filteredPhotos];
    if (sortMode === 'top') {
      return sorted.sort((a, b) => {
        const aLikes = photoLikes[getPhotoKey(a)] ?? 0;
        const bLikes = photoLikes[getPhotoKey(b)] ?? 0;
        if (bLikes !== aLikes) return bLikes - aLikes;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }
    return sorted;
  }, [filteredPhotos, sortMode, photoLikes]);

  const isTestPhoto = (url?: string) => (url ? url.startsWith('test-photo-') : false);

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
      setSelectedPhoto(displayedPhotos[newIndex]);
      setSelectedPhotoIndex(newIndex);
    }
  };

  const navigateNext = () => {
    if (selectedPhotoIndex < displayedPhotos.length - 1) {
      const newIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(displayedPhotos[newIndex]);
      setSelectedPhotoIndex(newIndex);
    }
  };

  const loadComments = async (photo: GalleryPhoto) => {
    const photoId = getPhotoKey(photo);
    if (!isUuid(photoId)) return;

    const { data } = await supabase
      .from('photo_comments')
      .select('id, photo_id, user_id, user_email, content, created_at')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

    if (data) {
      setComments((prev) => ({ ...prev, [photoId]: data }));
    }
  };

  const toggleLike = async (photo: GalleryPhoto) => {
    const photoId = getPhotoKey(photo);
    if (!isUuid(photoId)) {
      setAuthMessage('Likes indisponibles pour cette photo');
      return;
    }
    if (!user) {
      setAuthMessage('Connecte-toi pour liker');
      return;
    }

    if (userLikes.has(photoId)) {
      await supabase.from('photo_likes').delete().eq('photo_id', photoId).eq('user_id', user.id);
      setUserLikes((prev) => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
      setPhotoLikes((prev) => ({ ...prev, [photoId]: Math.max((prev[photoId] || 1) - 1, 0) }));
      return;
    }

    await supabase.from('photo_likes').insert({ photo_id: photoId, user_id: user.id });
    setUserLikes((prev) => new Set(prev).add(photoId));
    setPhotoLikes((prev) => ({ ...prev, [photoId]: (prev[photoId] || 0) + 1 }));
  };

  const submitComment = async () => {
    if (!selectedPhoto) return;
    const photoId = getPhotoKey(selectedPhoto);
    if (!isUuid(photoId)) {
      setAuthMessage('Commentaires indisponibles pour cette photo');
      return;
    }
    if (!user) {
      setAuthMessage('Connecte-toi pour commenter');
      return;
    }
    if (!commentDraft.trim()) return;

    const payload = {
      photo_id: photoId,
      user_id: user.id,
      user_email: user.email,
      content: commentDraft.trim(),
    };

    const { data } = await supabase.from('photo_comments').insert(payload).select('*').single();
    if (data) {
      setComments((prev) => ({
        ...prev,
        [photoId]: [data, ...(prev[photoId] || [])],
      }));
      setCommentDraft('');
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
  }, [selectedPhoto, selectedPhotoIndex, displayedPhotos]);

  useEffect(() => {
    if (selectedPhoto) {
      void loadComments(selectedPhoto);
    }
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const y = window.scrollY;
    scrollRestoreRef.current = { y };

    // Lock body scroll without jumping the page position.
    document.body.style.position = 'fixed';
    document.body.style.top = `-${y}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      const restoreY = scrollRestoreRef.current?.y ?? 0;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, restoreY);
      scrollRestoreRef.current = null;
    };
  }, [selectedPhoto]);

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">
              {dayFilter > 0 ? `Filtre jour ${dayFilter}` : 'Toutes les photos'}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSortMode('latest')}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
                  sortMode === 'latest'
                    ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/10'
                    : 'border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                Derniers
              </button>
              <button
                onClick={() => setSortMode('top')}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
                  sortMode === 'top'
                    ? 'border-[#FFB347] text-[#FFB347] bg-[#FFB347]/10'
                    : 'border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                Top likes
              </button>
            </div>
          </div>

          <div className="mb-12 border border-white/10 bg-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">Connexion</p>
              <p className="text-white/70 text-sm">
                {user ? `Connecte en tant que ${user.email}` : 'Connecte-toi pour liker et commenter'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setAuthMessage('Deconnecte');
                  }}
                  className="px-4 py-2 border border-white/10 text-white/60 hover:text-white hover:border-white/40 transition-all text-[10px] uppercase tracking-wider"
                >
                  Se deconnecter
                </button>
              ) : (
                <a
                  href="/auth"
                  className="px-4 py-2 bg-[#00BCD4] text-black text-[10px] uppercase tracking-[0.4em] font-sans font-bold"
                >
                  Se connecter
                </a>
              )}
              {authMessage && (
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  {authMessage}
                </span>
              )}
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="relative bg-black border border-white/5 overflow-hidden">
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              ))}
            </div>
          ) : displayedPhotos.length === 0 ? (
            <div className="text-center py-32">
              <svg className="w-24 h-24 mx-auto text-white/10 mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/40 font-editorial text-lg italic">Aucune photo pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {displayedPhotos.map((photo, index) => {
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
          {displayedPhotos.length > 0 && (
            <div className="mt-24 text-center">
              <div className="inline-flex items-center gap-12 px-12 py-6 border border-white/10">
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">
                    {displayedPhotos.length}
                  </div>
                  <div className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">
                    Photos
                  </div>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">
                    {displayedPhotos.filter(p => p.source === 'update').length}
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
          {selectedPhotoIndex < displayedPhotos.length - 1 && (
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
                {selectedPhotoIndex + 1} / {displayedPhotos.length}
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

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => toggleLike(selectedPhoto)}
                  className={`px-4 py-2 border text-[10px] uppercase tracking-wider font-sans transition-all ${
                    userLikes.has(getPhotoKey(selectedPhoto))
                      ? 'border-[#FFB347] text-[#FFB347] bg-[#FFB347]/10'
                      : 'border-white/10 text-white/40 hover:text-white/70'
                  }`}
                >
                  ❤️ {photoLikes[getPhotoKey(selectedPhoto)] ?? 0}
                </button>
                <span className="text-[10px] text-white/30 uppercase tracking-wider font-sans">
                  {user ? 'Connecte' : 'Connecte-toi pour liker'}
                </span>
              </div>

              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans mb-4">
                  Commentaires
                </p>
                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                  {(comments[getPhotoKey(selectedPhoto)] || []).length === 0 && (
                    <p className="text-white/40 text-sm">Aucun commentaire</p>
                  )}
                  {(comments[getPhotoKey(selectedPhoto)] || []).map((comment: any) => (
                    <div key={comment.id} className="border border-white/10 p-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans mb-2">
                        {comment.user_email || comment.user_id}
                      </p>
                      <p className="text-white/70 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 sticky bottom-0 bg-black/95 pt-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-stretch gap-3">
                      <textarea
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        rows={3}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] transition-all"
                        placeholder="Ajouter un commentaire..."
                      />
                      <button
                        onClick={submitComment}
                        className="px-4 py-2 bg-[#00BCD4] text-black text-[10px] uppercase tracking-[0.4em] font-sans font-bold"
                      >
                        Envoyer
                      </button>
                    </div>
                    {!user && (
                      <a
                        href="/auth"
                        className="text-[10px] uppercase tracking-[0.4em] font-sans text-white/50 hover:text-white"
                      >
                        Se connecter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Miniatures - ultra-minimalistes */}
            <div className="mt-8 overflow-x-auto">
              <div className="flex gap-2 justify-center min-w-max px-4">
                {displayedPhotos.slice(
                  Math.max(0, selectedPhotoIndex - 5),
                  Math.min(displayedPhotos.length, selectedPhotoIndex + 6)
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
