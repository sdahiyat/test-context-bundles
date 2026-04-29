import { supabase } from '@/lib/supabase/client';
import type {
    InsertMeal,
    Meal,
    MealWithItems,
    UpdateMeal,
} from '@/lib/supabase/types';

function dayBounds(date: string) {
    const start = `${date}T00:00:00.000Z`;
    const end = `${date}T23:59:59.999Z`;
    return { start, end };
}

export async function getMealsByDate(
    userId: string,
    date: string
): Promise<Meal[]> {
    const { start, end } = dayBounds(date);
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end)
        .order('logged_at', { ascending: true });

    if (error) {
        console.error('getMealsByDate failed', error);
        return [];
    }
    return data ?? [];
}

export async function getMealById(id: string): Promise<Meal | null> {
    const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('getMealById failed', error);
        return null;
    }
    return data;
}

export async function getMealsWithItems(
    userId: string,
    date: string
): Promise<MealWithItems[]> {
    const { start, end } = dayBounds(date);
    const { data, error } = await supabase
        .from('meals')
        .select('*, meal_items(*)')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lte('logged_at', end)
        .order('logged_at', { ascending: true });

    if (error) {
        console.error('getMealsWithItems failed', error);
        return [];
    }
    return (data as unknown as MealWithItems[]) ?? [];
}

export async function createMeal(data: InsertMeal): Promise<Meal | null> {
    const { data: row, error } = await supabase
        .from('meals')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('createMeal failed', error);
        return null;
    }
    return row;
}

export async function updateMeal(
    mealId: string,
    data: UpdateMeal
): Promise<Meal | null> {
    const { data: row, error } = await supabase
        .from('meals')
        .update(data)
        .eq('id', mealId)
        .select()
        .single();

    if (error) {
        console.error('updateMeal failed', error);
        return null;
    }
    return row;
}

export async function deleteMeal(mealId: string): Promise<void> {
    const { error } = await supabase.from('meals').delete().eq('id', mealId);
    if (error) {
        console.error('deleteMeal failed', error);
    }
}

export async function updateMealTotals(mealId: string): Promise<void> {
    const { data: items, error: itemsError } = await supabase
        .from('meal_items')
        .select('calories, protein_g, carbs_g, fat_g')
        .eq('meal_id', mealId);

    if (itemsError) {
        console.error('updateMealTotals: load items failed', itemsError);
        return;
    }

    const totals = (items ?? []).reduce(
        (acc, item) => ({
            total_calories: acc.total_calories + Number(item.calories ?? 0),
            total_protein_g: acc.total_protein_g + Number(item.protein_g ?? 0),
            total_carbs_g: acc.total_carbs_g + Number(item.carbs_g ?? 0),
            total_fat_g: acc.total_fat_g + Number(item.fat_g ?? 0),
        }),
        { total_calories: 0, total_protein_g: 0, total_carbs_g: 0, total_fat_g: 0 }
    );

    const { error } = await supabase
        .from('meals')
        .update(totals)
        .eq('id', mealId);

    if (error) {
        console.error('updateMealTotals: update meal failed', error);
    }
}
