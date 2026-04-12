'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_CONFIG, hashPassword, SecurityUtils } from '@/lib/admin-config';
import { Lock, AlertCircle, Clock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated');
    const sessionStart = localStorage.getItem('adminSessionStart');
    
    if (auth && sessionStart) {
      const elapsed = (Date.now() - parseInt(sessionStart)) / (1000 * 60);
      if (elapsed < ADMIN_CONFIG.SESSION_TIMEOUT) {
        router.push('/admin/dashboard');
        return;
      } else {
        // Session expired
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminSessionStart');
      }
    }
    
    // Check lockout status
    updateLockoutStatus();
  }, [router]);

  // Update lockout timer every second
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(updateLockoutStatus, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const updateLockoutStatus = () => {
    if (SecurityUtils.isAccountLocked()) {
      setLockoutTime(SecurityUtils.getLockoutTimeRemaining());
      const attempts = parseInt(localStorage.getItem('adminLoginAttempts') || '0');
      setAttemptsRemaining(ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS - attempts);
    } else {
      setLockoutTime(0);
      const attempts = parseInt(localStorage.getItem('adminLoginAttempts') || '0');
      setAttemptsRemaining(Math.max(0, ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS - attempts));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check if account is locked
    if (SecurityUtils.isAccountLocked()) {
      setError(`Account locked. Try again in ${SecurityUtils.getLockoutTimeRemaining()} minutes.`);
      setIsLoading(false);
      return;
    }

    try {
      // Hash the entered password
      const hashedPassword = await hashPassword(password);
      
      // Compare with stored hash
      if (hashedPassword === ADMIN_CONFIG.ADMIN_PASSWORD_HASH) {
        // Successful login
        SecurityUtils.resetFailedAttempts();
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminSessionStart', Date.now().toString());
        SecurityUtils.logActivity('LOGIN', 'Successful admin login');
        
        router.push('/admin/dashboard');
      } else {
        // Failed login
        SecurityUtils.recordFailedAttempt();
        SecurityUtils.logActivity('LOGIN_FAILED', 'Incorrect password attempt');
        
        if (SecurityUtils.isAccountLocked()) {
          setError(`Account locked due to too many failed attempts. Try again in ${ADMIN_CONFIG.LOCKOUT_DURATION} minutes.`);
          updateLockoutStatus();
        } else {
          const remaining = ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS - parseInt(localStorage.getItem('adminLoginAttempts') || '0');
          setError(`Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
          setAttemptsRemaining(remaining);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-charcoal-900 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-pearl-50" />
          </div>
          <h1 className="font-display text-3xl text-pearl-50 mb-2">Admin Portal</h1>
          <p className="text-neutral-400 text-sm">DRESS CODE Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-charcoal-900 rounded-2xl p-8 border border-charcoal-800">
          {/* Security Notice */}
          <div className="flex items-start gap-3 bg-charcoal-800/50 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-neutral-300 font-medium mb-1">Secure Access Only</p>
              <p className="text-neutral-500">This area is restricted to authorized personnel. All login attempts are logged.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-charcoal-950 border border-charcoal-700 rounded-lg text-pearl-50 placeholder:text-neutral-600 focus:outline-none focus:border-pearl-50 transition-colors"
                placeholder="Enter your password"
                autoFocus
                disabled={lockoutTime > 0 || isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${
                lockoutTime > 0 ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
              }`}>
                {lockoutTime > 0 ? (
                  <Clock className="w-5 h-5 text-red-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                )}
                <p className={lockoutTime > 0 ? 'text-red-400 text-sm' : 'text-amber-400 text-sm'}>
                  {error}
                </p>
              </div>
            )}

            {/* Attempts Remaining */}
            {attemptsRemaining < ADMIN_CONFIG.MAX_LOGIN_ATTEMPTS && attemptsRemaining > 0 && lockoutTime === 0 && (
              <p className="text-xs text-neutral-500 text-center">
                {attemptsRemaining} login attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before account lockout
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutTime > 0}
              className="w-full bg-pearl-50 text-charcoal-900 py-3 rounded-lg font-medium hover:bg-pearl-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Session Info */}
          <div className="mt-6 pt-6 border-t border-charcoal-800">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Session timeout: {ADMIN_CONFIG.SESSION_TIMEOUT} minutes</span>
              <span>SHA-256 Encrypted</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-600">
            Default password: <code className="bg-charcoal-900 px-2 py-1 rounded text-neutral-400">DressCode2026!</code>
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            Change password in lib/admin-config.ts
          </p>
        </div>
      </div>
    </div>
  );
}
