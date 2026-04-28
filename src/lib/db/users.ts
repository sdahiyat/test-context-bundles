import { supabase } from '@/lib/supabase/client';
import type { Database, UserRow } from '@/lib/supabase/types';

type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Fetches the public profile for a given user ID.
 * Returns null if the profile does not yet exist (e.g. new signup).
 * Throws on unexpected database errors.
 */
export async function getUserProfile(userId: string): Promise<UserRow | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = "The result contains 0 rows" — treat as not found
    if (error.code === 'PGRST116') return null;
    throw new Error(`getUserProfile failed: ${error.message}`);
  }

  return data;
}

/**
 * Inserts or updates a user profile row.
 * Commonly used after signup to persist extra metadata collected
 * during onboarding (full name, DOB, activity level, etc.).
 */
export async function upsertUserProfile(data: UserInsert): Promise<UserRow> {
  const { data: row, error } = await supabase
    .from('users')
    .upsert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`upsertUserProfile failed: ${error.message}`);
  }

  return row;
}

/**
 * Partially updates a user profile.
 * Throws if the row is not found or the update fails.
 */
export async function updateUserProfile(
  userId: string,
  updates: UserUpdate
): Promise<UserRow> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`updateUserProfile failed: ${error.message}`);
  }

  return data;
}
