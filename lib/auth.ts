import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import db from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pi-web-default-secret-change-in-production-' + Date.now()
);

const COOKIE_NAME = 'pi-web-token';
const JWT_EXPIRY = '7d';

export interface UserPayload {
  userId: number;
  email: string | null;
  role: string;
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(crypto.randomUUID())
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  const isSecure = process.env.NODE_ENV === 'production' && !process.env.PI_WEB_DEV;
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Store session in DB
export function createSession(userId: number, token: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();
  db.prepare('INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, token, expiresAt);
}

export function destroySession(token: string) {
  db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
}

// Check if user has active subscription
export function checkSubscription(userId: number): { active: boolean; plan: string } {
  const sub = db.prepare('SELECT status, plan FROM subscriptions WHERE user_id = ?').get(userId) as any;
  if (!sub) return { active: true, plan: 'free' }; // default: active
  return {
    active: sub.status === 'active',
    plan: sub.plan,
  };
}

// Get user workspace directory
export function getUserWorkspace(userId: number): string {
  const home = process.env.HOME || '/root';
  return `${home}/.pi-web/users/${userId}`;
}
