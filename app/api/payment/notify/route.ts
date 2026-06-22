import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Payment callback - handles both WeChat Pay and Alipay notifications.
 * Also supports mock payments for testing.
 * 
 * WeChat Pay: POST with XML/JSON body
 * Alipay: POST with form data
 * Mock: GET /api/payment/notify?orderId=xxx&mockPay=1
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let orderId: string | null = null;
    let status = 'paid';
    let paidAt = new Date().toISOString();

    if (contentType.includes('application/json')) {
      const body = await req.json();
      orderId = body.out_trade_no || body.orderId;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      orderId = form.get('out_trade_no') as string;
    }

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Update payment record
    db.prepare(`UPDATE payments SET status=?, paid_at=? WHERE external_id=?`)
      .run(status, paidAt, orderId);

    // Activate subscription
    const payment = db.prepare('SELECT user_id, plan FROM payments WHERE external_id=?').get(orderId) as any;
    if (payment) {
      const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id=?').get(payment.user_id);
      if (existing) {
        db.prepare('UPDATE subscriptions SET status=?, plan=? WHERE user_id=?').run('active', payment.plan, payment.user_id);
      } else {
        db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?,?,?)').run(payment.user_id, 'active', payment.plan);
      }
    }

    return NextResponse.json({ code: 'SUCCESS', message: 'ok' });
  } catch (e: any) {
    console.error('Payment notify error:', e);
    return NextResponse.json({ code: 'FAIL', message: e.message }, { status: 500 });
  }
}

// Mock payment for testing
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const mockPay = req.nextUrl.searchParams.get('mockPay');
  
  if (!orderId || !mockPay) {
    return NextResponse.json({ error: 'Invalid mock request' }, { status: 400 });
  }

  const paidAt = new Date().toISOString();
  db.prepare(`UPDATE payments SET status='paid', paid_at=? WHERE external_id=?`).run(paidAt, orderId);

  const payment = db.prepare('SELECT user_id, plan FROM payments WHERE external_id=?').get(orderId) as any;
  if (payment) {
    const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id=?').get(payment.user_id);
    if (existing) {
      db.prepare('UPDATE subscriptions SET status=?, plan=? WHERE user_id=?').run('active', payment.plan, payment.user_id);
    } else {
      db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?,?,?)').run(payment.user_id, 'active', payment.plan);
    }
  }

  return NextResponse.json({ success: true, message: '模拟支付成功，订阅已激活' });
}
