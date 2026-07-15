// Session store for admin authentication.
//
// In production, use Redis or a database instead of in-memory Map (documented
// limitation on serverless — sessions don't survive across lambdas/restarts).
//
// The Map is pinned to `globalThis` so that every API route bundle shares ONE
// instance. In Next.js dev each route can be compiled separately, and a plain
// module-level Map is not a reliable singleton across those bundles — which
// caused login to succeed but verify/orders to intermittently 401 ("Invalid
// session"). globalThis is process-wide and dedupes them.

import { randomUUID } from 'crypto';

export interface AdminSession {
  createdAt: number;
  adminId?: string;
  email?: string;
}

const g = globalThis as any;

export const sessions: Map<string, AdminSession> =
  g.__sneakerAirAdminSessions ?? (g.__sneakerAirAdminSessions = new Map());

// Session timeout: 30 minutes
export const SESSION_TTL = 30 * 60 * 1000;

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return randomUUID();
}

// Clean up expired sessions every 5 minutes (guard so we register the timer
// only once per process, not once per module re-evaluation).
if (!g.__sneakerAirSessionSweeper) {
  g.__sneakerAirSessionSweeper = setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions.entries()) {
      if (now - session.createdAt > SESSION_TTL) {
        sessions.delete(token);
      }
    }
  }, 5 * 60 * 1000);
}
