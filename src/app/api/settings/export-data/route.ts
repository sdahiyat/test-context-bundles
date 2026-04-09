import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Query meal history with joined food data
    // Table names match Task 4 (foods) and Task 5 (meals, meal_items) schema
    const { data: rows, error } = await supabase
      .from('meal_items')
      .select(`
        quantity,
        unit,
        meals!inner (
          meal_type,
          logged_at,
          notes,
          user_id
        ),
        foods!inner (
          name,
          calories,
          protein,
          carbs,
          fat
        )
      `)
      .eq('meals.user_id', session.user.id)
      .order('meals.logged_at', { ascending: false })

    if (error) {
      console.error('Export query error:', error)
      // Return empty CSV rather than error for better UX
    }

    const csvRows: string[] = []

    // Header row
    csvRows.push([
      'date',
      'meal_type',
      'food_name',
      'quantity',
      'unit',
      'calories',
      'protein_g',
      'carbs_g',
      'fat_g',
      'notes',
    ].join(','))

    // Data rows
    if (rows && rows.length > 0) {
      for (const item of rows) {
        const meal = item.meals as {
          meal_type: string
          logged_at: string
          notes: string | null
          user_id: string
        }
        const food = item.foods as {
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
        }

        const date = meal.logged_at
          ? new Date(meal.logged_at).toISOString().split('T')[0]
          : ''

        const escapeCsv = (val: string | number | null | undefined): string => {
          if (val === null || val === undefined) return ''
          const str = String(val)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }

        csvRows.push([
          escapeCsv(date),
          escapeCsv(meal.meal_type),
          escapeCsv(food.name),
          escapeCsv(item.quantity),
          escapeCsv(item.unit),
          escapeCsv(food.calories),
          escapeCsv(food.protein),
          escapeCsv(food.carbs),
          escapeCsv(food.fat),
          escapeCsv(meal.notes),
        ].join(','))
      }
    }

    const csvContent = csvRows.join('\n')

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=nutritrack-meals.csv',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Export data route error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
