import { supabase } from '@/lib/supabaseClient';
import { TravelPhoto, TravelUpdate, TravelUpdateExtras, TravelSpot } from '@/types';

export interface GalleryPhoto {
  id: string;
  url: string;
  title?: string;
  description?: string;
  date: string;
  source?: 'update' | 'gallery';
  updateDay?: number;
  updateTitle?: string;
  updateId?: string;
  photoId?: string;
  createdAt?: string;
}

type DbTravelUpdate = {
  id: string;
  date: string;
  day: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | null;
  location_name: string;
  location_lat: number;
  location_lng: number;
  spots: TravelSpot[] | null;
  created_at: string;
};

type DbTravelPhoto = {
  id: string;
  update_id: string;
  url: string;
  created_at: string;
};

type DbTravelExtras = {
  update_id: string;
  micro_story: string | null;
  highlights: string[] | null;
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
  status: row.status ?? 'published',
  location: {
    name: row.location_name,
    lat: row.location_lat,
    lng: row.location_lng,
  },
  photos: [],
  spots: row.spots ?? [],
  createdAt: row.created_at,
});

const mapTravelPhoto = (row: DbTravelPhoto): TravelPhoto => ({
  id: row.id,
  updateId: row.update_id,
  url: row.url,
  createdAt: row.created_at,
});

const mapTravelExtras = (row: DbTravelExtras): TravelUpdateExtras => ({
  updateId: row.update_id,
  microStory: row.micro_story ?? '',
  highlights: row.highlights ?? [],
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
  photoId: row.id,
  createdAt: row.created_at,
});

export async function getTravelUpdates(options?: { includeDrafts?: boolean }): Promise<TravelUpdate[]> {
  const baseQuery = supabase
    .from('travel_updates')
    .select('*')
    .order('date', { ascending: false });

  const { data, error } = options?.includeDrafts
    ? await baseQuery
    : await baseQuery.eq('status', 'published');

  if (error) {
    throw error;
  }

  const updates = (data as DbTravelUpdate[]).map(mapTravelUpdate);
  if (updates.length === 0) return updates;

  const updateIds = updates.map((update) => update.id);

  const [photosResult, extrasResult] = await Promise.all([
    supabase.from('travel_update_photos').select('*').in('update_id', updateIds),
    supabase.from('travel_update_extras').select('*').in('update_id', updateIds),
  ]);

  if (photosResult.error) {
    throw photosResult.error;
  }

  if (extrasResult.error) {
    throw extrasResult.error;
  }

  const photosByUpdate = new Map<string, TravelPhoto[]>();
  (photosResult.data as DbTravelPhoto[]).forEach((row) => {
    const photo = mapTravelPhoto(row);
    const existing = photosByUpdate.get(photo.updateId) ?? [];
    existing.push(photo);
    photosByUpdate.set(photo.updateId, existing);
  });

  const extrasByUpdate = new Map<string, TravelUpdateExtras>();
  (extrasResult.data as DbTravelExtras[]).forEach((row) => {
    extrasByUpdate.set(row.update_id, mapTravelExtras(row));
  });

  return updates.map((update) => ({
    ...update,
    photos: photosByUpdate.get(update.id) ?? [],
    extras: extrasByUpdate.get(update.id),
  }));
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

type TravelUpdatePayload = {
  date: string;
  day: number;
  title: string;
  description: string;
  status?: 'draft' | 'published';
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  photos: string[];
  spots?: TravelSpot[];
  extras?: {
    microStory: string;
    highlights: string[];
  };
};

export async function addTravelUpdate(update: TravelUpdatePayload): Promise<string> {
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

export async function updateTravelUpdate(id: string, update: TravelUpdatePayload): Promise<void> {
  const response = await fetch(`/api/updates?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to update travel update.');
  }
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
