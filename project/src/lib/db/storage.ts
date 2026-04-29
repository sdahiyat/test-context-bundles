import { supabase } from '@/lib/supabase/client';

export const MEAL_IMAGES_BUCKET = 'meal-images';
const SIGNED_URL_TTL_SECONDS = 3600;

function sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadMealImage(
    userId: string,
    file: File,
    mealId?: string
): Promise<string | null> {
    const safeName = sanitizeFileName(file.name);
    const prefix = mealId ? `${mealId}_` : '';
    const path = `${userId}/${prefix}${Date.now()}_${safeName}`;

    const { error } = await supabase.storage
        .from(MEAL_IMAGES_BUCKET)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type || undefined,
        });

    if (error) {
        console.error('uploadMealImage failed', error);
        return null;
    }
    return path;
}

export async function getMealImageUrl(path: string): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(MEAL_IMAGES_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

    if (error) {
        console.error('getMealImageUrl failed', error);
        return null;
    }
    return data?.signedUrl ?? null;
}

export async function deleteMealImage(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(MEAL_IMAGES_BUCKET)
        .remove([path]);

    if (error) {
        console.error('deleteMealImage failed', error);
    }
}
