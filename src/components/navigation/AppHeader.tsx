'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  title?: string;
}

const pathTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/log': 'Log Meal',
  '/progress': 'Progress',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

function getInitials(email: string | undefined): string {
  if (!email) return '?';
  return email.charAt(0).toUpperCase();
}

export function AppHeader({ title }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const derivedTitle =
    title ??
    Object.entries(pathTitleMap).find(([path]) => pathname.startsWith(path))?.[1] ??
    'NutriTrack';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Mobile: show app name; desktop: show page title */}
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-gray-900 sm:hidden">NutriTrack</span>
        <span className="hidden text-base font-semibold text-gray-900 sm:block">{derivedTitle}</span>
      </div>

      {/* User avatar */}
      {user && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700"
          aria-label={`Signed in as ${user.email}`}
          title={user.email ?? ''}
        >
          {getInitials(user.email)}
        </div>
      )}
    </header>
  );
}
