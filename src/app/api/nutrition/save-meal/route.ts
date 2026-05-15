import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { RecognizedFood, MealType } from '@/types/nutrition'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      mealType,
      foods,
      imageUrl,
      loggedAt,
    }: {
      userId: string
      mealType: MealType
      foods: RecognizedFood[]
      imageUrl: string
      loggedAt?: string
    } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    if (!mealType) {
      return NextResponse.json({ success: false, error: 'mealType is required' }, { status: 400 })
    }

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return NextResponse.json({ success: false, error: 'foods array is required and must not be empty' }, { status: 400 })
    }

    // 1. Insert the meal
    const { data: mealData, error: mealError } = await supabaseAdmin
      .from('meals')
      .insert({
        user_id: userId,
        meal_type: mealType,
        image_url: imageUrl || null,
        logged_at: loggedAt || new Date().toISOString(),
        source: 'ai_photo',
      })
      .select('id')
      .single()

    if (mealError) {
      console.error('Error inserting meal:', mealError)
      return NextResponse.json(
        { success: false, error: `Failed to create meal: ${mealError.message}` },
        { status: 500 }
      )
    }

    const mealId = mealData.id

    // 2. For each food, find or create in foods table, then insert meal_item
    for (const food of foods) {
      // Check if food exists by name (case-insensitive)
      const { data: existingFood } = await supabaseAdmin
        .from('foods')
        .select('id')
        .ilike('name', food.name)
        .limit(1)
        .single()

      let foodId: string

      if (existingFood) {
        foodId = existingFood.id
      } else {
        // Calculate nutrition per 100g based on the portion provided
        const portionInGrams = convertToGrams(food.portion, food.unit)
        const factor = portionInGrams > 0 ? 100 / portionInGrams : 1

        const { data: newFood, error: foodError } = await supabaseAdmin
          .from('foods')
          .insert({
            name: food.name,
            calories_per_100g: Math.round(food.calories * factor),
            protein_per_100g: Math.round(food.protein * factor * 10) / 10,
            carbs_per_100g: Math.round(food.carbs * factor * 10) / 10,
            fat_per_100g: Math.round(food.fat * factor * 10) / 10,
            serving_size: food.portion,
            serving_unit: food.unit,
            verified: false,
          })
          .select('id')
          .single()

        if (foodError) {
          console.error('Error inserting food:', foodError)
          // Continue with a placeholder - don't fail the whole meal
          foodId = '00000000-0000-0000-0000-000000000000'
        } else {
          foodId = newFood.id
        }
      }

      // Insert meal_item
      const { error: itemError } = await supabaseAdmin.from('meal_items').insert({
        meal_id: mealId,
        food_id: foodId,
        quantity: food.portion,
        unit: food.unit,
        calories_calculated: food.calories,
        protein_calculated: food.protein,
        carbs_calculated: food.carbs,
        fat_calculated: food.fat,
      })

      if (itemError) {
        console.error('Error inserting meal_item:', itemError)
        // Continue with other items
      }
    }

    // 3. Calculate totals for the meal
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)
    const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0)
    const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0)
    const totalFat = foods.reduce((sum, f) => sum + f.fat, 0)

    // 4. Upsert nutrition_logs for the day
    const logDate = loggedAt
      ? new Date(loggedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    const { data: existingLog } = await supabaseAdmin
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', logDate)
      .single()

    if (existingLog) {
      await supabaseAdmin
        .from('nutrition_logs')
        .update({
          total_calories: (existingLog.total_calories || 0) + Math.round(totalCalories),
          total_protein: (existingLog.total_protein || 0) + Math.round(totalProtein * 10) / 10,
          total_carbs: (existingLog.total_carbs || 0) + Math.round(totalCarbs * 10) / 10,
          total_fat: (existingLog.total_fat || 0) + Math.round(totalFat * 10) / 10,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('log_date', logDate)
    } else {
      await supabaseAdmin.from('nutrition_logs').insert({
        user_id: userId,
        log_date: logDate,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein * 10) / 10,
        total_carbs: Math.round(totalCarbs * 10) / 10,
        total_fat: Math.round(totalFat * 10) / 10,
      })
    }

    return NextResponse.json({
      success: true,
      mealId,
    })
  } catch (error: any) {
    console.error('Error saving meal:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to save meal. Please try again.',
      },
      { status: 500 }
    )
  }
}

function convertToGrams(portion: number, unit: string): number {
  const unitLower = unit.toLowerCase()
  const conversions: Record<string, number> = {
    grams: 1,
    gram: 1,
    g: 1,
    oz: 28.3495,
    ounce: 28.3495,
    ounces: 28.3495,
    cups: 240,
    cup: 240,
    serving: 100,
    servings: 100,
    ml: 1,
    milliliter: 1,
    milliliters: 1,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    piece: 100,
    pieces: 100,
    slice: 50,
    slices: 50,
  }
  return portion * (conversions[unitLower] || 100)
}
