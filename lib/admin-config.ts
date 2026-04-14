/**
 * DRESS CODE - Admin Security Configuration
 *
 * IMPORTANT: This file no longer stores credentials.
 * All authentication uses bcrypt + HttpOnly cookies via /api/admin/login.
 *
 * PASSWORD MANAGEMENT:
 * 1. Set ADMIN_PASSWORD_HASH in your .env.local file (bcrypt hash)
 * 2. To generate a bcrypt hash:
 *    - npm install bcrypt
 *    - Run: node -e "const bcrypt=require('bcrypt'); bcrypt.hash('YourPassword', 12).then(h => console.log(h))"
 *
 * SESSION CONFIGURATION:
 * - Sessions stored in-memory (Map). For production, use Redis or database.
 * - Session TTL: 30 minutes (configurable in lib/admin-sessions.ts)
 * - Rate limiting: 5 attempts per 15 min window, then 15 min lockout
 */

export const ADMIN_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  SESSION_TTL: 30 * 60 * 1000,

  // Rate limit window in milliseconds (15 minutes)
  RATE_LIMIT_WINDOW: 15 * 60 * 1000,

  // Max login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,

  // Lockout duration in milliseconds (15 minutes)
  LOCKOUT_DURATION: 15 * 60 * 1000,

  // Admin email for notifications
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@dresscode.com',
};
