import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'oil-web-default-secret-change-in-production'
);

async function requireAdmin() {
  const c = await cookies();
  const t = c.get('oil-web-token')?.value;
  if (!t) throw new Error('Forbidden');
  const { payload } = await jwtVerify(t, JWT_SECRET);
  const u = db.prepare('SELECT role FROM users WHERE id=?').get(payload.userId) as any;
  if (!u || u.role !== 'admin') throw new Error('Forbidden');
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const payments = db.prepare(`
    SELECT p.*, u.email, u.nickname
    FROM payments p LEFT JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 100
  `).all();

  const stats = {
    total: db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE status='paid'").get() as any,
    pending: db.prepare("SELECT COUNT(*) as c FROM payments WHERE status='pending'").get() as any,
    paid: db.prepare("SELECT COUNT(*) as c FROM payments WHERE status='paid'").get() as any,
    thisMonth: db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM payments WHERE status='paid' AND created_at >= date('now','start of month')").get() as any,
  };

  return NextResponse.json({ payments, stats });
}
