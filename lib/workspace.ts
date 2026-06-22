/**
 * User workspace isolation helpers.
 * Each user gets their own pi-agent session directory.
 */

import fs from 'fs';
import path from 'path';

const HOME = process.env.HOME || '/root';
const USERS_BASE = process.env.PI_WEB_USERS_DIR || path.join(HOME, '.pi-web', 'users');

export function ensureUserWorkspace(userId: number): string {
  const userDir = path.join(USERS_BASE, String(userId));
  const sessionsDir = path.join(userDir, 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });

  // Create a minimal settings.json if it doesn't exist
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
 * Override PI_CODING_AGENT_DIR for the current request context.
 * Call this at the beginning of each API route that needs user isolation.
 */
export function setUserAgentDir(userId: number): string {
  const dir = getUserDataDir(userId);
  process.env.PI_CODING_AGENT_DIR = dir;
  return dir;
}
