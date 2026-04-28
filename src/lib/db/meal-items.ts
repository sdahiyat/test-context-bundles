import { supabase } from '@/lib/supabase/client';
import type { Database, FoodRow, MealItemRow } from '@/lib/supabase/types';

type MealItemInsert = Database['public']['Tables']['meal_items']['Insert'];
type MealItemUpdate = Database['public']['Tables']['meal_items']['Update'];

/**
 * Adds a single food item to a meal.
 * The DB trigger on meal_items automatically recalculates the parent
 * meal's totals and updates the daily nutrition_log.
 *
 * Use `calculateMealItemMacros` to pre-compute the nutrition values
 * before calling this function.
 */
export async function addMealItem(item: MealItemInsert): Promise<MealItemRow> {
  const { data, error } = await supabase
    .from('meal_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    throw new Error(`addMealItem failed: ${error.message}`);
  }

  return data;
}

/**
 * Batch-inserts multiple food items into a meal in a single round-trip.
 * The DB trigger fires once per row, keeping all aggregates in sync.
 */
export async function addMealItems(
  items: MealItemInsert[]
): Promise<MealItemRow[]> {
  if (items.length === 0) return [];

  const { data, error } = await supabase
    .from('meal_items')
    .insert(items)
    .select();

  if (error) {
    throw new Error(`addMealItems failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Updates an existing meal item (e.g. to adjust quantity or serving size).
 * Recalculation of meal/log totals is handled by the DB trigger.
 */
export async function updateMealItem(
  itemId: string,
  updates: MealItemUpdate
): Promise<MealItemRow> {
  const { data, error } = await supabase
    .from('meal_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`updateMealItem failed: ${error.message}`);
  }

  return data;
}

/**
 * Removes a food item from a meal.
 * The DB trigger fires on DELETE to keep meal totals and the
 * daily nutrition_log accurate.
 */
export async function deleteMealItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw new Error(`deleteMealItem failed: ${error.message}`);
  }
}

/**
 * Pure helper — calculates the nutrition values for a meal item
 * given a food's per-serving data, a quantity (number of servings),
 * and an optional custom serving size override.
 *
 * All macro values are proportionally scaled from the food's reference
 * serving size to the actual amount consumed.
 *
 * Example:
 *   food.serving_size_g = 100, food.calories_per_serving = 250
 *   quantity = 1.5, customServingSizeG = undefined
 *   → serving_size_g = 150, calories = 375
 */
export function calculateMealItemMacros(
  food: FoodRow,
  quantity: number,
  customServingSizeG?: number
): Pick<
  MealItemRow,
  | 'serving_size_g'
  | 'calories'
  | 'protein_g'
  | 'carbs_g'
  | 'fat_g'
  | 'fiber_g'
  | 'sugar_g'
  | 'sodium_mg'
> {
  const baseServing = customServingSizeG ?? food.serving_size_g;
  const totalServingG = baseServing * quantity;

  // Scale factor relative to the food's reference serving size
  const scale = totalServingG / food.serving_size_g;

  return {
    serving_size_g: totalServingG,
    calories:       Math.round(food.calories_per_serving * scale * 100) / 100,
    protein_g:      Math.round(food.protein_g * scale * 100) / 100,
    carbs_g:        Math.round(food.carbs_g * scale * 100) / 100,
    fat_g:          Math.round(food.fat_g * scale * 100) / 100,
    fiber_g:        food.fiber_g  != null ? Math.round(food.fiber_g  * scale * 100) / 100 : null,
    sugar_g:        food.sugar_g  != null ? Math.round(food.sugar_g  * scale * 100) / 100 : null,
    sodium_mg:      food.sodium_mg != null ? Math.round(food.sodium_mg * scale * 100) / 100 : null,
  };
}
