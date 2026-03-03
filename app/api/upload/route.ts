import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let supabaseServer;
  try {
    supabaseServer = getSupabaseServerClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Supabase server environment variables.';
    return new NextResponse(message, { status: 500 });
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!bucket) {
    return new NextResponse('Missing SUPABASE_STORAGE_BUCKET', { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const pathPrefix = String(formData.get('pathPrefix') || 'uploads');

  if (!file || !(file instanceof File)) {
    return new NextResponse('Missing file', { status: 400 });
  }

  const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `${pathPrefix}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(filePath, Buffer.from(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  const { data } = supabaseServer.storage.from(bucket).getPublicUrl(filePath);
  return NextResponse.json({ url: data.publicUrl, path: filePath });
}
