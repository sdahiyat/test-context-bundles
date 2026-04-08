import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import type { UserProfile, Goal } from '@/types/profile';
import GoalPageClient from './GoalPageClient';

export default async function GoalPage() {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const profile = profileData as UserProfile | null;

  // If no profile, redirect to setup
  if (!profile || (!profile.weight_kg && !profile.height_cm && !profile.age)) {
    redirect('/profile/setup');
  }

  // Fetch active goal
  const { data: goalData } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeGoal = goalData as Goal | null;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Update Your Goal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Choose a goal type and customize your targets
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <GoalPageClient
            userId={user.id}
            profile={profile}
            activeGoal={activeGoal}
          />
        </div>
      </div>
    </main>
  );
}
