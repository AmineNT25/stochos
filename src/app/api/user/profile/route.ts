import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, currentPassword, newPassword } = await req.json();

  if (name !== undefined) {
    if (!name.trim()) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    await sql`UPDATE users SET name = ${name.trim()} WHERE id = ${session.user.id}`;
  }

  if (newPassword !== undefined) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const rows = await sql`SELECT password_hash FROM users WHERE id = ${session.user.id}`;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password_hash as string);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    const hash = await bcrypt.hash(newPassword, 12);
    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${session.user.id}`;
  }

  return NextResponse.json({ success: true });
}
