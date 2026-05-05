import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = Math.min(parseInt(limitParam ?? '20', 10) || 20, 20);

  // Get the session token from the Authorization header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Try to get user from cookie-based session
  let userId: string | null = null;

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id ?? null;
  } else {
    // Try to get from the anon client session (server-side cookie won't work here directly,
    // but we attempt via auth header pattern)
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data, error } = await admin.rpc('get_recent_foods', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) {
      console.error('[foods/recent] RPC error:', error);
      // Fall back to a direct query if RPC function doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await admin
        .from('meal_items')
        .select(`
          food_id,
          meals!inner(user_id, logged_at),
          foods(*)
        `)
        .eq('meals.user_id', userId)
        .order('meals(logged_at)', { ascending: false })
        .limit(limit * 3); // fetch more to deduplicate

      if (fallbackError) {
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      return NextResponse.json({ foods: fallbackData ?? [] });
    }

    return NextResponse.json({ foods: data ?? [] });
  } catch (err) {
    console.error('[foods/recent] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
