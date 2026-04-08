'use client';

import { useAuth } from '@/contexts/AuthContext';
import LogoutButton from '@/components/auth/LogoutButton';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-emerald-600">NutriTrack</h1>
        <div className="flex items-center gap-4">
          {user?.email && (
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.email}
            </span>
          )}
          <LogoutButton />
        </div>
      </header>

      {/* Body */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to NutriTrack 🥗
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Your dashboard is being built. Check back soon!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {['Calories', 'Protein', 'Carbs'].map((label) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
            >
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-3xl font-bold text-gray-300">—</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
