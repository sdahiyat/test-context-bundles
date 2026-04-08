import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Browser-safe Supabase client singleton.
 * Uses the public anon key — RLS enforces data access rules.
 * Import this anywhere in your application (client or server components).
 */
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Server-side Supabase admin client factory.
 * Uses the service role key which BYPASSES RLS.
 * Only use in API routes and server-side code — never expose to the browser.
 *
 * Factory pattern avoids instantiation at module load time,
 * which prevents build-time environment variable errors.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
