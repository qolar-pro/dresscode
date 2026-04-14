/**
 * DRESS CODE - IP Whitelist Utilities
 *
 * Used by middleware.ts and admin API routes to restrict access
 * to only whitelisted IP addresses.
 */

/**
 * Extract the real client IP from the request.
 * Handles proxies (Vercel, Cloudflare) and fallbacks.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    // x-forwarded-for can be comma-separated list; first entry is the client
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP.trim();
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

  // Empty whitelist = allow everything (dev mode)
  if (whitelist.length === 0) return true;

  const normalized = normalizeIP(ip);

  // Always allow localhost
  if (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === 'localhost' ||
    normalized.startsWith('192.168.') ||
    normalized.startsWith('10.') ||
    normalized === 'unknown'
  ) {
    return true;
  }

  return whitelist.includes(normalized);
}
