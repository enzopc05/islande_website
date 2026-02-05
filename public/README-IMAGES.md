# Comment ajouter vos propres images de test

Ce dossier `/public` peut contenir vos images locales pour tester le site sans avoir besoin d'API ou de BDD.

## Méthode 1 : Utiliser les données de test automatiques (RECOMMANDÉ)

1. **Cliquez sur le bouton "📸 Charger Photos Test"** en bas à droite de la page
2. Les données seront chargées automatiquement avec de vraies photos d'Islande depuis Unsplash
3. Rechargez la page pour voir le résultat

✅ **Avantages** : Instantané, aucun téléchargement nécessaire, vraies photos de qualité

## Méthode 2 : Ajouter vos propres images locales

Si vous voulez tester avec vos propres photos :

### Étape 1 : Ajouter les images dans `/public`

1. Créez un dossier `/public/test-photos`
2. Ajoutez vos images dedans (formats: `.jpg`, `.jpeg`, `.png`, `.webp`)

Exemple de structure :
```
public/
  test-photos/
    reykjavik-1.jpg
    cascade-seljalandsfoss.jpg
    plage-noire.jpg
    glacier.jpg
    etc...
```

### Étape 2 : Modifier le fichier mock-data.ts

Dans `lib/mock-data.ts`, remplacez les URLs Unsplash par vos images locales :

**Avant :**
```typescript
photos: [
  'https://images.unsplash.com/photo-1...',
],
```

**Après :**
```typescript
photos: [
  '/test-photos/reykjavik-1.jpg',
  '/test-photos/reykjavik-2.jpg',
],
```

### Étape 3 : Charger les données

Cliquez sur le bouton "📸 Charger Photos Test" et rechargez la page.

## Recommandations pour les images

- **Format** : JPEG ou WebP pour de meilleures performances
- **Résolution recommandée** : 1200x800px minimum
- **Poids** : Optimisez vos images (max 200-300KB par image)
- **Nommage** : Utilisez des noms descriptifs (ex: `jour-1-reykjavik.jpg`)

## Outils de compression d'images

Pour optimiser vos photos avant de les ajouter :
- https://tinypng.com/
- https://squoosh.app/
- https://imageoptim.com/

## En production

⚠️ **Important** : Ces images de test sont uniquement pour le développement local.
En production, utilisez Firebase Storage ou tout autre service de stockage cloud.

## Support

Si vous rencontrez des problèmes, vérifiez que :
- Les chemins des images commencent par `/`
- Les noms de fichiers n'ont pas d'espaces ou de caractères spéciaux
- Les images sont bien dans le dossier `/public`
