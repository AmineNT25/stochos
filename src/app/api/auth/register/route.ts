import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${hash}, 'user')
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[register]', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: process.env.NODE_ENV === 'development' ? msg : 'Something went wrong' }, { status: 500 });
  }
}
