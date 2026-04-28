import { supabase } from '@/lib/supabase/client';
import type { Database, FoodRow, MealItemRow, MealRow } from '@/lib/supabase/types';

type MealInsert = Database['public']['Tables']['meals']['Insert'];
type MealUpdate = Database['public']['Tables']['meals']['Update'];

/**
 * A meal row with its nested items and the food details for each item.
 */
export type MealWithItems = MealRow & {
  meal_items: Array<MealItemRow & { foods: FoodRow }>;
};

/**
 * Fetches all meals (with nested items and food details) for a user on a
 * specific calendar date, ordered by logged_at ascending.
 */
export async function getMealsByDate(
  userId: string,
  date: string // 'YYYY-MM-DD'
): Promise<MealWithItems[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_items(*, foods(*))')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('logged_at', { ascending: true });

  if (error) {
    throw new Error(`getMealsByDate failed: ${error.message}`);
  }

  return (data as MealWithItems[]) ?? [];
}

/**
 * Creates a new meal record.
 * The DB trigger on meal_items will keep totals updated automatically
 * as items are added.
 */
export async function createMeal(meal: MealInsert): Promise<MealRow> {
  const { data, error } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single();

  if (error) {
    throw new Error(`createMeal failed: ${error.message}`);
  }

  return data;
}

/**
 * Updates metadata on an existing meal (e.g. notes, image_url, meal_type).
 */
export async function updateMeal(
  mealId: string,
  updates: MealUpdate
): Promise<MealRow> {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', mealId)
    .select()
    .single();

  if (error) {
    throw new Error(`updateMeal failed: ${error.message}`);
  }

  return data;
}

/**
 * Deletes a meal and all its items (cascade delete via FK).
 * The DB trigger fires on the deleted meal_items, which updates
 * the nutrition_log automatically.
 */
export async function deleteMeal(mealId: string): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  if (error) {
    throw new Error(`deleteMeal failed: ${error.message}`);
  }
}

/**
 * Uploads a meal photo to the 'meal-images' storage bucket.
 *
 * Path convention: `{userId}/{timestamp}_{filename}`
 * This satisfies the storage RLS policy which checks that
 * (storage.foldername(name))[1] equals the authenticated user's ID.
 *
 * Returns a signed URL valid for 1 hour.
 */
export async function uploadMealImage(
  userId: string,
  file: File
): Promise<string> {
  // Sanitise filename to avoid path issues
  const sanitisedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${userId}/${Date.now()}_${sanitisedName}`;

  const { error: uploadError } = await supabase.storage
    .from('meal-images')
    .upload(path, file, { upsert: false });

  if (uploadError) {
    throw new Error(`uploadMealImage (upload) failed: ${uploadError.message}`);
  }

  const { data: urlData, error: urlError } = await supabase.storage
    .from('meal-images')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (urlError || !urlData?.signedUrl) {
    throw new Error(
      `uploadMealImage (signed URL) failed: ${urlError?.message ?? 'unknown error'}`
    );
  }

  return urlData.signedUrl;
}
