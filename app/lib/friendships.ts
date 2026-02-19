import { supabase } from '@/src/lib/supabase';

export type FriendshipRow = {
  user_low: string;
  user_high: string;
  created_at: string;
};

/**
 * Fetch all friendship rows where the current user participates.
 */
export async function getMyFriendships(): Promise<FriendshipRow[]> {
  const { data: me, error: authErr } = await supabase.auth.getUser();
  if (authErr || !me?.user?.id) return [];
  const myId = me.user.id;
  const { data, error } = await supabase
    .from('friendships')
    .select('user_low,user_high,created_at')
    .or(`user_low.eq.${myId},user_high.eq.${myId}`);
  if (error) return [];
  return (data ?? []) as unknown as FriendshipRow[];
}

/**
 * Return the set of friend user IDs for the current user.
 */
export async function getMyFriendIds(): Promise<string[]> {
  const rows = await getMyFriendships();
  const { data: me } = await supabase.auth.getUser();
  const myId = me?.user?.id ?? '';
  const ids = new Set<string>();
  for (const r of rows) {
    ids.add(r.user_low === myId ? r.user_high : r.user_low);
  }
  return Array.from(ids);
}

/**
 * Check whether the current user and the provided userId are friends.
 * Assumes friendships rows are normalized (user_low < user_high), but also
 * tolerates non-normalized data by using OR on both permutations.
 */
export async function areFriends(userId: string): Promise<boolean> {
  const { data: me, error: authErr } = await supabase.auth.getUser();
  if (authErr || !me?.user?.id) return false;
  const myId = me.user.id;
  if (!userId || userId === myId) return false;
  const low = [myId, userId].sort()[0];
  const high = [myId, userId].sort()[1];
  const { data, error } = await supabase
    .from('friendships')
    .select('user_low,user_high')
    .or(`and(user_low.eq.${low},user_high.eq.${high}),and(user_low.eq.${high},user_high.eq.${low})`)
    .limit(1);
  if (error) return false;
  return (data ?? []).length > 0;
}

