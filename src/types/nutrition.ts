export interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface MealItem {
  id: string;
  quantity: number;
  unit: string;
  custom_calories: number | null;
  foods: FoodItem;
}

export interface MealWithItems {
  id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  meal_items: MealItem[];
}

export interface UserGoals {
  daily_calories: number | null;
  daily_protein: number | null;
  daily_carbs: number | null;
  daily_fat: number | null;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
}

function getGramsFromUnit(quantity: number, unit: string): number {
  const unitLower = unit.toLowerCase();
  switch (unitLower) {
    case 'g':
    case 'grams':
    case 'gram':
      return quantity;
    case 'oz':
    case 'ounce':
    case 'ounces':
      return quantity * 28.35;
    case 'serving':
    case 'servings':
      return quantity * 100;
    case 'cup':
    case 'cups':
      return quantity * 240;
    default:
      return quantity;
  }
}

export function calculateMealNutrition(meal: MealWithItems): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const item of meal.meal_items) {
    const grams = getGramsFromUnit(item.quantity, item.unit);
    const factor = grams / 100;

    if (item.custom_calories !== null && item.custom_calories !== undefined) {
      calories += item.custom_calories;
    } else {
      calories += item.foods.calories_per_100g * factor;
    }

    protein += item.foods.protein_per_100g * factor;
    carbs += item.foods.carbs_per_100g * factor;
    fat += item.foods.fat_per_100g * factor;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}

export function calculateDailyTotals(meals: MealWithItems[]): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const meal of meals) {
    const nutrition = calculateMealNutrition(meal);
    calories += nutrition.calories;
    protein += nutrition.protein;
    carbs += nutrition.carbs;
    fat += nutrition.fat;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
  };
}
