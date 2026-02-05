/**
 * Script de vérification pour les données de test
 * Exécuter avec : node scripts/check-test-data.js
 */

// Simuler le fichier mock-data
const mockUpdates = require('../lib/mock-data.ts');

console.log('🔍 Vérification des données de test...\n');

// Statistiques
const totalUpdates = mockUpdates.mockTravelUpdates?.length || 0;
const totalPhotos = mockUpdates.mockTravelUpdates?.reduce(
  (sum, update) => sum + (update.photos?.length || 0), 
  0
) || 0;

const updatesWith0Photos = mockUpdates.mockTravelUpdates?.filter(u => !u.photos || u.photos.length === 0).length || 0;
const updatesWith1Photo = mockUpdates.mockTravelUpdates?.filter(u => u.photos?.length === 1).length || 0;
const updatesWith2Photos = mockUpdates.mockTravelUpdates?.filter(u => u.photos?.length === 2).length || 0;
const updatesWith3PlusPhotos = mockUpdates.mockTravelUpdates?.filter(u => u.photos?.length >= 3).length || 0;

console.log('📊 STATISTIQUES');
console.log('━'.repeat(50));
console.log(`✅ Nombre total d'étapes : ${totalUpdates}`);
console.log(`📸 Nombre total de photos : ${totalPhotos}`);
console.log(`📈 Photos par étape (moyenne) : ${(totalPhotos / totalUpdates).toFixed(1)}`);
console.log('');

console.log('📷 RÉPARTITION DES PHOTOS');
console.log('━'.repeat(50));
console.log(`Sans photo : ${updatesWith0Photos}`);
console.log(`1 photo : ${updatesWith1Photo}`);
console.log(`2 photos : ${updatesWith2Photos}`);
console.log(`3+ photos : ${updatesWith3PlusPhotos}`);
console.log('');

// Vérifier les URLs
console.log('🔗 VÉRIFICATION DES URLs');
console.log('━'.repeat(50));

let unsplashCount = 0;
let localCount = 0;
let otherCount = 0;

mockUpdates.mockTravelUpdates?.forEach(update => {
  update.photos?.forEach(url => {
    if (url.includes('unsplash.com')) {
      unsplashCount++;
    } else if (url.startsWith('/')) {
      localCount++;
    } else {
      otherCount++;
    }
  });
});

console.log(`Unsplash : ${unsplashCount} photos`);
console.log(`Local (/public) : ${localCount} photos`);
console.log(`Autre : ${otherCount} photos`);
console.log('');

// Liste détaillée
console.log('📋 DÉTAIL DES ÉTAPES');
console.log('━'.repeat(50));

mockUpdates.mockTravelUpdates?.forEach((update, index) => {
  console.log(`${index + 1}. Jour ${update.day} - ${update.title}`);
  console.log(`   📍 ${update.location.name}`);
  console.log(`   📸 ${update.photos?.length || 0} photo(s)`);
  
  if (update.photos && update.photos.length > 0) {
    update.photos.forEach((photo, i) => {
      const source = photo.includes('unsplash.com') ? '🌐 Unsplash' : 
                     photo.startsWith('/') ? '💾 Local' : '❓ Autre';
      console.log(`      ${i + 1}. ${source}`);
    });
  }
  console.log('');
});

console.log('✅ Vérification terminée!\n');

// Recommandations
console.log('💡 RECOMMANDATIONS');
console.log('━'.repeat(50));

if (totalPhotos === 0) {
  console.log('⚠️  Aucune photo trouvée! Ajoutez des URLs dans mock-data.ts');
} else if (totalPhotos < 20) {
  console.log('💡 Peu de photos. Envisagez d\'en ajouter plus pour un meilleur rendu.');
} else {
  console.log('✅ Bon nombre de photos!');
}

if (localCount > 0) {
  console.log(`💡 Vous utilisez ${localCount} photo(s) locale(s).`);
  console.log('   Assurez-vous qu\'elles sont bien dans /public');
}

if (updatesWith0Photos > 0) {
  console.log(`⚠️  ${updatesWith0Photos} étape(s) sans photo.`);
}

console.log('');
