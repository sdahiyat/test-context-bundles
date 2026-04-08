import { supabase } from '@/lib/supabase'
import { FoodRow, FoodInsert } from '@/types/database'

/**
 * Full-text search for foods by name.
 * Verified foods are returned first.
 * @param query  - The search string (supports websearch syntax)
 * @param limit  - Maximum number of results (default 20)
 */
export async function searchFoods(query: string, limit = 20): Promise<FoodRow[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .textSearch('name', query, { type: 'websearch', config: 'english' })
    .order('is_verified', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to search foods: ${error.message}`)
  }

  return data ?? []
}

/**
 * Fetch a single food item by its ID.
 * Returns null if not found.
 */
export async function getFoodById(id: string): Promise<FoodRow | null> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch food: ${error.message}`)
  }

  return data
}

/**
 * Create a new food entry in the reference database.
 * Returns the created row.
 */
export async function createFood(food: FoodInsert): Promise<FoodRow> {
  const { data, error } = await supabase
    .from('foods')
    .insert(food)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create food: ${error.message}`)
  }

  return data
}

/**
 * Fetch multiple food items by their IDs.
 * Useful for bulk lookups when building a meal.
 */
export async function getFoodsByIds(ids: string[]): Promise<FoodRow[]> {
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .in('id', ids)

  if (error) {
    throw new Error(`Failed to fetch foods by IDs: ${error.message}`)
  }

  return data ?? []
}
