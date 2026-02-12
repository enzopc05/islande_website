export interface TravelUpdate {
  id: string;
  date: string; // ISO string
  day: number; // Jour du voyage (1-12)
  title: string;
  description: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  photos: string[]; // URLs des photos
  createdAt: string; // ISO string
}

export interface TripInfo {
  startDate: string; // ISO string
  endDate: string; // ISO string
  travelers: string[];
  description: string;
}
