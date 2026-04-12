/**
 * DRESS CODE - Admin Security Configuration
 * 
 * SECURITY FEATURES:
 * - SHA-256 password hashing (stored as hash, not plain text)
 * - Session timeout (30 minutes)
 * - Brute-force protection (lockout after 5 failed attempts)
 * - Activity logging
 * 
 * HOW TO CHANGE PASSWORD:
 * 1. Go to https://emn178.github.io/online-tools/sha256.html
 * 2. Enter your new password
 * 3. Copy the SHA-256 hash (64 characters)
 * 4. Replace the ADMIN_PASSWORD_HASH below
 */

export const ADMIN_CONFIG = {
  // Default password: "DressCode2026!" 
  // SHA-256 hash of the password (change this to your own!)
  ADMIN_PASSWORD_HASH: '4c7d274e649cb30b853868b5b4819a0f8f97ab30df06ac9083ac63b6d24817fe',
  
  // Session timeout in minutes (30 minutes)
  SESSION_TIMEOUT: 30,
  
  // Max login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Lockout duration in minutes (15 minutes)
  LOCKOUT_DURATION: 15,
  
  // Admin email (for future password reset)
  ADMIN_EMAIL: 'admin@dresscode.com',
};

/**
 * Generate SHA-256 hash from password
 * Use this to create your own password hash
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Security utilities
 */
export const SecurityUtils = {
  // Check if session is expired
  isSessionExpired: (): boolean => {
    const sessionStart = localStorage.getItem('adminSessionStart');
    if (!sessionStart) return true;
    
    const elapsed = (Date.now() - parseInt(sessionStart)) / (1000 * 60);
    return elapsed > ADMIN_CONFIG.SESSION_TIMEOUT;
  },
  
  // Check if account is locked
  isAccountLocked: (): boolean => {
    const lockoutEnd = localStorage.getItem('adminLockoutEnd');
    if (!lockoutEnd) return false;
    return Date.now() < parseInt(lockoutEnd);
  },
  
  // Get remaining lockout time in minutes
  getLockoutTimeRemaining: (): number => {
    const lockoutEnd = localStorage.getItem('adminLockoutEnd');
    if (!lockoutEnd) return 0;
    const remaining = (parseInt(lockoutEnd) - Date.now()) / (1000 * 60);
    return Math.max(0, Math.ceil(remaining));
  },
  
  // Record failed login attempt
  recordFailedAttempt: () => {
    let attempts = parseInt(localStorage.getItem('adminLoginAttempts') || '0');
    attempts++;
    localStorage.setItem('adminLoginAttempts', attempts.toString());
    
    // Lock account if max attempts reached
    if (attempts >= ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockoutEnd = Date.now() + (ADMIN_CONFIG.LOCKOUT_DURATION * 60 * 1000);
      localStorage.setItem('adminLockoutEnd', lockoutEnd.toString());
      localStorage.removeItem('adminLoginAttempts');
    }
  },
  
  // Reset failed attempts on successful login
  resetFailedAttempts: () => {
    localStorage.removeItem('adminLoginAttempts');
    localStorage.removeItem('adminLockoutEnd');
  },
  
  // Log admin activity
  logActivity: (action: string, details?: string) => {
    const logs = JSON.parse(localStorage.getItem('adminActivityLogs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
    });
    // Keep only last 100 logs
    localStorage.setItem('adminActivityLogs', JSON.stringify(logs.slice(-100)));
  },
};
