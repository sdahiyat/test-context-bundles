import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const adminClient = createAdminClient()

    // Step 1: Delete meal_items for this user's meals
    const { error: mealItemsError } = await adminClient
      .from('meal_items')
      .delete()
      .in(
        'meal_id',
        adminClient.from('meals').select('id').eq('user_id', userId)
      )

    if (mealItemsError) {
      console.error('Error deleting meal_items:', mealItemsError)
      // Continue with deletion even if this fails (meals may not exist)
    }

    // Step 2: Delete meals
    const { error: mealsError } = await adminClient
      .from('meals')
      .delete()
      .eq('user_id', userId)

    if (mealsError) {
      console.error('Error deleting meals:', mealsError)
    }

    // Step 3: Delete user_settings
    const { error: settingsError } = await adminClient
      .from('user_settings')
      .delete()
      .eq('user_id', userId)

    if (settingsError) {
      console.error('Error deleting user_settings:', settingsError)
    }

    // Step 4: Delete user profile (try common table names from Task 3)
    const { error: profileError } = await adminClient
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      // Also try 'profiles' table name
      await adminClient
        .from('profiles')
        .delete()
        .eq('user_id', userId)
    }

    // Step 5: Delete the auth user (must be last)
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 })
  } catch (err) {
    console.error('Account deletion route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
