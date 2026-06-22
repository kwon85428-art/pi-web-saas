import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const profile = db.prepare(
      'SELECT id, email, nickname, avatar_url, role, created_at FROM users WHERE id = ?'
    ).get(user.userId) as any;

    const sub = db.prepare('SELECT status, plan FROM subscriptions WHERE user_id = ?').get(user.userId) as any;

    return NextResponse.json({
      user: {
        ...profile,
        subscription: sub || { status: 'active', plan: 'free' },
      },
    });
  } catch (e: any) {
    console.error('Get user error:', e);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}
