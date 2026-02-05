# Dossier pour vos photos de test locales

Placez vos images ici pour les tester dans l'application.

## Formats supportés
- `.jpg` / `.jpeg`
- `.png`
- `.webp`

## Utilisation

1. Ajoutez vos photos dans ce dossier
2. Référencez-les dans `lib/mock-data.ts` avec le chemin `/test-photos/votre-image.jpg`
3. Rechargez les données de test

Exemple :
```typescript
photos: [
  '/test-photos/reykjavik.jpg',
  '/test-photos/cascade.jpg',
]
```
