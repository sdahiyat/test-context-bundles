import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { UserProfile } from '@/types/profile';

const VALID_ACTIVITY_LEVELS = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'extremely_active',
] as const;

const VALID_GENDERS = ['male', 'female', 'other'] as const;

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate and extract allowed fields
    const allowedFields: Partial<UserProfile> = {};

    if (body.full_name !== undefined) {
      if (typeof body.full_name !== 'string' && body.full_name !== null) {
        return NextResponse.json({ error: 'full_name must be a string or null' }, { status: 400 });
      }
      allowedFields.full_name = body.full_name;
    }

    if (body.weight_kg !== undefined) {
      if (body.weight_kg !== null && typeof body.weight_kg !== 'number') {
        return NextResponse.json({ error: 'weight_kg must be a number or null' }, { status: 400 });
      }
      allowedFields.weight_kg = body.weight_kg;
    }

    if (body.height_cm !== undefined) {
      if (body.height_cm !== null && typeof body.height_cm !== 'number') {
        return NextResponse.json({ error: 'height_cm must be a number or null' }, { status: 400 });
      }
      allowedFields.height_cm = body.height_cm;
    }

    if (body.age !== undefined) {
      if (body.age !== null && typeof body.age !== 'number') {
        return NextResponse.json({ error: 'age must be a number or null' }, { status: 400 });
      }
      allowedFields.age = body.age;
    }

    if (body.gender !== undefined) {
      if (body.gender !== null && !VALID_GENDERS.includes(body.gender)) {
        return NextResponse.json(
          { error: `gender must be one of: ${VALID_GENDERS.join(', ')}` },
          { status: 400 }
        );
      }
      allowedFields.gender = body.gender;
    }

    if (body.activity_level !== undefined) {
      if (body.activity_level !== null && !VALID_ACTIVITY_LEVELS.includes(body.activity_level)) {
        return NextResponse.json(
          { error: `activity_level must be one of: ${VALID_ACTIVITY_LEVELS.join(', ')}` },
          { status: 400 }
        );
      }
      allowedFields.activity_level = body.activity_level;
    }

    const upsertData = {
      id: user.id,
      email: user.email ?? '',
      ...allowedFields,
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .upsert(upsertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
