import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import fs from 'fs';
import path from 'path';
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

function countSessions(): Record<number, number> {
  const base = process.env.OIL_WEB_USERS_DIR || path.join(process.env.HOME || '/root', '.oil-web', 'users');
  const counts: Record<number, number> = {};
  try {
    for (const uid of fs.readdirSync(base)) {
      const sessionsDir = path.join(base, uid, 'sessions');
      if (!fs.existsSync(sessionsDir)) continue;
      let n = 0;
      for (const dir of fs.readdirSync(sessionsDir)) {
        const d = path.join(sessionsDir, dir);
        if (fs.statSync(d).isDirectory()) {
          n += fs.readdirSync(d).filter(f => f.endsWith('.jsonl')).length;
        }
      }
      counts[parseInt(uid)] = n;
    }
  } catch {}
  return counts;
}

function countMessages(): Record<number, number> {
  const base = process.env.OIL_WEB_USERS_DIR || path.join(process.env.HOME || '/root', '.oil-web', 'users');
  const counts: Record<number, number> = {};
  try {
    for (const uid of fs.readdirSync(base)) {
      const sessionsDir = path.join(base, uid, 'sessions');
      if (!fs.existsSync(sessionsDir)) continue;
      let total = 0;
      for (const dir of fs.readdirSync(sessionsDir)) {
        const d = path.join(sessionsDir, dir);
        if (!fs.statSync(d).isDirectory()) continue;
        for (const f of fs.readdirSync(d)) {
          if (!f.endsWith('.jsonl')) continue;
          try {
            const content = fs.readFileSync(path.join(d, f), 'utf8');
            total += content.split('\n').filter(l => l.includes('"role":"user"')).length;
          } catch {}
        }
      }
      counts[parseInt(uid)] = total;
    }
  } catch {}
  return counts;
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const users = db.prepare('SELECT id, email, nickname, created_at FROM users ORDER BY id').all() as any[];
  const sessionCounts = countSessions();
  const totalSessions = Object.values(sessionCounts).reduce((a, b) => a + b, 0);

  // Daily registrations (last 7 days)
  const dailyReg = db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as count
    FROM users
    WHERE created_at >= date('now', '-7 days')
    GROUP BY day ORDER BY day
  `).all() as any[];

  // Subscription breakdown
  const subBreakdown = db.prepare(`
    SELECT plan, status, COUNT(*) as count
    FROM subscriptions GROUP BY plan, status
  `).all() as any[];

  // User list with session counts
  const userList = users.map(u => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    created_at: u.created_at,
    sessions: sessionCounts[u.id] || 0,
  }));

  return NextResponse.json({
    totalUsers: users.length,
    totalSessions,
    dailyRegistrations: dailyReg,
    subscriptionBreakdown: subBreakdown,
    users: userList,
  });
}
