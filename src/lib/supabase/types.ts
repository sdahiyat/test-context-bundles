export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level:
            | 'sedentary'
            | 'lightly_active'
            | 'moderately_active'
            | 'very_active'
            | 'super_active'
            | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'created_at' | 'updated_at'
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      goals: {
        Row: {
          id: string;
          user_id: string;
          goal_type:
            | 'lose_weight'
            | 'maintain_weight'
            | 'gain_weight'
            | 'build_muscle'
            | 'improve_health';
          target_weight_kg: number | null;
          target_calories: number;
          target_protein_g: number | null;
          target_carbs_g: number | null;
          target_fat_g: number | null;
          is_active: boolean;
          start_date: string;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['goals']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };

      foods: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          barcode: string | null;
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
        Insert: Omit<
          Database['public']['Tables']['foods']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['foods']['Insert']>;
      };

      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          logged_at: string;
          log_date: string;
          notes: string | null;
          image_url: string | null;
          total_calories: number;
          total_protein_g: number;
          total_carbs_g: number;
          total_fat_g: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['meals']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['meals']['Insert']>;
      };

      meal_items: {
        Row: {
          id: string;
          meal_id: string;
          food_id: string;
          quantity: number;
          serving_size_g: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number | null;
          sugar_g: number | null;
          sodium_mg: number | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['meal_items']['Row'],
          'id' | 'created_at'
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['meal_items']['Insert']>;
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
          total_fiber_g: number;
          total_sugar_g: number;
          total_sodium_mg: number;
          meal_count: number;
          water_ml: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['nutrition_logs']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['nutrition_logs']['Insert']
        >;
      };
    };

    Functions: {
      recalculate_meal_totals: {
        Args: { meal_uuid: string };
        Returns: void;
      };
      upsert_nutrition_log: {
        Args: { p_user_id: string; p_log_date: string };
        Returns: void;
      };
    };
  };
}

// ---------------------------------------------------------------------------
// Convenience row types — use these throughout the app instead of the
// verbose Database['public']['Tables'][...]['Row'] pattern.
// ---------------------------------------------------------------------------
export type UserRow =
  Database['public']['Tables']['users']['Row'];
export type GoalRow =
  Database['public']['Tables']['goals']['Row'];
export type FoodRow =
  Database['public']['Tables']['foods']['Row'];
export type MealRow =
  Database['public']['Tables']['meals']['Row'];
export type MealItemRow =
  Database['public']['Tables']['meal_items']['Row'];
export type NutritionLogRow =
  Database['public']['Tables']['nutrition_logs']['Row'];

// Insert types
export type UserInsert =
  Database['public']['Tables']['users']['Insert'];
export type GoalInsert =
  Database['public']['Tables']['goals']['Insert'];
export type FoodInsert =
  Database['public']['Tables']['foods']['Insert'];
export type MealInsert =
  Database['public']['Tables']['meals']['Insert'];
export type MealItemInsert =
  Database['public']['Tables']['meal_items']['Insert'];
export type NutritionLogInsert =
  Database['public']['Tables']['nutrition_logs']['Insert'];

// Update types
export type UserUpdate =
  Database['public']['Tables']['users']['Update'];
export type GoalUpdate =
  Database['public']['Tables']['goals']['Update'];
export type FoodUpdate =
  Database['public']['Tables']['foods']['Update'];
export type MealUpdate =
  Database['public']['Tables']['meals']['Update'];
export type MealItemUpdate =
  Database['public']['Tables']['meal_items']['Update'];
export type NutritionLogUpdate =
  Database['public']['Tables']['nutrition_logs']['Update'];
