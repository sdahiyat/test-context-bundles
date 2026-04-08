export interface UserProfileForCalc {
  weight_kg: number;
  height_cm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity_level:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active';
}

export interface CalorieTargets {
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fat_g: number;
}

export const ACTIVITY_MULTIPLIERS: Record<
  UserProfileForCalc['activity_level'],
  number
> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 */
export function calculateBMR(profile: UserProfileForCalc): number {
  const { weight_kg, height_cm, age, gender } = profile;
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  if (gender === 'male') {
    return base + 5;
  } else if (gender === 'female') {
    return base - 161;
  } else {
    // 'other' — use average of male and female formulas
    return base + (5 + -161) / 2; // base - 78
  }
}

/**
 * Calculates Total Daily Energy Expenditure = BMR × activity multiplier.
 */
export function calculateTDEE(profile: UserProfileForCalc): number {
  return calculateBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activity_level];
}

/**
 * Calculates suggested daily calorie and macro targets based on
 * user profile and goal type.
 */
export function calculateSuggestedTargets(
  profile: UserProfileForCalc,
  goalType: 'weight_loss' | 'maintenance' | 'muscle_gain'
): CalorieTargets {
  const tdee = calculateTDEE(profile);

  let daily_calories: number;
  let proteinMultiplier: number;

  switch (goalType) {
    case 'weight_loss':
      daily_calories = tdee - 500;
      proteinMultiplier = 2.2;
      break;
    case 'muscle_gain':
      daily_calories = tdee + 300;
      proteinMultiplier = 2.4;
      break;
    case 'maintenance':
    default:
      daily_calories = tdee;
      proteinMultiplier = 1.8;
      break;
  }

  // Ensure calories don't go below a safe minimum
  daily_calories = Math.max(daily_calories, 1200);

  const daily_protein_g = Math.round(profile.weight_kg * proteinMultiplier);
  const proteinCalories = daily_protein_g * 4;

  const daily_fat_g = Math.round((daily_calories * 0.25) / 9);
  const fatCalories = daily_fat_g * 9;

  const remainingCalories = daily_calories - proteinCalories - fatCalories;
  const daily_carbs_g = Math.round(remainingCalories / 4);

  return {
    daily_calories: Math.round(daily_calories),
    daily_protein_g,
    daily_carbs_g: Math.max(daily_carbs_g, 0),
    daily_fat_g,
  };
}
