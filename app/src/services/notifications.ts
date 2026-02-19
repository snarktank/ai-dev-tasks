import { supabase } from '@/src/lib/supabase';

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
};

export async function fetchNotifications(): Promise<NotificationRow[]> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return [];
  }
  const { data, error } = await supabase
    .from('notifications')
    .select('id,user_id,type,title,body,metadata,read_at,created_at')
    .order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as unknown as NotificationRow[];
}

export async function fetchUnreadCount(): Promise<number> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return 0;
  }
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) {
    return 0;
  }
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return;
  }
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() } as any)
    .is('read_at', null);
  if (error) {
    throw new Error(error.message);
  }
}

export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body?: string | null;
  metadata?: Record<string, any> | null;
}): Promise<NotificationRow> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      metadata: input.metadata ?? null,
    } as any)
    .select('id,user_id,type,title,body,metadata,read_at,created_at')
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data as unknown as NotificationRow;
}

export async function createFriendRequestNotification(args: {
  toUserId: string;
  friendRequestId: string;
  from: { id: string; username: string; name: string };
}) {
  const title = 'Vänförfrågan';
  const body = `${args.from.name} (@${args.from.username}) vill bli vän med dig.`;
  return createNotification({
    userId: args.toUserId,
    type: 'friend_request',
    title,
    body,
    metadata: {
      friend_request_id: args.friendRequestId,
      from_user_id: args.from.id,
      from_username: args.from.username,
      from_name: args.from.name,
    },
  });
}

export function subscribeToNotifications(onInsert: (row: NotificationRow) => void): () => void {
  let channel: ReturnType<typeof supabase.channel> | null = null;
  (async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;
      channel = supabase
        .channel('realtime:notifications:' + uid)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
          (payload) => {
            const newRow = payload.new as NotificationRow;
            onInsert(newRow);
          }
        )
        .subscribe();
    } catch {
      // ignore
    }
  })();
  return () => {
    if (channel) supabase.removeChannel(channel);
  };
}


