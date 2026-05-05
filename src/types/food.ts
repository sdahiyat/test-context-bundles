// ─── Core Food Types ──────────────────────────────────────────────────────────

export interface Food {
  id: string;
  name: string;
  brand?: string | null;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number | null;
  serving_size_g: number;
  serving_size_label: string;
  is_custom: boolean;
  created_by?: string | null;
  created_at: string;
}

export interface NutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface FoodWithNutrition extends Food {
  /** Nutrition values calculated for the requested portion */
  calculated_calories: number;
  calculated_protein: number;
  calculated_carbs: number;
  calculated_fat: number;
  calculated_fiber?: number;
}

export interface FoodSearchResult extends Food {
  match_score?: number;
}

export interface RecentFood {
  food: Food;
  last_logged_at: string;
  log_count: number;
}

export interface CreateFoodInput {
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  serving_size_g?: number;
  serving_size_label?: string;
}

// ─── Flat shapes returned by API endpoints ────────────────────────────────────

export type RecentFoodFlat = Food & {
  last_logged_at: string;
};

export type FrequentFoodFlat = Food & {
  log_count: number;
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculate nutrition values for a given quantity of a food.
 * @param food     Food object with per-100g macros
 * @param quantity_g  Weight in grams to calculate for
 */
export function calculateNutrition(food: Food, quantity_g: number): NutritionValues {
  const ratio = quantity_g / 100;
  return {
    calories: Math.round(food.calories_per_100g * ratio * 10) / 10,
    protein: Math.round(food.protein_per_100g * ratio * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * ratio * 10) / 10,
    fat: Math.round(food.fat_per_100g * ratio * 10) / 10,
    ...(food.fiber_per_100g != null
      ? { fiber: Math.round(food.fiber_per_100g * ratio * 10) / 10 }
      : {}),
  };
}

/**
 * Enrich a Food object with calculated nutrition for a given portion.
 */
export function toFoodWithNutrition(food: Food, quantity_g: number): FoodWithNutrition {
  const nutrition = calculateNutrition(food, quantity_g);
  return {
    ...food,
    calculated_calories: nutrition.calories,
    calculated_protein: nutrition.protein,
    calculated_carbs: nutrition.carbs,
    calculated_fat: nutrition.fat,
    ...(nutrition.fiber != null ? { calculated_fiber: nutrition.fiber } : {}),
  };
}
