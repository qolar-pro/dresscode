/**
 * Trusted-device gate for the admin area.
 *
 * Even with the secret URL + password, the admin area is only reachable from
 * devices that have been explicitly enrolled. Enrollment sets an httpOnly,
 * 1-year signed cookie; middleware refuses (fake 404) any request to the admin
 * slug or /api/admin/* that lacks a valid device cookie.
 *
 * This locks admin to the owner's specific laptop / phone / store PC regardless
 * of their IP (phones on cellular have rotating IPs, so an IP allowlist alone
 * can't do this). The IP allowlist remains available as an optional 2nd layer.
 *
 * Config (env):
 *   ADMIN_DEVICE_SECRET  — one-time enrollment passphrase (used in the enroll URL)
 *   ADMIN_DEVICE_TOKEN   — high-entropy value stored in the device cookie
 * If either is unset the gate is DISABLED (local-dev convenience).
 *
 * Pure JS only (no Node APIs) so it runs in both the Edge middleware and Node
 * route handlers.
 */
export const ADMIN_DEVICE_COOKIE = 'sa_device';

export function deviceGateEnabled(): boolean {
  const token = process.env.ADMIN_DEVICE_TOKEN;
  const secret = process.env.ADMIN_DEVICE_SECRET;
  return !!token && token.trim() !== '' && !!secret && secret.trim() !== '';
}

/** Length-independent, constant-time-ish string comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

/** True if the request's device cookie matches the enrolled token. */
export function deviceCookieValid(cookieValue: string | undefined | null): boolean {
  if (!deviceGateEnabled()) {
    // Gate not configured. FAIL CLOSED in production (incl. Vercel Preview,
    // where NODE_ENV is 'production') so a missing/mis-scoped env var can never
    // silently expose the admin area — it just becomes unreachable until the
    // vars are set. Only local dev (NODE_ENV !== 'production') is allowed open.
    return process.env.NODE_ENV !== 'production';
  }
  const expected = process.env.ADMIN_DEVICE_TOKEN as string;
  if (!cookieValue) return false;
  return timingSafeEqual(cookieValue, expected);
}
