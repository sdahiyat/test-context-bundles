'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/login');
  }

  return (
    <button
      onClick={handleSignOut}
      className={
        className ??
        'text-gray-600 hover:text-gray-900 transition font-medium text-sm'
      }
    >
      Sign out
    </button>
  );
}
