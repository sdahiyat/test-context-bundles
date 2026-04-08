import { supabase } from '@/lib/supabase'
import { MealRow, MealInsert, MealUpdate, MealItemInsert, MealItemRow } from '@/types/database'

/**
 * A meal row with its associated meal items included.
 */
export type MealWithItems = MealRow & { meal_items: MealItemRow[] }

/**
 * Fetch all meals logged by a user on a specific date.
 * The date parameter should be in 'YYYY-MM-DD' format.
 * Results include meal_items and are ordered by logged_at ASC.
 */
export async function getMealsForDate(
  userId: string,
  date: string
): Promise<MealWithItems[]> {
  // Build the date range for the full calendar day in UTC.
  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_items(*)')
    .eq('user_id', userId)
    .gte('logged_at', startOfDay)
    .lte('logged_at', endOfDay)
    .order('logged_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch meals for date: ${error.message}`)
  }

  return (data ?? []) as MealWithItems[]
}

/**
 * Fetch a single meal with its items.
 * Verifies ownership via user_id to prevent unauthorized access.
 * Returns null if not found or not owned by userId.
 */
export async function getMealById(
  id: string,
  userId: string
): Promise<MealWithItems | null> {
  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_items(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch meal: ${error.message}`)
  }

  return data as MealWithItems | null
}

/**
 * Create a new meal along with its initial meal items.
 * The database trigger automatically calculates and updates the meal totals.
 */
export async function createMeal(
  meal: MealInsert,
  items: MealItemInsert[]
): Promise<MealWithItems> {
  // Insert the meal first to get the generated ID.
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .insert(meal)
    .select()
    .single()

  if (mealError) {
    throw new Error(`Failed to create meal: ${mealError.message}`)
  }

  const mealId = mealData.id

  // Attach the meal_id to each item and insert them all.
  if (items.length > 0) {
    const itemsWithMealId = items.map((item) => ({ ...item, meal_id: mealId }))

    const { error: itemsError } = await supabase
      .from('meal_items')
      .insert(itemsWithMealId)

    if (itemsError) {
      throw new Error(`Failed to create meal items: ${itemsError.message}`)
    }
  }

  // Re-fetch the meal with totals (which have been updated by the DB trigger).
  const mealWithItems = await getMealById(mealId, meal.user_id)
  if (!mealWithItems) {
    throw new Error('Failed to retrieve meal after creation.')
  }

  return mealWithItems
}

/**
 * Update meal metadata (type, name, notes, image, etc.).
 * Requires userId as a security check.
 */
export async function updateMeal(
  id: string,
  userId: string,
  updates: MealUpdate
): Promise<MealRow> {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update meal: ${error.message}`)
  }

  return data
}

/**
 * Delete a meal and all its items.
 * meal_items are removed automatically via CASCADE.
 * Requires userId as a security check.
 */
export async function deleteMeal(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to delete meal: ${error.message}`)
  }
}

/**
 * Add a single food item to an existing meal.
 * Verifies that the meal belongs to userId before inserting.
 * The database trigger will recalculate the meal totals automatically.
 */
export async function addMealItem(
  mealId: string,
  userId: string,
  item: Omit<MealItemInsert, 'meal_id'>
): Promise<MealItemRow> {
  // Verify meal ownership.
  const meal = await getMealById(mealId, userId)
  if (!meal) {
    throw new Error('Meal not found or does not belong to this user.')
  }

  const { data, error } = await supabase
    .from('meal_items')
    .insert({ ...item, meal_id: mealId })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add meal item: ${error.message}`)
  }

  return data
}

/**
 * Remove a single meal item by its ID.
 * Validates ownership by checking the parent meal's user_id.
 * The database trigger will recalculate the meal totals automatically.
 */
export async function removeMealItem(itemId: string, userId: string): Promise<void> {
  // We need to join through meals to verify ownership.
  // Fetch the item to get its meal_id first.
  const { data: item, error: fetchError } = await supabase
    .from('meal_items')
    .select('meal_id')
    .eq('id', itemId)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Failed to fetch meal item: ${fetchError.message}`)
  }

  if (!item) {
    throw new Error('Meal item not found.')
  }

  // Verify the parent meal belongs to the user.
  const meal = await getMealById(item.meal_id, userId)
  if (!meal) {
    throw new Error('Meal not found or does not belong to this user.')
  }

  const { error } = await supabase
    .from('meal_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Failed to remove meal item: ${error.message}`)
  }
}
