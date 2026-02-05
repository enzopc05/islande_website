# 🇮🇸 Roadtrip Islande Août 2026

Site web pour documenter et partager votre aventure de 12 jours en Islande avec votre famille.

## ✨ Fonctionnalités

- **Page publique** avec timeline des mises à jour
- **Interface d'administration** protégée par mot de passe
- **Carte interactive** affichant votre parcours avec Leaflet
- **Galerie photos** optimisée avec Next.js Image
- **PWA (Progressive Web App)** pour une utilisation hors-ligne
- **Design responsive** adapté mobile, tablette et desktop
- **Optimisé pour connexions intermittentes**

## 🚀 Technologies utilisées

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Firebase** (Firestore + Storage)
- **React Leaflet** pour les cartes
- **PWA** avec next-pwa

## 📋 Prérequis

- Node.js 18+ installé
- Un compte Firebase (gratuit)
- Un compte Vercel pour le déploiement (gratuit)

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd islande_website
npm install
```

### 2. Test Rapide (Sans Firebase) 🚀

Vous voulez voir le rendu avec de vraies photos **sans configurer Firebase** ?

1. **Lancez le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Accédez à la page admin** : `http://localhost:3000/admin`
   - Mot de passe : `islande2026`

3. **Chargez les données de test** :
   - En bas à droite, cliquez sur **"📸 Charger Photos Test"**
   - La page se recharge automatiquement

4. **Explorez le site** :
   - Page d'accueil : 12 étapes avec vraies photos d'Islande
   - Galerie : 26 photos au total
   - Globe 3D interactif
   - Toutes les fonctionnalités visuelles

📖 **Guide complet** : Voir [docs/TEST-GUIDE.md](docs/TEST-GUIDE.md)

---

### 3. Configuration Firebase (Pour Production)

> 💡 **Optionnel** si vous testez seulement. Obligatoire pour déployer en production.

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez **Firestore Database** en mode test (ou production avec règles)
4. Activez **Storage** en mode test (ou production avec règles)
5. Dans les paramètres du projet, récupérez les clés de configuration

### 4. Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp .env.local.example .env.local
```

Remplissez les valeurs avec vos identifiants Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Mot de passe pour l'interface admin
NEXT_PUBLIC_ADMIN_PASSWORD=votre_mot_de_passe_secret
```

### 5. Règles de sécurité Firebase

#### Firestore (`rules` dans la console Firebase)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /travelUpdates/{document=**} {
      allow read: if true;
      allow write: if true; // À sécuriser en production
    }
  }
}
```

#### Storage (`rules` dans la console Firebase)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if true;
      allow write: if true; // À sécuriser en production
    }
  }
}
```

### 6. Créer les icônes PWA

Créez deux icônes dans le dossier `public/` :
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

Vous pouvez utiliser un outil en ligne comme [RealFaviconGenerator](https://realfavicongenerator.net/) pour générer ces icônes.

## 🏃 Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📱 Utilisation

### Page publique (/)

- Affiche toutes les mises à jour dans une grille
- Carte interactive montrant le parcours
- Accessible à tous sans authentification

### Interface Admin (/admin)

1. Allez sur `/admin`
2. Entrez votre mot de passe (défini dans `.env.local`)
3. Remplissez le formulaire :
   - **Jour** : Numéro du jour (1-12)
   - **Titre** : Titre de l'étape
   - **Description** : Racontez votre journée
   - **Lieu** : Nom du lieu
   - **Coordonnées GPS** : Latitude et longitude (obtenables depuis Google Maps)
   - **Photos** : Sélectionnez une ou plusieurs photos

### Obtenir les coordonnées GPS

1. Ouvrez Google Maps
2. Faites un clic droit sur le lieu
3. Cliquez sur les coordonnées pour les copier
4. Collez-les dans les champs Latitude et Longitude

## 🌍 Déploiement sur Vercel

### Méthode recommandée

1. Poussez votre code sur GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Allez sur [Vercel](https://vercel.com)
3. Cliquez sur "Import Project"
4. Sélectionnez votre repository GitHub
5. Ajoutez vos variables d'environnement (même contenu que `.env.local`)
6. Cliquez sur "Deploy"

Votre site sera disponible sur une URL type : `https://votre-projet.vercel.app`

### Mise à jour du site

À chaque push sur la branche `main`, Vercel redéploiera automatiquement votre site.

## 💡 Conseils pour le voyage

### Mode hors-ligne

- Le site est une PWA, vous pouvez l'installer sur votre téléphone
- Les pages déjà visitées seront accessibles hors-ligne
- Préparez vos posts à l'avance et publiez-les quand vous avez du wifi

### Optimisation des photos

- Prenez des photos de qualité raisonnable (pas de RAW)
- 1-2 Mo par photo est suffisant
- Le site optimise automatiquement l'affichage

### Points wifi en Islande

- Hôtels et guesthouses
- Stations-service N1
- Cafés et restaurants
- Certains sites touristiques

## 🔒 Sécurité

⚠️ **Important** : Dans cette version de base, l'authentification admin est simple (mot de passe côté client). Pour une meilleure sécurité :

1. Ajoutez Firebase Authentication
2. Sécurisez les règles Firestore/Storage
3. Créez une API route Next.js pour la création de posts

## 🛠️ Scripts disponibles

```bash
npm run dev          # Lancer en développement
npm run build        # Créer le build de production
npm run start        # Lancer le serveur de production
npm run lint         # Vérifier le code avec ESLint
```

## 📁 Structure du projet

```
islande_website/
├── app/
│   ├── admin/          # Interface d'administration
│   ├── layout.tsx      # Layout principal
│   └── page.tsx        # Page d'accueil
├── components/
│   ├── Header.tsx      # En-tête du site
│   ├── TravelMap.tsx   # Carte interactive
│   └── UpdateCard.tsx  # Carte d'update
├── lib/
│   ├── firebase.ts          # Configuration Firebase
│   └── firebase-service.ts  # Services Firestore
├── types/
│   └── index.ts        # Types TypeScript
├── public/
│   └── manifest.json   # Manifest PWA
└── .env.local          # Variables d'environnement (à créer)
```

## 🐛 Résolution de problèmes

### Les images ne s'affichent pas

- Vérifiez que Firebase Storage est activé
- Vérifiez les règles de sécurité Storage
- Vérifiez que le domaine Firebase est dans `next.config.ts`

### Erreur de connexion Firebase

- Vérifiez vos variables d'environnement dans `.env.local`
- Vérifiez que Firestore est activé en mode test

### La carte ne s'affiche pas

- C'est normal au chargement initial (pas de données)
- Ajoutez au moins une mise à jour pour voir la carte
- Vérifiez la console pour les erreurs JavaScript

## 📝 Améliorations futures possibles

- [ ] Authentification Firebase pour plus de sécurité
- [ ] Mode multi-utilisateurs
- [ ] Commentaires pour la famille
- [ ] Export PDF du voyage
- [ ] Intégration météo
- [ ] Statistiques du voyage (km parcourus, etc.)

## 🎉 Bon voyage !

Profitez bien de votre aventure en Islande et n'oubliez pas de partager vos plus beaux moments avec votre famille !

---

Créé avec ❤️ et Claude Code
