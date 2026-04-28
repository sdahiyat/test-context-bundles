-- Migration 002: Row Level Security Policies
-- Defines all RLS policies for every table

-- ============================================================
-- public.users
-- ============================================================
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_delete_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- ============================================================
-- public.goals
-- ============================================================
DROP POLICY IF EXISTS "goals_select_own" ON public.goals;
DROP POLICY IF EXISTS "goals_insert_own" ON public.goals;
DROP POLICY IF EXISTS "goals_update_own" ON public.goals;
DROP POLICY IF EXISTS "goals_delete_own" ON public.goals;

CREATE POLICY "goals_select_own" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "goals_insert_own" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_update_own" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "goals_delete_own" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- public.foods
-- Foods are a shared catalog; any authenticated user can read.
-- Any authenticated user can add foods (for custom entries).
-- Only the creator can update/delete their own food entries.
-- ============================================================
DROP POLICY IF EXISTS "foods_select_all" ON public.foods;
DROP POLICY IF EXISTS "foods_insert_authenticated" ON public.foods;
DROP POLICY IF EXISTS "foods_update_own" ON public.foods;
DROP POLICY IF EXISTS "foods_delete_own" ON public.foods;

CREATE POLICY "foods_select_all" ON public.foods
  FOR SELECT USING (TRUE);

CREATE POLICY "foods_insert_authenticated" ON public.foods
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "foods_update_own" ON public.foods
  FOR UPDATE USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "foods_delete_own" ON public.foods
  FOR DELETE USING (auth.uid() = created_by);

-- ============================================================
-- public.meals
-- ============================================================
DROP POLICY IF EXISTS "meals_select_own" ON public.meals;
DROP POLICY IF EXISTS "meals_insert_own" ON public.meals;
DROP POLICY IF EXISTS "meals_update_own" ON public.meals;
DROP POLICY IF EXISTS "meals_delete_own" ON public.meals;

CREATE POLICY "meals_select_own" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meals_insert_own" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_update_own" ON public.meals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meals_delete_own" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- public.meal_items
-- Access is derived from the parent meal's ownership.
-- ============================================================
DROP POLICY IF EXISTS "meal_items_select_own" ON public.meal_items;
DROP POLICY IF EXISTS "meal_items_insert_own" ON public.meal_items;
DROP POLICY IF EXISTS "meal_items_update_own" ON public.meal_items;
DROP POLICY IF EXISTS "meal_items_delete_own" ON public.meal_items;

CREATE POLICY "meal_items_select_own" ON public.meal_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_insert_own" ON public.meal_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_update_own" ON public.meal_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "meal_items_delete_own" ON public.meal_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

-- ============================================================
-- public.nutrition_logs
-- ============================================================
DROP POLICY IF EXISTS "nutrition_logs_select_own" ON public.nutrition_logs;
DROP POLICY IF EXISTS "nutrition_logs_insert_own" ON public.nutrition_logs;
DROP POLICY IF EXISTS "nutrition_logs_update_own" ON public.nutrition_logs;
DROP POLICY IF EXISTS "nutrition_logs_delete_own" ON public.nutrition_logs;

CREATE POLICY "nutrition_logs_select_own" ON public.nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_insert_own" ON public.nutrition_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_update_own" ON public.nutrition_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "nutrition_logs_delete_own" ON public.nutrition_logs
  FOR DELETE USING (auth.uid() = user_id);
