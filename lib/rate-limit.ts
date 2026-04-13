/**
 * Rate limiting utility for API routes and admin login
 * Uses in-memory Map (sufficient for single-server Vercel deployment)
 * For distributed systems, use Redis or Supabase-backed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitOptions {
  maxRequests: number;   // Max requests allowed
  windowMs: number;      // Time window in milliseconds
  blockMs?: number;      // Block duration after exceeding limit (optional)
}

// Default: 5 attempts per 15 minutes (for login)
export const LOGIN_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,     // 15 minutes
  blockMs: 15 * 60 * 1000,      // Block for 15 minutes
};

// Default: 20 requests per minute (for API routes)
export const API_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 20,
  windowMs: 60 * 1000,          // 1 minute
};

/**
 * Check if a request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or window expired, reset
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { allowed: true, remaining: options.maxRequests - 1, resetTime: now + options.windowMs, blocked: false };
  }

  // If blocked and block period hasn't ended
  if (entry.count >= options.maxRequests) {
    const blockEnd = entry.resetTime + (options.blockMs || 0);
    if (now < blockEnd) {
      return { allowed: false, remaining: 0, resetTime: blockEnd, blocked: true };
    }
    // Block period ended, reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return { allowed: true, remaining: options.maxRequests - 1, resetTime: now + options.windowMs, blocked: false };
  }

  // Increment count
  entry.count += 1;
  return { allowed: true, remaining: options.maxRequests - entry.count, resetTime: entry.resetTime, blocked: false };
}

/**
 * Middleware for Next.js API routes
 * Usage:
 * export const config = { api: { bodyParser: true } };
 * 
 * export default async function handler(req, res) {
 *   const result = rateLimitMiddleware(req, res, LOGIN_RATE_LIMIT);
 *   if (!result.allowed) {
 *     return res.status(429).json({ error: 'Too many requests', retryAfter: result.resetTime });
 *   }
 *   // ... rest of handler
 * }
 */
export function rateLimitMiddleware(
  req: any,
  res: any,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number; blocked: boolean } {
  // Use IP address as identifier
  const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  const result = checkRateLimit(identifier as string, options);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', options.maxRequests);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.resetTime);

  if (result.blocked) {
    res.setHeader('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
  }

  return result;
}

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits() {
  rateLimitStore.clear();
}
