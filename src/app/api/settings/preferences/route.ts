import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ALLOWED_FIELDS = [
  'weight_unit',
  'calorie_display',
  'theme',
  'meal_reminders',
  'daily_summary',
  'reminder_time',
] as const

type AllowedField = typeof ALLOWED_FIELDS[number]

export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Filter to only allowed fields
    const safeBody: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        safeBody[field as AllowedField] = body[field]
      }
    }

    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: session.user.id,
          ...safeBody,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving preferences:', error)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('Preferences route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null }, { status: 200 })
  } catch (err) {
    console.error('Preferences GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
