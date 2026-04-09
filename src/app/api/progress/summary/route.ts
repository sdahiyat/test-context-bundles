import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Conversion constants matching Task 5 patterns
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  oz: 28.3495,
  cup: 240,
  serving: 100,
};

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function calculateNutrition(
  quantity: number,
  unit: string,
  food: {
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fat_per_100g: number;
  }
): DailyTotals {
  const gramsMultiplier = (UNIT_TO_GRAMS[unit] || 1) * quantity;
  const factor = gramsMultiplier / 100;
  return {
    calories: (food.calories_per_100g || 0) * factor,
    protein: (food.protein_per_100g || 0) * factor,
    carbs: (food.carbs_per_100g || 0) * factor,
    fat: (food.fat_per_100g || 0) * factor,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get('days') || '30', 10);
    const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch user goals
    const { data: goalsData } = await supabase
      .from('goals')
      .select('daily_calories, daily_protein_g, daily_carbs_g, daily_fat_g, target_weight_kg')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Fetch meal items joined with meals and foods
    const { data: mealItemsData, error: mealError } = await supabase
      .from('meal_items')
      .select(
        `
        id,
        quantity,
        unit,
        meals!inner (
          id,
          user_id,
          logged_at
        ),
        foods (
          id,
          calories_per_100g,
          protein_per_100g,
          carbs_per_100g,
          fat_per_100g
        )
      `
      )
      .eq('meals.user_id', session.user.id)
      .gte('meals.logged_at', startDate.toISOString())
      .order('meals.logged_at', { ascending: true });

    if (mealError) {
      console.error('Error fetching meal items:', mealError);
      // Return empty data rather than error to avoid breaking the UI
    }

    // Aggregate by date
    const dailyMap: Record<string, DailyTotals> = {};

    // Pre-populate all dates in range with zeros for continuous chart
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    (mealItemsData || []).forEach((item: any) => {
      const meal = item.meals;
      const food = item.foods;
      if (!meal || !food) return;

      const dateStr = new Date(meal.logged_at).toISOString().split('T')[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }

      const nutrition = calculateNutrition(item.quantity || 1, item.unit || 'g', food);
      dailyMap[dateStr].calories += nutrition.calories;
      dailyMap[dateStr].protein += nutrition.protein;
      dailyMap[dateStr].carbs += nutrition.carbs;
      dailyMap[dateStr].fat += nutrition.fat;
    });

    // Build sorted series arrays
    const sortedDates = Object.keys(dailyMap).sort();

    const calorieSeries = sortedDates.map((date) => ({
      date,
      calories: Math.round(dailyMap[date].calories),
    }));

    const macroSeries = sortedDates.map((date) => ({
      date,
      protein: Math.round(dailyMap[date].protein * 10) / 10,
      carbs: Math.round(dailyMap[date].carbs * 10) / 10,
      fat: Math.round(dailyMap[date].fat * 10) / 10,
    }));

    // Calculate streak: consecutive days from today backwards with calories > 0
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    const reversedDates = [...sortedDates].reverse();

    // Start from today or yesterday if today has no data yet
    let checkIndex = reversedDates.findIndex((d) => d <= today);
    if (checkIndex === -1) checkIndex = 0;

    for (let i = checkIndex; i < reversedDates.length; i++) {
      const date = reversedDates[i];
      if (dailyMap[date] && dailyMap[date].calories > 0) {
        streak++;
      } else {
        // Allow today to have no data without breaking streak
        if (date === today && streak === 0) {
          continue;
        }
        break;
      }
    }

    // Calculate weekly averages (only for days with data)
    const daysWithData = sortedDates.filter((d) => dailyMap[d].calories > 0);
    const weeklyAverages = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };

    if (daysWithData.length > 0) {
      const totalCalories = daysWithData.reduce((sum, d) => sum + dailyMap[d].calories, 0);
      const totalProtein = daysWithData.reduce((sum, d) => sum + dailyMap[d].protein, 0);
      const totalCarbs = daysWithData.reduce((sum, d) => sum + dailyMap[d].carbs, 0);
      const totalFat = daysWithData.reduce((sum, d) => sum + dailyMap[d].fat, 0);
      const count = daysWithData.length;

      weeklyAverages.calories = Math.round(totalCalories / count);
      weeklyAverages.protein = Math.round((totalProtein / count) * 10) / 10;
      weeklyAverages.carbs = Math.round((totalCarbs / count) * 10) / 10;
      weeklyAverages.fat = Math.round((totalFat / count) * 10) / 10;
    }

    return NextResponse.json({
      calorieSeries,
      macroSeries,
      streak,
      weeklyAverages,
      goalCalories: goalsData?.daily_calories || 2000,
      goalProtein: goalsData?.daily_protein_g || 150,
      goalCarbs: goalsData?.daily_carbs_g || 250,
      goalFat: goalsData?.daily_fat_g || 65,
      goalWeight: goalsData?.target_weight_kg || null,
    });
  } catch (err) {
    console.error('Unexpected error in GET /api/progress/summary:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
