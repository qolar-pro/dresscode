/**
 * Sneaker Air - IP Whitelist Utilities
 *
 * Used by middleware.ts and admin API routes to restrict access
 * to only whitelisted IP addresses.
 */

/**
 * Extract the real client IP from the request.
 *
 * SECURITY NOTE: `x-forwarded-for` is client-settable and therefore spoofable
 * unless a trusted proxy is guaranteed to overwrite it. On Vercel the platform
 * sets a trustworthy `x-real-ip` (and prepends the real client to XFF), so we
 * prefer `x-real-ip` first. Do not rely on this value for anything security
 * critical without a trusted reverse proxy in front.
 */
export function getClientIP(request: Request): string {
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return normalizeIP(realIP.trim());
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be comma-separated list; first entry is the client
    return normalizeIP(forwarded.split(',')[0].trim());
  }

  // Fallback: use the socket remote address (Node.js runtime)
  // In edge runtime this won't be available, so default to 'unknown'
  return 'unknown';
}

/**
 * Normalize an IP string for comparison.
 * Handles IPv4, IPv6 localhost, and stripping port numbers.
 */
export function normalizeIP(ip: string): string {
  // Strip port if present (e.g. "::1:12345" → "::1")
  let cleaned = ip;

  // Handle IPv4-mapped IPv6 (::ffff:127.0.0.1 → 127.0.0.1)
  if (cleaned.startsWith('::ffff:')) {
    cleaned = cleaned.substring(7);
  }

  return cleaned.trim().toLowerCase();
}

/**
 * Parse the ADMIN_ALLOWED_IPS env var into an array of normalized IPs.
 */
export function parseWhitelist(env: string | undefined): string[] {
  if (!env || env.trim() === '') return [];

  return env
    .split(',')
    .map((ip) => normalizeIP(ip.trim()))
    .filter((ip) => ip !== '');
}

/**
 * Check if an IP is allowed based on the whitelist.
 * Returns true if the IP is in the whitelist, or if whitelist is empty
 * (empty whitelist = allow all, useful for local dev).
 */
export function isIPAllowed(ip: string, whitelistEnv: string | undefined): boolean {
  const whitelist = parseWhitelist(whitelistEnv);

  // Empty whitelist => allow all (local dev convenience). Set ADMIN_ALLOWED_IPS
  // in production to actually restrict admin access to known IPs.
  if (whitelist.length === 0) return true;

  return whitelist.includes(normalizeIP(ip));
}
