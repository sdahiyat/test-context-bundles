import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Use any for Database generic since we may not have a generated types file
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServerClient() {
  return createServerComponentClient<any>({ cookies });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createRouteClient() {
  return createRouteHandlerClient<any>({ cookies });
}
