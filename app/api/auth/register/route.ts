import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createToken, setAuthCookie, createSession } from '@/lib/auth';
import { getUserDataDir } from '@/lib/workspace';

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 });
    }

    // Check if email already exists (before password check for better UX)
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 409 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 个字符' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
    ).run(email.toLowerCase(), passwordHash, nickname || email.split('@')[0]);

    const userId = result.lastInsertRowid as number;

    // Create subscription (free tier by default)
    db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?, ?, ?)').run(userId, 'inactive', 'free');

    // Create session
    const token = await createToken({ userId, email: email.toLowerCase(), role: 'user' });
    createSession(userId, token);
    await setAuthCookie(token);

    // Create user workspace
    getUserDataDir(userId);

    return NextResponse.json({
      user: { id: userId, email: email.toLowerCase(), nickname: nickname || email.split('@')[0], role: 'user' },
    });
  } catch (e: any) {
    console.error('Register error:', e);
    return NextResponse.json({ error: '注册失败' }, { status: 500 });
  }
}
