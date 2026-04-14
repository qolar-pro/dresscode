'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminEmergency() {
  const [masterPassword, setMasterPassword] = useState('');
  const [newIPs, setNewIPs] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmergencyLogin = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin-emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Emergency access granted! Redirecting...');
        const slug = data.secretUrl || 'admin';
        setTimeout(() => router.push(`/${slug}/dashboard`), 1500);
      } else {
        setError(data.error || 'Invalid master password');
      }
    } catch {
      setError('Connection error. Please try again.');
    }

    setIsLoading(false);
  };

  const handleUpdateIPs = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin-emergency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterPassword, newIPs }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('IP whitelist updated successfully!');
        setNewIPs('');
      } else {
        setError(data.error || 'Failed to update IPs');
      }
    } catch {
      setError('Connection error. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-3xl text-pearl-50 mb-2">Emergency Access</h1>
          <p className="text-neutral-400 text-sm">DRESS CODE Disaster Recovery</p>
        </div>

        {/* Emergency Login Form */}
        <div className="bg-charcoal-900 rounded-2xl p-8 border border-charcoal-800 mb-6">
          <h2 className="text-lg font-medium text-pearl-50 mb-4">Emergency Admin Login</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">
                Master Password
              </label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-charcoal-950 border border-charcoal-700 rounded-lg text-pearl-50 placeholder:text-neutral-600 focus:outline-none focus:border-pearl-50 transition-colors"
                placeholder="Enter master password"
                autoFocus
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleEmergencyLogin}
              disabled={isLoading || !masterPassword}
              className="w-full bg-red-500/20 text-red-400 py-3 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Emergency Sign In
                </>
              )}
            </button>
          </div>
        </div>

        {/* Update IP Whitelist Form */}
        <div className="bg-charcoal-900 rounded-2xl p-8 border border-charcoal-800">
          <h2 className="text-lg font-medium text-pearl-50 mb-4">Update IP Whitelist</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">
                New IPs (comma-separated)
              </label>
              <input
                type="text"
                value={newIPs}
                onChange={(e) => {
                  setNewIPs(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-charcoal-950 border border-charcoal-700 rounded-lg text-pearl-50 placeholder:text-neutral-600 focus:outline-none focus:border-pearl-50 transition-colors"
                placeholder="123.456.78.90,987.65.43.21"
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-500 mt-2">
                These IPs will be appended to the existing whitelist
              </p>
            </div>

            <button
              onClick={handleUpdateIPs}
              disabled={isLoading || !masterPassword || !newIPs}
              className="w-full bg-pearl-50 text-charcoal-900 py-3 rounded-lg font-medium hover:bg-pearl-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update IP Whitelist'
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mt-6">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mt-6">
            <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            ⚠️ This route is protected by IP whitelisting. Only whitelisted IPs can access this page.
          </p>
        </div>
      </div>
    </div>
  );
}
