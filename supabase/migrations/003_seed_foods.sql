-- Seed common foods (skip if already seeded via Task 4)
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, serving_size_g, serving_unit, is_custom)
VALUES
  -- Proteins
  ('Chicken Breast', 165, 31, 0, 3.6, 100, 'g', false),
  ('Salmon', 208, 20, 0, 13, 100, 'g', false),
  ('Eggs', 155, 13, 1.1, 11, 50, 'g', false),
  ('Ground Beef 80/20', 254, 17, 0, 20, 100, 'g', false),
  ('Tofu', 76, 8, 1.9, 4.8, 100, 'g', false),
  ('Turkey Breast', 135, 30, 0, 1, 100, 'g', false),
  ('Tuna (canned)', 116, 26, 0, 1, 85, 'g', false),
  ('Shrimp', 99, 24, 0.2, 0.3, 100, 'g', false),
  ('Cod', 82, 18, 0, 0.7, 100, 'g', false),
  ('Pork Tenderloin', 143, 26, 0, 3.5, 100, 'g', false),

  -- Grains
  ('White Rice (cooked)', 130, 2.7, 28, 0.3, 100, 'g', false),
  ('Brown Rice (cooked)', 123, 2.7, 26, 1, 100, 'g', false),
  ('Oats', 389, 17, 66, 7, 40, 'g', false),
  ('White Bread', 265, 9, 49, 3.2, 30, 'g', false),
  ('Whole Wheat Bread', 247, 13, 41, 4.2, 30, 'g', false),
  ('Pasta (cooked)', 131, 5, 25, 1.1, 100, 'g', false),
  ('Quinoa (cooked)', 120, 4.4, 21, 1.9, 100, 'g', false),
  ('Bagel', 245, 10, 48, 1.5, 98, 'g', false),
  ('Tortilla (flour)', 312, 8.3, 52, 7.3, 45, 'g', false),
  ('Granola', 471, 10, 64, 20, 50, 'g', false),

  -- Dairy
  ('Whole Milk', 61, 3.2, 4.8, 3.3, 240, 'ml', false),
  ('Greek Yogurt (plain)', 59, 10, 3.6, 0.4, 170, 'g', false),
  ('Cheddar Cheese', 403, 25, 1.3, 33, 28, 'g', false),
  ('Cottage Cheese', 98, 11, 3.4, 4.3, 100, 'g', false),
  ('Butter', 717, 0.9, 0.1, 81, 14, 'g', false),
  ('Mozzarella', 280, 28, 2.2, 17, 28, 'g', false),

  -- Fruits
  ('Banana', 89, 1.1, 23, 0.3, 118, 'g', false),
  ('Apple', 52, 0.3, 14, 0.2, 182, 'g', false),
  ('Blueberries', 57, 0.7, 14, 0.3, 148, 'g', false),
  ('Strawberries', 32, 0.7, 7.7, 0.3, 100, 'g', false),
  ('Orange', 47, 0.9, 12, 0.1, 131, 'g', false),
  ('Avocado', 160, 2, 9, 15, 150, 'g', false),
  ('Grapes', 69, 0.7, 18, 0.2, 100, 'g', false),

  -- Vegetables
  ('Broccoli', 34, 2.8, 7, 0.4, 91, 'g', false),
  ('Spinach', 23, 2.9, 3.6, 0.4, 30, 'g', false),
  ('Sweet Potato', 86, 1.6, 20, 0.1, 130, 'g', false),
  ('Mixed Salad Greens', 17, 1.5, 2.9, 0.2, 85, 'g', false),
  ('Carrots', 41, 0.9, 10, 0.2, 61, 'g', false),
  ('Bell Pepper', 31, 1, 6, 0.3, 119, 'g', false),
  ('Cucumber', 15, 0.7, 3.6, 0.1, 100, 'g', false),
  ('Tomato', 18, 0.9, 3.9, 0.2, 123, 'g', false),

  -- Legumes
  ('Black Beans (cooked)', 132, 8.9, 24, 0.5, 172, 'g', false),
  ('Lentils (cooked)', 116, 9, 20, 0.4, 198, 'g', false),
  ('Chickpeas (cooked)', 164, 8.9, 27, 2.6, 164, 'g', false),

  -- Fats & Nuts
  ('Almonds', 579, 21, 22, 50, 28, 'g', false),
  ('Peanut Butter', 588, 25, 20, 50, 32, 'g', false),
  ('Olive Oil', 884, 0, 0, 100, 14, 'ml', false),
  ('Walnuts', 654, 15, 14, 65, 28, 'g', false),

  -- Common Meals / Other
  ('Pizza (cheese)', 266, 11, 33, 10, 107, 'g', false),
  ('Protein Bar', 370, 30, 35, 10, 60, 'g', false)

ON CONFLICT (name) DO NOTHING;
