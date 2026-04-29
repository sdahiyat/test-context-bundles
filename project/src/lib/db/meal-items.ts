import { supabase } from '@/lib/supabase/client';
import { updateMealTotals } from '@/lib/db/meals';
import type {
    InsertMealItem,
    MealItem,
    UpdateMealItem,
} from '@/lib/supabase/types';

export async function getMealItems(mealId: string): Promise<MealItem[]> {
    const { data, error } = await supabase
        .from('meal_items')
        .select('*')
        .eq('meal_id', mealId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('getMealItems failed', error);
        return [];
    }
    return data ?? [];
}

export async function addMealItem(
    data: InsertMealItem
): Promise<MealItem | null> {
    const { data: row, error } = await supabase
        .from('meal_items')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('addMealItem failed', error);
        return null;
    }

    await updateMealTotals(data.meal_id);
    return row;
}

export async function updateMealItem(
    itemId: string,
    data: UpdateMealItem
): Promise<MealItem | null> {
    const { data: row, error } = await supabase
        .from('meal_items')
        .update(data)
        .eq('id', itemId)
        .select()
        .single();

    if (error) {
        console.error('updateMealItem failed', error);
        return null;
    }

    if (row?.meal_id) {
        await updateMealTotals(row.meal_id);
    }
    return row;
}

export async function removeMealItem(
    itemId: string,
    mealId: string
): Promise<void> {
    const { error } = await supabase
        .from('meal_items')
        .delete()
        .eq('id', itemId);

    if (error) {
        console.error('removeMealItem failed', error);
        return;
    }
    await updateMealTotals(mealId);
}
