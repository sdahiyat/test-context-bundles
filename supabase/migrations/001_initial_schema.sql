-- Migration 001: Initial Schema
-- Creates all tables, constraints, indexes, and enables RLS

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: public.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height_cm       NUMERIC(5,2),
  weight_kg       NUMERIC(5,2),
  activity_level  TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'super_active')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: public.goals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.goals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_type         TEXT NOT NULL CHECK (goal_type IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_health')),
  target_weight_kg  NUMERIC(5,2),
  target_calories   INT NOT NULL,
  target_protein_g  INT,
  target_carbs_g    INT,
  target_fat_g      INT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  start_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date       DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: only one active goal per user
CREATE UNIQUE INDEX goals_one_active_per_user
  ON public.goals (user_id)
  WHERE is_active = TRUE;

CREATE INDEX goals_user_id_idx ON public.goals (user_id);

CREATE TRIGGER goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: public.foods
-- ============================================================
CREATE TABLE IF NOT EXISTS public.foods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  brand                 TEXT,
  barcode               TEXT UNIQUE,
  serving_size_g        NUMERIC(7,2) NOT NULL DEFAULT 100,
  calories_per_serving  NUMERIC(7,2) NOT NULL,
  protein_g             NUMERIC(7,2) NOT NULL DEFAULT 0,
  carbs_g               NUMERIC(7,2) NOT NULL DEFAULT 0,
  fat_g                 NUMERIC(7,2) NOT NULL DEFAULT 0,
  fiber_g               NUMERIC(7,2) DEFAULT 0,
  sugar_g               NUMERIC(7,2) DEFAULT 0,
  sodium_mg             NUMERIC(7,2) DEFAULT 0,
  is_verified           BOOLEAN NOT NULL DEFAULT FALSE,
  created_by            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on name + brand
CREATE INDEX foods_fts_idx ON public.foods
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(brand, '')));

CREATE INDEX foods_name_idx ON public.foods (name);
CREATE INDEX foods_created_by_idx ON public.foods (created_by);

CREATE TRIGGER foods_updated_at
  BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: public.meals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meal_type       TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  image_url       TEXT,
  total_calories  NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_carbs_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_fat_g     NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX meals_user_id_log_date_idx ON public.meals (user_id, log_date);
CREATE INDEX meals_user_id_idx ON public.meals (user_id);

CREATE TRIGGER meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: public.meal_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id        UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  food_id        UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  quantity       NUMERIC(7,2) NOT NULL DEFAULT 1,
  serving_size_g NUMERIC(7,2) NOT NULL,
  calories       NUMERIC(8,2) NOT NULL,
  protein_g      NUMERIC(8,2) NOT NULL DEFAULT 0,
  carbs_g        NUMERIC(8,2) NOT NULL DEFAULT 0,
  fat_g          NUMERIC(8,2) NOT NULL DEFAULT 0,
  fiber_g        NUMERIC(8,2) DEFAULT 0,
  sugar_g        NUMERIC(8,2) DEFAULT 0,
  sodium_mg      NUMERIC(8,2) DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX meal_items_meal_id_idx ON public.meal_items (meal_id);
CREATE INDEX meal_items_food_id_idx ON public.meal_items (food_id);

ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TABLE: public.nutrition_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_date        DATE NOT NULL,
  total_calories  NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_protein_g NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_carbs_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_fat_g     NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_fiber_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_sugar_g   NUMERIC(8,2) NOT NULL DEFAULT 0,
  total_sodium_mg NUMERIC(8,2) NOT NULL DEFAULT 0,
  meal_count      INT NOT NULL DEFAULT 0,
  water_ml        INT NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, log_date)
);

CREATE INDEX nutrition_logs_user_id_log_date_idx ON public.nutrition_logs (user_id, log_date DESC);

CREATE TRIGGER nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
