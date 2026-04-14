// Session store for admin authentication
// In production, use Redis or a database instead of in-memory Map

import { randomUUID } from 'crypto';

export interface AdminSession {
  createdAt: number;
  adminId?: string;
  email?: string;
}

export const sessions = new Map<string, AdminSession>();

// Session timeout: 30 minutes
export const SESSION_TTL = 30 * 60 * 1000;

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return randomUUID();
}

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);
