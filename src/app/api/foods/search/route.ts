import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (!q.trim()) {
    // Return recent foods for user
    const { data: recentItems, error } = await supabase
      .from('meal_items')
      .select(`
        food_id,
        created_at,
        food:foods(*)
      `)
      .eq('meals.user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Fallback: return popular foods
      const { data: popularFoods, error: fallbackError } = await supabase
        .from('foods')
        .select('*')
        .eq('is_custom', false)
        .order('name', { ascending: true })
        .limit(10);

      if (fallbackError) {
        return NextResponse.json({ error: 'Failed to fetch foods' }, { status: 500 });
      }

      return NextResponse.json(popularFoods || []);
    }

    // Deduplicate by food_id
    const seen = new Set<string>();
    const uniqueFoods: unknown[] = [];
    for (const item of recentItems || []) {
      if (item.food_id && !seen.has(item.food_id)) {
        seen.add(item.food_id);
        if (item.food) {
          uniqueFoods.push(item.food);
        }
        if (uniqueFoods.length >= 10) break;
      }
    }

    if (uniqueFoods.length === 0) {
      // No recent foods, return default list
      const { data: defaultFoods } = await supabase
        .from('foods')
        .select('*')
        .eq('is_custom', false)
        .order('name', { ascending: true })
        .limit(10);

      return NextResponse.json(defaultFoods || []);
    }

    return NextResponse.json(uniqueFoods);
  }

  // Search by name
  const { data: foods, error } = await supabase
    .from('foods')
    .select('*')
    .ilike('name', `%${q}%`)
    .order('is_custom', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error searching foods:', error);
    return NextResponse.json({ error: 'Failed to search foods' }, { status: 500 });
  }

  return NextResponse.json(foods || []);
}
