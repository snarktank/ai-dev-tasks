import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from './env';

export function createSupabaseClient(env: Env): SupabaseClient {
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  return createClient(env.SUPABASE_URL, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


