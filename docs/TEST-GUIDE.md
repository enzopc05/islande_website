# Guide de Test - Images et Données

Ce guide explique comment tester le site avec de vraies images sans avoir besoin d'API ni de base de données.

## 🚀 Solution Rapide (Recommandée)

### Étape 1 : Lancer le serveur de développement
```bash
npm run dev
```

### Étape 2 : Charger les données de test

1. Ouvrez le site dans votre navigateur
2. Allez sur la page **Admin** : `http://localhost:3000/admin`
3. Connectez-vous avec le mot de passe : **`islande2026`**
4. En bas à droite, vous verrez un panneau **"Mode Test"**
5. Cliquez sur le bouton **"📸 Charger Photos Test"**
6. La page va se recharger automatiquement

✅ **C'est tout !** Vous avez maintenant 12 étapes de voyage avec de vraies photos d'Islande.

## 📸 Sources des Images

Les images proviennent de **Unsplash**, un service gratuit de photos de haute qualité :
- Pas de téléchargement nécessaire
- Chargement dynamique depuis internet
- Photos professionnelles d'Islande
- Aucune limite d'utilisation en développement

## 🗺️ Contenu Chargé

Quand vous chargez les données de test, vous obtenez :

- **12 étapes de voyage** (12 jours en Islande)
- **26 photos au total** réparties sur les différentes étapes
- Chaque étape contient :
  - Titre
  - Description détaillée
  - Localisation GPS (latitude/longitude)
  - 1 à 3 photos par étape
  - Date et numéro de jour

### Exemple d'étapes incluses :
1. Arrivée à Reykjavik
2. Cercle d'Or - Þingvellir
3. Geysir & Gullfoss
4. Cascade de Seljalandsfoss
5. Plage de Reynisfjara
6. Lagon glaciaire de Jökulsárlón
7. Fjords de l'Est
8. Lac Mývatn
9. Cascade Dettifoss
10. Akureyri
11. Péninsule de Snæfellsnes
12. Blue Lagoon

## 🔍 Où Voir les Photos

Une fois les données chargées :

### Page d'Accueil (`/`)
- Affiche toutes les étapes avec leur photo principale
- Défilement infini pour charger plus d'étapes
- Globe 3D interactif avec les positions GPS
- Statistiques du voyage

### Page Galerie (`/galerie`)
- Toutes les photos dans une grille style masonry
- Lightbox pour voir les photos en plein écran
- Navigation au clavier (←/→ pour changer, Esc pour fermer)
- Filtres par étape de voyage

## 🛠️ Comment ça Marche ?

### Architecture Technique

1. **Fichier de données** : `lib/mock-data.ts`
   - Contient 12 objets `TravelUpdate`
   - Chaque update a un tableau `photos` avec des URLs Unsplash

2. **LocalStorage**
   - Les données sont stockées dans le navigateur
   - Clé : `test_travel_updates`
   - Persiste entre les rechargements

3. **Composant de chargement** : `components/TestDataLoader.tsx`
   - Interface visible en bas à droite
   - Fonctions : charger / effacer les données
   - Notification de succès

## 🎨 Personnaliser les Images

### Option 1 : Modifier les URLs Unsplash

Éditez `lib/mock-data.ts` et changez les paramètres d'URL :

```typescript
// Avant (1200x800)
'https://images.unsplash.com/photo-xxx?w=1200&h=800&fit=crop'

// Après (format différent)
'https://images.unsplash.com/photo-xxx?w=1600&h=900&fit=crop'
```

Paramètres disponibles :
- `w` : largeur en pixels
- `h` : hauteur en pixels
- `fit=crop` : recadrage automatique
- `q=80` : qualité JPEG (1-100)

### Option 2 : Utiliser vos Propres Images

#### 1. Ajouter les images locales

Créez un dossier et ajoutez vos photos :
```
public/
  test-photos/
    iceland-1.jpg
    iceland-2.jpg
    etc...
```

#### 2. Modifier les URLs dans mock-data.ts

```typescript
photos: [
  '/test-photos/iceland-1.jpg',
  '/test-photos/iceland-2.jpg',
],
```

#### 3. Optimiser vos images

