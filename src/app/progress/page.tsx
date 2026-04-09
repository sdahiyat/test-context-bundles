import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProgressDashboard from '@/components/progress/ProgressDashboard';

export const metadata = {
  title: 'Progress | NutriTrack',
  description: 'Track your nutrition progress, weight, and streaks over time.',
};

export default async function ProgressPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Progress</h1>
          <p className="mt-2 text-gray-600">
            Track your nutrition history, weight trends, and logging streaks.
          </p>
        </div>
        <ProgressDashboard />
      </div>
    </div>
  );
}
