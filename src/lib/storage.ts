import { supabase } from '@/lib/supabase'

/**
 * The Supabase Storage bucket used for meal images.
 * This bucket is private — access is controlled via signed URLs.
 */
export const MEAL_IMAGES_BUCKET = 'meal-images'

/**
 * Upload a meal image to Supabase Storage.
 * Files are stored under the user's own folder: {userId}/{timestamp}-{filename}
 * The bucket is private, so a signed URL is required to retrieve the image.
 *
 * @param userId - The authenticated user's ID (used as the folder name)
 * @param file   - The File object to upload
 * @returns The storage path of the uploaded file (use getMealImageUrl to retrieve it)
 */
export async function uploadMealImage(userId: string, file: File): Promise<string> {
  const filePath = `${userId}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .upload(filePath, file)

  if (error) {
    throw new Error(`Failed to upload meal image: ${error.message}`)
  }

  return filePath
}

/**
 * Generate a short-lived signed URL for a private meal image.
 * The URL expires after 1 hour (3600 seconds).
 *
 * @param filePath - The storage path returned by uploadMealImage
 * @returns A time-limited signed URL string
 */
export async function getMealImageUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .createSignedUrl(filePath, 3600)

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a meal image from Supabase Storage.
 *
 * @param filePath - The storage path returned by uploadMealImage
 */
export async function deleteMealImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(MEAL_IMAGES_BUCKET)
    .remove([filePath])

  if (error) {
    throw new Error(`Failed to delete meal image: ${error.message}`)
  }
}
