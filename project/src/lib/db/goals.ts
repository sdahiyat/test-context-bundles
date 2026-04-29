import { supabase } from '@/lib/supabase/client';
import type { Goal, InsertGoal, UpdateGoal } from '@/lib/supabase/types';

export async function getActiveGoal(userId: string): Promise<Goal | null> {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('getActiveGoal failed', error);
        return null;
    }
    return data;
}

export async function createGoal(data: InsertGoal): Promise<Goal | null> {
    const { data: row, error } = await supabase
        .from('goals')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('createGoal failed', error);
        return null;
    }
    return row;
}

export async function updateGoal(
    goalId: string,
    data: UpdateGoal
): Promise<Goal | null> {
    const { data: row, error } = await supabase
        .from('goals')
        .update(data)
        .eq('id', goalId)
        .select()
        .single();

    if (error) {
        console.error('updateGoal failed', error);
        return null;
    }
    return row;
}

export async function deactivateAllGoals(userId: string): Promise<void> {
    const { error } = await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

    if (error) {
        console.error('deactivateAllGoals failed', error);
    }
}

export async function setActiveGoal(
    goalId: string,
    userId: string
): Promise<Goal | null> {
    await deactivateAllGoals(userId);
    return updateGoal(goalId, { is_active: true });
}
