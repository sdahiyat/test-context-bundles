-- Foods seed data for NutriTrack
-- Run this after the initial schema migration
-- Uses ON CONFLICT DO NOTHING for idempotency

INSERT INTO foods (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_size_g, serving_size_label, is_custom) VALUES

-- PROTEINS
('Chicken Breast', NULL, 165, 31.0, 0.0, 3.6, 0.0, 100, '100g', false),
('Chicken Thigh', NULL, 209, 26.0, 0.0, 11.0, 0.0, 100, '100g', false),
('Salmon', NULL, 208, 20.0, 0.0, 13.0, 0.0, 100, '100g', false),
('Tuna (Canned in Water)', NULL, 116, 26.0, 0.0, 1.0, 0.0, 85, '1 can (85g)', false),
('Ground Beef (80% Lean)', NULL, 215, 26.0, 0.0, 13.0, 0.0, 100, '100g', false),
('Ground Turkey', NULL, 149, 19.0, 0.0, 8.0, 0.0, 100, '100g', false),
('Whole Eggs', NULL, 155, 13.0, 1.1, 11.0, 0.0, 50, '1 large egg', false),
('Egg Whites', NULL, 52, 11.0, 0.7, 0.2, 0.0, 100, '100g', false),
('Greek Yogurt (Plain)', NULL, 59, 10.0, 3.6, 0.4, 0.0, 170, '6 oz', false),
('Cottage Cheese', NULL, 98, 11.0, 3.4, 4.3, 0.0, 113, '1/2 cup', false),
('Tofu (Firm)', NULL, 76, 8.0, 1.9, 4.8, 0.3, 100, '100g', false),
('Shrimp', NULL, 99, 24.0, 0.2, 0.3, 0.0, 100, '100g', false),
('Tilapia', NULL, 96, 20.0, 0.0, 2.0, 0.0, 100, '100g', false),
('Cod', NULL, 82, 18.0, 0.0, 0.7, 0.0, 100, '100g', false),
('Pork Tenderloin', NULL, 143, 26.0, 0.0, 4.0, 0.0, 100, '100g', false),
('Turkey Breast', NULL, 135, 30.0, 0.0, 1.0, 0.0, 100, '100g', false),
('Tempeh', NULL, 193, 19.0, 9.0, 11.0, 0.0, 100, '100g', false),
('Edamame', NULL, 121, 11.0, 9.0, 5.0, 5.0, 100, '100g', false),
('Whey Protein Powder', NULL, 400, 80.0, 8.0, 8.0, 0.0, 30, '1 scoop (30g)', false),
('Plant Protein Powder', NULL, 370, 72.0, 12.0, 6.0, 4.0, 30, '1 scoop (30g)', false),

-- CARBOHYDRATES / GRAINS
('White Rice (Cooked)', NULL, 130, 2.7, 28.0, 0.3, 0.4, 186, '1 cup cooked', false),
('Brown Rice (Cooked)', NULL, 123, 2.7, 26.0, 1.0, 1.8, 195, '1 cup cooked', false),
('Rolled Oats (Dry)', NULL, 389, 17.0, 66.0, 7.0, 10.0, 40, '1/2 cup dry', false),
('Whole Wheat Bread', NULL, 247, 13.0, 41.0, 4.2, 7.0, 28, '1 slice', false),
('White Bread', NULL, 265, 9.0, 49.0, 3.2, 2.7, 28, '1 slice', false),
('Sweet Potato', NULL, 86, 1.6, 20.0, 0.1, 3.0, 130, '1 medium', false),
('White Potato', NULL, 77, 2.0, 17.0, 0.1, 2.2, 150, '1 medium', false),
('Pasta (Cooked)', NULL, 158, 5.8, 31.0, 0.9, 1.8, 140, '1 cup cooked', false),
('Whole Wheat Pasta (Cooked)', NULL, 124, 5.4, 27.0, 0.5, 4.5, 140, '1 cup cooked', false),
('Quinoa (Cooked)', NULL, 120, 4.4, 21.0, 1.9, 2.8, 185, '1 cup cooked', false),
('Bread (Sourdough)', NULL, 274, 9.5, 52.0, 1.6, 2.4, 56, '2 slices', false),
('Tortilla (Flour)', NULL, 312, 8.0, 52.0, 7.0, 2.0, 45, '1 medium', false),
('Tortilla (Corn)', NULL, 218, 5.7, 45.0, 3.0, 6.0, 26, '1 small', false),
('Granola', NULL, 471, 8.0, 64.0, 20.0, 4.0, 45, '1/2 cup', false),
('Cereal (Bran Flakes)', NULL, 340, 10.0, 74.0, 2.0, 13.0, 30, '3/4 cup', false),

