'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  addGalleryPhotos,
  addTravelUpdate,
  deleteGalleryPhoto as deleteGalleryPhotoRemote,
  deleteTravelUpdate,
  getGalleryPhotos,
  getTravelUpdates,
  updateTravelUpdate,
  uploadGalleryPhotos,
  uploadPhotos,
} from '@/lib/supabase-service';
import Header from '@/components/Header';
import TestDataLoader from '@/components/TestDataLoader';
import { TravelUpdate, TravelSpot } from '@/types';

const AdminMapPicker = dynamic(() => import('@/components/AdminMapPicker'), {
  ssr: false,
});

type TabType = 'create' | 'manage' | 'spots' | 'gallery';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [day, setDay] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [microStory, setMicroStory] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [spots, setSpots] = useState<TravelSpot[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [testMode, setTestMode] = useState(false);
  const [existingUpdates, setExistingUpdates] = useState<TravelUpdate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([]);
  const [existingPhotoObjects, setExistingPhotoObjects] = useState<any[]>([]);
  
  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryPhotoFiles, setGalleryPhotoFiles] = useState<File[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadExistingUpdates();
      loadGalleryPhotos();
    }
  }, []);

  const loadGalleryPhotos = async () => {
    try {
      const data = localStorage.getItem('gallery_photos');
      const localPhotos = data ? JSON.parse(data) : [];
      const remotePhotos = await getGalleryPhotos();
      const allPhotos = [...remotePhotos, ...localPhotos].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setGalleryPhotos(allPhotos);
    } catch (error) {
      console.error('Erreur chargement photos galerie:', error);
      setGalleryPhotos([]);
    }
  };

  const loadExistingUpdates = async () => {
    try {
      const localData = localStorage.getItem('test_travel_updates');
      const testUpdates = localData ? JSON.parse(localData) : [];
      
      if (testUpdates.length > 0) {
        setExistingUpdates(testUpdates.sort((a: TravelUpdate, b: TravelUpdate) => a.day - b.day));
      }
      
      const remoteUpdates = await getTravelUpdates({ includeDrafts: true });
      const allUpdates = [...remoteUpdates, ...testUpdates].sort((a, b) => a.day - b.day);
      setExistingUpdates(allUpdates);
    } catch (error) {
      console.error('Erreur lors du chargement des updates:', error);
      const localData = localStorage.getItem('test_travel_updates');
      const testUpdates = localData ? JSON.parse(localData) : [];
      setExistingUpdates(testUpdates);
    }
  };

  const extractCoordinatesFromGoogleMapsLink = (link: string) => {
    try {
      let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites');
        return true;
      }

      match = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites');
        return true;
      }

      match = link.match(/\/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites');
        return true;
      }

      match = link.match(/#map=\d+\/(-?\d+\.\d+)\/(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites');
        return true;
      }

      match = link.match(/[?&]mlat=(-?\d+\.\d+)&mlon=(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites');
        return true;
      }

      setMessage('❌ Format de lien non reconnu');
      return false;
    } catch (error) {
      setMessage('❌ Erreur extraction coordonnées');
      return false;
    }
  };

  const handleGoogleMapsLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setGoogleMapsLink(link);
    
    if (
      link.includes('openstreetmap.org') ||
      link.includes('google.com/maps') ||
      link.includes('maps.app.goo.gl')
    ) {
      extractCoordinatesFromGoogleMapsLink(link);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'islande2026';

    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      setMessage('');
    } else {
      setMessage('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  const handleSendTestEmail = async () => {
    const email = testEmail.trim();
    if (!email) {
      setMessage('❌ Renseigne un email pour le test');
      return;
    }

    setSendingTestEmail(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || 'Erreur envoi test');
      }

      setMessage('✅ Email test envoye');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur envoi test';
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingDate(null);
    setExistingPhotoUrls([]);
    setExistingPhotoObjects([]);
    setDay(1);
    setTitle('');
    setDescription('');
    setMicroStory('');
    setHighlightsInput('');
    setStatus('published');
    setLocationName('');
    setLat('');
    setLng('');
    setGoogleMapsLink('');
    setSpots([]);
    setSelectedFiles([]);
    setPreviewData(null);
    const fileInput = document.getElementById('photos') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleRemoveExistingPhoto = (photoId: string) => {
    setExistingPhotoObjects((prev: any[]) => {
      const next = prev.filter((photo) => photo.id !== photoId);
      setExistingPhotoUrls(next.map((photo) => photo.url).filter(Boolean));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const highlights = highlightsInput
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const updateData: any = {
        day,
        title,
        description,
        status,
        location: {
          name: locationName,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        spots,
        extras: {
          microStory: microStory.trim(),
          highlights,
        },
        date: editingDate ?? new Date().toISOString(),
        photos: [],
      };

      if (testMode) {
        const localUpdateId = editingId ?? `test-${Date.now()}`;
        updateData.id = localUpdateId;
        const newPhotos = selectedFiles.map((_, index) => ({
          id: `${localUpdateId}-photo-${Date.now()}-${index}`,
          updateId: localUpdateId,
          url: `test-photo-${day}-${Date.now()}-${index}`,
        }));
        updateData.photos = editingId ? [...existingPhotoObjects, ...newPhotos] : newPhotos;
        
        const localData = localStorage.getItem('test_travel_updates');
        const updates = localData ? JSON.parse(localData) : [];
        
        if (editingId) {
          const index = updates.findIndex((u: any) => u.id === editingId);
          if (index !== -1) {
            updates[index] = { ...updateData, id: editingId };
          }
          setMessage(`✅ Update jour ${day} modifiée localement`);
        } else {
          updates.push(updateData);
          setMessage(`✅ Update jour ${day} créée localement`);
        }
        
        localStorage.setItem('test_travel_updates', JSON.stringify(updates));
        await loadExistingUpdates();
        resetForm();
      } else {
        const updateId = editingId ?? `update-${Date.now()}`;
        let photoUrls: string[] = [];
        if (selectedFiles.length > 0) {
          photoUrls = await uploadPhotos(selectedFiles, updateId);
        }

        updateData.photos = editingId ? [...existingPhotoUrls, ...photoUrls] : photoUrls;

        if (editingId) {
          await updateTravelUpdate(editingId, updateData);
          setMessage(`✅ Update jour ${day} modifiée sur Supabase`);
        } else {
          await addTravelUpdate(updateData);
          setMessage(`✅ Update jour ${day} publiée sur Supabase`);
        }
        await loadExistingUpdates();
        resetForm();
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const editUpdate = (update: TravelUpdate) => {
    setEditingId(update.id);
    setEditingDate(update.date);
    setExistingPhotoUrls((update.photos || []).map((photo: any) => photo.url).filter(Boolean));
    setExistingPhotoObjects(update.photos || []);
    setDay(update.day);
    setTitle(update.title);
    setDescription(update.description);
    setMicroStory(update.extras?.microStory ?? '');
    setHighlightsInput((update.extras?.highlights ?? []).join(', '));
    setStatus(update.status ?? 'published');
    setLocationName(update.location.name);
    setLat(update.location.lat.toString());
    setLng(update.location.lng.toString());
    setSpots(update.spots ?? []);
    setMessage('📝 Mode édition activé');
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm('Supprimer cette update ?')) return;

    try {
      if (!testMode) {
        await deleteTravelUpdate(id);
        setMessage('🗑️ Update supprimée');
        await loadExistingUpdates();
        return;
      }

      const localData = localStorage.getItem('test_travel_updates');
      const updates = localData ? JSON.parse(localData) : [];
      const filtered = updates.filter((u: any) => u.id !== id);
      localStorage.setItem('test_travel_updates', JSON.stringify(filtered));
      setMessage('🗑️ Update supprimée');
      loadExistingUpdates();
    } catch (error) {
      setMessage('❌ Erreur suppression');
    }
  };

  const duplicateUpdate = async (update: TravelUpdate) => {
    const duplicated = {
      ...update,
      id: `dup-${Date.now()}`,
      title: `${update.title} (copie)`,
      date: new Date().toISOString(),
      status: 'draft' as const,
    };

    if (testMode) {
      const localData = localStorage.getItem('test_travel_updates');
      const updates = localData ? JSON.parse(localData) : [];
      updates.push(duplicated);
      localStorage.setItem('test_travel_updates', JSON.stringify(updates));
      setMessage('✅ Etape dupliquee (test)');
      await loadExistingUpdates();
      return;
    }

    const photoUrls = (update.photos || []).map((photo: any) => photo.url).filter(Boolean);
    await addTravelUpdate({
      date: duplicated.date,
      day: duplicated.day,
      title: duplicated.title,
      description: duplicated.description,
      status: 'draft',
      location: duplicated.location,
      photos: photoUrls,
      spots: duplicated.spots ?? [],
      extras: duplicated.extras
        ? {
            microStory: duplicated.extras.microStory,
            highlights: duplicated.extras.highlights,
          }
        : undefined,
    });

    setMessage('✅ Etape dupliquee (brouillon)');
    await loadExistingUpdates();
  };

  const removeSpotFromUpdate = (updateId: string, spotId: string) => {
    if (!testMode) {
      setMessage('❌ Suppression spots disponible seulement en mode test');
      return;
    }

    const localData = localStorage.getItem('test_travel_updates');
    const updates = localData ? JSON.parse(localData) : [];
    const index = updates.findIndex((u: any) => u.id === updateId);
    if (index === -1) return;

    updates[index].spots = (updates[index].spots || []).filter((s: any) => s.id !== spotId);
    localStorage.setItem('test_travel_updates', JSON.stringify(updates));
    setExistingUpdates(updates);
    setMessage('🗑️ Spot supprimé (mode test)');
  };

  const handleImportUpdates = async (file: File) => {
    try {
      const content = await file.text();
      const parsed = JSON.parse(content);
      const updates = Array.isArray(parsed) ? parsed : parsed?.updates;

      if (!Array.isArray(updates)) {
        setMessage('❌ Format JSON invalide');
        return;
      }

      if (testMode) {
        const localData = localStorage.getItem('test_travel_updates');
        const existing = localData ? JSON.parse(localData) : [];
        const normalized = updates.map((update: any) => {
          const localUpdateId = update.id || `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          const photoUrls = Array.isArray(update.photos) ? update.photos : [];
          const photos = photoUrls.length > 0 && typeof photoUrls[0] === 'string'
            ? photoUrls.map((url: string, index: number) => ({
                id: `${localUpdateId}-photo-${index}`,
                updateId: localUpdateId,
                url,
              }))
            : photoUrls;

          return {
            ...update,
            id: localUpdateId,
            photos,
          };
        });
        const merged = [...existing, ...normalized];
        localStorage.setItem('test_travel_updates', JSON.stringify(merged));
        await loadExistingUpdates();
        setMessage(`✅ ${normalized.length} update(s) importée(s) en test`);
        return;
      }

      for (const update of updates) {
        const normalizedPhotos = Array.isArray(update.photos)
          ? update.photos.map((photo: any) => (typeof photo === 'string' ? photo : photo.url)).filter(Boolean)
          : [];
        await addTravelUpdate({
          ...update,
          photos: normalizedPhotos,
        });
      }

      await loadExistingUpdates();
      setMessage(`✅ ${updates.length} update(s) importée(s)`);
    } catch (error) {
      console.error('Import error:', error);
      setMessage('❌ Erreur import JSON');
    }
  };

  const clearTestUpdates = () => {
    if (confirm('Effacer toutes les updates de test ?')) {
      localStorage.removeItem('test_travel_updates');
      setExistingUpdates([]);
      setMessage('🧹 Données de test effacées');
    }
  };

  const handleAddGalleryPhotos = async () => {
    if (galleryPhotoFiles.length === 0) {
      setMessage('❌ Sélectionnez au moins une photo');
      return;
    }

    try {
      const resetGalleryForm = () => {
        setGalleryPhotoFiles([]);
        setGalleryTitle('');
        setGalleryDescription('');
        const fileInput = document.getElementById('galleryPhotos') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      };

      if (!testMode) {
        const photoUrls = await uploadGalleryPhotos(galleryPhotoFiles);
        const newPhotos = photoUrls.map((url, index) => ({
          url,
          title: galleryTitle || `Photo ${galleryPhotos.length + index + 1}`,
          description: galleryDescription,
          date: new Date().toISOString(),
          source: 'gallery' as const,
        }));

        await addGalleryPhotos(newPhotos);
        resetGalleryForm();
        setMessage(`✅ ${newPhotos.length} photo(s) ajoutée(s)`);
        await loadGalleryPhotos();
        return;
      }

      const existingPhotos = localStorage.getItem('gallery_photos');
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      const newPhotos = galleryPhotoFiles.map((_, index) => ({
        id: `gallery-${Date.now()}-${index}`,
        url: `test-photo-gallery-${Date.now()}-${index}`,
        title: galleryTitle || `Photo ${photos.length + index + 1}`,
        description: galleryDescription,
        date: new Date().toISOString(),
        source: 'gallery' as const,
      }));

      photos.push(...newPhotos);
      localStorage.setItem('gallery_photos', JSON.stringify(photos));
      resetGalleryForm();
      setMessage(`✅ ${newPhotos.length} photo(s) ajoutée(s)`);
      loadGalleryPhotos();
    } catch (error) {
      setMessage('❌ Erreur ajout photos');
    }
  };

  const deleteGalleryPhoto = async (photoId: string) => {
    if (!confirm('Supprimer cette photo ?')) return;

    try {
      if (!testMode) {
        await deleteGalleryPhotoRemote(photoId);
        setMessage('🗑️ Photo supprimée');
        await loadGalleryPhotos();
        return;
      }

      const data = localStorage.getItem('gallery_photos');
      const photos = data ? JSON.parse(data) : [];
      const filtered = photos.filter((p: any) => p.id !== photoId);
      localStorage.setItem('gallery_photos', JSON.stringify(filtered));
      setMessage('🗑️ Photo supprimée');
      loadGalleryPhotos();
    } catch (error) {
      setMessage('❌ Erreur suppression');
    }
  };

  // Login page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-7xl font-display font-black text-white mb-4 tracking-tighter">
              ADMIN
            </h1>
            <p className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">
              Panneau d'administration
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all text-center text-lg tracking-wider"
                placeholder="Mot de passe"
                autoFocus
              />
            </div>

            {message && (
              <div className="text-center p-4 bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#00BCD4] text-black py-4 font-sans uppercase tracking-[0.4em] text-[10px] hover:bg-white transition-all font-bold"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main admin interface with tabs
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-32 max-w-7xl">
        {/* Header avec déconnexion */}
        <div className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-6xl md:text-7xl font-display font-black text-white tracking-tighter mb-2">
              ADMIN
            </h1>
            <p className="text-[10px] font-sans uppercase tracking-[0.5em] text-white/40">
              Gestion du contenu
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-6 py-3 border border-white/10 text-white/60 hover:border-red-500/50 hover:text-red-400 transition-all text-[10px] uppercase tracking-[0.4em] font-sans"
          >
            Déconnexion
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-12 border-b border-white/10 pb-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-8 py-4 font-sans uppercase tracking-[0.4em] text-[10px] transition-all border-b-2 ${
              activeTab === 'create'
                ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/5'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            ➕ Créer
          </button>
          
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-8 py-4 font-sans uppercase tracking-[0.4em] text-[10px] transition-all border-b-2 relative ${
              activeTab === 'manage'
                ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/5'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            📋 Gérer étapes
            {existingUpdates.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#00BCD4] text-black text-[8px] rounded-full font-bold">
                {existingUpdates.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('spots')}
            className={`px-8 py-4 font-sans uppercase tracking-[0.4em] text-[10px] transition-all border-b-2 ${
              activeTab === 'spots'
                ? 'border-[#FFB347] text-[#FFB347] bg-[#FFB347]/5'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            ✨ Gérer spots
          </button>
          
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-8 py-4 font-sans uppercase tracking-[0.4em] text-[10px] transition-all border-b-2 ${
              activeTab === 'gallery'
                ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/5'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            🖼️ Galerie
            {galleryPhotos.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#00BCD4] text-black text-[8px] rounded-full font-bold">
                {galleryPhotos.length}
              </span>
            )}
          </button>
        </div>


        {/* Notifications */}
        {message && (
          <div className={`mb-8 p-4 text-center border ${
            message.includes('✅') 
              ? 'bg-green-500/10 text-green-400 border-green-500/30' 
              : message.includes('❌')
              ? 'bg-red-500/10 text-red-400 border-red-500/30'
              : 'bg-[#00BCD4]/10 text-[#00BCD4] border-[#00BCD4]/30'
          } text-sm font-sans`}>
            {message}
          </div>
        )}

        {/* Email test */}
        <div className="mb-8 p-6 border border-white/10 bg-white/5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
                Email test Resend
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
                placeholder="ex: toi@email.com"
              />
            </div>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={sendingTestEmail}
              className="px-6 py-3 bg-[#00BCD4] text-black text-[10px] uppercase tracking-[0.4em] font-sans font-bold disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
            >
              {sendingTestEmail ? 'Envoi...' : 'Envoyer test'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' && (
          <CreateUpdateForm
            day={day}
            setDay={setDay}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            microStory={microStory}
            setMicroStory={setMicroStory}
            highlightsInput={highlightsInput}
            setHighlightsInput={setHighlightsInput}
            status={status}
            setStatus={setStatus}
            locationName={locationName}
            setLocationName={setLocationName}
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
            googleMapsLink={googleMapsLink}
            setGoogleMapsLink={setGoogleMapsLink}
            spots={spots}
            setSpots={setSpots}
            handleGoogleMapsLinkChange={handleGoogleMapsLinkChange}
            selectedFiles={selectedFiles}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            loading={loading}
            editingId={editingId}
            existingPhotoCount={existingPhotoUrls.length}
            existingPhotos={existingPhotoObjects}
            onRemoveExistingPhoto={handleRemoveExistingPhoto}
            resetForm={resetForm}
            previewData={previewData}
            setPreviewData={setPreviewData}
            onImportUpdates={handleImportUpdates}
          />
        )}

        {activeTab === 'manage' && (
          <ManageUpdatesTab
            updates={existingUpdates}
            onEdit={editUpdate}
            onDuplicate={duplicateUpdate}
            onDelete={deleteUpdate}
            onClearAll={clearTestUpdates}
          />
        )}

        {activeTab === 'spots' && (
          <ManageSpotsTab
            updates={existingUpdates}
            onEditUpdate={editUpdate}
            onRemoveSpot={removeSpotFromUpdate}
            testMode={testMode}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryTab
            photos={galleryPhotos}
            photoFiles={galleryPhotoFiles}
            setPhotoFiles={setGalleryPhotoFiles}
            title={galleryTitle}
            setTitle={setGalleryTitle}
            description={galleryDescription}
            setDescription={setGalleryDescription}
            onAdd={handleAddGalleryPhotos}
            onDelete={deleteGalleryPhoto}
          />
        )}
      </div>

      {/* Loader de données de test */}
      <TestDataLoader />
    </div>
  );
}

// Component: Create/Edit Update Form
function CreateUpdateForm({ 
  day, setDay, title, setTitle, description, setDescription,
  microStory, setMicroStory, highlightsInput, setHighlightsInput,
  status, setStatus,
  locationName, setLocationName, lat, setLat, lng, setLng,
  googleMapsLink, setGoogleMapsLink, spots, setSpots, handleGoogleMapsLinkChange, selectedFiles, handleFileChange,
  handleSubmit, loading, editingId, existingPhotoCount, existingPhotos, onRemoveExistingPhoto, resetForm, previewData, setPreviewData, onImportUpdates
}: any) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [spotDescription, setSpotDescription] = useState('');
  const [spotLat, setSpotLat] = useState('');
  const [spotLng, setSpotLng] = useState('');
  const [spotSuggestions, setSpotSuggestions] = useState<any[]>([]);
  const [spotSearching, setSpotSearching] = useState(false);
  const [showSpotSuggestions, setShowSpotSuggestions] = useState(false);
  const [mapTarget, setMapTarget] = useState<'update' | 'spot'>('update');

  const defaultCenter = useMemo<[number, number]>(() => [64.9631, -19.0208], []);
  const parsedLat = Number.parseFloat(lat);
  const parsedLng = Number.parseFloat(lng);
  const hasCoords = !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);
  const parsedSpotLat = Number.parseFloat(spotLat);
  const parsedSpotLng = Number.parseFloat(spotLng);
  const hasSpotCoords = !Number.isNaN(parsedSpotLat) && !Number.isNaN(parsedSpotLng);
  const mapCenter: [number, number] = hasCoords ? [parsedLat, parsedLng] : defaultCenter;
  const mapZoom = hasCoords ? 10 : 6;
  const spotReady = spotName.trim().length > 0 && hasSpotCoords;


  useEffect(() => {
    setSpotName('');
    setSpotDescription('');
    setSpotLat('');
    setSpotLng('');
    setSpotSuggestions([]);
  }, [editingId]);

  useEffect(() => {
    const query = locationName.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&limit=6&addressdetails=1&accept-language=fr`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Nominatim error');
        const data = await response.json();
        setSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locationName]);

  useEffect(() => {
    const query = spotName.trim();
    if (query.length < 3) {
      setSpotSuggestions([]);
      setSpotSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setSpotSearching(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&limit=6&addressdetails=1&accept-language=fr`;
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Nominatim error');
        const data = await response.json();
        setSpotSuggestions(Array.isArray(data) ? data : []);
      } catch (error) {
        if ((error as any)?.name !== 'AbortError') {
          setSpotSuggestions([]);
        }
      } finally {
        setSpotSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [spotName]);

  const handleSuggestionSelect = (item: any) => {
    const nextName = item.display_name || item.name || '';
    const nextLat = Number.parseFloat(item.lat);
    const nextLng = Number.parseFloat(item.lon);

    if (nextName) setLocationName(nextName);
    if (!Number.isNaN(nextLat)) setLat(nextLat.toString());
    if (!Number.isNaN(nextLng)) setLng(nextLng.toString());
    if (!Number.isNaN(nextLat) && !Number.isNaN(nextLng)) {
      setGoogleMapsLink(`https://www.openstreetmap.org/?mlat=${nextLat}&mlon=${nextLng}#map=13/${nextLat}/${nextLng}`);
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSpotSuggestionSelect = (item: any) => {
    const nextName = item.display_name || item.name || '';
    const nextLat = Number.parseFloat(item.lat);
    const nextLng = Number.parseFloat(item.lon);

    if (nextName) setSpotName(nextName);
    if (!Number.isNaN(nextLat)) setSpotLat(nextLat.toString());
    if (!Number.isNaN(nextLng)) setSpotLng(nextLng.toString());

    setShowSpotSuggestions(false);
    setSpotSuggestions([]);
  };

  const handleMapSelect = async (nextLat: number, nextLng: number) => {
    if (mapTarget === 'spot') {
      setSpotLat(nextLat.toString());
      setSpotLng(nextLng.toString());
      if (!spotName.trim()) {
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextLat}&lon=${nextLng}&accept-language=fr`;
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          if (response.ok) {
            const data = await response.json();
            if (data?.display_name) setSpotName(data.display_name);
          }
        } catch (error) {
          // Ignore reverse lookup errors; user can still type a name.
        }
      }
      return;
    }

    setLat(nextLat.toString());
    setLng(nextLng.toString());
    setGoogleMapsLink(`https://www.openstreetmap.org/?mlat=${nextLat}&mlon=${nextLng}#map=13/${nextLat}/${nextLng}`);

    if (!locationName.trim()) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextLat}&lon=${nextLng}&accept-language=fr`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (response.ok) {
          const data = await response.json();
          if (data?.display_name) setLocationName(data.display_name);
        }
      } catch (error) {
        // Ignore reverse lookup errors; user can still type a name.
      }
    }
  };

  const handleAddSpot = () => {
    if (!spotReady) return;

    const newSpot: TravelSpot = {
      id: `spot-${Date.now()}`,
      day,
      name: spotName.trim(),
      description: spotDescription.trim() || undefined,
      location: {
        lat: parsedSpotLat,
        lng: parsedSpotLng,
      },
    };

    setSpots((prev: TravelSpot[]) => [...prev, newSpot]);
    setSpotName('');
    setSpotDescription('');
    setSpotLat('');
    setSpotLng('');
    setSpotSuggestions([]);
    setShowSpotSuggestions(false);
  };

  const handleRemoveSpot = (id: string) => {
    setSpots((prev: TravelSpot[]) => prev.filter((spot) => spot.id !== id));
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {editingId && (
        <div className="p-4 bg-[#00BCD4]/10 border border-[#00BCD4]/50 text-center">
          <p className="text-[10px] text-[#00BCD4] font-sans uppercase tracking-[0.4em]">
            📝 Mode Édition Active
          </p>
        </div>
      )}

      {/* Jour et Titre */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Jour
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white text-center text-2xl font-display font-black focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="Ex: Arrivée à Reykjavik"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all font-editorial"
          placeholder="Racontez votre journée..."
          required
        />
      </div>

      {/* Micro-story & Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Micro-story (2-3 lignes)
          </label>
          <textarea
            value={microStory}
            onChange={(e) => setMicroStory(e.target.value)}
            rows={4}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all font-editorial"
            placeholder="Mini recit du jour..."
          />
        </div>
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Faits marquants (separes par virgules)
          </label>
          <input
            type="text"
            value={highlightsInput}
            onChange={(e) => setHighlightsInput(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="Meteo 8C, 210km, Aurore boreale"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between border border-white/10 bg-white/5 p-4">
        <div>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-sans">
            Statut
          </p>
          <p className="text-white/70 text-sm">{status === 'draft' ? 'Brouillon' : 'Publie'}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStatus('draft')}
            className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
              status === 'draft'
                ? 'border-[#FFB347] text-[#FFB347] bg-[#FFB347]/10'
                : 'border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            Brouillon
          </button>
          <button
            type="button"
            onClick={() => setStatus('published')}
            className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
              status === 'published'
                ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/10'
                : 'border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            Publie
          </button>
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-6 p-6 border border-white/10 bg-white/5">
        <h4 className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">📍 Localisation</h4>
        
        <div className="relative">
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Lieu
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            autoComplete="off"
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="Rechercher un lieu"
            required
          />

          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute z-20 mt-2 w-full bg-black border border-white/10 shadow-xl">
              {isSearching && (
                <div className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  Recherche...
                </div>
              )}
              {suggestions.map((item) => (
                <button
                  key={item.place_id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSuggestionSelect(item)}
                  className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  {item.display_name}
                </button>
              ))}
              {!isSearching && suggestions.length === 0 && (
                <div className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  Aucune suggestion
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50">
                Carte (cliquer pour placer le point)
              </label>
              <span className="text-[10px] text-white/30 uppercase tracking-wider font-sans">
                {mapTarget === 'update'
                  ? hasCoords
                    ? `${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)}`
                    : 'Aucun point'
                  : hasSpotCoords
                  ? `${parsedSpotLat.toFixed(4)}, ${parsedSpotLng.toFixed(4)}`
                  : 'Aucun point'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMapTarget('update')}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
                  mapTarget === 'update'
                    ? 'border-[#00BCD4] text-[#00BCD4] bg-[#00BCD4]/10'
                    : 'border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                Point etape
              </button>
              <button
                type="button"
                onClick={() => setMapTarget('spot')}
                className={`px-4 py-2 text-[10px] uppercase tracking-wider font-sans border transition-all ${
                  mapTarget === 'spot'
                    ? 'border-[#FFB347] text-[#FFB347] bg-[#FFB347]/10'
                    : 'border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                Point spot
              </button>
            </div>
          </div>
          <div className="h-[280px] w-full overflow-hidden rounded-lg border border-white/10">
            <AdminMapPicker
              center={mapCenter}
              zoom={mapZoom}
              hasCoords={hasCoords}
              coords={{ lat: parsedLat, lng: parsedLng }}
              hasSpotCoords={hasSpotCoords}
              spotCoords={{ lat: parsedSpotLat, lng: parsedSpotLng }}
              onSelect={handleMapSelect}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border border-white/10 bg-black/40">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-sans uppercase tracking-[0.5em] text-white/60">
              Spots intermediaires
            </h5>
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-sans">
              {spots.length} spot{spots.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="relative">
            <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
              Nom du spot
            </label>
            <input
              type="text"
              value={spotName}
              onChange={(e) => setSpotName(e.target.value)}
              autoComplete="off"
              onFocus={() => setShowSpotSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSpotSuggestions(false), 150)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FFB347] focus:border-transparent transition-all"
              placeholder="Ex: Cascade secrete"
            />

            {showSpotSuggestions && (spotSuggestions.length > 0 || spotSearching) && (
              <div className="absolute z-20 mt-2 w-full bg-black border border-white/10 shadow-xl">
                {spotSearching && (
                  <div className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                    Recherche...
                  </div>
                )}
                {spotSuggestions.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSpotSuggestionSelect(item)}
                    className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                  >
                    {item.display_name}
                  </button>
                ))}
                {!spotSearching && spotSuggestions.length === 0 && (
                  <div className="px-4 py-3 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                    Aucune suggestion
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
              Description (optionnel)
            </label>
            <input
              type="text"
              value={spotDescription}
              onChange={(e) => setSpotDescription(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FFB347] focus:border-transparent transition-all"
              placeholder="Ex: Vue incroyable au coucher du soleil"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
                Latitude spot
              </label>
              <input
                type="number"
                step="any"
                value={spotLat}
                onChange={(e) => setSpotLat(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FFB347] focus:border-transparent transition-all font-mono"
                placeholder="64.1466"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
                Longitude spot
              </label>
              <input
                type="number"
                step="any"
                value={spotLng}
                onChange={(e) => setSpotLng(e.target.value)}
                className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FFB347] focus:border-transparent transition-all font-mono"
                placeholder="-21.9426"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddSpot}
              disabled={!spotReady}
              className="px-6 py-3 border border-[#FFB347]/40 text-[#FFB347] hover:bg-[#FFB347]/10 transition-all text-[10px] uppercase tracking-[0.4em] font-sans disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Ajouter un spot
            </button>
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-sans">
              {spotReady ? 'Pret a ajouter' : 'Nom + coordonnees requis'}
            </span>
          </div>

          {spots.length > 0 && (
            <div className="space-y-2">
              {spots.map((spot: TravelSpot) => (
                <div key={spot.id} className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3">
                  <div>
                    <p className="text-sm text-white/80">{spot.name}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans">
                      {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpot(spot.id)}
                    className="px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-[10px] uppercase tracking-wider"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Lien OpenStreetMap
          </label>
          <input
            type="text"
            value={googleMapsLink}
            onChange={handleGoogleMapsLinkChange}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="https://www.openstreetmap.org/..."
          />
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-3">
            <span className="text-[8px] text-white/30 bg-black px-3 uppercase tracking-wider font-sans">ou manuellement</span>
          </div>
          <div className="border-t border-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all font-mono"
              placeholder="64.1466"
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all font-mono"
              placeholder="-21.9426"
              required
            />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
          Photos
        </label>
        <input
          type="file"
          id="photos"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-sans file:uppercase file:tracking-wider file:bg-[#00BCD4] file:text-black hover:file:bg-white file:cursor-pointer transition-all"
        />
        {editingId && existingPhotoCount > 0 && (
          <p className="text-[10px] text-white/40 mt-3 uppercase tracking-wider">
            {existingPhotoCount} photo(s) deja associee(s)
          </p>
        )}
        {selectedFiles.length > 0 && (
          <p className="text-[10px] text-white/40 mt-3 uppercase tracking-wider">
            {selectedFiles.length} fichier(s) sélectionné(s)
          </p>
        )}
      </div>

      {editingId && Array.isArray(existingPhotos) && existingPhotos.length > 0 && (
        <div className="border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans mb-3">
            Photos associees
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {existingPhotos.map((photo: any) => (
              <div key={photo.id} className="relative border border-white/10 bg-black/40">
                {photo.url && !photo.url.startsWith('test-photo-') ? (
                  <img
                    src={photo.url}
                    alt="Photo existante"
                    className="h-24 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-24 w-full flex items-center justify-center text-white/20 text-[10px] uppercase tracking-wider">
                    Test
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveExistingPhoto(photo.id)}
                  className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center bg-black/70 border border-white/20 text-white/70 hover:text-white hover:border-white/60 transition-all"
                  aria-label="Retirer la photo"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 py-4 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-all text-[10px] font-sans uppercase tracking-[0.4em]"
          >
            ✖️ Annuler
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 bg-[#00BCD4] text-black hover:bg-white transition-all text-[10px] font-sans uppercase tracking-[0.4em] font-bold disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
        >
          {loading ? '...' : (editingId ? '💾 Modifier' : '➕ Créer')}
        </button>
      </div>

      {/* Import JSON */}
      <div className="p-6 border border-white/10 bg-white/5 space-y-4">
        <h4 className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">⬆️ Import JSON</h4>
        <p className="text-[10px] text-white/40 font-sans uppercase tracking-wider">
          Format: tableau d updates ou objet {'{'} updates: [] {'}'}
        </p>
        <input
          type="file"
          accept="application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportUpdates(file);
            if (e.target) e.target.value = '';
          }}
          className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-sans file:uppercase file:tracking-wider file:bg-[#00BCD4] file:text-black hover:file:bg-white file:cursor-pointer transition-all"
        />
      </div>
    </form>
  );
}

// Component: Manage Updates Tab
function ManageUpdatesTab({ updates, onEdit, onDuplicate, onDelete, onClearAll }: any) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-20 border border-white/10">
        <p className="text-white/40 text-sm font-editorial italic">Aucune update pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[10px] text-white/50 uppercase tracking-wider font-sans">
          {updates.length} update(s) au total
        </p>
        
        <button
          onClick={onClearAll}
          className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-[10px] uppercase tracking-wider font-sans"
        >
          🗑️ Tout effacer
        </button>
      </div>

      <div className="grid gap-4">
        {updates.map((update: TravelUpdate) => (
          <div key={update.id} className="p-6 border border-white/10 bg-white/5 hover:border-[#00BCD4]/50 transition-all group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-4xl font-display font-black text-[#00BCD4]">{update.day}</span>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white">{update.title}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans">{update.location.name}</p>
                  </div>
                  <span className={`px-2 py-1 text-[8px] uppercase tracking-wider font-sans border ${
                    update.status === 'draft'
                      ? 'border-[#FFB347]/40 text-[#FFB347]'
                      : 'border-[#00BCD4]/40 text-[#00BCD4]'
                  }`}>
                    {update.status === 'draft' ? 'Brouillon' : 'Publie'}
                  </span>
                </div>
                
                <p className="text-sm text-white/60 font-editorial line-clamp-2 mb-3">{update.description}</p>
                
                <div className="flex items-center gap-6 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  <span>📸 {update.photos?.length || 0} photo(s)</span>
                  <span>📍 {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}</span>
                  <span>✨ {update.spots?.length || 0} spot(s)</span>
                </div>

                {update.spots && update.spots.length > 0 && (
                  <div className="mt-3 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                    Spots: {update.spots.map((spot: TravelSpot) => spot.name).join(' • ')}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(update)}
                  className="px-4 py-2 border border-[#00BCD4]/30 text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-all text-[10px] uppercase tracking-wider"
                >
                  ✏️ Modifier
                </button>

                <button
                  onClick={() => onDuplicate(update)}
                  className="px-4 py-2 border border-white/10 text-white/60 hover:border-white/40 hover:text-white transition-all text-[10px] uppercase tracking-wider"
                >
                  📌 Dupliquer
                </button>
                
                <button
                  onClick={() => onDelete(update.id)}
                  className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-[10px] uppercase tracking-wider"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component: Manage Spots Tab
function ManageSpotsTab({ updates, onEditUpdate, onRemoveSpot, testMode }: any) {
  const spots = updates.flatMap((update: TravelUpdate) =>
    (update.spots ?? []).map((spot: TravelSpot) => ({
      ...spot,
      updateId: update.id,
      updateTitle: update.title,
    }))
  );

  if (spots.length === 0) {
    return (
      <div className="text-center py-20 border border-white/10">
        <p className="text-white/40 text-sm font-editorial italic">Aucun spot pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-[10px] text-white/50 uppercase tracking-wider font-sans">
          {spots.length} spot(s) au total
        </p>
        {!testMode && (
          <span className="text-[10px] text-white/30 uppercase tracking-wider font-sans">
            Suppression dispo en mode test
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {spots.map((spot: any) => (
          <div key={spot.id} className="p-6 border border-white/10 bg-white/5 hover:border-[#FFB347]/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl font-display font-black text-[#FFB347]">{spot.day}</span>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">{spot.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-sans">
                      {spot.updateTitle}
                    </p>
                  </div>
                </div>

                {spot.description && (
                  <p className="text-sm text-white/60 font-editorial line-clamp-2 mb-3">
                    {spot.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  <span>📍 {spot.location.lat.toFixed(4)}, {spot.location.lng.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const update = updates.find((u: TravelUpdate) => u.id === spot.updateId);
                    if (update) onEditUpdate(update);
                  }}
                  className="px-4 py-2 border border-[#00BCD4]/30 text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-all text-[10px] uppercase tracking-wider"
                >
                  ✏️ Etape
                </button>
                <button
                  onClick={() => onRemoveSpot(spot.updateId, spot.id)}
                  disabled={!testMode}
                  className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-[10px] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🗑️ Spot
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component: Gallery Tab
function GalleryTab({ photos, photoFiles, setPhotoFiles, title, setTitle, description, setDescription, onAdd, onDelete }: any) {
  return (
    <div className="space-y-8">
      {/* Add photos form */}
      <div className="p-6 border border-white/10 bg-white/5 space-y-6">
        <h3 className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">➕ Ajouter des photos</h3>
        
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Photos
          </label>
          <input
            type="file"
            id="galleryPhotos"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && setPhotoFiles(Array.from(e.target.files))}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[10px] file:font-sans file:uppercase file:tracking-wider file:bg-[#00BCD4] file:text-black hover:file:bg-white file:cursor-pointer transition-all"
          />
          {photoFiles.length > 0 && (
            <p className="text-[10px] text-white/40 mt-3 uppercase tracking-wider">
              {photoFiles.length} fichier(s) sélectionné(s)
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] transition-all"
            placeholder="Titre (optionnel)"
          />
          
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] transition-all"
            placeholder="Description (optionnelle)"
          />
        </div>

        <button
          onClick={onAdd}
          className="w-full py-4 bg-[#00BCD4] text-black hover:bg-white transition-all text-[10px] font-sans uppercase tracking-[0.4em] font-bold"
        >
          ➕ Ajouter à la galerie
        </button>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="text-center py-20 border border-white/10">
          <p className="text-white/40 text-sm font-editorial italic">Aucune photo dans la galerie</p>
        </div>
      ) : (
        <div>
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-sans mb-6">
            {photos.length} photo(s) dans la galerie
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo: any) => (
              <div key={photo.id} className="relative group aspect-square border border-white/10 bg-white/5 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => onDelete(photo.id)}
                    className="px-4 py-2 bg-red-500 text-white text-[10px] uppercase tracking-wider hover:bg-red-600 transition-colors"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
                
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <p className="text-[10px] text-white uppercase tracking-wider truncate">{photo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
