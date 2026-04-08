export interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  serving_size_g: number;
  serving_unit: string;
  is_custom: boolean;
  created_by?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  meal_id: string;
  food_id: string;
  food?: Food;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: MealType;
  logged_at: string;
  notes?: string;
  items?: MealItem[];
  created_at: string;
  updated_at: string;
}

export interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type PortionUnit = 'g' | 'oz' | 'cup' | 'serving';

export const PORTION_UNITS: PortionUnit[] = ['g', 'oz', 'cup', 'serving'];

export const UNIT_TO_GRAMS: Record<PortionUnit, number | null> = {
  g: 1,
  oz: 28.35,
  cup: 240,
  serving: null, // uses food's serving_size_g
};

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface PendingMealItem {
  food: Food;
  quantity: number;
  unit: PortionUnit;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateNutritionForPortion(
  food: Food,
  quantity: number,
  unit: PortionUnit
): MealTotals {
  let grams: number;
  if (unit === 'serving') {
    grams = quantity * (food.serving_size_g || 100);
  } else {
    const conversionFactor = UNIT_TO_GRAMS[unit];
    grams = quantity * (conversionFactor ?? 1);
  }

  const factor = grams / 100;
  return {
    calories: Math.round(food.calories_per_100g * factor * 10) / 10,
    protein: Math.round((food.protein_per_100g || 0) * factor * 10) / 10,
    carbs: Math.round((food.carbs_per_100g || 0) * factor * 10) / 10,
    fat: Math.round((food.fat_per_100g || 0) * factor * 10) / 10,
  };
}

export function getMealTotals(items: MealItem[] | PendingMealItem[]): MealTotals {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
