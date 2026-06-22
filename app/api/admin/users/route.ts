import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oil-web-default-secret-change-in-production'
);

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('oil-web-token')?.value;
  if (!token) throw new Error('Forbidden');
  const { payload } = await jwtVerify(token, JWT_SECRET);
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(payload.userId) as any;
  if (!user || user.role !== 'admin') throw new Error('Forbidden');
  return payload.userId as number;
}

export async function GET() {
  try { await requireAdmin(); }
  catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const users = db.prepare(`
    SELECT u.id, u.email, u.nickname, u.role, u.created_at,
           s.status as sub_status, s.plan as sub_plan
    FROM users u LEFT JOIN subscriptions s ON u.id = s.user_id
    ORDER BY u.id DESC
  `).all();

  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get() as any;
  const activeSubs = db.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status='active'").get() as any;

  return NextResponse.json({ users, stats: { totalUsers: totalUsers.c, activeSubs: activeSubs.c } });
}
