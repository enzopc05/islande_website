'use client';

import { useState, useEffect } from 'react';
import { addTravelUpdate, uploadPhotos, getTravelUpdates } from '@/lib/firebase-service';
import Header from '@/components/Header';
import { TravelUpdate } from '@/types';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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
  const [testMode, setTestMode] = useState(true); // Mode test par défaut
  const [existingUpdates, setExistingUpdates] = useState<TravelUpdate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  
  // State pour la galerie
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

  const loadGalleryPhotos = () => {
    try {
      const data = localStorage.getItem('gallery_photos');
      const photos = data ? JSON.parse(data) : [];
      setGalleryPhotos(photos.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Erreur chargement photos galerie:', error);
      setGalleryPhotos([]);
    }
  };

  const handleAddGalleryPhotos = async () => {
    if (galleryPhotoFiles.length === 0) {
      setMessage('❌ Veuillez sélectionner au moins une photo');
      return;
    }

    try {
      const existingPhotos = localStorage.getItem('gallery_photos');
      const photos = existingPhotos ? JSON.parse(existingPhotos) : [];

      // Créer les nouvelles photos
      const newPhotos = galleryPhotoFiles.map((file, index) => ({
        id: `gallery-${Date.now()}-${index}`,
        url: testMode ? `test-photo-gallery-${Date.now()}-${index}` : file.name,
        title: galleryTitle || `Photo ${photos.length + index + 1}`,
        description: galleryDescription,
        date: new Date().toISOString(),
        source: 'gallery' as const,
      }));

      // TODO: Si mode production, uploader les photos sur Firebase Storage
      if (!testMode) {
        setMessage('⚠️ Upload Firebase pour galerie non implémenté encore');
        return;
      }

      // Ajouter au localStorage
      photos.push(...newPhotos);
      localStorage.setItem('gallery_photos', JSON.stringify(photos));

      // Reset
      setGalleryPhotoFiles([]);
      setGalleryTitle('');
      setGalleryDescription('');
      const fileInput = document.getElementById('galleryPhotos') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setMessage(`✅ ${newPhotos.length} photo(s) ajoutée(s) à la galerie !`);
      loadGalleryPhotos();
    } catch (error) {
      console.error('Erreur ajout photos galerie:', error);
      setMessage('❌ Erreur lors de l\'ajout des photos');
    }
  };

  const deleteGalleryPhoto = (photoId: string) => {
    if (!confirm('Supprimer cette photo de la galerie ?')) return;

    try {
      const data = localStorage.getItem('gallery_photos');
      const photos = data ? JSON.parse(data) : [];
      const filtered = photos.filter((p: any) => p.id !== photoId);
      localStorage.setItem('gallery_photos', JSON.stringify(filtered));
      setMessage('🗑️ Photo supprimée de la galerie');
      loadGalleryPhotos();
    } catch (error) {
      console.error('Erreur suppression photo galerie:', error);
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  const loadExistingUpdates = async () => {
    try {
      // Charger localStorage de manière synchrone d'abord (plus rapide)
      const localData = localStorage.getItem('test_travel_updates');
      const testUpdates = localData ? JSON.parse(localData) : [];
      
      // Si on a des données locales, les afficher immédiatement
      if (testUpdates.length > 0) {
        setExistingUpdates(testUpdates.sort((a: TravelUpdate, b: TravelUpdate) => a.day - b.day));
      }
      
      // Puis charger Firebase en arrière-plan
      const firebaseData = await getTravelUpdates();
      
      // Fusionner et trier
      const allUpdates = [...firebaseData, ...testUpdates].sort((a, b) => a.day - b.day);
      setExistingUpdates(allUpdates);
    } catch (error) {
      console.error('Erreur lors du chargement des updates:', error);
      // En cas d'erreur Firebase, charger au moins les updates locales
      const localData = localStorage.getItem('test_travel_updates');
      const testUpdates = localData ? JSON.parse(localData) : [];
      setExistingUpdates(testUpdates);
    }
  };

  const extractCoordinatesFromGoogleMapsLink = (link: string) => {
    try {
      // Formats supportés:
      // https://www.google.com/maps/place/.../@64.1466,-21.9426,17z/...
      // https://www.google.com/maps?q=64.1466,-21.9426
      // https://maps.app.goo.gl/... (ce format nécessite de suivre la redirection, on va essayer d'extraire depuis l'URL actuelle)
      
      // Essayer de matcher le format /@lat,lng
      let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites du lien Google Maps');
        return true;
      }

      // Essayer de matcher le format ?q=lat,lng
      match = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites du lien Google Maps');
        return true;
      }

      // Essayer de matcher le format /place/.../@lat,lng
      match = link.match(/\/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) {
        setLat(match[1]);
        setLng(match[2]);
        setMessage('✅ Coordonnées extraites du lien Google Maps');
        return true;
      }

      setMessage('❌ Impossible d\'extraire les coordonnées. Utilisez un lien Google Maps valide.');
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des coordonnées:', error);
      setMessage('❌ Erreur lors de l\'extraction des coordonnées');
      return false;
    }
  };

  const handleGoogleMapsLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setGoogleMapsLink(link);
    
    // Si le lien contient google.com/maps ou maps.app.goo.gl
    if (link.includes('google.com/maps') || link.includes('maps.app.goo.gl')) {
      extractCoordinatesFromGoogleMapsLink(link);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'islande2025';

    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      setMessage('Connexion réussie !');
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

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer les données exactement comme elles seraient envoyées
    const updateData = {
      day,
      title,
      description,
      location: {
        name: locationName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      photos: selectedFiles.map(file => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        type: file.type
      })),
      googleMapsLink: googleMapsLink || 'N/A',
      date: new Date().toISOString(),
    };

    setPreviewData(updateData);
    setMessage('👁️ Aperçu généré - Vérifiez les données ci-dessous');
    
    // Log dans la console pour debug
    console.log('📦 PREVIEW DATA:', updateData);
  };

  const clearTestUpdates = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les updates de test ?')) {
      localStorage.removeItem('test_travel_updates');
      setMessage('🗑️ Toutes les updates de test ont été effacées');
      loadExistingUpdates();
    }
  };

  const importRoadtripData = async (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.roadtrip || !Array.isArray(data.roadtrip)) {
        setMessage('❌ Format JSON invalide. Utilisez le format : { "roadtrip": [...] }');
        return;
      }

      const testUpdates = data.roadtrip.map((update: any) => ({
        id: `${Date.now()}-${update.day}`,
        day: update.day,
        title: update.title,
        description: update.description,
        location: update.location,
        photos: [`test-photo-${Date.now()}-${update.day}-iceland.jpg`],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }));

      // Sauvegarder dans localStorage
      localStorage.setItem('test_travel_updates', JSON.stringify(testUpdates));
      
      setMessage(`✅ ${testUpdates.length} étapes importées avec succès !`);
      loadExistingUpdates();
    } catch (error) {
      console.error('Erreur import JSON:', error);
      setMessage('❌ Erreur lors de l\'import. Vérifiez le format JSON.');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importRoadtripData(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (testMode) {
        // MODE TEST - Sauvegarde locale
        const existing = localStorage.getItem('test_travel_updates');
        const updates = existing ? JSON.parse(existing) : [];
        
        // Si on édite, récupérer les photos existantes
        let photos = selectedFiles.map((file, index) => 
          `test-photo-${Date.now()}-${index}-${file.name}`
        );
        
        if (editingId && selectedFiles.length === 0) {
          // Mode édition sans nouvelles photos - garder les anciennes
          const existingUpdate = updates.find((u: TravelUpdate) => u.id === editingId);
          if (existingUpdate) {
            photos = existingUpdate.photos || [];
          }
        }
        
        const testUpdate = {
          id: editingId || Date.now().toString(),
          day,
          title,
          description,
          location: {
            name: locationName,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          },
          photos,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        // Sauvegarder dans localStorage
        
        if (editingId) {
          // Mode édition - remplacer l'update existante
          const index = updates.findIndex((u: TravelUpdate) => u.id === editingId);
          if (index !== -1) {
            updates[index] = testUpdate;
            setMessage('✅ Update de test modifiée !');
          }
        } else {
          // Mode création - ajouter une nouvelle update
          updates.push(testUpdate);
          setMessage('✅ Update de test créée ! Visible sur la page d\'accueil');
        }
        
        localStorage.setItem('test_travel_updates', JSON.stringify(updates));
      } else {
        // MODE PRODUCTION - Firebase
        const tempId = Date.now().toString();

        // Upload photos
        let photoUrls: string[] = [];
        if (selectedFiles.length > 0) {
          setMessage('Upload des photos...');
          photoUrls = await uploadPhotos(selectedFiles, tempId);
        }

        // Créer l'update
        setMessage('Création de l\'update...');
        await addTravelUpdate({
          day,
          title,
          description,
          location: {
            name: locationName,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          },
          photos: photoUrls,
          date: new Date().toISOString(),
        });

        setMessage('Update créée avec succès ! ✅');
      }

      // Reset form
      setDay(day + 1);
      setTitle('');
      setDescription('');
      setLocationName('');
      setGoogleMapsLink('');
      setLat('');
      setLng('');
      setSelectedFiles([]);
      setEditingId(null);

      // Reset file input
      const fileInput = document.getElementById('photos') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Recharger la liste des updates
      loadExistingUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      setMessage('Erreur lors de la création de l\'update ❌');
    } finally {
      setLoading(false);
    }
  };

  const loadUpdateForEdit = (update: TravelUpdate) => {
    setEditingId(update.id);
    setDay(update.day);
    setTitle(update.title);
    setDescription(update.description);
    setLocationName(update.location.name);
    setLat(update.location.lat.toString());
    setLng(update.location.lng.toString());
    setGoogleMapsLink('');
    setSelectedFiles([]);
    setMessage('📝 Édition de l\'update - Modifiez les champs et soumettez');
    
    // Scroll vers le formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteUpdate = async (update: TravelUpdate) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${update.title}" ?`)) {
      return;
    }

    try {
      const isTestUpdate = update.photos && update.photos.length > 0 && update.photos[0].startsWith('test-photo-');
      
      if (isTestUpdate) {
        // Supprimer depuis localStorage
        const localData = localStorage.getItem('test_travel_updates');
        const testUpdates = localData ? JSON.parse(localData) : [];
        const filtered = testUpdates.filter((u: TravelUpdate) => u.id !== update.id);
        localStorage.setItem('test_travel_updates', JSON.stringify(filtered));
        setMessage('🗑️ Update de test supprimée');
      } else {
        // TODO: Supprimer depuis Firebase (nécessite une fonction deleteUpdate dans firebase-service)
        setMessage('⚠️ Suppression Firebase non implémentée encore');
        return;
      }

      loadExistingUpdates();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--midnight)]">
        <Header />
        <div className="flex items-center justify-center py-12 px-4 min-h-screen">
          <div className="max-w-md w-full glass-effect border border-white/10 p-10">
            <h2 className="text-3xl font-display font-bold text-white mb-8 text-center">
              Connexion Admin
            </h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                  placeholder="Entrez le mot de passe"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--glacier-blue)] text-white py-3 px-4 font-sans uppercase tracking-wider hover:bg-[var(--deep-ocean)] transition-colors font-semibold text-sm"
              >
                Se connecter
              </button>
              {message && (
                <p className="text-center text-sm text-red-400">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--midnight)]">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-display font-bold text-white">
              Nouvelle Mise à Jour
            </h2>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 font-sans text-sm uppercase tracking-wider transition-colors"
            >
              Déconnexion
            </button>
          </div>

          <div className="glass-effect border border-white/10 p-8">
            {/* Toggle Mode Test/Prod */}
            <div className="mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-semibold text-white mb-2">
                    {testMode ? '🧪 Mode Test' : '🚀 Mode Production'}
                  </h3>
                  <p className="text-sm text-white/60 font-serif">
                    {testMode 
                      ? 'Les updates seront sauvegardées localement (aucune connexion Firebase requise)' 
                      : 'Les updates seront envoyées sur Firebase avec upload des photos'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTestMode(!testMode)}
                  className={`px-6 py-3 text-sm font-sans uppercase tracking-wider transition-all border-2 ${ 
                    testMode 
                      ? 'bg-[var(--glacier-blue)] text-white border-[var(--glacier-blue)] hover:bg-[var(--deep-ocean)]' 
                      : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                  }`}
                >
                  {testMode ? 'Passer en Prod' : 'Passer en Test'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="day" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                    Jour du voyage (1-12)
                  </label>
                  <input
                    type="number"
                    id="day"
                    min="1"
                    max="12"
                    value={day}
                    onChange={(e) => setDay(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                    placeholder="Ex: Arrivée à Reykjavik"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                  placeholder="Racontez votre journée..."
                  required
                />
              </div>

              <div>
                <label htmlFor="locationName" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                  Lieu
                </label>
                <input
                  type="text"
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                  placeholder="Ex: Reykjavik"
                  required
                />
              </div>

              {/* Nouveau champ pour le lien Google Maps */}
              <div>
                <label htmlFor="googleMapsLink" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                  Lien Google Maps
                  <span className="text-xs normal-case block mt-1 text-white/50 font-serif italic">
                    Collez le lien Google Maps pour extraire automatiquement les coordonnées
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="googleMapsLink"
                    value={googleMapsLink}
                    onChange={handleGoogleMapsLinkChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                    placeholder="https://www.google.com/maps/place/..."
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-4">
                  <span className="text-xs text-white/40 bg-[var(--midnight)] px-3 uppercase tracking-wider font-sans">ou</span>
                </div>
                <div className="border-t border-white/10"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="lat" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="lat"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                    placeholder="Ex: 64.1466"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lng" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="lng"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all"
                    placeholder="Ex: -21.9426"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="photos" className="block text-sm font-sans uppercase tracking-wider text-white/70 mb-3">
                  Photos
                </label>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[var(--glacier-blue)] file:text-white hover:file:bg-[var(--deep-ocean)] file:cursor-pointer transition-all"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-white/50 mt-3">
                    {selectedFiles.length} photo(s) sélectionnée(s)
                  </p>
                )}
              </div>

              {editingId && (
                <div className="bg-[var(--glacier-blue)]/10 border border-[var(--glacier-blue)]/50 p-4 text-center">
                  <p className="text-sm text-[var(--glacier-blue)] font-sans uppercase tracking-wider">
                    📝 Mode Édition - Modifiez les champs ci-dessus et soumettez
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="w-full bg-white/10 border-2 border-[var(--glacier-blue)] text-[var(--glacier-blue)] py-4 px-4 font-sans uppercase tracking-wider hover:bg-[var(--glacier-blue)]/10 transition-colors font-semibold text-sm"
                >
                  👁️ Prévisualiser
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setDay(1);
                      setTitle('');
                      setDescription('');
                      setLocationName('');
                      setLat('');
                      setLng('');
                      setGoogleMapsLink('');
                      setSelectedFiles([]);
                      setMessage('');
                      const fileInput = document.getElementById('photos') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="w-full bg-white/10 border-2 border-white/30 text-white/70 py-4 px-4 font-sans uppercase tracking-wider hover:bg-white/20 transition-colors font-semibold text-sm"
                  >
                    ✖️ Annuler
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[var(--glacier-blue)] text-white py-4 px-4 font-sans uppercase tracking-wider hover:bg-[var(--deep-ocean)] transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed text-sm ${editingId ? '' : 'md:col-span-2'}`}
                >
                  {loading ? (editingId ? 'Modification...' : 'Création en cours...') : (editingId ? '💾 Modifier' : 'Créer l\'update')}
                </button>
              </div>

              {message && (
                <div className={`text-center p-4 ${
                  message.includes('✅') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-[var(--glacier-blue)]/20 text-[var(--glacier-blue)] border border-[var(--glacier-blue)]/30'
                }`}>
                  {message}
                </div>
              )}

              {/* Preview Panel */}
              {previewData && (
                <div className="glass-effect border border-[var(--glacier-blue)]/50 p-6 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-[var(--glacier-blue)] text-lg">
                      📦 Aperçu des données
                    </h3>
                    <button
                      onClick={() => setPreviewData(null)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded border border-white/10">
                      <div className="font-mono text-xs text-white/90 whitespace-pre-wrap break-all">
                        {JSON.stringify(previewData, null, 2)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-white/50 uppercase tracking-wider text-xs mb-1">Jour</div>
                        <div className="text-white font-semibold">{previewData.day}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-white/50 uppercase tracking-wider text-xs mb-1">Photos</div>
                        <div className="text-white font-semibold">{previewData.photos.length}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-white/50 uppercase tracking-wider text-xs mb-1">Latitude</div>
                        <div className="text-[var(--glacier-blue)] font-mono">{previewData.location.lat}</div>
                      </div>
                      <div className="bg-white/5 p-3 rounded">
                        <div className="text-white/50 uppercase tracking-wider text-xs mb-1">Longitude</div>
                        <div className="text-[var(--glacier-blue)] font-mono">{previewData.location.lng}</div>
                      </div>
                    </div>

                    <div className="text-xs text-white/50 font-mono bg-black/20 p-3 rounded border border-white/5">
                      ℹ️ Les données ci-dessus sont affichées à titre de test. 
                      Elles ne seront pas envoyées tant que vous ne cliquez pas sur "Créer l'update".
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Section de gestion des updates existantes */}
          {existingUpdates.length > 0 && (
            <div className="mt-8 glass-effect border border-[var(--glacier-blue)]/30 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold text-white">
                  📋 Gérer les Updates ({existingUpdates.length})
                </h3>
                <button
                  onClick={() => setShowGallery(!showGallery)}
                  className="px-4 py-2 bg-[var(--glacier-blue)]/20 border border-[var(--glacier-blue)] text-[var(--glacier-blue)] hover:bg-[var(--glacier-blue)]/30 transition-colors text-sm font-sans uppercase tracking-wider"
                >
                  {showGallery ? '📝 Voir la liste' : '🖼️ Voir la galerie'}
                </button>
              </div>

              {!showGallery ? (
                <div className="space-y-4">
                  {existingUpdates.map((update) => {
                    const isTestUpdate = update.photos && update.photos.length > 0 && update.photos[0].startsWith('test-photo-');
                    
                    return (
                      <div key={update.id} className="bg-white/5 border border-white/10 p-6 hover:border-[var(--glacier-blue)]/50 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-[var(--glacier-blue)]/20 text-[var(--glacier-blue)] text-xs font-sans uppercase tracking-wider">
                                Jour {update.day}
                              </span>
                              {isTestUpdate && (
                                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-sans uppercase tracking-wider">
                                  🧪 TEST
                                </span>
                              )}
                            </div>
                            <h4 className="text-xl font-display font-bold text-white mb-2">{update.title}</h4>
                            <p className="text-sm text-white/70 font-serif mb-3 line-clamp-2">{update.description}</p>
                            <div className="flex items-center gap-4 text-xs text-white/50">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {update.location.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {update.photos?.length || 0} photo(s)
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => loadUpdateForEdit(update)}
                              className="px-4 py-2 bg-[var(--glacier-blue)]/20 border border-[var(--glacier-blue)] text-[var(--glacier-blue)] hover:bg-[var(--glacier-blue)]/30 transition-colors text-xs font-sans uppercase tracking-wider"
                            >
                              ✏️ Éditer
                            </button>
                            <button
                              onClick={() => deleteUpdate(update)}
                              className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-sans uppercase tracking-wider"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingUpdates.flatMap(update => 
                    update.photos?.map((photo, index) => {
                      const isTestPhoto = photo.startsWith('test-photo-');
                      return (
                        <div key={`${update.id}-${index}`} className="group relative aspect-square overflow-hidden border border-white/10 hover:border-[var(--glacier-blue)]/50 transition-all">
                          {isTestPhoto ? (
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-ocean)] to-[var(--midnight)] flex items-center justify-center">
                              <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-white/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-white/30 text-xs">Test</p>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={photo} 
                              alt={`${update.title} - Photo ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white px-2">
                              <p className="text-xs font-sans uppercase tracking-wider mb-1">Jour {update.day}</p>
                              <p className="text-sm font-serif">{update.title}</p>
                            </div>
                          </div>
                        </div>
                      );
                    }) || []
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section de gestion des tests */}
          {testMode && (
            <div className="mt-8 space-y-6">
              {/* Import JSON */}
              <div className="glass-effect border border-[var(--glacier-blue)]/30 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-[var(--glacier-blue)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-[var(--glacier-blue)] mb-2 text-lg">📥 Importer un Road Trip</h3>
                    <p className="text-sm text-white/70 font-serif mb-4">
                      Importez un fichier JSON complet avec toutes les étapes de votre voyage. 
                      Fichier exemple : <code className="text-xs bg-white/10 px-2 py-1 rounded">test-data/iceland-roadtrip.json</code>
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Importer depuis un fichier</label>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportFile}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[var(--glacier-blue)] file:text-white hover:file:bg-[var(--deep-ocean)] file:cursor-pointer transition-all"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="jsonPaste" className="block text-xs text-white/50 uppercase tracking-wider mb-2">Ou coller le JSON directement</label>
                        <textarea
                          id="jsonPaste"
                          rows={4}
                          placeholder='{ "roadtrip": [ { "day": 1, "title": "...", ... } ] }'
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent transition-all font-mono text-xs"
                        />
                        <button
                          onClick={() => {
                            const textarea = document.getElementById('jsonPaste') as HTMLTextAreaElement;
                            if (textarea.value) {
                              importRoadtripData(textarea.value);
                              textarea.value = '';
                            }
                          }}
                          className="mt-2 px-4 py-2 bg-[var(--glacier-blue)] text-white hover:bg-[var(--deep-ocean)] transition-colors text-xs font-sans uppercase tracking-wider"
                        >
                          Importer le JSON
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Galerie de Photos */}
              <div className="glass-effect border border-[var(--glacier-blue)]/30 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[var(--glacier-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-display font-semibold text-white text-lg">
                      🖼️ Galerie d'Art ({galleryPhotos.length} photos)
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Formulaire ajout photo */}
                  <div className="bg-white/5 p-4 border border-white/10">
                    <h4 className="text-sm font-sans uppercase tracking-wider text-white/70 mb-4">
                      Ajouter des Photos
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/50 mb-2">Photos</label>
                        <input
                          type="file"
                          id="galleryPhotos"
                          multiple
                          accept="image/*"
                          onChange={(e) => setGalleryPhotoFiles(e.target.files ? Array.from(e.target.files) : [])}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-[var(--glacier-blue)] file:text-white file:cursor-pointer hover:file:bg-[var(--deep-ocean)]"
                        />
                        {galleryPhotoFiles.length > 0 && (
                          <p className="text-xs text-[var(--glacier-blue)] mt-2">
                            {galleryPhotoFiles.length} fichier(s) sélectionné(s)
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-2">Titre (optionnel)</label>
                        <input
                          type="text"
                          value={galleryTitle}
                          onChange={(e) => setGalleryTitle(e.target.value)}
                          placeholder="Ex: Aurores boréales"
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/50 mb-2">Description (optionnelle)</label>
                        <textarea
                          value={galleryDescription}
                          onChange={(e) => setGalleryDescription(e.target.value)}
                          rows={2}
                          placeholder="Un court texte sur cette photo..."
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:ring-2 focus:ring-[var(--glacier-blue)] focus:border-transparent"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddGalleryPhotos}
                        className="w-full px-4 py-3 bg-[var(--glacier-blue)] text-white hover:bg-[var(--deep-ocean)] transition-colors text-sm font-sans uppercase tracking-wider"
                      >
                        Ajouter à la Galerie
                      </button>
                    </div>
                  </div>

                  {/* Liste des photos */}
                  {galleryPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-sans uppercase tracking-wider text-white/70 mb-4">
                        Photos dans la galerie
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryPhotos.map((photo) => (
                          <div key={photo.id} className="group relative aspect-square bg-white/5 border border-white/10 hover:border-[var(--glacier-blue)]/50 transition-all">
                            {photo.url.startsWith('test-photo-') ? (
                              <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-ocean)] to-[var(--midnight)] flex items-center justify-center">
                                <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            ) : (
                              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                            )}
                            
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                              <p className="text-white text-xs font-display font-semibold text-center mb-2">
                                {photo.title}
                              </p>
                              <button
                                onClick={() => deleteGalleryPhoto(photo.id)}
                                className="px-3 py-1 bg-red-500/80 text-white text-xs hover:bg-red-600 transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {galleryPhotos.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/50 text-sm font-serif italic">
                        Aucune photo dans la galerie pour le moment
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Effacer tout */}
              <div className="glass-effect border border-red-500/30 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <div>
                      <h3 className="font-display font-semibold text-red-400 mb-2 text-lg">Zone de test</h3>
                      <p className="text-sm text-white/70 font-serif">
                        Supprimer toutes les updates de test enregistrées localement.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearTestUpdates}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-sans uppercase tracking-wider"
                  >
                    Effacer tout
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 glass-effect border border-[var(--glacier-blue)]/30 p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[var(--glacier-blue)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-display font-semibold text-[var(--glacier-blue)] mb-2 text-lg">Mode Test</h3>
                <p className="text-sm text-white/70 font-serif">
                  Utilisez le bouton "Prévisualiser" pour tester l'extraction des coordonnées depuis Google Maps et vérifier vos données avant l'envoi. 
                  Parfait pour développer sans base de données !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
