-- NutriTrack initial schema: tables, RLS, storage, triggers.

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    height_cm numeric,
    weight_kg numeric,
    date_of_birth date,
    gender text check (gender in ('male','female','other','prefer_not_to_say')),
    activity_level text check (activity_level in ('sedentary','lightly_active','moderately_active','very_active','extra_active')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.goals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    goal_type text not null check (goal_type in ('lose_weight','maintain_weight','gain_weight','build_muscle','improve_health')),
    target_weight_kg numeric,
    target_calories integer not null,
    target_protein_g numeric,
    target_carbs_g numeric,
    target_fat_g numeric,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.foods (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    brand text,
    serving_size_g numeric not null default 100,
    calories_per_serving numeric not null,
    protein_g numeric not null default 0,
    carbs_g numeric not null default 0,
    fat_g numeric not null default 0,
    fiber_g numeric default 0,
    sugar_g numeric default 0,
    sodium_mg numeric default 0,
    is_verified boolean not null default false,
    created_by uuid references public.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.meals (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    logged_at timestamptz not null default now(),
    meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
    notes text,
    image_url text,
    total_calories numeric not null default 0,
    total_protein_g numeric not null default 0,
    total_carbs_g numeric not null default 0,
    total_fat_g numeric not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.meal_items (
    id uuid primary key default gen_random_uuid(),
    meal_id uuid not null references public.meals(id) on delete cascade,
    food_id uuid references public.foods(id) on delete set null,
    food_name text not null,
    serving_size_g numeric not null,
    quantity numeric not null default 1,
    calories numeric not null,
    protein_g numeric not null default 0,
    carbs_g numeric not null default 0,
    fat_g numeric not null default 0,
    fiber_g numeric default 0,
    sugar_g numeric default 0,
    sodium_mg numeric default 0,
    created_at timestamptz not null default now()
);

create table if not exists public.nutrition_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users(id) on delete cascade,
    log_date date not null,
    total_calories numeric not null default 0,
    total_protein_g numeric not null default 0,
    total_carbs_g numeric not null default 0,
    total_fat_g numeric not null default 0,
    total_fiber_g numeric default 0,
    total_sugar_g numeric default 0,
    total_sodium_mg numeric default 0,
    meal_count integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, log_date)
);

-- =========================================================================
-- Indexes
-- =========================================================================

create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_meals_user_id on public.meals(user_id);
create index if not exists idx_meals_logged_at on public.meals(logged_at);
create index if not exists idx_meal_items_meal_id on public.meal_items(meal_id);
create index if not exists idx_meal_items_food_id on public.meal_items(food_id);
create index if not exists idx_nutrition_logs_user_id on public.nutrition_logs(user_id);
create index if not exists idx_nutrition_logs_log_date on public.nutrition_logs(log_date);
create index if not exists idx_foods_name on public.foods using gin (to_tsvector('english', name));

-- =========================================================================
-- Trigger functions
-- =========================================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
    before update on public.users
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
    before update on public.goals
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_foods_updated_at on public.foods;
create trigger set_foods_updated_at
    before update on public.foods
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_meals_updated_at on public.meals;
create trigger set_meals_updated_at
    before update on public.meals
    for each row execute procedure public.update_updated_at_column();

drop trigger if exists set_nutrition_logs_updated_at on public.nutrition_logs;
create trigger set_nutrition_logs_updated_at
    before update on public.nutrition_logs
    for each row execute procedure public.update_updated_at_column();

-- Auto-create profile row when an auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.users (id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Recompute the daily nutrition_logs row whenever a meal changes.
create or replace function public.update_nutrition_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    affected_user uuid;
    affected_date date;
begin
    if (tg_op = 'DELETE') then
        affected_user := old.user_id;
        affected_date := date(old.logged_at);
    else
        affected_user := new.user_id;
        affected_date := date(new.logged_at);
    end if;

    insert into public.nutrition_logs (
        user_id,
        log_date,
        total_calories,
        total_protein_g,
        total_carbs_g,
        total_fat_g,
        meal_count
    )
    select
        affected_user,
        affected_date,
        coalesce(sum(total_calories), 0),
        coalesce(sum(total_protein_g), 0),
        coalesce(sum(total_carbs_g), 0),
        coalesce(sum(total_fat_g), 0),
        count(*)
    from public.meals
    where user_id = affected_user
      and date(logged_at) = affected_date
    on conflict (user_id, log_date) do update
        set total_calories = excluded.total_calories,
            total_protein_g = excluded.total_protein_g,
            total_carbs_g = excluded.total_carbs_g,
            total_fat_g = excluded.total_fat_g,
            meal_count = excluded.meal_count,
            updated_at = now();

    if (tg_op = 'DELETE') then
        return old;
    end if;
    return new;
end;
$$;

drop trigger if exists on_meal_change on public.meals;
create trigger on_meal_change
    after insert or update or delete on public.meals
    for each row execute procedure public.update_nutrition_log();

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.foods enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.nutrition_logs enable row level security;

-- users: only the row owner can read/modify their profile.
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
    for select using (auth.uid() = id);

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users
    for insert with check (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
    for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists users_delete_own on public.users;
create policy users_delete_own on public.users
    for delete using (auth.uid() = id);

-- goals: scoped by user_id.
drop policy if exists goals_select_own on public.goals;
create policy goals_select_own on public.goals
    for select using (auth.uid() = user_id);

drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own on public.goals
    for insert with check (auth.uid() = user_id);

drop policy if exists goals_update_own on public.goals;
create policy goals_update_own on public.goals
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists goals_delete_own on public.goals;
create policy goals_delete_own on public.goals
    for delete using (auth.uid() = user_id);

-- foods: shared catalog — any authenticated user can read; users can only
-- modify rows they themselves created.
drop policy if exists foods_select_authenticated on public.foods;
create policy foods_select_authenticated on public.foods
    for select using (auth.role() = 'authenticated');

drop policy if exists foods_insert_own on public.foods;
create policy foods_insert_own on public.foods
    for insert with check (auth.uid() = created_by);

drop policy if exists foods_update_own on public.foods;
create policy foods_update_own on public.foods
    for update using (auth.uid() = created_by) with check (auth.uid() = created_by);

drop policy if exists foods_delete_own on public.foods;
create policy foods_delete_own on public.foods
    for delete using (auth.uid() = created_by);

-- meals: scoped by user_id.
drop policy if exists meals_select_own on public.meals;
create policy meals_select_own on public.meals
    for select using (auth.uid() = user_id);

drop policy if exists meals_insert_own on public.meals;
create policy meals_insert_own on public.meals
    for insert with check (auth.uid() = user_id);

drop policy if exists meals_update_own on public.meals;
create policy meals_update_own on public.meals
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists meals_delete_own on public.meals;
create policy meals_delete_own on public.meals
    for delete using (auth.uid() = user_id);

-- meal_items: gated by ownership of the parent meal.
drop policy if exists meal_items_select_own on public.meal_items;
create policy meal_items_select_own on public.meal_items
    for select using (
        exists (
            select 1 from public.meals
            where meals.id = meal_items.meal_id
              and meals.user_id = auth.uid()
        )
    );

drop policy if exists meal_items_insert_own on public.meal_items;
create policy meal_items_insert_own on public.meal_items
    for insert with check (
        exists (
            select 1 from public.meals
            where meals.id = meal_items.meal_id
              and meals.user_id = auth.uid()
        )
    );

drop policy if exists meal_items_update_own on public.meal_items;
create policy meal_items_update_own on public.meal_items
    for update using (
        exists (
            select 1 from public.meals
            where meals.id = meal_items.meal_id
              and meals.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1 from public.meals
            where meals.id = meal_items.meal_id
              and meals.user_id = auth.uid()
        )
    );

drop policy if exists meal_items_delete_own on public.meal_items;
create policy meal_items_delete_own on public.meal_items
    for delete using (
        exists (
            select 1 from public.meals
            where meals.id = meal_items.meal_id
              and meals.user_id = auth.uid()
        )
    );

-- nutrition_logs: scoped by user_id.
drop policy if exists nutrition_logs_select_own on public.nutrition_logs;
create policy nutrition_logs_select_own on public.nutrition_logs
    for select using (auth.uid() = user_id);

drop policy if exists nutrition_logs_insert_own on public.nutrition_logs;
create policy nutrition_logs_insert_own on public.nutrition_logs
    for insert with check (auth.uid() = user_id);

drop policy if exists nutrition_logs_update_own on public.nutrition_logs;
create policy nutrition_logs_update_own on public.nutrition_logs
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists nutrition_logs_delete_own on public.nutrition_logs;
create policy nutrition_logs_delete_own on public.nutrition_logs
    for delete using (auth.uid() = user_id);

-- =========================================================================
-- Storage: meal-images bucket (private; per-user folder layout)
-- =========================================================================

insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', false)
on conflict (id) do nothing;

drop policy if exists meal_images_select on storage.objects;
create policy meal_images_select on storage.objects
    for select using (
        bucket_id = 'meal-images'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

drop policy if exists meal_images_insert on storage.objects;
create policy meal_images_insert on storage.objects
    for insert with check (
        bucket_id = 'meal-images'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

drop policy if exists meal_images_update on storage.objects;
create policy meal_images_update on storage.objects
    for update using (
        bucket_id = 'meal-images'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

drop policy if exists meal_images_delete on storage.objects;
create policy meal_images_delete on storage.objects
    for delete using (
        bucket_id = 'meal-images'
        and auth.uid()::text = (storage.foldername(name))[1]
    );
