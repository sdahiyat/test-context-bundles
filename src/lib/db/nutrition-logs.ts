import { supabase } from '@/lib/supabase'
import { NutritionLogRow } from '@/types/database'

/**
 * Fetch the nutrition log for a specific user and date.
 * The date parameter should be in 'YYYY-MM-DD' format.
 * Returns null if no log exists for that date.
 */
export async function getNutritionLog(
  userId: string,
  date: string
): Promise<NutritionLogRow | null> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch nutrition log: ${error.message}`)
  }

  return data
}

/**
 * Fetch nutrition logs for a user within a date range (inclusive).
 * Both dates should be in 'YYYY-MM-DD' format.
 * Results are ordered by log_date ascending.
 */
export async function getNutritionLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<NutritionLogRow[]> {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch nutrition logs: ${error.message}`)
  }

  return data ?? []
}

/**
 * Trigger a recalculation of the nutrition log for a specific date
 * by calling the upsert_nutrition_log database function via RPC.
 * This aggregates all meals for the user on that date.
 */
export async function recalculateNutritionLog(
  userId: string,
  date: string
): Promise<void> {
  const { error } = await supabase.rpc('upsert_nutrition_log', {
    p_user_id: userId,
    p_log_date: date,
  })

  if (error) {
    throw new Error(`Failed to recalculate nutrition log: ${error.message}`)
  }
}

/**
 * Fetch the nutrition logs for an entire week starting from weekStartDate.
 * weekStartDate should be in 'YYYY-MM-DD' format.
 * Returns up to 7 log entries ordered by log_date ascending.
 */
export async function getWeeklySummary(
  userId: string,
  weekStartDate: string
): Promise<NutritionLogRow[]> {
  // Calculate the end of the week (6 days after the start date).
  const start = new Date(weekStartDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const weekEndDate = end.toISOString().split('T')[0]

  return getNutritionLogs(userId, weekStartDate, weekEndDate)
}
