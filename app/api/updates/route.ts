import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
type UpdatePayload = {
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
  spots?: unknown[];
  extras?: {
    microStory: string;
    highlights: string[];
  };
};

type UpdateRow = {
  date: string;
  day: number;
  title: string;
  description: string;
  status: 'draft' | 'published';
  location_name: string;
  location_lat: number;
  location_lng: number;
  spots: unknown[];
};

type PhotoRow = {
  update_id: string;
  url: string;
};

type NewsletterRow = {
  email: string | null;
};

const RESEND_API_URL = 'https://api.resend.com/emails';
const EMAIL_FROM = process.env.NEWSLETTER_FROM || 'onboarding@resend.dev';

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const buildEmailHtml = (payload: UpdatePayload, origin: string) => {
  const highlights = payload.extras?.highlights ?? [];
  const highlightsHtml = highlights.length
    ? `<ul style="padding-left:16px;margin:12px 0 0 0;">${highlights
        .map((item) => `<li style="margin:6px 0;">${item}</li>`)
        .join('')}</ul>`
    : '';

  const microStory = payload.extras?.microStory
    ? `<p style="margin:12px 0 0 0;white-space:pre-line;">${payload.extras.microStory}</p>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;background:#0b0b0b;padding:32px;">
      <div style="max-width:600px;margin:0 auto;background:#111827;border:1px solid #1f2937;padding:28px;">
        <p style="letter-spacing:0.4em;font-size:10px;text-transform:uppercase;color:#38bdf8;">Nouveau post</p>
        <h1 style="margin:12px 0 8px 0;font-size:28px;color:white;">Jour ${payload.day} — ${payload.title}</h1>
        <p style="margin:0;color:#94a3b8;">${payload.location.name}</p>
        ${microStory}
        ${highlightsHtml}
        <div style="margin:24px 0;">
          <a href="${origin}/#updates" style="display:inline-block;padding:12px 18px;background:#38bdf8;color:#0b0b0b;text-decoration:none;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;font-size:10px;">Voir le post</a>
        </div>
        <p style="font-size:10px;color:#6b7280;letter-spacing:0.3em;text-transform:uppercase;">Islande 2026</p>
      </div>
    </div>
  `;
};

const sendNewsletterEmails = async (payload: UpdatePayload, origin: string) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { data, error } = await supabaseServer
    .from('newsletter_subscribers')
    .select('email');

  if (error || !data) return;

  const recipients = (data as NewsletterRow[])
    .map((row) => row.email)
    .filter((email): email is string => Boolean(email));

  if (recipients.length === 0) return;

  const html = buildEmailHtml(payload, origin);
  const subject = `Jour ${payload.day} — ${payload.title}`;
  const batches = chunkArray(recipients, 50);

  for (const batch of batches) {
    await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: batch,
        subject,
        html,
      }),
    });
  }
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
      Array.isArray(payload.photos) &&
      (payload.spots === undefined || Array.isArray(payload.spots)) &&
      (payload.extras === undefined ||
        (typeof payload.extras.microStory === 'string' && Array.isArray(payload.extras.highlights)))
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
    status: payload.status ?? 'published',
    location_name: payload.location.name,
    location_lat: payload.location.lat,
    location_lng: payload.location.lng,
    spots: payload.spots ?? [],
  };

  const { data, error } = await supabaseServer
    .from('travel_updates')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  if (payload.photos.length > 0) {
    const photoRows: PhotoRow[] = payload.photos.map((url) => ({
      update_id: data.id,
      url,
    }));

    const { error: photosError } = await supabaseServer
      .from('travel_update_photos')
      .insert(photoRows);

    if (photosError) {
      return new NextResponse(photosError.message, { status: 500 });
    }
  }

  if (payload.extras) {
    const { error: extrasError } = await supabaseServer
      .from('travel_update_extras')
      .upsert({
        update_id: data.id,
        micro_story: payload.extras.microStory,
        highlights: payload.extras.highlights,
      });

    if (extrasError) {
      return new NextResponse(extrasError.message, { status: 500 });
    }
  }

  if (row.status === 'published') {
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
    try {
      await sendNewsletterEmails(payload, origin);
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  }

  return NextResponse.json({ id: data.id });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }

  const payload = (await request.json()) as UpdatePayload;

  if (!isValidUpdatePayload(payload)) {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const row: UpdateRow = {
    date: payload.date,
    day: payload.day,
    title: payload.title,
    description: payload.description,
    status: payload.status ?? 'published',
    location_name: payload.location.name,
    location_lat: payload.location.lat,
    location_lng: payload.location.lng,
    spots: payload.spots ?? [],
  };

  const { error: updateError } = await supabaseServer
    .from('travel_updates')
    .update(row)
    .eq('id', id);

  if (updateError) {
    return new NextResponse(updateError.message, { status: 500 });
  }

  await supabaseServer.from('travel_update_photos').delete().eq('update_id', id);

  if (payload.photos.length > 0) {
    const photoRows: PhotoRow[] = payload.photos.map((url) => ({
      update_id: id,
      url,
    }));

    const { error: photosError } = await supabaseServer
      .from('travel_update_photos')
      .insert(photoRows);

    if (photosError) {
      return new NextResponse(photosError.message, { status: 500 });
    }
  }

  if (payload.extras) {
    const { error: extrasError } = await supabaseServer
      .from('travel_update_extras')
      .upsert({
        update_id: id,
        micro_story: payload.extras.microStory,
        highlights: payload.extras.highlights,
      });

    if (extrasError) {
      return new NextResponse(extrasError.message, { status: 500 });
    }
  }

  return NextResponse.json({ id });
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

  await supabaseServer.from('travel_update_photos').delete().eq('update_id', id);
  await supabaseServer.from('travel_update_extras').delete().eq('update_id', id);

  return new NextResponse(null, { status: 204 });
}
