import { supabase } from '@/lib/supabase/client';
import type { Food, InsertFood, UpdateFood } from '@/lib/supabase/types';

export async function searchFoods(query: string, limit = 20): Promise<Food[]> {
    const trimmed = query.trim();
    let request = supabase
        .from('foods')
        .select('*')
        .order('is_verified', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit);

    if (trimmed.length > 0) {
        request = request.ilike('name', `%${trimmed}%`);
    }

    const { data, error } = await request;
    if (error) {
        console.error('searchFoods failed', error);
        return [];
    }
    return data ?? [];
}

export async function getFoodById(id: string): Promise<Food | null> {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('getFoodById failed', error);
        return null;
    }
    return data;
}

export async function createFood(data: InsertFood): Promise<Food | null> {
    const { data: row, error } = await supabase
        .from('foods')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('createFood failed', error);
        return null;
    }
    return row;
}

export async function updateFood(
    foodId: string,
    data: UpdateFood
): Promise<Food | null> {
    const { data: row, error } = await supabase
        .from('foods')
        .update(data)
        .eq('id', foodId)
        .select()
        .single();

    if (error) {
        console.error('updateFood failed', error);
        return null;
    }
    return row;
}

export async function deleteFood(foodId: string): Promise<void> {
    const { error } = await supabase.from('foods').delete().eq('id', foodId);
    if (error) {
        console.error('deleteFood failed', error);
    }
}
