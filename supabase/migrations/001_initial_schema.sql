-- NutriTrack Initial Database Schema
-- Run via Supabase Dashboard SQL editor or `supabase db push`

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text,
  email      text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- ─── GOALS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  goal_type        text CHECK (goal_type IN ('weight_loss', 'maintenance', 'muscle_gain')),
  target_calories  int,
  target_protein   int,
  target_carbs     int,
  target_fat       int,
  target_weight    numeric,
  current_weight   numeric,
  is_active        boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own goals"
  ON goals FOR ALL USING (auth.uid() = user_id);

-- ─── FOODS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name               text NOT NULL,
  brand              text,
  calories_per_100g  numeric NOT NULL,
  protein_per_100g   numeric NOT NULL,
  carbs_per_100g     numeric NOT NULL,
  fat_per_100g       numeric NOT NULL,
  fiber_per_100g     numeric,
  serving_size_g     numeric DEFAULT 100,
  serving_size_label text DEFAULT '100g',
  is_custom          boolean DEFAULT false,
  created_by         uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at         timestamptz DEFAULT now(),
  UNIQUE NULLS NOT DISTINCT (name, created_by)
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Public foods readable by everyone, custom foods readable by creator or anyone (for meal_items)
CREATE POLICY IF NOT EXISTS "Foods are publicly readable"
  ON foods FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create custom foods"
  ON foods FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND is_custom = true AND auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can update own custom foods"
  ON foods FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Users can delete own custom foods"
  ON foods FOR DELETE USING (auth.uid() = created_by);

-- ─── MEALS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  meal_type  text CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  logged_at  timestamptz DEFAULT now(),
  notes      text,
  image_url  text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own meals"
  ON meals FOR ALL USING (auth.uid() = user_id);

-- ─── MEAL ITEMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS meal_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id     uuid REFERENCES meals(id) ON DELETE CASCADE NOT NULL,
  food_id     uuid REFERENCES foods(id) ON DELETE RESTRICT NOT NULL,
  quantity_g  numeric,
  servings    numeric DEFAULT 1,
  calories    numeric,
  protein     numeric,
  carbs       numeric,
  fat         numeric
);

ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own meal items"
  ON meal_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meals WHERE meals.id = meal_items.meal_id AND meals.user_id = auth.uid()
    )
  );

-- ─── NUTRITION LOGS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  log_date        date NOT NULL,
  total_calories  numeric,
  total_protein   numeric,
  total_carbs     numeric,
  total_fat       numeric,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (user_id, log_date)
);

ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can manage own nutrition logs"
  ON nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- ─── STORAGE ─────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "Users can upload meal images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can view own meal images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete own meal images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
