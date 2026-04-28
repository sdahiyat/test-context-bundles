-- Migration 003: Database Functions and Triggers
-- Stored functions for automation and data consistency

-- ============================================================
-- FUNCTION: handle_new_user
-- Fires after a new auth.users row is created.
-- Auto-creates the corresponding public.users profile row.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists before recreating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: recalculate_meal_totals
-- Recomputes and persists aggregated nutrition totals for a
-- given meal by summing all its meal_items.
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_meal_totals(meal_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.meals
  SET
    total_calories  = (SELECT COALESCE(SUM(calories),  0) FROM public.meal_items WHERE meal_id = meal_uuid),
    total_protein_g = (SELECT COALESCE(SUM(protein_g), 0) FROM public.meal_items WHERE meal_id = meal_uuid),
    total_carbs_g   = (SELECT COALESCE(SUM(carbs_g),   0) FROM public.meal_items WHERE meal_id = meal_uuid),
    total_fat_g     = (SELECT COALESCE(SUM(fat_g),     0) FROM public.meal_items WHERE meal_id = meal_uuid),
    updated_at      = NOW()
  WHERE id = meal_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: upsert_nutrition_log
-- Rebuilds (or inserts) the daily nutrition_logs aggregate row
-- for a given user and date, derived from meals + meal_items.
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_nutrition_log(p_user_id UUID, p_log_date DATE)
RETURNS VOID AS $$
DECLARE
  v_totals RECORD;
BEGIN
  SELECT
    COALESCE(SUM(mi.calories),         0) AS calories,
    COALESCE(SUM(mi.protein_g),        0) AS protein,
    COALESCE(SUM(mi.carbs_g),          0) AS carbs,
    COALESCE(SUM(mi.fat_g),            0) AS fat,
    COALESCE(SUM(mi.fiber_g),          0) AS fiber,
    COALESCE(SUM(mi.sugar_g),          0) AS sugar,
    COALESCE(SUM(mi.sodium_mg),        0) AS sodium,
    COUNT(DISTINCT m.id)                  AS meal_count
  INTO v_totals
  FROM public.meals m
  JOIN public.meal_items mi ON mi.meal_id = m.id
  WHERE m.user_id  = p_user_id
    AND m.log_date = p_log_date;

  INSERT INTO public.nutrition_logs (
    user_id,
    log_date,
    total_calories,
    total_protein_g,
    total_carbs_g,
    total_fat_g,
    total_fiber_g,
    total_sugar_g,
    total_sodium_mg,
    meal_count
  ) VALUES (
    p_user_id,
    p_log_date,
    v_totals.calories,
    v_totals.protein,
    v_totals.carbs,
    v_totals.fat,
    v_totals.fiber,
    v_totals.sugar,
    v_totals.sodium,
    v_totals.meal_count
  )
  ON CONFLICT (user_id, log_date) DO UPDATE SET
    total_calories  = EXCLUDED.total_calories,
    total_protein_g = EXCLUDED.total_protein_g,
    total_carbs_g   = EXCLUDED.total_carbs_g,
    total_fat_g     = EXCLUDED.total_fat_g,
    total_fiber_g   = EXCLUDED.total_fiber_g,
    total_sugar_g   = EXCLUDED.total_sugar_g,
    total_sodium_mg = EXCLUDED.total_sodium_mg,
    meal_count      = EXCLUDED.meal_count,
    updated_at      = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: trigger_update_meal_and_log
-- Fires after any INSERT, UPDATE, or DELETE on meal_items.
-- Keeps meal totals and the daily nutrition_log in sync.
-- ============================================================
CREATE OR REPLACE FUNCTION public.trigger_update_meal_and_log()
RETURNS TRIGGER AS $$
DECLARE
  v_meal_id  UUID;
  v_user_id  UUID;
  v_log_date DATE;
BEGIN
  -- Use NEW for INSERT/UPDATE, OLD for DELETE
  v_meal_id := COALESCE(NEW.meal_id, OLD.meal_id);

  SELECT user_id, log_date
  INTO   v_user_id, v_log_date
  FROM   public.meals
  WHERE  id = v_meal_id;

  PERFORM public.recalculate_meal_totals(v_meal_id);
  PERFORM public.upsert_nutrition_log(v_user_id, v_log_date);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists before recreating
DROP TRIGGER IF EXISTS on_meal_item_change ON public.meal_items;

CREATE TRIGGER on_meal_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.meal_items
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_meal_and_log();
