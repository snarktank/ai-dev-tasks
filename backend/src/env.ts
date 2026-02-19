import 'dotenv/config';

export type Env = {
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export function loadEnv(): Env {
  const SUPABASE_URL =
    process.env.SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    '';
  const SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (!SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL)');
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY)');
  }
  const PORT = Number(process.env.PORT ?? 8787);
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY };
}


