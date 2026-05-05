import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { Food } from '@/types/food';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const limitParam = searchParams.get('limit');
  const includeCustomParam = searchParams.get('include_custom');

  // Validate query param
  if (!q || q.trim() === '') {
    return NextResponse.json(
      { error: 'Query parameter "q" is required and cannot be empty' },
      { status: 400 }
    );
  }

  const searchQuery = q.trim();
  const limit = Math.min(parseInt(limitParam ?? '20', 10) || 20, 50);
  const includeCustom = includeCustomParam !== 'false';

  try {
    const admin = createAdminClient();

    let query = admin
      .from('foods')
      .select('*')
      .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
      .limit(limit);

    if (!includeCustom) {
      query = query.eq('is_custom', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[foods/search] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Sort results: exact name match → starts with → contains
    const lowerQuery = searchQuery.toLowerCase();
    const sorted = (data as Food[]).sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const scoreA =
        aName === lowerQuery ? 0 : aName.startsWith(lowerQuery) ? 1 : 2;
      const scoreB =
        bName === lowerQuery ? 0 : bName.startsWith(lowerQuery) ? 1 : 2;

      if (scoreA !== scoreB) return scoreA - scoreB;
      return aName.localeCompare(bName);
    });

    return NextResponse.json({ foods: sorted, total: sorted.length });
  } catch (err) {
    console.error('[foods/search] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
