'use client';

import { useEffect, useState, useMemo } from 'react';
import { getTravelUpdates } from '@/lib/supabase-service';
import { TravelUpdate } from '@/types';
import Header from '@/components/Header';
import HeroEditorial from '@/components/HeroEditorial';
import UpdateDetailPanel from '@/components/UpdateDetailPanel';
import dynamic from 'next/dynamic';

// Import dynamique du globe 3D pour éviter les erreurs SSR
const GlobeMap = dynamic(() => import('@/components/GlobeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] bg-black flex items-center justify-center border border-white/5 overflow-hidden">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-[#00BCD4] mb-6"></div>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-sans">
          Chargement du globe...
        </p>
      </div>
    </div>
  ),
});

// Import dynamique de la carte 2D classique
const TravelMap = dynamic(() => import('@/components/TravelMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[700px] bg-black flex items-center justify-center border border-white/5 overflow-hidden">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/10 border-t-[#00BCD4] mb-6"></div>
        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-sans">
          Chargement de la carte...
        </p>
      </div>
    </div>
  ),
});

// Import dynamique des cartes d'update
const UpdateCard = dynamic(() => import('@/components/UpdateCard'), {
  ssr: false,
  loading: () => (
    <div className="bg-[var(--charcoal)] border border-white/10 overflow-hidden">
      <div className="relative h-80 bg-gradient-to-br from-[var(--deep-ocean)]/20 to-[var(--midnight)]/20 overflow-hidden">
        <div className="absolute inset-0 shimmer"></div>
        <div className="absolute top-6 left-6 glass-effect px-5 py-2.5 w-20 h-10"></div>
      </div>
      <div className="p-8 space-y-4">
        <div className="h-3 bg-white/10 rounded w-1/3 shimmer"></div>
        <div className="h-8 bg-white/10 rounded w-2/3 shimmer"></div>
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-5/6 shimmer"></div>
          <div className="h-4 bg-white/10 rounded w-4/6 shimmer"></div>
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  const [updates, setUpdates] = useState<TravelUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6); // Pagination lazy
  const [mapView, setMapView] = useState<'globe' | 'flat'>('globe'); // Vue 3D ou 2D
  const [selectedUpdate, setSelectedUpdate] = useState<TravelUpdate | null>(null);
  const [selectedUpdateIndex, setSelectedUpdateIndex] = useState<number>(-1);

  useEffect(() => {
    async function fetchUpdates() {
      const startTime = performance.now();
      
      try {
        // Charger localStorage de manière synchrone d'abord (plus rapide)
        const localData = localStorage.getItem('test_travel_updates');
        const testUpdates = localData ? JSON.parse(localData) : [];
        
        // Si on a des données locales, les afficher immédiatement
        if (testUpdates.length > 0) {
          setUpdates(testUpdates.sort((a: TravelUpdate, b: TravelUpdate) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
          setLoading(false);
        }
        
        // Puis charger Supabase en arrière-plan
        const remoteUpdates = await getTravelUpdates();
        
        // Fusionner et trier
        const allUpdates = [...remoteUpdates, ...testUpdates].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setUpdates(allUpdates);
        
        const endTime = performance.now();
        console.log(`⚡ Updates chargées en ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error('Error fetching updates:', error);
        
        // En cas d'erreur Supabase, charger au moins les updates locales
        const localData = localStorage.getItem('test_travel_updates');
        const testUpdates = localData ? JSON.parse(localData) : [];
        setUpdates(testUpdates);
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, []);

  // Mémoriser les updates visibles pour éviter les recalculs
  const visibleUpdates = useMemo(() => 
    updates.slice(0, visibleCount),
    [updates, visibleCount]
  );

  // Charger plus d'updates
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, updates.length));
  };

  // Ouvrir le panneau de détails
  const openUpdateDetail = (update: TravelUpdate, index: number) => {
    setSelectedUpdate(update);
    setSelectedUpdateIndex(index);
  };

  // Fermer le panneau
  const closeUpdateDetail = () => {
    setSelectedUpdate(null);
    setSelectedUpdateIndex(-1);
  };

  // Naviguer vers l'étape suivante
  const goToNextUpdate = () => {
    if (selectedUpdateIndex < updates.length - 1) {
      const newIndex = selectedUpdateIndex + 1;
      setSelectedUpdate(updates[newIndex]);
      setSelectedUpdateIndex(newIndex);
    }
  };

  // Naviguer vers l'étape précédente
  const goToPreviousUpdate = () => {
    if (selectedUpdateIndex > 0) {
      const newIndex = selectedUpdateIndex - 1;
      setSelectedUpdate(updates[newIndex]);
      setSelectedUpdateIndex(newIndex);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--basalt-black)]">
      <Header />

      {/* Hero Editorial */}
      <HeroEditorial updatesCount={updates.length} />

      <main className="relative bg-[var(--basalt-black)]">
        {/* Section Updates */}
        <section id="updates" className="py-32 px-6 relative">
          {/* Background subtil */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--basalt-black)] via-[var(--basalt-charcoal)] to-[var(--basalt-black)]"></div>
          
          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Section title - minimaliste */}
            <div className="text-center mb-32 animate-fade-in">
              <span className="text-[10px] font-sans uppercase tracking-[0.6em] text-[#00BCD4] mb-8 block">
                Le Voyage
              </span>
              <h2 className="text-7xl md:text-9xl font-display font-black text-white mb-0 tracking-tighter leading-[0.85]">
                Chroniques<br/>Glaciaires
              </h2>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-32">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[var(--glacier-blue)] opacity-20"></div>
                  <div className="animate-spin rounded-full h-24 w-24 border-4 border-[var(--charcoal)] border-t-[var(--glacier-blue)] border-r-[var(--ice-cyan)]"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <svg className="w-8 h-8 text-[var(--glacier-blue)] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && updates.length === 0 && (
              <div className="text-center py-32 animate-fade-in">
                <div className="mb-8 inline-block">
                  <svg className="w-32 h-32 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-4">
                  L'aventure commence bientôt
                </h3>
                <p className="text-white/60 font-serif text-lg italic">
                  Nous partons bientôt en Islande. Revenez pour suivre nos aventures glaciaires
                </p>
              </div>
            )}

            {/* Updates Grid - 2 colonnes spacieuses */}
            {!loading && updates.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-24">
                  {visibleUpdates.map((update, index) => (
                    <div
                      key={update.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <UpdateCard 
                        update={update} 
                        onClick={() => openUpdateDetail(update, updates.indexOf(update))}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Bouton Charger plus - minimaliste */}
                {visibleCount < updates.length && (
                  <div className="text-center mt-32">
                    <button
                      onClick={loadMore}
                      className="group px-16 py-6 bg-transparent border border-white/10 text-white font-sans uppercase tracking-[0.5em] text-[10px] hover:border-[#00BCD4] hover:text-[#00BCD4] transition-all duration-500"
                    >
                      Afficher plus
                    </button>
                    <p className="mt-6 text-[10px] text-white/20 font-sans uppercase tracking-[0.4em]">
                      {updates.length - visibleCount} {updates.length - visibleCount > 1 ? 'étapes' : 'étape'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Map Section - ultra minimaliste */}
        {!loading && updates.length > 0 && (
          <section id="carte" className="py-40 px-6">
            <div className="container mx-auto max-w-7xl">
              {/* En-tête radically simple */}
              <div className="max-w-5xl mx-auto mb-20 text-center">
                <span className="text-[10px] font-sans uppercase tracking-[0.6em] text-[#00BCD4] mb-8 block">
                  Voyage Immersif
                </span>
                <h2 className="text-7xl md:text-9xl font-display font-black text-white mb-8 tracking-tighter leading-[0.85]">
                  Notre<br/>Planète
                </h2>
                <p className="text-xs text-white/30 font-sans uppercase tracking-[0.4em]">
                  Cliquez et faites glisser pour explorer
                </p>
              </div>

              {/* Sélecteur de vue */}
              <div className="flex justify-center gap-4 mb-12">
                <button
                  onClick={() => setMapView('globe')}
                  className={`px-8 py-3 text-[10px] font-sans uppercase tracking-[0.4em] transition-all duration-300 ${
                    mapView === 'globe'
                      ? 'bg-[#00BCD4] text-black border-2 border-[#00BCD4]'
                      : 'bg-transparent text-white/40 border-2 border-white/10 hover:border-white/30 hover:text-white/60'
                  }`}
                >
                  Vue 3D Globe
                </button>
                <button
                  onClick={() => setMapView('flat')}
                  className={`px-8 py-3 text-[10px] font-sans uppercase tracking-[0.4em] transition-all duration-300 ${
                    mapView === 'flat'
                      ? 'bg-[#00BCD4] text-black border-2 border-[#00BCD4]'
                      : 'bg-transparent text-white/40 border-2 border-white/10 hover:border-white/30 hover:text-white/60'
                  }`}
                >
                  Carte 2D Précise
                </button>
              </div>

              {/* Carte interactive - basculable */}
              <div className="relative overflow-hidden">
                {mapView === 'globe' ? (
                  <GlobeMap updates={updates} />
                ) : (
                  <TravelMap updates={updates} />
                )}
              </div>

              {/* Stats - épurées */}
              <div className="mt-24 grid grid-cols-3 gap-12 max-w-3xl mx-auto text-center">
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">12</div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Jours</p>
                </div>
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">{updates.length}</div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Étapes</p>
                </div>
                <div>
                  <div className="text-5xl font-display font-black text-[#00BCD4] mb-2">∞</div>
                  <p className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/30">Souvenirs</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer - minimaliste absolu */}
      <footer className="bg-black text-white py-32 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-12">
            <svg className="w-16 h-16 mx-auto text-[#00BCD4] opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={0.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          
          <h3 className="text-5xl font-display font-black mb-6 text-white tracking-tighter">
            ÍSLAND
          </h3>
          
          <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-sans mb-12">
            Été 2026
          </p>
          
          <div className="flex items-center justify-center gap-4 text-[10px] text-white/10 font-sans uppercase tracking-[0.3em]">
            <span>Next.js</span>
            <span>•</span>
            <span>Supabase</span>
            <span>•</span>
            <span>Leaflet</span>
          </div>
        </div>
      </footer>

      {/* Panneau de détails */}
      <UpdateDetailPanel
        update={selectedUpdate}
        onClose={closeUpdateDetail}
        onNext={goToNextUpdate}
        onPrevious={goToPreviousUpdate}
        hasNext={selectedUpdateIndex < updates.length - 1}
        hasPrevious={selectedUpdateIndex > 0}
      />
    </div>
  );
}
