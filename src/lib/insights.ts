import { SupabaseClient } from '@supabase/supabase-js';
import { openai } from '@/lib/openai';

export interface InsightPattern {
  type: string;
  description: string;
  severity: 'positive' | 'warning' | 'info';
}

export interface InsightSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InsightResult {
  id: string;
  summary: string;
  patterns: InsightPattern[];
  suggestions: InsightSuggestion[];
  generatedAt: string;
  periodDays: number;
}

interface MealItem {
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food_name?: string;
}

interface MealWithItems {
  id: string;
  meal_type: string;
  logged_at: string;
  items: MealItem[];
}

interface UserGoals {
  goal_type: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
}

interface DailyTotals {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealTypes: string[];
}

function buildNutritionPrompt(meals: MealWithItems[], userGoals: UserGoals | null, days: number): string {
  if (meals.length === 0) {
    return `The user has not logged any meals yet. Please provide a friendly introductory message encouraging them to start logging meals, with a brief explanation of how tracking helps. Return JSON with summary, empty patterns array, and 2-3 beginner suggestions.`;
  }

  // Group meals by date and calculate daily totals
  const dailyMap: Record<string, DailyTotals> = {};

  for (const meal of meals) {
    const date = meal.logged_at.split('T')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0, mealTypes: [] };
    }
    const day = dailyMap[date];
    day.mealTypes.push(meal.meal_type);
    for (const item of meal.items) {
      day.calories += item.calories || 0;
      day.protein += item.protein || 0;
      day.carbs += item.carbs || 0;
      day.fat += item.fat || 0;
    }
  }

  const dailyTotals = Object.values(dailyMap);
  const numDays = dailyTotals.length;

  const avgCalories = Math.round(dailyTotals.reduce((s, d) => s + d.calories, 0) / numDays);
  const avgProtein = Math.round(dailyTotals.reduce((s, d) => s + d.protein, 0) / numDays);
  const avgCarbs = Math.round(dailyTotals.reduce((s, d) => s + d.carbs, 0) / numDays);
  const avgFat = Math.round(dailyTotals.reduce((s, d) => s + d.fat, 0) / numDays);

  const skippedBreakfasts = dailyTotals.filter(d => !d.mealTypes.includes('breakfast')).length;
  const mealFrequency = dailyTotals.map(d => d.mealTypes.length);
  const avgMealsPerDay = (mealFrequency.reduce((s, n) => s + n, 0) / numDays).toFixed(1);

  const goalsText = userGoals
    ? `
User Goals:
- Goal type: ${userGoals.goal_type}
- Daily calorie target: ${userGoals.daily_calories} kcal
- Daily protein target: ${userGoals.daily_protein}g
- Daily carbs target: ${userGoals.daily_carbs}g
- Daily fat target: ${userGoals.daily_fat}g`
    : 'No specific goals set yet.';

  return `You are a nutrition coach AI. Analyze the following meal history data and provide personalized insights.

Analysis Period: Last ${days} days (${numDays} days with logged meals)

Daily Averages:
- Calories: ${avgCalories} kcal/day
- Protein: ${avgProtein}g/day
- Carbohydrates: ${avgCarbs}g/day
- Fat: ${avgFat}g/day
- Average meals per day: ${avgMealsPerDay}
- Days breakfast was skipped: ${skippedBreakfasts} out of ${numDays}
${goalsText}

Daily breakdown (last ${Math.min(7, numDays)} days):
${dailyTotals.slice(-7).map(d => `- ${d.date}: ${Math.round(d.calories)} kcal, ${Math.round(d.protein)}g protein, ${Math.round(d.carbs)}g carbs, ${Math.round(d.fat)}g fat, meals: ${d.mealTypes.join(', ')}`).join('\n')}

Please respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "summary": "2-3 sentence personalized summary of the user's nutrition patterns",
  "patterns": [
    {
      "type": "pattern category (e.g., protein_intake, meal_timing, calorie_balance)",
      "description": "specific observation about the pattern",
      "severity": "positive|warning|info"
    }
  ],
  "suggestions": [
    {
      "title": "short actionable title",
      "description": "specific actionable advice",
      "priority": "high|medium|low"
    }
  ]
}

Include 3-5 patterns and 3-4 suggestions. Be specific and actionable based on the actual data.`;
}

export async function getMealHistoryForInsights(
  userId: string,
  days: number,
  supabaseClient: SupabaseClient
): Promise<MealWithItems[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const { data: meals, error } = await supabaseClient
      .from('meals')
      .select(`
        id,
        meal_type,
        logged_at,
        meal_items (
          quantity,
          unit,
          foods (
            name,
            calories_per_100g,
            protein_per_100g,
            carbs_per_100g,
            fat_per_100g
          )
        )
      `)
      .eq('user_id', userId)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Error fetching meal history:', error);
      return [];
    }

    if (!meals) return [];

    // Transform the data into our expected format
    const mealsWithItems: MealWithItems[] = meals.map((meal: any) => ({
      id: meal.id,
      meal_type: meal.meal_type,
      logged_at: meal.logged_at,
      items: (meal.meal_items || []).map((item: any) => {
        const food = item.foods;
        const quantityIn100g = (item.quantity || 100) / 100;
        return {
          quantity: item.quantity,
          unit: item.unit,
          food_name: food?.name || 'Unknown food',
          calories: Math.round((food?.calories_per_100g || 0) * quantityIn100g),
          protein: Math.round((food?.protein_per_100g || 0) * quantityIn100g * 10) / 10,
          carbs: Math.round((food?.carbs_per_100g || 0) * quantityIn100g * 10) / 10,
          fat: Math.round((food?.fat_per_100g || 0) * quantityIn100g * 10) / 10,
        };
      }),
    }));

    return mealsWithItems;
  } catch (err) {
    console.error('Unexpected error fetching meal history:', err);
    return [];
  }
}

export function canRegenerateInsights(lastGeneratedAt: string | null): boolean {
  if (!lastGeneratedAt) return true;
  const last = new Date(lastGeneratedAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  return hoursDiff >= 6;
}

export async function generateInsights(
  userId: string,
  supabaseClient: SupabaseClient
): Promise<InsightResult> {
  const periodDays = 30;

  // Fetch meal history
  const meals = await getMealHistoryForInsights(userId, periodDays, supabaseClient);

  // Fetch user goals
  let userGoals: UserGoals | null = null;
  try {
    const { data: goals } = await supabaseClient
      .from('goals')
      .select('goal_type, daily_calories, daily_protein, daily_carbs, daily_fat')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (goals) {
      userGoals = goals as UserGoals;
    }
  } catch {
    // Goals not found, continue without them
  }

  const prompt = buildNutritionPrompt(meals, userGoals, periodDays);

  const fallbackInsight: InsightResult = {
    id: '',
    summary: 'We encountered an issue generating your personalized insights. Please try again later.',
    patterns: [
      {
        type: 'system',
        description: 'Unable to analyze patterns at this time.',
        severity: 'info',
      },
    ],
    suggestions: [
      {
        title: 'Keep logging meals',
        description: 'Continue logging your meals daily for the best insights.',
        priority: 'medium',
      },
    ],
    generatedAt: new Date().toISOString(),
    periodDays,
  };

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1500,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful nutrition coach. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallbackInsight;
    }

    // Clean up potential markdown code blocks
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleaned);

    return {
      id: '',
      summary: parsed.summary || 'No summary available.',
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      generatedAt: new Date().toISOString(),
      periodDays,
    };
  } catch (err) {
    console.error('Error generating insights:', err);
    return fallbackInsight;
  }
}
