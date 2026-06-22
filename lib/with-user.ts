/**
 * API route wrapper for multi-user session isolation.
 * 
 * Each API route that reads/writes pi agent sessions must call
 * `withUserIsolation(req)` at the top to set the user's data directory.
 */

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { setUserAgentDir } from './workspace';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pi-web-default-secret-change-in-production'
);

export interface AuthContext {
  userId: number;
  email: string | null;
  role: string;
  dataDir: string;
}

/**
 * Extract user from request cookie, set PI_CODING_AGENT_DIR, return context.
 * Throws if not authenticated.
 */
export async function withUserIsolation(req: NextRequest): Promise<AuthContext> {
  const token = req.cookies.get('pi-web-token')?.value;
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as number;
    const email = payload.email as string | null;
    const role = payload.role as string;

    const dataDir = setUserAgentDir(userId);

    return { userId, email, role, dataDir };
  } catch {
    throw new Error('Unauthorized');
  }
}
