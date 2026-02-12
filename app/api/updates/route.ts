import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { TravelUpdate } from '@/types';

type UpdatePayload = Omit<TravelUpdate, 'id' | 'createdAt'>;

type UpdateRow = {
  date: string;
  day: number;
  title: string;
  description: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  photos: string[];
};

function isValidUpdatePayload(payload: UpdatePayload): payload is UpdatePayload {
  return Boolean(
    payload &&
      typeof payload.date === 'string' &&
      typeof payload.day === 'number' &&
      typeof payload.title === 'string' &&
      typeof payload.description === 'string' &&
      payload.location &&
      typeof payload.location.name === 'string' &&
      typeof payload.location.lat === 'number' &&
      typeof payload.location.lng === 'number' &&
      Array.isArray(payload.photos)
  );
}

export async function POST(request: Request) {
  const payload = (await request.json()) as UpdatePayload;

  if (!isValidUpdatePayload(payload)) {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const row: UpdateRow = {
    date: payload.date,
    day: payload.day,
    title: payload.title,
    description: payload.description,
    location_name: payload.location.name,
    location_lat: payload.location.lat,
    location_lng: payload.location.lng,
    photos: payload.photos,
  };

  const { data, error } = await supabaseServer
    .from('travel_updates')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }

  const { error } = await supabaseServer
    .from('travel_updates')
    .delete()
    .eq('id', id);

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
