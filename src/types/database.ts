// ============================================================
// NutriTrack Database Types
// Auto-matched to the Supabase schema defined in
// supabase/migrations/001_initial_schema.sql
// ============================================================

export type Database = {
  public: {
    Tables: {
      // ── users ──────────────────────────────────────────────
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          height_cm: number | null
          weight_kg: number | null
          activity_level:
            | 'sedentary'
            | 'lightly_active'
            | 'moderately_active'
            | 'very_active'
            | 'extra_active'
            | null
          created_at: string
          updated_at: string
        }
        Insert: {
          /** Must match the auth.users id */
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?:
            | 'sedentary'
            | 'lightly_active'
            | 'moderately_active'
            | 'very_active'
            | 'extra_active'
            | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?:
            | 'sedentary'
            | 'lightly_active'
            | 'moderately_active'
            | 'very_active'
            | 'extra_active'
            | null
          created_at?: string
          updated_at?: string
        }
      }

      // ── goals ──────────────────────────────────────────────
      goals: {
        Row: {
          id: string
          user_id: string
          goal_type: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain'
          target_weight_kg: number | null
          target_calories: number
          protein_target_g: number | null
          carbs_target_g: number | null
          fat_target_g: number | null
          is_active: boolean
          start_date: string
          target_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_type: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain'
          target_weight_kg?: number | null
          target_calories: number
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          is_active?: boolean
          start_date?: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_type?: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain'
          target_weight_kg?: number | null
          target_calories?: number
          protein_target_g?: number | null
          carbs_target_g?: number | null
          fat_target_g?: number | null
          is_active?: boolean
          start_date?: string
          target_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ── foods ──────────────────────────────────────────────
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          serving_size_g: number
          serving_description: string | null
          calories_per_serving: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          is_verified: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          serving_size_g: number
          serving_description?: string | null
          calories_per_serving: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_verified?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          serving_size_g?: number
          serving_description?: string | null
          calories_per_serving?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_verified?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ── meals ──────────────────────────────────────────────
      meals: {
        Row: {
          id: string
          user_id: string
          name: string | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at: string
          image_url: string | null
          ai_generated: boolean
          notes: string | null
          total_calories: number
          total_protein_g: number
          total_carbs_g: number
          total_fat_g: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at?: string
          image_url?: string | null
          ai_generated?: boolean
          notes?: string | null
          total_calories?: number
          total_protein_g?: number
          total_carbs_g?: number
          total_fat_g?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          logged_at?: string
          image_url?: string | null
          ai_generated?: boolean
          notes?: string | null
          total_calories?: number
          total_protein_g?: number
          total_carbs_g?: number
          total_fat_g?: number
          created_at?: string
          updated_at?: string
        }
      }

      // ── meal_items ─────────────────────────────────────────
      meal_items: {
        Row: {
          id: string
          meal_id: string
          food_id: string | null
          food_name: string
          quantity: number
          serving_size_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_id?: string | null
          food_name: string
          quantity?: number
          serving_size_g: number
          calories: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_id?: string | null
          food_name?: string
          quantity?: number
          serving_size_g?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          created_at?: string
        }
      }

      // ── nutrition_logs ─────────────────────────────────────
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          total_calories: number
          total_protein_g: number
          total_carbs_g: number
          total_fat_g: number
          water_ml: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          total_calories?: number
          total_protein_g?: number
          total_carbs_g?: number
          total_fat_g?: number
          water_ml?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          total_calories?: number
          total_protein_g?: number
          total_carbs_g?: number
          total_fat_g?: number
          water_ml?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }

    Functions: {
      calculate_meal_totals: {
        Args: { meal_id_param: string }
        Returns: void
      }
      upsert_nutrition_log: {
        Args: { p_user_id: string; p_log_date: string }
        Returns: void
      }
    }
  }
}

// ============================================================
// Convenience Row Types
// ============================================================
export type UserRow = Database['public']['Tables']['users']['Row']
export type GoalRow = Database['public']['Tables']['goals']['Row']
export type FoodRow = Database['public']['Tables']['foods']['Row']
export type MealRow = Database['public']['Tables']['meals']['Row']
export type MealItemRow = Database['public']['Tables']['meal_items']['Row']
export type NutritionLogRow = Database['public']['Tables']['nutrition_logs']['Row']

// ============================================================
// Convenience Insert Types
// ============================================================
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type GoalInsert = Database['public']['Tables']['goals']['Insert']
export type FoodInsert = Database['public']['Tables']['foods']['Insert']
export type MealInsert = Database['public']['Tables']['meals']['Insert']
export type MealItemInsert = Database['public']['Tables']['meal_items']['Insert']
export type NutritionLogInsert = Database['public']['Tables']['nutrition_logs']['Insert']

// ============================================================
// Convenience Update Types
// ============================================================
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type GoalUpdate = Database['public']['Tables']['goals']['Update']
export type FoodUpdate = Database['public']['Tables']['foods']['Update']
export type MealUpdate = Database['public']['Tables']['meals']['Update']
export type MealItemUpdate = Database['public']['Tables']['meal_items']['Update']
export type NutritionLogUpdate = Database['public']['Tables']['nutrition_logs']['Update']
