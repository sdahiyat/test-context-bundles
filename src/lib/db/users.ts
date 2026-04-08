import { supabase } from '@/lib/supabase'
import { UserRow, UserInsert, UserUpdate, GoalRow } from '@/types/database'

/**
 * Fetch a user profile by their ID.
 * Returns null if the user does not exist.
 */
export async function getUserById(id: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data
}

/**
 * Create a new user profile row.
 * The id must match an existing auth.users record.
 */
export async function createUser(user: UserInsert): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return data
}

/**
 * Update an existing user profile.
 * Returns the updated row.
 */
export async function updateUser(id: string, updates: UserUpdate): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return data
}

/**
 * Fetch a user along with their currently active goal in a single request.
 * Returns { user, goal } where goal may be null if no active goal exists.
 */
export async function getUserWithActiveGoal(
  id: string
): Promise<{ user: UserRow; goal: GoalRow | null }> {
  const { data, error } = await supabase
    .from('users')
    .select('*, goals!goals_user_id_fkey(*)')
    .eq('id', id)
    .eq('goals.is_active', true)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch user with active goal: ${error.message}`)
  }

  if (!data) {
    throw new Error(`User not found: ${id}`)
  }

  // Supabase returns the joined relation as an array; extract the first active goal.
  const goals = (data as unknown as { goals: GoalRow[] }).goals
  const goal = Array.isArray(goals) && goals.length > 0 ? goals[0] : null

  // Strip the nested goals array and return a clean user row.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { goals: _goals, ...userRow } = data as UserRow & { goals: GoalRow[] }

  return { user: userRow as UserRow, goal }
}
