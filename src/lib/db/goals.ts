import { supabase } from '@/lib/supabase/client';
import type { Database, GoalRow } from '@/lib/supabase/types';

type GoalInsert = Database['public']['Tables']['goals']['Insert'];
type GoalUpdate = Database['public']['Tables']['goals']['Update'];

/**
 * Returns the currently active goal for a user, or null if none exists.
 */
export async function getActiveGoal(userId: string): Promise<GoalRow | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`getActiveGoal failed: ${error.message}`);
  }

  return data;
}

/**
 * Returns all goals for a user, newest first (goal history).
 */
export async function getUserGoals(userId: string): Promise<GoalRow[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`getUserGoals failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Creates a new goal for the user.
 * First deactivates any existing active goal to maintain the
 * partial unique index constraint (one active goal per user).
 */
export async function createGoal(
  userId: string,
  goal: Omit<GoalInsert, 'user_id'>
): Promise<GoalRow> {
  // Deactivate existing active goal (if any)
  const { error: deactivateError } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (deactivateError) {
    throw new Error(`createGoal (deactivate) failed: ${deactivateError.message}`);
  }

  // Insert the new active goal
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...goal, user_id: userId, is_active: true })
    .select()
    .single();

  if (error) {
    throw new Error(`createGoal (insert) failed: ${error.message}`);
  }

  return data;
}

/**
 * Updates fields on an existing goal by ID.
 */
export async function updateGoal(
  goalId: string,
  updates: GoalUpdate
): Promise<GoalRow> {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    throw new Error(`updateGoal failed: ${error.message}`);
  }

  return data;
}
