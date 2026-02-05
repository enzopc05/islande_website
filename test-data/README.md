# 🧪 Données de Test - Road Trip Islande

Ce dossier contient des données de test pour rapidement peupler votre site de voyage.

## 📋 iceland-roadtrip.json

Un road trip complet de 12 jours en Islande avec :
- ✅ Coordonnées GPS réelles
- ✅ Descriptions détaillées
- ✅ Lieux touristiques emblématiques
- ✅ Liens Google Maps

## 🚀 Comment l'utiliser

### Méthode 1 : Import depuis fichier
1. Allez sur `/admin`
2. Connectez-vous (mot de passe par défaut: `islande2026`)
3. Activez le **Mode Test** (activé par défaut)
4. Dans la section "📥 Importer un Road Trip", cliquez sur "Parcourir"
5. Sélectionnez le fichier `iceland-roadtrip.json`
6. Les 12 étapes sont automatiquement importées !

### Méthode 2 : Copier-coller
1. Ouvrez le fichier `iceland-roadtrip.json`
2. Copiez tout le contenu
3. Sur `/admin`, dans la zone de texte "Ou coller le JSON directement"
4. Collez le contenu et cliquez sur "Importer le JSON"

## 📍 Étapes incluses

1. **Jour 1** - Reykjavik (capitale)
2. **Jour 2** - Þingvellir (Cercle d'Or)
3. **Jour 3** - Geysir & Gullfoss
4. **Jour 4** - Seljalandsfoss (cascade)
5. **Jour 5** - Reynisfjara (plage noire)
6. **Jour 6** - Skaftafell & Glacier Vatnajökull
7. **Jour 7** - Jökulsárlón (lagon glaciaire)
8. **Jour 8** - Fjords de l'Est
9. **Jour 9** - Lac Mývatn
10. **Jour 10** - Akureyri (capitale du Nord)
11. **Jour 11** - Péninsule de Snæfellsnes
12. **Jour 12** - Blue Lagoon & Retour

## 🎨 Personnalisation

Vous pouvez modifier le JSON pour :
- Changer les descriptions
- Ajouter/retirer des étapes
- Modifier les coordonnées GPS
- Adapter à votre propre voyage

## 📝 Format JSON

```json
{
  "roadtrip": [
    {
      "day": 1,
      "title": "Titre de l'étape",
      "description": "Description détaillée...",
      "location": {
        "name": "Nom du lieu",
        "lat": 64.1466,
        "lng": -21.9426
      },
      "googleMapsLink": "https://www.google.com/maps/@64.1466,-21.9426,13z"
    }
  ]
}
```

## ⚠️ Notes

- Les photos seront des placeholders (mode test)
- Les données sont stockées dans le localStorage
- Pour effacer, utilisez le bouton "Effacer tout" en mode test
- Compatible avec le mode production (Firebase) après adaptation
