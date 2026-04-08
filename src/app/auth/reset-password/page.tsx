'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase v2 processes the hash fragment automatically on getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message || 'Failed to update password. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess('Password updated successfully! Redirecting…');
    setLoading(false);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }

  if (checking) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-gray-500">Verifying reset link…</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          Link expired or invalid
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Set new password
        </h1>
        <p className="text-gray-500 text-sm">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="Min. 8 characters"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            placeholder="Re-enter your new password"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
            {success}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
