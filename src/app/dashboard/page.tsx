import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import DashboardClient from './DashboardClient';
import { MealWithItems, UserGoals, UserProfile } from '@/types/nutrition';

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA');
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerComponentClient<any>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const today = getTodayDateString();
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

  // Fetch today's meals
  let initialMeals: MealWithItems[] = [];
  try {
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select(
        `id, meal_type, logged_at, meal_items(id, quantity, unit, custom_calories, foods(id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g))`
      )
      .eq('user_id', session.user.id)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: true });

    if (!mealsError && mealsData) {
      initialMeals = mealsData as MealWithItems[];
    }
  } catch {
    // Tables may not exist yet — gracefully return empty
    initialMeals = [];
  }

  // Fetch user goals
  let userGoals: UserGoals | null = null;
  try {
    // Try the goals table first (from Task 3)
    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('daily_calories, daily_protein, daily_carbs, daily_fat')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!goalsError && goalsData) {
      userGoals = {
        daily_calories: goalsData.daily_calories ?? null,
        daily_protein: goalsData.daily_protein ?? null,
        daily_carbs: goalsData.daily_carbs ?? null,
        daily_fat: goalsData.daily_fat ?? null,
      };
    }
  } catch {
    // Goals table may not exist yet
    userGoals = null;
  }

  // Fetch user profile
  let userProfile: UserProfile | null = null;
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profileError && profileData) {
      userProfile = {
        id: profileData.id,
        display_name: profileData.display_name ?? null,
      };
    }
  } catch {
    // Profile table may not exist yet
    userProfile = null;
  }

  return (
    <DashboardClient
      initialDate={today}
      initialMeals={initialMeals}
      userGoals={userGoals}
      profile={userProfile}
    />
  );
}
