-- ============================================================
-- NutriTrack Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Run this via the Supabase Dashboard SQL editor or
-- the Supabase CLI: supabase db push
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: public.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm       NUMERIC(5,2),
  weight_kg       NUMERIC(5,2),
  activity_level  TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: public.goals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type         TEXT NOT NULL CHECK (goal_type IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain')),
  target_weight_kg  NUMERIC(5,2),
  target_calories   INT NOT NULL,
  protein_target_g  INT,
  carbs_target_g    INT,
  fat_target_g      INT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  start_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date       DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: public.foods
-- ============================================================
CREATE TABLE IF NOT EXISTS public.foods (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT NOT NULL,
  brand                 TEXT,
  serving_size_g        NUMERIC(8,2) NOT NULL,
  serving_description   TEXT,
  calories_per_serving  NUMERIC(8,2) NOT NULL,
  protein_g             NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs_g               NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat_g                 NUMERIC(8,2) NOT NULL DEFAULT 0,
  fiber_g               NUMERIC(8,2) DEFAULT 0,
  sugar_g               NUMERIC(8,2) DEFAULT 0,
  sodium_mg             NUMERIC(8,2) DEFAULT 0,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for foods
CREATE INDEX IF NOT EXISTS foods_name_idx ON public.foods USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS foods_created_by_idx ON public.foods(created_by);

-- ============================================================
-- TABLE: public.meals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT,
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url       TEXT,
  ai_generated    BOOLEAN NOT NULL DEFAULT FALSE,
  notes           TEXT,
  total_calories  NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_carbs_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_fat_g     NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for meals
CREATE INDEX IF NOT EXISTS meals_user_id_logged_at_idx ON public.meals(user_id, logged_at DESC);

-- ============================================================
-- TABLE: public.meal_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_items (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_id        UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id        UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  food_name      TEXT NOT NULL,
  quantity       NUMERIC(8,2) NOT NULL DEFAULT 1,
  serving_size_g NUMERIC(8,2) NOT NULL,
  calories       NUMERIC(8,2) NOT NULL,
  protein_g      NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs_g        NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat_g          NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for meal_items
CREATE INDEX IF NOT EXISTS meal_items_meal_id_idx ON public.meal_items(meal_id);

-- ============================================================
-- TABLE: public.nutrition_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date        DATE NOT NULL,
  total_calories  NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_carbs_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_fat_g     NUMERIC(8,2) NOT NULL DEFAULT 0,
  water_ml        INT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Index for nutrition_logs
CREATE INDEX IF NOT EXISTS nutrition_logs_user_id_date_idx ON public.nutrition_logs(user_id, log_date DESC);

-- ============================================================
-- TRIGGER FUNCTION: update_updated_at_column
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: calculate_meal_totals
-- Aggregates meal_items for a given meal and updates the parent
-- meal's nutrition totals. Uses SECURITY DEFINER to bypass RLS
-- during trigger execution.
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_meal_totals(meal_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.meals
  SET
    total_calories  = COALESCE((
      SELECT SUM(calories * quantity)
      FROM public.meal_items
      WHERE meal_id = meal_id_param
    ), 0),
    total_protein_g = COALESCE((
      SELECT SUM(protein_g * quantity)
      FROM public.meal_items
      WHERE meal_id = meal_id_param
    ), 0),
    total_carbs_g   = COALESCE((
      SELECT SUM(carbs_g * quantity)
      FROM public.meal_items
      WHERE meal_id = meal_id_param
    ), 0),
    total_fat_g     = COALESCE((
      SELECT SUM(fat_g * quantity)
      FROM public.meal_items
      WHERE meal_id = meal_id_param
    ), 0),
    updated_at      = NOW()
  WHERE id = meal_id_param;
END;
$$;

-- ============================================================
-- TRIGGER FUNCTION: recalculate_meal_totals
-- Called after INSERT/UPDATE/DELETE on meal_items.
-- Handles DELETE by using OLD.meal_id since NEW is NULL.
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_meal_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meal_id UUID;
BEGIN
  -- On DELETE, NEW is NULL; use OLD. Otherwise use NEW.
  IF TG_OP = 'DELETE' THEN
    v_meal_id := OLD.meal_id;
  ELSE
    v_meal_id := NEW.meal_id;
  END IF;

  PERFORM calculate_meal_totals(v_meal_id);
  RETURN NULL;
END;
$$;

-- Apply the trigger to meal_items
CREATE TRIGGER meal_items_recalculate_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.meal_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_meal_totals();

-- ============================================================
-- FUNCTION: upsert_nutrition_log
-- Aggregates all meals for a user on a given date and upserts
-- into nutrition_logs. Uses SECURITY DEFINER to bypass RLS.
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_nutrition_log(p_user_id UUID, p_log_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_calories  NUMERIC(8,2);
  v_total_protein_g NUMERIC(8,2);
  v_total_carbs_g   NUMERIC(8,2);
  v_total_fat_g     NUMERIC(8,2);
BEGIN
  SELECT
    COALESCE(SUM(total_calories), 0),
    COALESCE(SUM(total_protein_g), 0),
    COALESCE(SUM(total_carbs_g), 0),
    COALESCE(SUM(total_fat_g), 0)
  INTO
    v_total_calories,
    v_total_protein_g,
    v_total_carbs_g,
    v_total_fat_g
  FROM public.meals
  WHERE
    user_id = p_user_id
    AND logged_at::DATE = p_log_date;

  INSERT INTO public.nutrition_logs (
    user_id,
    log_date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g
  ) VALUES (
    p_user_id,
    p_log_date,
    v_total_calories,
    v_total_protein_g,
    v_total_carbs_g,
    v_total_fat_g
  )
  ON CONFLICT (user_id, log_date)
  DO UPDATE SET
    total_calories  = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g   = EXCLUDED.total_carbs_g,
    total_fat_g     = EXCLUDED.total_fat_g,
    updated_at      = NOW();
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all public tables
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- ── goals ────────────────────────────────────────────────────
CREATE POLICY "goals_select_own"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_own"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update_own"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_own"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- ── foods ────────────────────────────────────────────────────
-- Public read so users can search the shared food database.
-- Only authenticated users can add; only creator can modify.
CREATE POLICY "foods_select_all_authenticated"
  ON public.foods FOR SELECT
  USING (TRUE);

CREATE POLICY "foods_insert_authenticated"
  ON public.foods FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "foods_update_own"
  ON public.foods FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "foods_delete_own"
  ON public.foods FOR DELETE
  USING (auth.uid() = created_by);

-- ── meals ────────────────────────────────────────────────────
CREATE POLICY "meals_select_own"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "meals_insert_own"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update_own"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_delete_own"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- ── meal_items ───────────────────────────────────────────────
-- Policies are based on parent meal ownership.
CREATE POLICY "meal_items_select_own"
  ON public.meal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE id = meal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_insert_own"
  ON public.meal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE id = meal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_update_own"
  ON public.meal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE id = meal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_delete_own"
  ON public.meal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE id = meal_id AND user_id = auth.uid()
    )
  );

-- ── nutrition_logs ───────────────────────────────────────────
CREATE POLICY "nutrition_logs_select_own"
  ON public.nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_insert_own"
  ON public.nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_update_own"
  ON public.nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_delete_own"
  ON public.nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE: meal-images bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Allow authenticated users to upload to their own folder
CREATE POLICY "meal_images_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meal-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage RLS: Allow authenticated users to read their own images
CREATE POLICY "meal_images_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meal-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Storage RLS: Allow authenticated users to delete their own images
CREATE POLICY "meal_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meal-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
