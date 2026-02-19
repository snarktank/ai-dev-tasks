import { supabase } from '@/src/lib/supabase';
import { addFriend, getFriends } from '@/lib/users-store';

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string; // ISO
};

let friendRequests: FriendRequest[] = [];
let initialized = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

type Listener = (current: FriendRequest[]) => void;
const listeners = new Set<Listener>();

function notify() {
  const snapshot = [...friendRequests];
  listeners.forEach((l) => l(snapshot));
}

async function refreshForMe() {
  const { data: me } = await supabase.auth.getUser();
  const myId = me?.user?.id;
  if (!myId) return;
  const { data: inbound } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, to_user_id, status, created_at')
    .eq('to_user_id', myId);
  const { data: outbound } = await supabase
    .from('friend_requests')
    .select('id, from_user_id, to_user_id, status, created_at')
    .eq('from_user_id', myId);
  const merged = ([] as any[]).concat(inbound ?? [], outbound ?? []);
  friendRequests = merged.map((r) => ({
    id: r.id,
    fromUserId: r.from_user_id,
    toUserId: r.to_user_id,
    status: r.status,
    createdAt: r.created_at,
  }));
  // After refresh, ensure accepted relations are reflected in local friends list
  const currentFriends = getFriends();
  const existingIds = new Set(currentFriends.map((f) => f.id));
  const accepted = friendRequests.filter((r) => r.status === 'accepted');
  for (const r of accepted) {
    const otherId = r.fromUserId === myId ? r.toUserId : r.fromUserId;
    if (!existingIds.has(otherId)) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id, username, full_name, first_name, last_name, email')
          .eq('id', otherId)
          .single();
        if (prof) {
          const fullName =
            (prof as any).full_name ||
            ([ (prof as any).first_name, (prof as any).last_name ].filter(Boolean).join(' ')) ||
            (prof as any).username ||
            ((prof as any).email ?? 'user').split('@')[0];
          addFriend({
            id: (prof as any).id,
            name: fullName,
            username: (prof as any).username ?? ((prof as any).email ?? 'user').split('@')[0],
            email: (prof as any).email ?? '',
            createdAt: new Date().toISOString().slice(0, 10),
          });
          existingIds.add(otherId);
        }
      } catch {
        // ignore profile fetch errors
      }
    }
  }
}

export function subscribeFriendRequests(listener: Listener) {
  listeners.add(listener);
  (async () => {
    if (!initialized) {
      initialized = true;
      await refreshForMe();
      try {
        const { data: me } = await supabase.auth.getUser();
        const myId = me?.user?.id;
        if (myId) {
          channel = supabase
            .channel('realtime:friend_requests:' + myId)
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'friend_requests', filter: `to_user_id=eq.${myId}` },
              async () => {
                await refreshForMe();
                notify();
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'friend_requests', filter: `from_user_id=eq.${myId}` },
              async () => {
                await refreshForMe();
                notify();
              }
            )
            .subscribe();
        }
      } catch {
        // ignore
      }
    } else {
      await refreshForMe();
    }
    notify();
  })();
  return () => listeners.delete(listener);
}

export function getInboundPending(userId: string): FriendRequest[] {
  return friendRequests.filter((r) => r.toUserId === userId && r.status === 'pending');
}

export function getOutboundPending(userId: string): FriendRequest[] {
  return friendRequests.filter((r) => r.fromUserId === userId && r.status === 'pending');
}

export function hasAnyRelation(a: string, b: string): boolean {
  return friendRequests.some(
    (r) =>
      (r.fromUserId === a && r.toUserId === b) ||
      (r.fromUserId === b && r.toUserId === a)
  );
}

export async function addFriendRequest(req: { toUserId: string; fromUserId?: string }) {
  const { data: me } = await supabase.auth.getUser();
  const myId = me?.user?.id ?? req.fromUserId;
  if (!myId) throw new Error('Not signed in');
  if (myId === req.toUserId) throw new Error('Cannot request yourself');
  
  // Use RPC function to create both request and notification atomically
  const { data: requestId, error } = await supabase.rpc('send_friend_request', {
    p_to_user_id: req.toUserId,
  });
  
  if (error) throw new Error(error.message);
  
  await refreshForMe();
  notify();
}

export async function acceptFriendRequest(id: string) {
  const { data: me } = await supabase.auth.getUser();
  const myId = me?.user?.id;
  if (!myId) throw new Error('Not signed in');
  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted', responded_at: new Date().toISOString() } as any)
    .eq('id', id)
    .eq('to_user_id', myId)
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
  await refreshForMe();
  notify();
}

export async function declineFriendRequest(id: string) {
  const { data: me } = await supabase.auth.getUser();
  const myId = me?.user?.id;
  if (!myId) throw new Error('Not signed in');
  const { error } = await supabase
    .from('friend_requests')
    .delete()
    .eq('id', id)
    .eq('to_user_id', myId)
    .eq('status', 'pending');
  if (error) throw new Error(error.message);
  await refreshForMe();
  notify();
}

export function getAllFriendRequests(): FriendRequest[] {
  return [...friendRequests];
}

export function resetFriendRequestsStore() {
  friendRequests = [];
  initialized = false;
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
  listeners.clear();
}


