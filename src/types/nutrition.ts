export interface RecognizedFood {
  id: string
  name: string
  portion: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  confidence: number
}

export interface PhotoRecognitionResult {
  foods: RecognizedFood[]
  rawResponse: string
  imageUrl: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export interface NutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Food {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  serving_size?: number
  serving_unit?: string
  verified?: boolean
}

export interface Meal {
  id: string
  user_id: string
  meal_type: MealType
  logged_at: string
  image_url?: string
  source?: string
  notes?: string
}

export interface MealItem {
  id: string
  meal_id: string
  food_id: string
  quantity: number
  unit: string
  calories_calculated?: number
  protein_calculated?: number
  carbs_calculated?: number
  fat_calculated?: number
}

export interface MealTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export const PORTION_UNITS = ['g', 'oz', 'cup', 'serving', 'ml', 'tbsp', 'tsp'] as const
export type PortionUnit = (typeof PORTION_UNITS)[number]

export const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  oz: 28.3495,
  cup: 240,
  serving: 100,
  ml: 1,
  tbsp: 15,
  tsp: 5,
}
