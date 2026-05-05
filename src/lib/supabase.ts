import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-safe singleton client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client factory (service role — bypasses RLS — server/API use only)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Server-side client factory that accepts a cookie store
export function createServerSupabaseClient(cookieStore?: {
  get: (name: string) => { value: string } | undefined;
}) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: cookieStore
        ? {
            Cookie: (() => {
              // Build cookie header from the store if provided
              const authCookieNames = [
                `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth-token`,
              ];
              const parts: string[] = [];
              for (const name of authCookieNames) {
                const val = cookieStore.get(name);
                if (val) parts.push(`${name}=${val.value}`);
              }
              return parts.join('; ');
            })(),
          }
        : {},
    },
  });
}
