export interface TravelUpdate {
  id: string;
  date: string; // ISO string
  day: number; // Jour du voyage (1-12)
  title: string;
  description: string;
  status?: 'draft' | 'published';
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  photos: TravelPhoto[];
  spots?: TravelSpot[]; // Spots intermediaires
  extras?: TravelUpdateExtras;
  createdAt: string; // ISO string
}

export interface TravelSpot {
  id: string;
  day: number;
  name: string;
  description?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface TravelPhoto {
  id: string;
  updateId: string;
  url: string;
  createdAt?: string;
}

export interface TravelUpdateExtras {
  updateId: string;
  microStory: string;
  highlights: string[];
}

export interface PhotoLike {
  id: string;
  photoId: string;
  userId: string;
  createdAt: string;
}

export interface PhotoComment {
  id: string;
  photoId: string;
  userId: string;
  userEmail?: string;
  content: string;
  createdAt: string;
}

export interface TripInfo {
  startDate: string; // ISO string
  endDate: string; // ISO string
  travelers: string[];
  description: string;
}
