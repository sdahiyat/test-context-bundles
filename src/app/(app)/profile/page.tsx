import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import ProfileView from '@/components/profile/ProfileView';
import type { UserProfile, Goal } from '@/types/profile';
import Link from 'next/link';

export default async function ProfilePage() {
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

  // Fetch active goal
  const { data: goalData } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const profile = profileData as UserProfile | null;
  const activeGoal = goalData as Goal | null;

  // If no profile at all, redirect to setup
  if (!profile) {
    redirect('/profile/setup');
  }

  const isProfileIncomplete = !profile.weight_kg || !profile.height_cm || !profile.age;

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal info and nutrition goals</p>
        </div>

        {isProfileIncomplete && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Your profile is incomplete</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Complete your profile to get personalized calorie and macro targets.
              </p>
            </div>
            <Link
              href="/profile/setup"
              className="text-xs font-semibold text-amber-700 underline whitespace-nowrap"
            >
              Complete Setup
            </Link>
          </div>
        )}

        <ProfileView profile={profile} activeGoal={activeGoal} />
      </div>
    </main>
  );
}
