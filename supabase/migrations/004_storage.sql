-- Migration 004: Supabase Storage Configuration
-- Creates the meal-images bucket and sets storage RLS policies.
-- Image path convention: {user_id}/{timestamp}_{filename}
-- This ensures (storage.foldername(name))[1] == user_id for RLS.

-- ============================================================
-- CREATE BUCKET: meal-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-images',
  'meal-images',
  FALSE,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE RLS POLICIES
-- ============================================================

-- Allow authenticated users to upload images into their own folder
DROP POLICY IF EXISTS "meal_images_insert" ON storage.objects;
CREATE POLICY "meal_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'meal-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to read images from their own folder
DROP POLICY IF EXISTS "meal_images_select" ON storage.objects;
CREATE POLICY "meal_images_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'meal-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete images from their own folder
DROP POLICY IF EXISTS "meal_images_delete" ON storage.objects;
CREATE POLICY "meal_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'meal-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
