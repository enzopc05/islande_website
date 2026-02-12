import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
type GalleryInsert = {
  url: string;
  title?: string;
  description?: string;
  date: string;
  source?: 'update' | 'gallery';
  updateDay?: number;
  updateTitle?: string;
};

type GalleryRow = {
  url: string;
  title: string | null;
  description: string | null;
  date: string;
  source: string;
  update_day: number | null;
  update_title: string | null;
};

function isValidGalleryPhoto(photo: GalleryInsert): photo is GalleryInsert {
  return Boolean(photo && typeof photo.url === 'string' && typeof photo.date === 'string');
}

export async function POST(request: Request) {
  const payload = (await request.json()) as { photos: GalleryInsert[] };

  if (!payload?.photos || !Array.isArray(payload.photos) || payload.photos.length === 0) {
    return new NextResponse('Missing photos', { status: 400 });
  }

  if (!payload.photos.every(isValidGalleryPhoto)) {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const rows: GalleryRow[] = payload.photos.map((photo) => ({
    url: photo.url,
    title: photo.title ?? null,
    description: photo.description ?? null,
    date: photo.date,
    source: photo.source ?? 'gallery',
    update_day: photo.updateDay ?? null,
    update_title: photo.updateTitle ?? null,
  }));

  const { data, error } = await supabaseServer
    .from('gallery_photos')
    .insert(rows)
    .select('id');

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  const ids = (data ?? []).map((row: { id: string }) => row.id);
  return NextResponse.json({ ids });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }

  const { error } = await supabaseServer
    .from('gallery_photos')
    .delete()
    .eq('id', id);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
