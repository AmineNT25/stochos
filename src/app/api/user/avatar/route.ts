import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';

const MAX_BYTES = 200_000; // ~150 KB image → ~200 KB base64

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { image } = await req.json();

  if (!image || typeof image !== 'string') {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });
  }

  if (!image.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
  }

  if (Buffer.byteLength(image, 'utf8') > MAX_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max ~150 KB)' }, { status: 413 });
  }

  await sql`UPDATE users SET avatar = ${image} WHERE id = ${session.user.id}`;

  return NextResponse.json({ success: true });
}