Pour de meilleures performances :
- Redimensionnez à 1200-1600px de large
- Compressez avec [TinyPNG](https://tinypng.com/)
- Convertissez en WebP si possible

## 🧪 Tester Différents Scénarios

### Ajouter une Nouvelle Étape

Dans `lib/mock-data.ts`, ajoutez un nouvel objet au tableau :

```typescript
export const mockTravelUpdates: TravelUpdate[] = [
  // ... étapes existantes
  {
    id: 'mock-13',
    date: '2024-08-27T10:00:00Z',
    day: 13,
    title: 'Votre Nouvelle Étape',
    description: 'Description...',
    location: {
      name: 'Nom du lieu',
      lat: 64.1234,
      lng: -21.5678,
    },
    photos: [
      'https://images.unsplash.com/photo-xxx...',
    ],
    createdAt: '2024-08-27T10:00:00Z',
  },
];
```

### Tester Sans Photos

Mettez un tableau vide :
```typescript
photos: [],
```

### Tester Avec Beaucoup de Photos

Ajoutez plus d'URLs :
```typescript
photos: [
  'https://images.unsplash.com/photo-1...',
  'https://images.unsplash.com/photo-2...',
  'https://images.unsplash.com/photo-3...',
  'https://images.unsplash.com/photo-4...',
  'https://images.unsplash.com/photo-5...',
],
```

## 🗑️ Effacer les Données

Deux méthodes :

### Méthode 1 : Interface visuelle
Cliquez sur "🗑️ Effacer données" dans le panneau en bas à droite

### Méthode 2 : Console du navigateur
```javascript
localStorage.removeItem('test_travel_updates');
window.location.reload();
```

## 🔄 Workflow de Test Recommandé

1. **Premier lancement** : Charger les données de test
2. **Tester l'affichage** : Vérifier la page d'accueil et la galerie
3. **Tester les interactions** :
   - Cliquer sur une étape
   - Ouvrir le lightbox
   - Naviguer entre les photos (clavier)
   - Tester le globe 3D
4. **Personnaliser** : Modifier les données selon vos besoins
5. **Effacer** : Nettoyer quand vous avez terminé

## ⚠️ Limitations

### Ce qui NE fonctionne PAS avec les données de test :

- ❌ **Page Admin** : Les fonctionnalités d'ajout/modification nécessitent Firebase
- ❌ **Upload de photos** : Nécessite Firebase Storage
- ❌ **Synchronisation** : Les données ne sont que locales (pas partagées entre appareils)
- ❌ **Persistance** : Les données sont supprimées si vous videz le cache du navigateur

### Ce qui FONCTIONNE parfaitement :

- ✅ Affichage des étapes sur la page d'accueil
- ✅ Affichage de toutes les photos dans la galerie
- ✅ Lightbox et navigation entre photos
- ✅ Globe 3D avec les positions
- ✅ Carte 2D alternative
- ✅ Statistiques du voyage
- ✅ Design et animations
- ✅ Lazy loading et optimisations

## 🚀 Passer en Production

Quand vous serez prêt à déployer avec de vraies données :

1. Configurez Firebase (voir documentation Firebase)
2. Activez Firebase Storage pour les images
3. Créez la page admin pour ajouter des étapes
4. Les images uploadées remplaceront les URLs Unsplash
5. Supprimez ou cachez le composant `TestDataLoader`

## 💡 Astuces

### Trouver des Photos sur Unsplash

1. Allez sur [unsplash.com](https://unsplash.com/)
2. Cherchez "Iceland" ou "Islande"
3. Cliquez sur une photo
4. Prenez l'URL et ajoutez `?w=1200&h=800&fit=crop`

### Déboguer

Ouvrez la console du navigateur et tapez :
```javascript
// Vérifier les données chargées
JSON.parse(localStorage.getItem('test_travel_updates'))

// Compter les étapes
JSON.parse(localStorage.getItem('test_travel_updates')).length

// Compter toutes les photos
JSON.parse(localStorage.getItem('test_travel_updates'))
  .reduce((sum, update) => sum + update.photos.length, 0)
```

### Performance

Pour des images plus rapides, réduisez la qualité :
```typescript
// Haute qualité (plus lent)
'?w=1600&h=1200&fit=crop'

// Qualité moyenne (recommandé)
'?w=1200&h=800&fit=crop&q=80'

// Basse qualité (plus rapide)
'?w=800&h=600&fit=crop&q=60'
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur (F12)
2. Assurez-vous que le serveur dev tourne (`npm run dev`)
3. Essayez d'effacer et recharger les données
4. Videz le cache du navigateur
5. Vérifiez que vous avez une connexion internet (pour Unsplash)

---

**Bon test ! 🇮🇸** 

Si vous avez des questions ou des suggestions, n'hésitez pas à modifier ce guide.
