'use client';

import { useState, useEffect } from 'react';
import { loadMockData, clearMockData, hasMockData } from '@/lib/mock-data';

/**
 * Composant pour charger/effacer facilement les données de test
 * À placer dans la page admin uniquement
 */
export default function TestDataLoader() {
  const [hasData, setHasData] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    setHasData(hasMockData());
  }, []);

  const handleLoadData = () => {
    loadMockData();
    setHasData(true);
    showMessage('✅ Données de test chargées ! Rechargez la page pour voir les photos.');
    
    // Recharger la page après 2 secondes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleClearData = () => {
    clearMockData();
    setHasData(false);
    showMessage('🗑️ Données de test effacées ! Rechargez la page.');
    
    // Recharger la page après 2 secondes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const showMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification */}
      {showNotification && (
        <div className="absolute bottom-20 right-0 bg-[#00BCD4] text-black px-6 py-3 rounded-lg shadow-2xl animate-fade-in mb-4 min-w-[300px]">
          <p className="text-sm font-sans font-medium">{notificationMessage}</p>
        </div>
      )}

      {/* Panel de contrôle */}
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="mb-4">
          <h3 className="text-white font-sans text-xs uppercase tracking-[0.3em] mb-2">
            Mode Test
          </h3>
          <p className="text-white/40 text-[10px] leading-relaxed">
            Chargez des données avec de vraies photos d'Islande pour tester le site
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {!hasData ? (
            <button
              onClick={handleLoadData}
              className="bg-[#00BCD4] hover:bg-[#00ACC1] text-black font-sans text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-lg transition-all duration-300 font-bold"
            >
              📸 Charger Photos Test
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-500 text-[10px] font-sans uppercase tracking-wider">
                  Données actives
                </span>
              </div>
              <button
                onClick={handleClearData}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 font-sans text-xs uppercase tracking-[0.2em] px-6 py-3 rounded-lg transition-all duration-300"
              >
                🗑️ Effacer données
              </button>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-white/30 text-[9px] leading-relaxed">
            Les photos proviennent d'Unsplash et sont affichées en temps réel.
            Vous pouvez aussi ajouter vos propres images dans <code className="text-[#00BCD4]">/public</code>
          </p>
        </div>
      </div>
    </div>
  );
}
