import { TravelUpdate } from '@/types';

/**
 * Données de test avec de vraies images d'Islande depuis Unsplash
 * Ces données permettent de tester le site sans API ni BDD
 */
export const mockTravelUpdates: TravelUpdate[] = [
  {
    id: 'mock-1',
    date: '2024-08-15T10:00:00Z',
    day: 1,
    title: 'Arrivée à Reykjavik',
    description: 'Premier jour en Islande ! Arrivée à l\'aéroport de Keflavik et transfert vers Reykjavik. Installation à l\'hôtel et première exploration de la capitale islandaise. Promenade dans le centre-ville, visite de la rue commerçante Laugavegur et découverte de l\'architecture colorée des maisons. Le soleil de minuit donne une ambiance magique à la ville.',
    location: {
      name: 'Reykjavik',
      lat: 64.1466,
      lng: -21.9426,
    },
    photos: [
      'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-15T10:00:00Z',
  },
  {
    id: 'mock-2',
    date: '2024-08-16T14:30:00Z',
    day: 2,
    title: 'Cercle d\'Or - Þingvellir',
    description: 'Début du fameux Cercle d\'Or ! Première étape au parc national de Þingvellir, classé au patrimoine mondial de l\'UNESCO. C\'est ici que se rencontrent les plaques tectoniques eurasienne et nord-américaine. Balade dans la faille de Silfra et découverte du site historique de l\'Alþingi, le plus ancien parlement du monde.',
    location: {
      name: 'Parc National de Þingvellir',
      lat: 64.2559,
      lng: -21.1304,
    },
    photos: [
      'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1476067897447-d0c5df27b5df?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-16T14:30:00Z',
  },
  {
    id: 'mock-3',
    date: '2024-08-17T11:15:00Z',
    day: 3,
    title: 'Cercle d\'Or - Geysir & Gullfoss',
    description: 'Continuation du Cercle d\'Or avec la zone géothermale de Geysir. Observation du geyser Strokkur qui jaillit toutes les 5-10 minutes jusqu\'à 30 mètres de haut ! Ensuite, direction la majestueuse cascade de Gullfoss, la "Chute d\'Or", avec ses deux niveaux et son débit impressionnant. Les embruns créent souvent de magnifiques arc-en-ciel.',
    location: {
      name: 'Geysir',
      lat: 64.3107,
      lng: -20.3003,
    },
    photos: [
      'https://images.unsplash.com/photo-1505832018823-50331d70d237?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-17T11:15:00Z',
  },
  {
    id: 'mock-4',
    date: '2024-08-18T16:45:00Z',
    day: 4,
    title: 'Côte Sud - Seljalandsfoss',
    description: 'Route vers la côte sud de l\'Islande. Arrêt à la cascade de Seljalandsfoss, l\'une des plus photographiées du pays. Particularité unique : on peut marcher derrière le rideau d\'eau pour une vue spectaculaire ! Attention, prévoir un imperméable car on ressort trempé mais les photos valent le coup.',
    location: {
      name: 'Cascade de Seljalandsfoss',
      lat: 63.6156,
      lng: -19.9889,
    },
    photos: [
      'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587032411808-f49da4d32dde?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-18T16:45:00Z',
  },
  {
    id: 'mock-5',
    date: '2024-08-19T13:20:00Z',
    day: 5,
    title: 'Côte Sud - Reynisfjara',
    description: 'Découverte de la plage de sable noir de Reynisfjara. Paysage lunaire avec ses colonnes de basalte hexagonales et ses formations rocheuses Reynisdrangar émergeant de l\'océan. Attention aux vagues sournoises ! Visite des villages de pêcheurs environnants et dégustation de produits locaux.',
    location: {
      name: 'Plage de Reynisfjara',
      lat: 63.4041,
      lng: -19.0447,
    },
    photos: [
      'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-19T13:20:00Z',
  },
  {
    id: 'mock-6',
    date: '2024-08-20T09:00:00Z',
    day: 6,
    title: 'Jökulsárlón - Le Lagon Glaciaire',
    description: 'Moment magique au lagon glaciaire de Jökulsárlón. Des icebergs millénaires flottent majestueusement avant de rejoindre l\'océan. Observation de phoques et excursion en zodiac entre les glaces. La plage de diamants juste à côté offre un spectacle surréaliste avec ses blocs de glace échoués sur le sable noir.',
    location: {
      name: 'Jökulsárlón',
      lat: 64.0484,
      lng: -16.2306,
    },
    photos: [
      'https://images.unsplash.com/photo-1569341808-4b2a182cca69?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-20T09:00:00Z',
  },
  {
    id: 'mock-7',
    date: '2024-08-21T15:30:00Z',
    day: 7,
    title: 'Fjords de l\'Est',
    description: 'Traversée des fjords de l\'Est, région sauvage et moins touristique. Routes sinueuses offrant des panoramas à couper le souffle. Arrêts dans de petits villages de pêcheurs préservés. Observation de rennes et d\'oiseaux marins. La lumière dorée du soir sur les montagnes est absolument magique.',
    location: {
      name: 'Fjords de l\'Est',
      lat: 65.2637,
      lng: -14.0121,
    },
    photos: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-21T15:30:00Z',
  },
  {
    id: 'mock-8',
    date: '2024-08-22T12:00:00Z',
    day: 8,
    title: 'Mývatn - Les Merveilles du Nord',
    description: 'Exploration de la région du lac Mývatn. Visite des pseudo-cratères de Skútustaðir, des formations de lave de Dimmuborgir surnommées "le château du diable", et du cratère volcanique Hverfjall. Baignade relaxante dans les bains naturels de Mývatn, version moins touristique du Blue Lagoon.',
    location: {
      name: 'Lac Mývatn',
      lat: 65.5970,
      lng: -16.9177,
    },
    photos: [
      'https://images.unsplash.com/photo-1517815683604-e5bb2fda8e89?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548247929-11ffc9c24e5e?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-22T12:00:00Z',
  },
  {
    id: 'mock-9',
    date: '2024-08-23T10:30:00Z',
    day: 9,
    title: 'Dettifoss - La Plus Puissante',
    description: 'Randonnée vers Dettifoss, la cascade la plus puissante d\'Europe. Le grondement est assourdissant et les embruns se voient à des kilomètres ! Court trek dans le canyon pour admirer cette force de la nature. Le paysage désertique environnant renforce l\'impression d\'être sur une autre planète.',
    location: {
      name: 'Dettifoss',
      lat: 65.8141,
      lng: -16.3833,
    },
    photos: [
      'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-23T10:30:00Z',
  },
  {
    id: 'mock-10',
    date: '2024-08-24T14:00:00Z',
    day: 10,
    title: 'Akureyri - Capitale du Nord',
    description: 'Journée de détente à Akureyri, la capitale du nord de l\'Islande. Visite de la ville, de ses musées et de son jardin botanique surprenant. Shopping dans les boutiques locales et dégustation de la célèbre glace islandaise même par temps froid ! Excursion d\'observation des baleines dans le fjord.',
    location: {
      name: 'Akureyri',
      lat: 65.6835,
      lng: -18.0878,
    },
    photos: [
      'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-24T14:00:00Z',
  },
  {
    id: 'mock-11',
    date: '2024-08-25T11:45:00Z',
    day: 11,
    title: 'Snæfellsnes - L\'Islande en Miniature',
    description: 'Exploration de la péninsule de Snæfellsnes, surnommée "l\'Islande en miniature" car on y trouve tous les paysages du pays. Visite de la montagne Kirkjufell, la plus photographiée d\'Islande, de plages de sable noir, de falaises à oiseaux et du glacier Snæfellsjökull. Paysages variés et spectaculaires.',
    location: {
      name: 'Péninsule de Snæfellsnes',
      lat: 64.8702,
      lng: -23.7761,
    },
    photos: [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1533112028616-25e177ecc5a3?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-25T11:45:00Z',
  },
  {
    id: 'mock-12',
    date: '2024-08-26T08:00:00Z',
    day: 12,
    title: 'Blue Lagoon & Départ',
    description: 'Dernière journée en Islande ! Matinée détente au célèbre Blue Lagoon, ses eaux laiteuses bleu turquoise à 38°C sont parfaites pour se relaxer. Masque d\'argile siliceux offert à l\'entrée. Moment de contemplation avec vue sur le champ de lave environnant. Transfert vers l\'aéroport avec des souvenirs plein la tête.',
    location: {
      name: 'Blue Lagoon',
      lat: 63.8804,
      lng: -22.4495,
    },
    photos: [
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&h=800&fit=crop',
    ],
    createdAt: '2024-08-26T08:00:00Z',
  },
];

/**
 * Charge les données de test dans le localStorage
 */
export function loadMockData() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('test_travel_updates', JSON.stringify(mockTravelUpdates));
    console.log('✅ Données de test chargées avec succès!', mockTravelUpdates.length, 'updates');
    return true;
  }
  return false;
}

/**
 * Efface les données de test
 */
export function clearMockData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('test_travel_updates');
    localStorage.removeItem('gallery_photos');
    console.log('🗑️ Données de test effacées');
    return true;
  }
  return false;
}

/**
 * Vérifie si des données de test sont chargées
 */
export function hasMockData(): boolean {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('test_travel_updates');
    return data !== null && data !== '[]';
  }
  return false;
}