-- FRUITS
('Banana', NULL, 89, 1.1, 23.0, 0.3, 2.6, 118, '1 medium', false),
('Apple', NULL, 52, 0.3, 14.0, 0.2, 2.4, 182, '1 medium', false),
('Orange', NULL, 47, 0.9, 12.0, 0.1, 2.4, 131, '1 medium', false),
('Blueberries', NULL, 57, 0.7, 14.0, 0.3, 2.4, 148, '1 cup', false),
('Strawberries', NULL, 32, 0.7, 7.7, 0.3, 2.0, 152, '1 cup', false),
('Mango', NULL, 60, 0.8, 15.0, 0.4, 1.6, 165, '1 cup chunks', false),
('Grapes', NULL, 69, 0.7, 18.0, 0.2, 0.9, 92, '1/2 cup', false),
('Pineapple', NULL, 50, 0.5, 13.0, 0.1, 1.4, 165, '1 cup chunks', false),
('Avocado', NULL, 160, 2.0, 9.0, 15.0, 6.7, 201, '1 whole', false),
('Watermelon', NULL, 30, 0.6, 7.6, 0.2, 0.4, 280, '2 cups', false),

-- VEGETABLES
('Broccoli', NULL, 34, 2.8, 7.0, 0.4, 2.6, 91, '1 cup', false),
('Spinach (Raw)', NULL, 23, 2.9, 3.6, 0.4, 2.2, 30, '1 cup', false),
('Kale (Raw)', NULL, 49, 4.3, 9.0, 0.9, 3.6, 67, '1 cup', false),
('Carrot', NULL, 41, 0.9, 10.0, 0.2, 2.8, 61, '1 medium', false),
('Cucumber', NULL, 15, 0.7, 3.6, 0.1, 0.5, 119, '1/2 medium', false),
('Tomato', NULL, 18, 0.9, 3.9, 0.2, 1.2, 123, '1 medium', false),
('Bell Pepper (Red)', NULL, 31, 1.0, 6.0, 0.3, 2.1, 119, '1 medium', false),
('Romaine Lettuce', NULL, 15, 1.4, 2.9, 0.2, 2.1, 85, '2 cups', false),
('Zucchini', NULL, 17, 1.2, 3.1, 0.3, 1.0, 196, '1 medium', false),
('Mushrooms (White)', NULL, 22, 3.1, 3.3, 0.3, 1.0, 70, '1 cup sliced', false),
('Onion', NULL, 40, 1.1, 9.3, 0.1, 1.7, 110, '1 medium', false),
('Garlic', NULL, 149, 6.4, 33.0, 0.5, 2.1, 3, '1 clove', false),
('Cauliflower', NULL, 25, 1.9, 5.0, 0.3, 2.0, 107, '1 cup', false),
('Green Beans', NULL, 31, 1.8, 7.0, 0.2, 2.7, 110, '1 cup', false),
('Asparagus', NULL, 20, 2.2, 3.9, 0.2, 2.1, 134, '1 cup', false),
('Celery', NULL, 16, 0.7, 3.0, 0.2, 1.6, 101, '1 cup', false),
('Brussels Sprouts', NULL, 43, 3.4, 9.0, 0.3, 3.8, 88, '1 cup', false),

-- DAIRY & EGGS
('Cheddar Cheese', NULL, 402, 25.0, 1.3, 33.0, 0.0, 28, '1 oz', false),
('Mozzarella Cheese', NULL, 280, 28.0, 2.2, 17.0, 0.0, 28, '1 oz', false),
('Parmesan Cheese', NULL, 431, 38.0, 4.1, 29.0, 0.0, 15, '2 tbsp', false),
('Whole Milk', NULL, 61, 3.2, 4.8, 3.3, 0.0, 244, '1 cup', false),
('Skim Milk', NULL, 34, 3.4, 5.0, 0.2, 0.0, 244, '1 cup', false),
('Butter', NULL, 717, 0.9, 0.1, 81.0, 0.0, 14, '1 tbsp', false),
('Heavy Cream', NULL, 345, 2.1, 2.9, 37.0, 0.0, 15, '1 tbsp', false),

