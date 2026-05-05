export type GoalType =
    | 'lose_weight'
    | 'maintain_weight'
    | 'gain_weight'
    | 'build_muscle'
    | 'improve_health';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type ActivityLevel =
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    height_cm: number | null;
                    weight_kg: number | null;
                    date_of_birth: string | null;
                    gender: Gender | null;
                    activity_level: ActivityLevel | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    height_cm?: number | null;
                    weight_kg?: number | null;
                    date_of_birth?: string | null;
                    gender?: Gender | null;
                    activity_level?: ActivityLevel | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    height_cm?: number | null;
                    weight_kg?: number | null;
                    date_of_birth?: string | null;
                    gender?: Gender | null;
                    activity_level?: ActivityLevel | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            goals: {
                Row: {
                    id: string;
                    user_id: string;
                    goal_type: GoalType;
                    target_weight_kg: number | null;
                    target_calories: number;
                    target_protein_g: number | null;
                    target_carbs_g: number | null;
                    target_fat_g: number | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    goal_type: GoalType;
                    target_weight_kg?: number | null;
                    target_calories: number;
                    target_protein_g?: number | null;
                    target_carbs_g?: number | null;
                    target_fat_g?: number | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    goal_type?: GoalType;
                    target_weight_kg?: number | null;
                    target_calories?: number;
                    target_protein_g?: number | null;
                    target_carbs_g?: number | null;
                    target_fat_g?: number | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            foods: {
                Row: {
                    id: string;
                    name: string;
                    brand: string | null;
                    serving_size_g: number;
                    calories_per_serving: number;
                    protein_g: number;
                    carbs_g: number;
                    fat_g: number;
                    fiber_g: number | null;
                    sugar_g: number | null;
                    sodium_mg: number | null;
                    is_verified: boolean;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    brand?: string | null;
                    serving_size_g?: number;
                    calories_per_serving: number;
                    protein_g?: number;
                    carbs_g?: number;
                    fat_g?: number;
                    fiber_g?: number | null;
                    sugar_g?: number | null;
                    sodium_mg?: number | null;
                    is_verified?: boolean;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    brand?: string | null;
                    serving_size_g?: number;
                    calories_per_serving?: number;
                    protein_g?: number;
                    carbs_g?: number;
                    fat_g?: number;
                    fiber_g?: number | null;
                    sugar_g?: number | null;
                    sodium_mg?: number | null;
                    is_verified?: boolean;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            meals: {
                Row: {
                    id: string;
                    user_id: string;
                    logged_at: string;
                    meal_type: MealType;
                    notes: string | null;
                    image_url: string | null;
                    total_calories: number;
                    total_protein_g: number;
                    total_carbs_g: number;
                    total_fat_g: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    logged_at?: string;
                    meal_type: MealType;
                    notes?: string | null;
                    image_url?: string | null;
                    total_calories?: number;
                    total_protein_g?: number;
                    total_carbs_g?: number;
                    total_fat_g?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    logged_at?: string;
                    meal_type?: MealType;
                    notes?: string | null;
                    image_url?: string | null;
                    total_calories?: number;
                    total_protein_g?: number;
                    total_carbs_g?: number;
                    total_fat_g?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            meal_items: {
                Row: {
                    id: string;
                    meal_id: string;
                    food_id: string | null;
                    food_name: string;
                    serving_size_g: number;
                    quantity: number;
                    calories: number;
                    protein_g: number;
                    carbs_g: number;
                    fat_g: number;
                    fiber_g: number | null;
                    sugar_g: number | null;
                    sodium_mg: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    meal_id: string;
                    food_id?: string | null;
                    food_name: string;
                    serving_size_g: number;
                    quantity?: number;
                    calories: number;
                    protein_g?: number;
                    carbs_g?: number;
                    fat_g?: number;
                    fiber_g?: number | null;
                    sugar_g?: number | null;
                    sodium_mg?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    meal_id?: string;
                    food_id?: string | null;
                    food_name?: string;
                    serving_size_g?: number;
                    quantity?: number;
                    calories?: number;
                    protein_g?: number;
                    carbs_g?: number;
                    fat_g?: number;
                    fiber_g?: number | null;
                    sugar_g?: number | null;
                    sodium_mg?: number | null;
                    created_at?: string;
                };
            };
            nutrition_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    log_date: string;
                    total_calories: number;
                    total_protein_g: number;
                    total_carbs_g: number;
                    total_fat_g: number;
                    total_fiber_g: number | null;
                    total_sugar_g: number | null;
                    total_sodium_mg: number | null;
                    meal_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    log_date: string;
                    total_calories?: number;
                    total_protein_g?: number;
                    total_carbs_g?: number;
                    total_fat_g?: number;
                    total_fiber_g?: number | null;
                    total_sugar_g?: number | null;
                    total_sodium_mg?: number | null;
                    meal_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    log_date?: string;
                    total_calories?: number;
                    total_protein_g?: number;
                    total_carbs_g?: number;
                    total_fat_g?: number;
                    total_fiber_g?: number | null;
                    total_sugar_g?: number | null;
                    total_sodium_mg?: number | null;
                    meal_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
    };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Food = Database['public']['Tables']['foods']['Row'];
export type Meal = Database['public']['Tables']['meals']['Row'];
export type MealItem = Database['public']['Tables']['meal_items']['Row'];
export type NutritionLog = Database['public']['Tables']['nutrition_logs']['Row'];

export type InsertUser = Database['public']['Tables']['users']['Insert'];
export type InsertGoal = Database['public']['Tables']['goals']['Insert'];
export type InsertFood = Database['public']['Tables']['foods']['Insert'];
export type InsertMeal = Database['public']['Tables']['meals']['Insert'];
export type InsertMealItem = Database['public']['Tables']['meal_items']['Insert'];
export type InsertNutritionLog = Database['public']['Tables']['nutrition_logs']['Insert'];

export type UpdateUser = Database['public']['Tables']['users']['Update'];
export type UpdateGoal = Database['public']['Tables']['goals']['Update'];
export type UpdateFood = Database['public']['Tables']['foods']['Update'];
export type UpdateMeal = Database['public']['Tables']['meals']['Update'];
export type UpdateMealItem = Database['public']['Tables']['meal_items']['Update'];
export type UpdateNutritionLog = Database['public']['Tables']['nutrition_logs']['Update'];

export type MealWithItems = Meal & { meal_items: MealItem[] };
