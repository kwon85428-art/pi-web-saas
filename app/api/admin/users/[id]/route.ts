import { NextRequest, NextResponse } from 'next/server';
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
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const { id } = await params;
  const body = await req.json();
  const { role, subStatus, subPlan } = body;

  if (role) db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);

  if (subStatus || subPlan) {
    const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(id);
    if (existing) {
      if (subStatus) db.prepare('UPDATE subscriptions SET status = ? WHERE user_id = ?').run(subStatus, id);
      if (subPlan) db.prepare('UPDATE subscriptions SET plan = ? WHERE user_id = ?').run(subPlan, id);
    } else {
      db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?,?,?)').run(id, subStatus || 'active', subPlan || 'free');
    }
  }
  return NextResponse.json({ success: true });
}
