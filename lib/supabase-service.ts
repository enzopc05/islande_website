import { supabase } from '@/lib/supabaseClient';
import { TravelUpdate } from '@/types';

export interface GalleryPhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  date: string;
  source?: 'update' | 'gallery';
  updateDay?: number;
  updateTitle?: string;
  createdAt?: string;
}

type DbTravelUpdate = {
  id: string;
  date: string;
  day: number;
  title: string;
  description: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  photos: string[] | null;
  created_at: string;
};

type DbGalleryPhoto = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  date: string;
  source: string | null;
  update_day: number | null;
  update_title: string | null;
  created_at: string;
};

const mapTravelUpdate = (row: DbTravelUpdate): TravelUpdate => ({
  id: row.id,
  date: row.date,
  day: row.day,
  title: row.title,
  description: row.description,
  location: {
    name: row.location_name,
    lat: row.location_lat,
    lng: row.location_lng,
  },
  photos: row.photos ?? [],
  createdAt: row.created_at,
});

const mapGalleryPhoto = (row: DbGalleryPhoto): GalleryPhoto => ({
  id: row.id,
  url: row.url,
  title: row.title ?? undefined,
  description: row.description ?? undefined,
  date: row.date,
  source: (row.source as 'update' | 'gallery' | null) ?? undefined,
  updateDay: row.update_day ?? undefined,
  updateTitle: row.update_title ?? undefined,
  createdAt: row.created_at,
});

export async function getTravelUpdates(): Promise<TravelUpdate[]> {
  const { data, error } = await supabase
    .from('travel_updates')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbTravelUpdate[]).map(mapTravelUpdate);
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as DbGalleryPhoto[]).map(mapGalleryPhoto);
}

export async function addTravelUpdate(update: Omit<TravelUpdate, 'id' | 'createdAt'>): Promise<string> {
  const response = await fetch('/api/updates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to create travel update.');
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export async function deleteTravelUpdate(id: string): Promise<void> {
  const response = await fetch(`/api/updates?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to delete travel update.');
  }
}

async function uploadSinglePhoto(file: File, pathPrefix: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pathPrefix', pathPrefix);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload photo.');
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

export async function uploadPhotos(files: File[], updateId: string): Promise<string[]> {
  const pathPrefix = `travel_updates/${updateId}`;
  const uploads = files.map((file) => uploadSinglePhoto(file, pathPrefix));
  return Promise.all(uploads);
}

export async function uploadGalleryPhotos(files: File[]): Promise<string[]> {
  const pathPrefix = `gallery/${Date.now()}`;
  const uploads = files.map((file) => uploadSinglePhoto(file, pathPrefix));
  return Promise.all(uploads);
}

export async function addGalleryPhotos(photos: Omit<GalleryPhoto, 'id' | 'createdAt'>[]): Promise<string[]> {
  const response = await fetch('/api/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photos }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to create gallery photos.');
  }

  const data = (await response.json()) as { ids: string[] };
  return data.ids;
}

export async function deleteGalleryPhoto(id: string): Promise<void> {
  const response = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to delete gallery photo.');
  }
}
