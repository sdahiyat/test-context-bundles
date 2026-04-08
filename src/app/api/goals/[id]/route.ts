import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const VALID_GOAL_TYPES = ['weight_loss', 'maintenance', 'muscle_gain'] as const;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;
    const body = await req.json();

    // Verify ownership
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('id, user_id')
      .eq('id', goalId)
      .single();

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract updatable fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.goal_type !== undefined) {
      if (!VALID_GOAL_TYPES.includes(body.goal_type)) {
        return NextResponse.json(
          { error: `goal_type must be one of: ${VALID_GOAL_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.goal_type = body.goal_type;
    }

    if (body.target_weight_kg !== undefined) {
      updateData.target_weight_kg = body.target_weight_kg;
    }
    if (body.daily_calories !== undefined) {
      updateData.daily_calories = body.daily_calories;
    }
    if (body.daily_protein_g !== undefined) {
      updateData.daily_protein_g = body.daily_protein_g;
    }
    if (body.daily_carbs_g !== undefined) {
      updateData.daily_carbs_g = body.daily_carbs_g;
    }
    if (body.daily_fat_g !== undefined) {
      updateData.daily_fat_g = body.daily_fat_g;
    }

    const { data: updatedGoal, error: updateError } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedGoal);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goalId = params.id;

    // Verify ownership
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('id, user_id')
      .eq('id', goalId)
      .single();

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    if (existingGoal.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete — set is_active = false
    const { error: updateError } = await supabase
      .from('goals')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', goalId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
