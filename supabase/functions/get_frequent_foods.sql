-- Frequent foods database function
-- Run this in the Supabase SQL editor after the initial schema migration

CREATE OR REPLACE FUNCTION get_frequent_foods(p_user_id uuid, p_limit int DEFAULT 10)
RETURNS TABLE (
  id                uuid,
  name              text,
  brand             text,
  calories_per_100g numeric,
  protein_per_100g  numeric,
  carbs_per_100g    numeric,
  fat_per_100g      numeric,
  fiber_per_100g    numeric,
  serving_size_g    numeric,
  serving_size_label text,
  is_custom         boolean,
  created_by        uuid,
  created_at        timestamptz,
  log_count         bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    f.id,
    f.name,
    f.brand,
    f.calories_per_100g,
    f.protein_per_100g,
    f.carbs_per_100g,
    f.fat_per_100g,
    f.fiber_per_100g,
    f.serving_size_g,
    f.serving_size_label,
    f.is_custom,
    f.created_by,
    f.created_at,
    COUNT(mi.id) AS log_count
  FROM meal_items mi
  JOIN meals m ON m.id = mi.meal_id
  JOIN foods f ON f.id = mi.food_id
  WHERE m.user_id = p_user_id
  GROUP BY
    f.id,
    f.name,
    f.brand,
    f.calories_per_100g,
    f.protein_per_100g,
    f.carbs_per_100g,
    f.fat_per_100g,
    f.fiber_per_100g,
    f.serving_size_g,
    f.serving_size_label,
    f.is_custom,
    f.created_by,
    f.created_at
  ORDER BY log_count DESC
  LIMIT p_limit;
$$;
