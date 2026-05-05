import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, supabase } from '@/lib/supabase';
import { CreateFoodInput } from '@/types/food';

export async function POST(request: NextRequest) {
  // Authenticate user
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    userId = user?.id ?? null;
  } else {
    const { data: { session } } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse body
  let body: Partial<CreateFoodInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  const errors: Record<string, string> = {};

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.name = 'Name is required';
  }

  const numericFields: Array<keyof CreateFoodInput> = [
    'calories_per_100g',
    'protein_per_100g',
    'carbs_per_100g',
    'fat_per_100g',
  ];

  for (const field of numericFields) {
    const val = body[field];
    if (val === undefined || val === null) {
      errors[field] = `${field.replace(/_/g, ' ')} is required`;
    } else if (typeof val !== 'number' || isNaN(val) || val < 0) {
      errors[field] = `${field.replace(/_/g, ' ')} must be a non-negative number`;
    }
  }

  if (body.fiber_per_100g !== undefined && body.fiber_per_100g !== null) {
    if (typeof body.fiber_per_100g !== 'number' || isNaN(body.fiber_per_100g) || body.fiber_per_100g < 0) {
      errors.fiber_per_100g = 'Fiber must be a non-negative number';
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check for duplicate custom food name for this user
  const { data: existing } = await admin
    .from('foods')
    .select('id')
    .eq('name', body.name!.trim())
    .eq('created_by', userId)
    .eq('is_custom', true)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A custom food with this name already exists' },
      { status: 409 }
    );
  }

  // Insert the new custom food
  const { data, error } = await admin
    .from('foods')
    .insert({
      name: body.name!.trim(),
      brand: body.brand?.trim() || null,
      calories_per_100g: body.calories_per_100g!,
      protein_per_100g: body.protein_per_100g!,
      carbs_per_100g: body.carbs_per_100g!,
      fat_per_100g: body.fat_per_100g!,
      fiber_per_100g: body.fiber_per_100g ?? null,
      serving_size_g: body.serving_size_g ?? 100,
      serving_size_label: body.serving_size_label ?? '100g',
      is_custom: true,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('[foods/POST] Insert error:', error);
    return NextResponse.json({ error: 'Failed to create food' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
