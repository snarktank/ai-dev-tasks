import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = (Constants?.expoConfig as any)?.extra ?? {};
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  extra.EXPO_PUBLIC_SUPABASE_URL ||
  extra.supabaseUrl;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Set env or expo.extra in app.json."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
