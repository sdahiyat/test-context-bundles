import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { calculateSuggestedTargets } from '@/lib/nutrition-calculator';
import type { UserProfileForCalc } from '@/lib/nutrition-calculator';

const VALID_GOAL_TYPES = ['weight_loss', 'maintenance', 'muscle_gain'] as const;
type GoalType = (typeof VALID_GOAL_TYPES)[number];

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: goal, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(goal ?? null);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { goal_type, target_weight_kg, use_suggested } = body;
    let { daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g } = body;

    // Validate goal_type
    if (!goal_type || !VALID_GOAL_TYPES.includes(goal_type as GoalType)) {
      return NextResponse.json(
        { error: `goal_type must be one of: ${VALID_GOAL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // If use_suggested, compute targets from user profile
    if (use_suggested) {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('weight_kg, height_cm, age, gender, activity_level')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        return NextResponse.json(
          { error: 'User profile not found. Please complete your profile first.' },
          { status: 400 }
        );
      }

      if (
        !profileData.weight_kg ||
        !profileData.height_cm ||
        !profileData.age ||
        !profileData.gender ||
        !profileData.activity_level
      ) {
        return NextResponse.json(
          { error: 'Profile is incomplete. Please fill in weight, height, age, gender, and activity level.' },
          { status: 400 }
        );
      }

      const profileForCalc: UserProfileForCalc = {
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        age: profileData.age,
        gender: profileData.gender as UserProfileForCalc['gender'],
        activity_level: profileData.activity_level as UserProfileForCalc['activity_level'],
      };

      const suggested = calculateSuggestedTargets(profileForCalc, goal_type as GoalType);
      daily_calories = suggested.daily_calories;
      daily_protein_g = suggested.daily_protein_g;
      daily_carbs_g = suggested.daily_carbs_g;
      daily_fat_g = suggested.daily_fat_g;
    }

    // Deactivate existing active goals
    const { error: deactivateError } = await supabase
      .from('goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (deactivateError) {
      return NextResponse.json({ error: deactivateError.message }, { status: 500 });
    }

    // Insert new active goal
    const { data: newGoal, error: insertError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_type,
        target_weight_kg: target_weight_kg ?? null,
        daily_calories: daily_calories ?? null,
        daily_protein_g: daily_protein_g ?? null,
        daily_carbs_g: daily_carbs_g ?? null,
        daily_fat_g: daily_fat_g ?? null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newGoal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
