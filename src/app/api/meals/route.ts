import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { MEAL_TYPES, MealType, PortionUnit, calculateNutritionForPortion } from '@/types/nutrition';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  let query = supabase
    .from('meals')
    .select(`
      *,
      items:meal_items(
        *,
        food:foods(*)
      )
    `)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (date) {
    query = query.eq('logged_at', date);
  }

  const { data: meals, error } = await query;

  if (error) {
    console.error('Error fetching meals:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
  }

  return NextResponse.json(meals);
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    meal_type: MealType;
    logged_at?: string;
    notes?: string;
    items: Array<{ food_id: string; quantity: number; unit: PortionUnit }>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { meal_type, logged_at, notes, items } = body;

  if (!meal_type || !MEAL_TYPES.includes(meal_type)) {
    return NextResponse.json(
      { error: `Invalid meal_type. Must be one of: ${MEAL_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'At least one food item is required' }, { status: 400 });
  }

  // Fetch all foods for items
  const foodIds = items.map((item) => item.food_id);
  const { data: foods, error: foodsError } = await supabase
    .from('foods')
    .select('*')
    .in('id', foodIds);

  if (foodsError || !foods) {
    console.error('Error fetching foods:', foodsError);
    return NextResponse.json({ error: 'Failed to fetch food data' }, { status: 500 });
  }

  const foodMap = new Map(foods.map((f) => [f.id, f]));

  // Validate all food IDs exist
  for (const item of items) {
    if (!foodMap.has(item.food_id)) {
      return NextResponse.json(
        { error: `Food with id ${item.food_id} not found` },
        { status: 400 }
      );
    }
  }

  // Insert meal
  const mealDate = logged_at || new Date().toISOString().split('T')[0];

  const { data: meal, error: mealError } = await supabase
    .from('meals')
    .insert({
      user_id: session.user.id,
      meal_type,
      logged_at: mealDate,
      notes: notes || null,
    })
    .select()
    .single();

  if (mealError || !meal) {
    console.error('Error creating meal:', mealError);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }

  // Calculate nutrition and prepare meal items
  const mealItemsToInsert = items.map((item) => {
    const food = foodMap.get(item.food_id)!;
    const nutrition = calculateNutritionForPortion(
      {
        id: food.id,
        name: food.name,
        calories_per_100g: food.calories_per_100g,
        protein_per_100g: food.protein_per_100g || 0,
        carbs_per_100g: food.carbs_per_100g || 0,
        fat_per_100g: food.fat_per_100g || 0,
        serving_size_g: food.serving_size_g || 100,
        serving_unit: food.serving_unit || 'g',
        is_custom: food.is_custom || false,
        created_by: food.created_by,
      },
      item.quantity,
      item.unit
    );

    return {
      meal_id: meal.id,
      food_id: item.food_id,
      quantity: item.quantity,
      unit: item.unit,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
    };
  });

  const { data: insertedItems, error: itemsError } = await supabase
    .from('meal_items')
    .insert(mealItemsToInsert)
    .select(`
      *,
      food:foods(*)
    `);

  if (itemsError) {
    console.error('Error creating meal items:', itemsError);
    // Clean up the meal we created
    await supabase.from('meals').delete().eq('id', meal.id);
    return NextResponse.json({ error: 'Failed to create meal items' }, { status: 500 });
  }

  return NextResponse.json({ ...meal, items: insertedItems }, { status: 201 });
}
