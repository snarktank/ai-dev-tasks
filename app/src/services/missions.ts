import { supabase } from '@/src/lib/supabase';

export type Mission = {
  id: string;
  title: string;
  category: string;
  co2_kg: number;
  max_per_day: number;
  description?: string | null;
  quantity_mode?: number | null;
  quantity_unit?: string | null;
  quantity_multiplier?: number | null;
  image_key?: string | null;
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('id,title,category,co2_kg,max_per_day,description,quantity_mode,quantity_unit,quantity_multiplier,image_key')
    .order('category', { ascending: true })
    .order('title', { ascending: true });
  if (error) {
    // Surface a clean error; callers can show an empty state on failure
    throw new Error(error.message);
  }
  return (data ?? []) as Mission[];
}

export async function fetchTodayCounts(missionIds: string[]): Promise<Record<string, number>> {
  if (!missionIds.length) return {};
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return {};
  }
  const userId = userData.user.id;
  const sinceIso = startOfTodayIso();
  const { data, error } = await supabase
    .from('user_actions')
    .select('mission_id, created_at')
    .eq('user_id', userId)
    .in('mission_id', missionIds)
    .gte('created_at', sinceIso);
  // If the table doesn't exist yet or RLS blocks, treat as zero counts so UI still renders missions.
  if (error) return {};
  const counts: Record<string, number> = {};
  (data ?? []).forEach((row: { mission_id: string }) => {
    counts[row.mission_id] = (counts[row.mission_id] ?? 0) + 1;
  });
  // Ensure every mission id is present with at least 0
  for (const id of missionIds) {
    if (counts[id] == null) counts[id] = 0;
  }
  return counts;
}

export async function logUserAction(mission: Mission): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Du måste vara inloggad för att utföra uppdrag.');
  }
  const userId = userData.user.id;
  const { error } = await supabase.from('user_actions').insert({
    user_id: userId,
    mission_id: mission.id,
    co2_saved_kg: mission.co2_kg,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Notify local listeners so UI can update immediately even without realtime
  notifyCo2TotalUpdated();
}

export async function logUserActionWithCo2(mission: Mission, co2SavedKg: number): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('Du måste vara inloggad för att utföra uppdrag.');
  }
  const userId = userData.user.id;
  const { error } = await supabase.from('user_actions').insert({
    user_id: userId,
    mission_id: mission.id,
    co2_saved_kg: co2SavedKg,
  });
  if (error) {
    throw new Error(error.message);
  }
  notifyCo2TotalUpdated();
}

// Fetch the caller's total saved CO2 from Supabase by summing user_actions
export async function fetchMyTotalCo2Saved(): Promise<number> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return 0;
  }
  const userId = userData.user.id;
  const { data, error } = await supabase
    .from('user_actions')
    .select('co2_saved_kg')
    .eq('user_id', userId);
  if (error) {
    return 0;
  }
  return (data as { co2_saved_kg: number }[] | null)?.reduce((sum, r) => sum + (Number(r.co2_saved_kg) || 0), 0) ?? 0;
}

// Fetch the total saved CO2 for ALL users by summing user_actions
export async function fetchAllUsersTotalCo2Saved(): Promise<number> {
  const { data, error } = await supabase
    .from('user_actions')
    .select('co2_saved_kg');
  if (error) {
    return 0;
  }
  return (data as { co2_saved_kg: number }[] | null)?.reduce((sum, r) => sum + (Number(r.co2_saved_kg) || 0), 0) ?? 0;
}

// Generic helpers for any user
export async function fetchUserTotalCo2Saved(userId: string): Promise<number> {
  if (!userId) return 0;
  const { data, error } = await supabase
    .from('user_actions')
    .select('co2_saved_kg')
    .eq('user_id', userId);
  if (error) {
    return 0;
  }
  return (data as { co2_saved_kg: number }[] | null)?.reduce((sum, r) => sum + (Number(r.co2_saved_kg) || 0), 0) ?? 0;
}

export async function fetchUserCo2SavedSince(userId: string, dateYmd: string): Promise<number> {
  if (!userId) return 0;
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(dateYmd) ? dateYmd : undefined;
  if (!safe) {
    return fetchUserTotalCo2Saved(userId);
  }
  const since = new Date(`${safe}T00:00:00`);
  const sinceIso = since.toISOString();
  const { data, error } = await supabase
    .from('user_actions')
    .select('co2_saved_kg, created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) {
    return 0;
  }
  return (data as { co2_saved_kg: number }[] | null)?.reduce((sum, r) => sum + (Number(r.co2_saved_kg) || 0), 0) ?? 0;
}

// Fetch the caller's saved CO2 since a specific YYYY-MM-DD (inclusive, local midnight)
export async function fetchMyCo2SavedSince(dateYmd: string): Promise<number> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return 0;
  }
  // Basic validation and conversion to ISO start of day
  const safe = /^\d{4}-\d{2}-\d{2}$/.test(dateYmd) ? dateYmd : undefined;
  if (!safe) {
    return fetchMyTotalCo2Saved();
  }
  const since = new Date(`${safe}T00:00:00`);
  const sinceIso = since.toISOString();
  const userId = userData.user.id;
  const { data, error } = await supabase
    .from('user_actions')
    .select('co2_saved_kg, created_at')
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) {
    return 0;
  }
  return (data as { co2_saved_kg: number }[] | null)?.reduce((sum, r) => sum + (Number(r.co2_saved_kg) || 0), 0) ?? 0;
}

// Lightweight local pub/sub for CO2 total updates
type Co2Listener = () => void;
const co2Listeners = new Set<Co2Listener>();
export function subscribeCo2TotalUpdated(listener: Co2Listener) {
  co2Listeners.add(listener);
  return () => co2Listeners.delete(listener);
}
function notifyCo2TotalUpdated() {
  co2Listeners.forEach((l) => l());
}

export function resetMissionsStore() {
  co2Listeners.clear();
}


