/**
 * User workspace isolation — runs on Node.js runtime (API routes only).
 * Do NOT import this in middleware.ts (Edge Runtime incompatible).
 */

import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

const HOME = process.env.HOME || '/root';
const USERS_BASE = process.env.OIL_WEB_USERS_DIR || path.join(HOME, '.oil-web', 'users');

function ensureUserWorkspace(userId: number): string {
  const userDir = path.join(USERS_BASE, String(userId));
  const sessionsDir = path.join(userDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });

  const settingsFile = path.join(userDir, 'settings.json');
  if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify({
      defaultProvider: 'deepseek',
      defaultModel: 'deepseek-v4-flash',
    }, null, 2));
  }

  return userDir;
}

export function getUserDataDir(userId: number): string {
  return ensureUserWorkspace(userId);
}

/**
 * Set PI_CODING_AGENT_DIR for the current request based on x-pi-user-id header.
 * Call at the top of each API route that needs session isolation.
 */
export function setUserAgentDir(userId: number): string {
  const dir = getUserDataDir(userId);
  process.env.PI_CODING_AGENT_DIR = dir;
  return dir;
}

/**
 * Get current user ID from request headers (set by middleware).
 * Returns null if not authenticated.
 */
export async function getUserIdFromHeaders(): Promise<number | null> {
  try {
    const h = await headers();
    const id = h.get('x-pi-user-id');
    return id ? parseInt(id, 10) : null;
  } catch {
    return null;
  }
}
