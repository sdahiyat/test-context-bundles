import { supabase } from '@/lib/supabase/client';
import type { Database, FoodRow } from '@/lib/supabase/types';

type FoodInsert = Database['public']['Tables']['foods']['Insert'];

/**
 * Searches foods by name or brand using a case-insensitive partial match.
 * Results are limited to `limit` rows (default 20).
 */
export async function searchFoods(
  query: string,
  limit = 20
): Promise<FoodRow[]> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    throw new Error(`searchFoods failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Fetches a single food entry by its UUID.
 * Returns null if not found.
 */
export async function getFoodById(foodId: string): Promise<FoodRow | null> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('id', foodId)
    .maybeSingle();

  if (error) {
    throw new Error(`getFoodById failed: ${error.message}`);
  }

  return data;
}

/**
 * Looks up a food by its barcode (UPC/EAN).
 * Returns null if no matching food exists.
 */
export async function getFoodByBarcode(barcode: string): Promise<FoodRow | null> {
  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('barcode', barcode)
    .maybeSingle();

  if (error) {
    throw new Error(`getFoodByBarcode failed: ${error.message}`);
  }

  return data;
}

/**
 * Creates a new food entry in the shared foods catalog.
 * Any authenticated user can add foods; the `created_by` field
 * should be set to the current user's ID.
 */
export async function createFood(food: FoodInsert): Promise<FoodRow> {
  const { data, error } = await supabase
    .from('foods')
    .insert(food)
    .select()
    .single();

  if (error) {
    throw new Error(`createFood failed: ${error.message}`);
  }

  return data;
}
