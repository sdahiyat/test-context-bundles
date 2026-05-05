import { supabase } from '@/lib/supabase/client';
import type { InsertUser, UpdateUser, User } from '@/lib/supabase/types';

export async function getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('getUserProfile failed', error);
        return null;
    }
    return data;
}

export async function createUserProfile(data: InsertUser): Promise<User | null> {
    const { data: row, error } = await supabase
        .from('users')
        .insert(data)
        .select()
        .single();

    if (error) {
        console.error('createUserProfile failed', error);
        return null;
    }
    return row;
}

export async function updateUserProfile(
    userId: string,
    data: UpdateUser
): Promise<User | null> {
    const { data: row, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('updateUserProfile failed', error);
        return null;
    }
    return row;
}
