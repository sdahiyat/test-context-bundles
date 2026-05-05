export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activity_level:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active'
    | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_type: 'weight_loss' | 'maintenance' | 'muscle_gain';
  target_weight_kg: number | null;
  daily_calories: number | null;
  daily_protein_g: number | null;
  daily_carbs_g: number | null;
  daily_fat_g: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ActivityLevel = UserProfile['activity_level'];
export type GoalType = Goal['goal_type'];

export interface ProfileWithGoal {
  profile: UserProfile;
  activeGoal: Goal | null;
}
