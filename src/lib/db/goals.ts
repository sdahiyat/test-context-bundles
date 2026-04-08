import { supabase } from '@/lib/supabase'
import { GoalRow, GoalInsert, GoalUpdate } from '@/types/database'

/**
 * Fetch the currently active goal for a user.
 * Returns null if no active goal exists.
 */
export async function getActiveGoal(userId: string): Promise<GoalRow | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch active goal: ${error.message}`)
  }

  return data
}

/**
 * Fetch all goals for a user, newest first.
 */
export async function getAllGoals(userId: string): Promise<GoalRow[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch goals: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new goal for a user.
 * Deactivates all existing active goals before inserting the new one.
 */
export async function createGoal(goal: GoalInsert): Promise<GoalRow> {
  // Deactivate any currently active goals for this user.
  const { error: deactivateError } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('user_id', goal.user_id)
    .eq('is_active', true)

  if (deactivateError) {
    throw new Error(`Failed to deactivate existing goals: ${deactivateError.message}`)
  }

  // Insert the new goal (always active).
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...goal, is_active: true })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create goal: ${error.message}`)
  }

  return data
}

/**
 * Update a specific goal.
 * Requires userId to prevent users from modifying other users' goals.
 */
export async function updateGoal(
  id: string,
  userId: string,
  updates: GoalUpdate
): Promise<GoalRow> {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update goal: ${error.message}`)
  }

  return data
}

/**
 * Deactivate a specific goal without deleting it.
 * Requires userId as a security check.
 */
export async function deactivateGoal(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to deactivate goal: ${error.message}`)
  }
}
