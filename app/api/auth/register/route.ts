import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { createToken, setAuthCookie, createSession } from '@/lib/auth';
import { getUserDataDir } from '@/lib/workspace';

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)'
    ).run(email.toLowerCase(), passwordHash, nickname || email.split('@')[0]);

    const userId = result.lastInsertRowid as number;

    // Create subscription (free tier by default)
    db.prepare('INSERT INTO subscriptions (user_id, status, plan) VALUES (?, ?, ?)').run(userId, 'active', 'free');

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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
