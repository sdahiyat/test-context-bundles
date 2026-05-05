import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA');
}

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createRouteHandlerClient<any>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayDateString();

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      );
    }

    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: meals, error } = await supabase
      .from('meals')
      .select(
        `id, meal_type, logged_at, meal_items(id, quantity, unit, custom_calories, foods(id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g))`
      )
      .eq('user_id', session.user.id)
      .gte('logged_at', startOfDay)
      .lte('logged_at', endOfDay)
      .order('logged_at', { ascending: true });

    if (error) {
      // If the table doesn't exist yet, return empty results gracefully
      if (
        error.code === '42P01' ||
        error.message?.includes('does not exist')
      ) {
        return NextResponse.json({ meals: [], date });
      }
      console.error('Dashboard summary error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meals' },
        { status: 500 }
      );
    }

    return NextResponse.json({ meals: meals || [], date });
  } catch (err) {
    console.error('Unexpected error in dashboard summary:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
