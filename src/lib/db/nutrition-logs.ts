import { supabase } from '@/lib/supabase/client';
import type { NutritionLogRow } from '@/lib/supabase/types';

/**
 * Fetches the aggregated nutrition log for a user on a specific date.
 * Returns null if no log entry exists for that date yet.
 */
export async function getNutritionLog(
  userId: string,
  date: string // 'YYYY-MM-DD'
): Promise<NutritionLogRow | null> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle();

  if (error) {
    throw new Error(`getNutritionLog failed: ${error.message}`);
  }

  return data;
}

/**
 * Fetches nutrition logs for a user across an inclusive date range.
 * Useful for rendering progress charts and weekly/monthly summaries.
 * Results are ordered by log_date ascending.
 */
export async function getNutritionLogRange(
  userId: string,
  startDate: string, // 'YYYY-MM-DD'
  endDate: string    // 'YYYY-MM-DD'
): Promise<NutritionLogRow[]> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true });

  if (error) {
    throw new Error(`getNutritionLogRange failed: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Sets (or updates) the recorded water intake for a specific day.
 * Uses upsert so it works whether the log row already exists or not.
 * Note: this will NOT overwrite calorie/macro totals managed by the
 * DB trigger; only the water_ml column is targeted here.
 */
export async function updateWaterIntake(
  userId: string,
  date: string, // 'YYYY-MM-DD'
  waterMl: number
): Promise<NutritionLogRow> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .upsert(
      { user_id: userId, log_date: date, water_ml: waterMl },
      { onConflict: 'user_id,log_date' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`updateWaterIntake failed: ${error.message}`);
  }

  return data;
}

/**
 * Manually triggers a full recalculation of the nutrition_log row for
 * a given user and date by calling the `upsert_nutrition_log` database
 * function. Useful for admin repair operations or resolving data drift.
 */
export async function triggerNutritionLogRecalculation(
  userId: string,
  date: string // 'YYYY-MM-DD'
): Promise<void> {
  const { error } = await supabase.rpc('upsert_nutrition_log', {
    p_user_id: userId,
    p_log_date: date,
  });

  if (error) {
    throw new Error(
      `triggerNutritionLogRecalculation failed: ${error.message}`
    );
  }
}
