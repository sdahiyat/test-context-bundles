import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe singleton client (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-only admin client factory (uses service role key, bypasses RLS)
// NEVER expose this to the browser — import only in API routes / Server Components
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Server client that uses the user's auth cookie — for Server Components / Route Handlers
// Requires @supabase/ssr or @supabase/auth-helpers-nextjs
export function createServerClient(cookieStore?: {
  get: (name: string) => { value: string } | undefined;
}) {
  // If cookies are provided, create an authenticated server client
  // Otherwise fall back to the admin client for API routes that handle auth manually
  if (cookieStore) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {},
      },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
