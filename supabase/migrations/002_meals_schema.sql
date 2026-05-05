-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meal_items table
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',
  calories NUMERIC NOT NULL,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;

-- Meals policies
CREATE POLICY "Users can select own meals"
  ON meals FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  USING (user_id = auth.uid());

-- Meal items policies (join to meals for ownership check)
CREATE POLICY "Users can select own meal items"
  ON meal_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal items"
  ON meal_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own meal items"
  ON meal_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal items"
  ON meal_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
        AND meals.user_id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_food_id ON meal_items(food_id);
