'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, Clock } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const router = useRouter();

  // Check if already authenticated via cookie
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      if (res.ok) {
        router.push('/admin/dashboard');
      }
    } catch {
      // Not authenticated, stay on login
    }
  };

  // Update lockout timer every second
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login - redirect
        router.push('/admin/dashboard');
      } else if (res.status === 429) {
        // Rate limited
        const retryAfter = parseInt(res.headers.get('Retry-After') || '900');
        setLockoutTime(retryAfter);
        setError(`Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`);
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
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
              <span>Session timeout: 30 minutes</span>
              <span>bcrypt Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
