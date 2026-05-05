import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Food ID is required' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('foods')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[foods/[id]] Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[foods/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
