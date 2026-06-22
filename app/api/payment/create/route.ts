import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import crypto from 'crypto';
import db from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'oil-web-default');

interface PaymentConfig {
  wechat_enabled: boolean;
  alipay_enabled: boolean;
  pro_price: number;
  pro_price_cny: number;
}

function getConfig(): PaymentConfig {
  const row = db.prepare("SELECT value FROM settings WHERE key='payment_config'").get() as any;
  if (row) return JSON.parse(row.value);
  return { wechat_enabled: true, alipay_enabled: true, pro_price: 9.9, pro_price_cny: 69 };
}

export async function POST(req: NextRequest) {
  // Auth
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

  const cfg = getConfig();
  const amount = plan === 'pro' ? cfg.pro_price_cny : cfg.pro_price_cny;
  const planName = plan === 'pro' ? 'pro' : 'pro';

  if (process.env.NODE_ENV === 'development' || !process.env.WECHAT_MCH_ID) {
    // Mock mode: simulate payment
    const orderId = `OIL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    db.prepare(`INSERT INTO payments (user_id, amount, currency, method, status, plan, external_id) VALUES (?,?,?,?,?,?,?)`)
      .run(userId, amount, 'CNY', method, 'pending', planName, orderId);

    return NextResponse.json({
      orderId,
      amount: amount / 100,
      method,
      plan: planName,
      qrcode: null,
      mockUrl: `/api/payment/notify?orderId=${orderId}&mockPay=1`,
    });
  }

  // Real payment: generate order via WeChat/Alipay API
  const orderId = `OIL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  db.prepare(`INSERT INTO payments (user_id, amount, currency, method, status, plan, external_id) VALUES (?,?,?,?,?,?,?)`)
    .run(userId, amount, 'CNY', method, 'pending', planName, orderId);

  if (method === 'wechat') {
    // WeChat Native Pay - generate QR code URL
    const wxOrder = await createWechatOrder(orderId, amount, planName);
    return NextResponse.json({ orderId, amount: amount / 100, method, plan: planName, qrcode: wxOrder.code_url, mockUrl: null });
  } else {
    // Alipay - generate payment URL
    const aliOrder = await createAlipayOrder(orderId, amount, planName);
    return NextResponse.json({ orderId, amount: amount / 100, method, plan: planName, qrcode: aliOrder.qr_code, mockUrl: null });
  }
}

async function createWechatOrder(orderId: string, amount: number, desc: string) {
  // TODO: Replace with real WeChat Pay API call
  // https://pay.weixin.qq.com/docs/merchant/apis/native-payment/direct-jsons/native-prepay.html
  const response = await fetch('https://api.mch.weixin.qq.com/v3/pay/transactions/native', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `WECHATPAY2-SHA256-RSA2048 ${await wechatSign()}` },
    body: JSON.stringify({
      appid: process.env.WECHAT_APP_ID,
      mchid: process.env.WECHAT_MCH_ID,
      description: `Oil Web ${desc} 订阅`,
      out_trade_no: orderId,
      notify_url: `${process.env.OIL_WEB_URL}/api/payment/notify`,
      amount: { total: amount, currency: 'CNY' },
    }),
  });
  return response.json();
}

async function createAlipayOrder(orderId: string, amount: number, desc: string) {
  // TODO: Replace with real Alipay API call
  // https://opendocs.alipay.com/apis/api_1/alipay.trade.precreate
  return { qr_code: `alipay://pay?out_trade_no=${orderId}&total_amount=${(amount/100).toFixed(2)}&subject=Oil+Web+${desc}` };
}

async function wechatSign(): Promise<string> {
  // TODO: Real WeChat Pay API v3 signature
  return 'WECHATPAY2-SHA256-RSA2048 mock-signature';
}
