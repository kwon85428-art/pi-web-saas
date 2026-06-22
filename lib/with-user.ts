/**
 * API route wrapper for multi-user session isolation.
 * Each API route that needs pi agent sessions calls `withUser()` at the top.
 */

import { headers } from 'next/headers';
import { setUserAgentDir } from './workspace';

export interface AuthContext {
  userId: number;
  email: string | null;
  role: string;
  dataDir: string;
}

export async function withUser(): Promise<AuthContext> {
  const h = await headers();
  const userIdStr = h.get('x-pi-user-id');
  if (!userIdStr) throw new Error('Unauthorized');

  const userId = parseInt(userIdStr, 10);
  const email = h.get('x-pi-user-email') || null;
  const role = h.get('x-pi-user-role') || 'user';

  const dataDir = setUserAgentDir(userId);
  return { userId, email, role, dataDir };
}
