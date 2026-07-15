// Admin authentication session store.
//
// Durable + serverless-safe: when Supabase is configured, sessions live in the
// `admin_sessions` table (written/read via the service-role key only), so a
// login survives across Vercel lambda instances and cold starts. When Supabase
// is NOT configured (local dev), it falls back to an in-memory Map pinned to
// globalThis so all route bundles in one process share it.
//
// The public API is async (createSession/getSession/deleteSession) because the
// Supabase path does I/O. It is only ever called from Node route handlers
// (never Edge middleware), so async DB access here is fine.

import { randomUUID } from 'crypto';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export interface AdminSession {
  createdAt: number;
  email?: string;
}

// Session timeout: 30 minutes.
export const SESSION_TTL = 30 * 60 * 1000;

const g = globalThis as any;
const memSessions: Map<string, AdminSession> =
  g.__sneakerAirAdminSessions ?? (g.__sneakerAirAdminSessions = new Map());

// In-memory (dev) cleanup sweeper — registered once per process.
if (!g.__sneakerAirSessionSweeper) {
  g.__sneakerAirSessionSweeper = setInterval(() => {
    const now = Date.now();
    for (const [token, s] of memSessions.entries()) {
      if (now - s.createdAt > SESSION_TTL) memSessions.delete(token);
    }
  }, 5 * 60 * 1000);
}

/** Cryptographically secure session token. */
export function generateSessionToken(): string {
  return randomUUID();
}

/** Persist a new admin session. */
export async function createSession(token: string, data?: { email?: string }): Promise<void> {
  if (isSupabaseConfigured()) {
    const now = Date.now();
    await supabaseAdmin.from('admin_sessions').insert([
      {
        token,
        email: data?.email ?? null,
        created_at: new Date(now).toISOString(),
        expires_at: new Date(now + SESSION_TTL).toISOString(),
      },
    ]);
    return;
  }
  memSessions.set(token, { createdAt: Date.now(), email: data?.email });
}

/** Return the session if it exists and has not expired, else null. */
export async function getSession(token: string): Promise<AdminSession | null> {
  if (!token) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabaseAdmin
      .from('admin_sessions')
      .select('created_at, expires_at, email')
      .eq('token', token)
      .single();
    if (error || !data) return null;
    if (new Date(data.expires_at).getTime() < Date.now()) {
      // Expired — best-effort cleanup, then treat as invalid.
      await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
      return null;
    }
    return { createdAt: new Date(data.created_at).getTime(), email: data.email ?? undefined };
  }

  const s = memSessions.get(token);
  if (!s) return null;
  if (Date.now() - s.createdAt > SESSION_TTL) {
    memSessions.delete(token);
    return null;
  }
  return s;
}

/** Revoke a session (logout). */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  if (isSupabaseConfigured()) {
    await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
    return;
  }
  memSessions.delete(token);
}
