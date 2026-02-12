'use client';

import { useState, useEffect } from 'react';
import {
  addGalleryPhotos,
  addTravelUpdate,
  deleteGalleryPhoto as deleteGalleryPhotoRemote,
  deleteTravelUpdate,
  getGalleryPhotos,
  getTravelUpdates,
  uploadGalleryPhotos,
  uploadPhotos,
} from '@/lib/supabase-service';
import Header from '@/components/Header';
import TestDataLoader from '@/components/TestDataLoader';
import { TravelUpdate } from '@/types';

type TabType = 'create' | 'manage' | 'gallery';

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
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [testMode, setTestMode] = useState(false);
  const [existingUpdates, setExistingUpdates] = useState<TravelUpdate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [galleryPhotoFiles, setGalleryPhotoFiles] = useState<File[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');

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
      
      const remoteUpdates = await getTravelUpdates();
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
    
    if (link.includes('google.com/maps') || link.includes('maps.app.goo.gl')) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDay(1);
    setTitle('');
    setDescription('');
    setLocationName('');
    setLat('');
    setLng('');
    setGoogleMapsLink('');
    setSelectedFiles([]);
    setPreviewData(null);
    const fileInput = document.getElementById('photos') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData: any = {
        day,
        title,
        description,
        location: {
          name: locationName,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
        date: new Date().toISOString(),
        photos: [],
      };

      if (testMode) {
        updateData.photos = selectedFiles.map((_, index) => `test-photo-${day}-${index}`);
        
        const localData = localStorage.getItem('test_travel_updates');
        const updates = localData ? JSON.parse(localData) : [];
        
        if (editingId) {
          const index = updates.findIndex((u: any) => u.id === editingId);
          if (index !== -1) {
            updates[index] = { ...updateData, id: editingId };
          }
          setMessage(`✅ Update jour ${day} modifiée localement`);
        } else {
          updateData.id = `test-${Date.now()}`;
          updates.push(updateData);
          setMessage(`✅ Update jour ${day} créée localement`);
        }
        
        localStorage.setItem('test_travel_updates', JSON.stringify(updates));
        await loadExistingUpdates();
        resetForm();
      } else {
        const updateId = `update-${Date.now()}`;
        let photoUrls: string[] = [];
        if (selectedFiles.length > 0) {
          photoUrls = await uploadPhotos(selectedFiles, updateId);
        }
        
        updateData.photos = photoUrls;
        await addTravelUpdate(updateData);
        setMessage(`✅ Update jour ${day} publiée sur Supabase`);
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
    setDay(update.day);
    setTitle(update.title);
    setDescription(update.description);
    setLocationName(update.location.name);
    setLat(update.location.lat.toString());
    setLng(update.location.lng.toString());
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
            📋 Gérer
            {existingUpdates.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#00BCD4] text-black text-[8px] rounded-full font-bold">
                {existingUpdates.length}
              </span>
            )}
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

        {/* Mode Toggle */}
        <div className="mb-8 p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{testMode ? '🧪' : '🚀'}</span>
                <h3 className="text-xl font-display font-black text-white tracking-tight">
                  {testMode ? 'Mode Test' : 'Mode Production'}
                </h3>
              </div>
              <p className="text-[10px] text-white/50 font-sans uppercase tracking-wider">
                {testMode 
                  ? 'Données sauvegardées localement' 
                  : 'Envoi sur Supabase + Upload photos'}
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setTestMode(!testMode)}
              className={`px-6 py-3 text-[10px] font-sans uppercase tracking-[0.4em] transition-all border-2 ${
                testMode 
                  ? 'bg-[#00BCD4] text-black border-[#00BCD4]' 
                  : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
              }`}
            >
              {testMode ? 'Activer Prod' : 'Activer Test'}
            </button>
          </div>
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

        {/* Tab Content */}
        {activeTab === 'create' && (
          <CreateUpdateForm
            day={day}
            setDay={setDay}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            locationName={locationName}
            setLocationName={setLocationName}
            lat={lat}
            setLat={setLat}
            lng={lng}
            setLng={setLng}
            googleMapsLink={googleMapsLink}
            handleGoogleMapsLinkChange={handleGoogleMapsLinkChange}
            selectedFiles={selectedFiles}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            loading={loading}
            editingId={editingId}
            resetForm={resetForm}
            previewData={previewData}
            setPreviewData={setPreviewData}
          />
        )}

        {activeTab === 'manage' && (
          <ManageUpdatesTab
            updates={existingUpdates}
            onEdit={editUpdate}
            onDelete={deleteUpdate}
            onClearAll={clearTestUpdates}
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
  locationName, setLocationName, lat, setLat, lng, setLng,
  googleMapsLink, handleGoogleMapsLinkChange, selectedFiles, handleFileChange,
  handleSubmit, loading, editingId, resetForm, previewData, setPreviewData
}: any) {
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

      {/* Localisation */}
      <div className="space-y-6 p-6 border border-white/10 bg-white/5">
        <h4 className="text-[10px] font-sans uppercase tracking-[0.5em] text-[#00BCD4]">📍 Localisation</h4>
        
        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Lieu
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="Ex: Reykjavik"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-sans uppercase tracking-[0.4em] text-white/50 mb-3">
            Lien Google Maps
          </label>
          <input
            type="text"
            value={googleMapsLink}
            onChange={handleGoogleMapsLinkChange}
            className="w-full px-4 py-4 bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#00BCD4] focus:border-transparent transition-all"
            placeholder="https://www.google.com/maps/..."
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
        {selectedFiles.length > 0 && (
          <p className="text-[10px] text-white/40 mt-3 uppercase tracking-wider">
            {selectedFiles.length} fichier(s) sélectionné(s)
          </p>
        )}
      </div>

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
    </form>
  );
}

// Component: Manage Updates Tab
function ManageUpdatesTab({ updates, onEdit, onDelete, onClearAll }: any) {
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
                </div>
                
                <p className="text-sm text-white/60 font-editorial line-clamp-2 mb-3">{update.description}</p>
                
                <div className="flex items-center gap-6 text-[10px] text-white/40 uppercase tracking-wider font-sans">
                  <span>📸 {update.photos?.length || 0} photo(s)</span>
                  <span>📍 {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(update)}
                  className="px-4 py-2 border border-[#00BCD4]/30 text-[#00BCD4] hover:bg-[#00BCD4]/10 transition-all text-[10px] uppercase tracking-wider"
                >
                  ✏️ Modifier
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
