import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'oil-web-default');

const DEFAULT_CONFIG = {
  wechat_enabled: true,
  alipay_enabled: true,
  pro_price: 69,
  pro_price_cny: 69,
};

export async function GET() {
  const row = db.prepare("SELECT value FROM settings WHERE key='payment_config'").get() as any;
  const config = row ? JSON.parse(row.value) : DEFAULT_CONFIG;
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  // Admin only
  const c = await cookies();
  const t = c.get('oil-web-token')?.value;
  if (!t) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const { payload } = await jwtVerify(t, JWT_SECRET);
    const user = db.prepare('SELECT role FROM users WHERE id=?').get(payload.userId) as any;
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await req.json();
  const existing = db.prepare("SELECT id FROM settings WHERE key='payment_config'").get() as any;
  
  if (existing) {
    db.prepare("UPDATE settings SET value=? WHERE key='payment_config'").run(JSON.stringify(body));
  } else {
    // Create settings table if not exists
    db.exec(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
    db.prepare("INSERT INTO settings (key, value) VALUES ('payment_config', ?)").run(JSON.stringify(body));
  }

  return NextResponse.json({ success: true });
}
