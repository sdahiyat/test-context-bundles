import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);
    const limit = parseInt(searchParams.get('limit') || '200', 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('weight_logs')
      .select('id, weight_kg, logged_at')
      .eq('user_id', session.user.id)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching weight logs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Normalize to YYYY-MM-DD date strings
    const normalized = (data || []).map((entry) => ({
      id: entry.id,
      weight_kg: entry.weight_kg,
      date: new Date(entry.logged_at).toISOString().split('T')[0],
      logged_at: entry.logged_at,
    }));

    return NextResponse.json({ data: normalized });
  } catch (err) {
    console.error('Unexpected error in GET /api/weight:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weight_kg, logged_at } = body;

    if (!weight_kg || typeof weight_kg !== 'number' || weight_kg <= 0) {
      return NextResponse.json({ error: 'Invalid weight_kg value' }, { status: 400 });
    }

    if (weight_kg < 20 || weight_kg > 500) {
      return NextResponse.json(
        { error: 'Weight must be between 20 and 500 kg' },
        { status: 400 }
      );
    }

    const loggedAt = logged_at ? new Date(logged_at).toISOString() : new Date().toISOString();

    // Upsert: if a log already exists for this user on this UTC date, update it
    const { data, error } = await supabase
      .from('weight_logs')
      .upsert(
        {
          user_id: session.user.id,
          weight_kg: Math.round(weight_kg * 100) / 100,
          logged_at: loggedAt,
        },
        {
          onConflict: 'user_id,logged_at',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation by doing an explicit update
      if (error.code === '23505') {
        const dateStr = new Date(loggedAt).toISOString().split('T')[0];
        const { data: updateData, error: updateError } = await supabase
          .from('weight_logs')
          .update({ weight_kg: Math.round(weight_kg * 100) / 100, logged_at: loggedAt })
          .eq('user_id', session.user.id)
          .gte('logged_at', `${dateStr}T00:00:00.000Z`)
          .lt('logged_at', `${dateStr}T23:59:59.999Z`)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating weight log:', updateError);
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ data: updateData }, { status: 200 });
      }

      console.error('Error inserting weight log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in POST /api/weight:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