-- FATS / OILS / NUTS
('Olive Oil', NULL, 884, 0.0, 0.0, 100.0, 0.0, 14, '1 tbsp', false),
('Coconut Oil', NULL, 862, 0.0, 0.0, 100.0, 0.0, 14, '1 tbsp', false),
('Almonds', NULL, 579, 21.0, 22.0, 50.0, 12.5, 28, '1 oz (~23 almonds)', false),
('Walnuts', NULL, 654, 15.0, 14.0, 65.0, 6.7, 28, '1 oz (~14 halves)', false),
('Cashews', NULL, 553, 18.0, 30.0, 44.0, 3.3, 28, '1 oz', false),
('Peanuts', NULL, 567, 26.0, 16.0, 49.0, 8.5, 28, '1 oz', false),
('Peanut Butter', NULL, 588, 25.0, 20.0, 50.0, 6.0, 32, '2 tbsp', false),
('Almond Butter', NULL, 614, 21.0, 19.0, 56.0, 10.0, 32, '2 tbsp', false),
('Sunflower Seeds', NULL, 584, 21.0, 20.0, 51.0, 8.6, 28, '1 oz', false),
('Chia Seeds', NULL, 486, 17.0, 42.0, 31.0, 34.4, 28, '2 tbsp', false),
('Flaxseeds', NULL, 534, 18.0, 29.0, 42.0, 27.3, 14, '2 tbsp', false),

-- LEGUMES
('Black Beans (Cooked)', NULL, 132, 8.9, 24.0, 0.5, 8.7, 172, '1 cup', false),
('Chickpeas (Cooked)', NULL, 164, 8.9, 27.0, 2.6, 7.6, 164, '1 cup', false),
('Lentils (Cooked)', NULL, 116, 9.0, 20.0, 0.4, 7.9, 198, '1 cup', false),
('Kidney Beans (Cooked)', NULL, 127, 8.7, 23.0, 0.5, 7.4, 177, '1 cup', false),
('Hummus', NULL, 166, 8.0, 14.0, 10.0, 6.0, 60, '1/4 cup', false),

-- SNACKS & OTHER
('Dark Chocolate (70%)', NULL, 598, 8.0, 46.0, 43.0, 10.9, 40, '4 squares', false),
('Rice Cakes (Plain)', NULL, 387, 8.0, 81.0, 3.0, 1.5, 9, '1 cake', false),
('Granola Bar', NULL, 471, 8.0, 64.0, 20.0, 4.0, 47, '1 bar', false),
('Protein Bar', NULL, 350, 20.0, 40.0, 10.0, 5.0, 60, '1 bar', false),
('Popcorn (Air-Popped)', NULL, 387, 13.0, 78.0, 4.5, 14.5, 28, '3 cups', false),
('Pretzels', NULL, 380, 9.0, 80.0, 3.0, 2.9, 28, '1 oz', false),
('Tortilla Chips', NULL, 489, 7.0, 64.0, 23.0, 4.4, 28, '1 oz (~10 chips)', false),

-- BEVERAGES / SAUCES / CONDIMENTS
('Orange Juice', NULL, 45, 0.7, 10.0, 0.2, 0.2, 240, '1 cup', false),
('Almond Milk (Unsweetened)', NULL, 17, 0.6, 0.3, 1.4, 0.5, 240, '1 cup', false),
('Oat Milk', NULL, 45, 1.0, 6.3, 1.5, 0.8, 240, '1 cup', false),
('Ketchup', NULL, 112, 1.9, 27.0, 0.1, 0.3, 17, '1 tbsp', false),
('Mayonnaise', NULL, 680, 1.0, 0.6, 75.0, 0.0, 14, '1 tbsp', false),
('Soy Sauce', NULL, 53, 8.1, 4.9, 0.1, 0.8, 16, '1 tbsp', false),
('Hot Sauce', NULL, 24, 1.2, 4.0, 0.4, 0.0, 5, '1 tsp', false),

-- FAST FOOD / PREPARED (approximate)
('Scrambled Eggs (2 large)', NULL, 149, 10.0, 1.6, 11.0, 0.0, 96, '2 eggs scrambled', false),
('Beef Steak (Sirloin)', NULL, 271, 26.0, 0.0, 18.0, 0.0, 100, '100g', false),
('Bacon (Cooked)', NULL, 541, 37.0, 1.4, 42.0, 0.0, 19, '2 slices', false),
('Ham (Sliced)', NULL, 145, 21.0, 1.5, 6.0, 0.0, 56, '2 oz', false),
('Pepperoni', NULL, 494, 21.0, 1.8, 45.0, 0.0, 28, '1 oz', false)

ON CONFLICT DO NOTHING;
