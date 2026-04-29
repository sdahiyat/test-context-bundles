import { supabase } from '@/lib/supabase/client';
import type {
    InsertNutritionLog,
    NutritionLog,
} from '@/lib/supabase/types';

export async function getNutritionLog(
    userId: string,
    date: string
): Promise<NutritionLog | null> {
    const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', date)
        .maybeSingle();

    if (error) {
        console.error('getNutritionLog failed', error);
        return null;
    }
    return data;
}

export async function getNutritionLogRange(
    userId: string,
    startDate: string,
    endDate: string
): Promise<NutritionLog[]> {
    const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });

    if (error) {
        console.error('getNutritionLogRange failed', error);
        return [];
    }
    return data ?? [];
}

export async function upsertNutritionLog(
    data: InsertNutritionLog
): Promise<NutritionLog | null> {
    const { data: row, error } = await supabase
        .from('nutrition_logs')
        .upsert(data, { onConflict: 'user_id,log_date' })
        .select()
        .single();

    if (error) {
        console.error('upsertNutritionLog failed', error);
        return null;
    }
    return row;
}
