import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { MEAL_TYPES, MealType, PortionUnit, calculateNutritionForPortion } from '@/types/nutrition';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: meal, error } = await supabase
    .from('meals')
    .select(`
      *,
      items:meal_items(
        *,
        food:foods(*)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !meal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  if (meal.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(meal);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: existingMeal, error: fetchError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', params.id)
    .single();

  if (fetchError || !existingMeal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  if (existingMeal.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: {
    meal_type?: MealType;
    logged_at?: string;
    notes?: string;
    items?: Array<{ food_id: string; quantity: number; unit: PortionUnit }>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { meal_type, logged_at, notes, items } = body;

  if (meal_type && !MEAL_TYPES.includes(meal_type)) {
    return NextResponse.json(
      { error: `Invalid meal_type. Must be one of: ${MEAL_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // Update meal record
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (meal_type) updateData.meal_type = meal_type;
  if (logged_at) updateData.logged_at = logged_at;
  if (notes !== undefined) updateData.notes = notes;

  const { error: updateError } = await supabase
    .from('meals')
    .update(updateData)
    .eq('id', params.id);

  if (updateError) {
    console.error('Error updating meal:', updateError);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }

  // If items provided, replace all meal items
  if (items && Array.isArray(items)) {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('meal_items')
      .delete()
      .eq('meal_id', params.id);

    if (deleteError) {
      console.error('Error deleting meal items:', deleteError);
      return NextResponse.json({ error: 'Failed to update meal items' }, { status: 500 });
    }

    if (items.length > 0) {
      // Fetch food data
      const foodIds = items.map((item) => item.food_id);
      const { data: foods, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds);

      if (foodsError || !foods) {
        return NextResponse.json({ error: 'Failed to fetch food data' }, { status: 500 });
      }

      const foodMap = new Map(foods.map((f) => [f.id, f]));

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
          },
          item.quantity,
          item.unit
        );

        return {
          meal_id: params.id,
          food_id: item.food_id,
          quantity: item.quantity,
          unit: item.unit,
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
        };
      });

      const { error: insertError } = await supabase
        .from('meal_items')
        .insert(mealItemsToInsert);

      if (insertError) {
        console.error('Error inserting updated meal items:', insertError);
        return NextResponse.json({ error: 'Failed to insert updated meal items' }, { status: 500 });
      }
    }
  }

  // Fetch and return updated meal
  const { data: updatedMeal, error: refetchError } = await supabase
    .from('meals')
    .select(`
      *,
      items:meal_items(
        *,
        food:foods(*)
      )
    `)
    .eq('id', params.id)
    .single();

  if (refetchError || !updatedMeal) {
    return NextResponse.json({ error: 'Failed to fetch updated meal' }, { status: 500 });
  }

  return NextResponse.json(updatedMeal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: existingMeal, error: fetchError } = await supabase
    .from('meals')
    .select('id, user_id')
    .eq('id', params.id)
    .single();

  if (fetchError || !existingMeal) {
    return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
  }

  if (existingMeal.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from('meals')
    .delete()
    .eq('id', params.id);

  if (deleteError) {
    console.error('Error deleting meal:', deleteError);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
