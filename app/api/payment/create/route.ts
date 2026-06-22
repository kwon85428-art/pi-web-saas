import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import crypto from 'crypto';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'oil-web-default');

const PLANS: Record<string, { price: number; name: string; desc: string }> = {
  go:    { price: 69,  name: 'Go',   desc: '基础版 · 30次/月' },
  plus:  { price: 139, name: 'Plus', desc: '标准版 · 200次/月' },
  pro:   { price: 199, name: 'Pro',  desc: '专业版 · 不限次数' },
};

export async function POST(req: NextRequest) {
  const c = await cookies();
  const t = c.get('oil-web-token')?.value;
  if (!t) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  let userId: number;
  try { const { payload } = await jwtVerify(t, JWT_SECRET); userId = payload.userId as number; }
  catch { return NextResponse.json({ error: '登录已过期' }, { status: 401 }); }

  const { method, plan } = await req.json();
  if (!['wechat', 'alipay'].includes(method)) {
    return NextResponse.json({ error: '不支持的支付方式' }, { status: 400 });
  }

  const p = PLANS[plan] || PLANS['go'];
  const orderId = `OIL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  
  db.prepare(`INSERT INTO payments (user_id, amount, currency, method, status, plan, external_id) VALUES (?,?,?,?,?,?,?)`)
    .run(userId, p.price, 'CNY', method, 'pending', plan, orderId);

  // Mock mode for development
  if (!process.env.WECHAT_MCH_ID) {
    return NextResponse.json({
      orderId, amount: p.price, plan: plan || 'go', planName: p.name,
      method, qrcode: null,
      mockUrl: `/api/payment/notify?orderId=${orderId}&mockPay=1`,
    });
  }

  // Real payment integration placeholder
  return NextResponse.json({ orderId, amount: p.price, plan, planName: p.name, method, qrcode: null });
}

// GET - list available plans
export async function GET() {
  return NextResponse.json({
    plans: Object.entries(PLANS).map(([key, val]) => ({ id: key, ...val })),
  });
}
