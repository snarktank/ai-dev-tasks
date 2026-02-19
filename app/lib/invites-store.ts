import { isValidEmail, isValidUsername, type InviteTarget } from './users-store';
import { addParticipant, loadCompetitionsFromSupabase } from './competitions-store';
import { supabase } from '@/src/lib/supabase';

export type Invite = {
  id: string;
  competitionId: string;
  target: InviteTarget;
  status: 'pending' | 'accepted' | 'declined';
};

let invites: Invite[] = [];

type Listener = (current: Invite[]) => void;
const listeners = new Set<Listener>();

function notify() {
  const snapshot = [...invites];
  listeners.forEach((l) => l(snapshot));
}

export function subscribeInvites(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPendingInvitesForCompetition(competitionId: string): Invite[] {
  return invites.filter((i) => i.competitionId === competitionId && i.status === 'pending');
}

export function getPendingInvitesForUser(userId: string): Invite[] {
  return invites.filter(
    (i) => i.status === 'pending' && i.target.type === 'friend' && i.target.userId === userId
  );
}

export function addPendingInvites(competitionId: string, targets: InviteTarget[]) {
  const newOnes: Invite[] = targets.map((t) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    competitionId,
    target: t,
    status: 'pending',
  }));
  invites = [...newOnes, ...invites];
  notify();
}

function setInvitesForCompetition(competitionId: string, next: Invite[]) {
  // Keep invites for other competitions; replace for this one
  invites = [...invites.filter((i) => i.competitionId !== competitionId), ...next];
  notify();
}

export async function syncPendingInvitesForCompetition(competitionId: string): Promise<void> {
  try {
    const { data: me } = await supabase.auth.getUser();
    const myId = me?.user?.id;
    if (!myId) return;
    const { data, error } = await supabase
      .from('competition_invites')
      .select('id, competition_id, invited_user_id, status, invited_by_user_id')
      .eq('competition_id', competitionId)
      .eq('invited_by_user_id', myId)
      .eq('status', 'pending');
    if (error) throw error;
    const next: Invite[] = (data ?? []).map((row: any) => ({
      id: row.id as string,
      competitionId: row.competition_id as string,
      target: { type: 'friend', userId: row.invited_user_id as string },
      status: 'pending',
    }));
    setInvitesForCompetition(competitionId, next);
  } catch {
    // ignore errors; keep current local state
  }
}

// For demo: accept an invite and add participant to the competition
export function acceptInvite(inviteId: string) {
  const inv = invites.find((i) => i.id === inviteId);
  if (!inv) return;
  if (inv.status !== 'pending') return;

  inv.status = 'accepted';

  // Derive a display name
  let name = 'Okänd';
  if (inv.target.type === 'friend') {
    // Represent friend as placeholder name; in real app we would look it up
    name = `Vän ${inv.target.userId}`;
  } else if (inv.target.type === 'email') {
    name = inv.target.email.split('@')[0];
  } else if (inv.target.type === 'username') {
    name = inv.target.username;
  }
  name = name.charAt(0).toUpperCase() + name.slice(1);

  // Try to add the INVITED user as participant in Supabase.
  // If the current session user IS the invitee, insert-self policy applies.
  // If the current session user IS the owner, owner-adds policy applies.
  (async () => {
    try {
      const { data: me } = await supabase.auth.getUser();
      const myId = me?.user?.id ?? null;

      // Resolve the intended target user's id
      let targetUserId: string | null = null;
      if (inv.target.type === 'friend') {
        targetUserId = inv.target.userId;
      } else if (inv.target.type === 'email') {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .eq('email', inv.target.email)
          .single();
        targetUserId = (data as any)?.id ?? null;
        if (data) {
          const full = (data as any).full_name as string | null;
          const uname = (data as any).username as string | null;
          name = full || uname || name;
        }
      } else if (inv.target.type === 'username') {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .eq('username', inv.target.username)
          .single();
        targetUserId = (data as any)?.id ?? null;
        if (data) {
          const full = (data as any).full_name as string | null;
          const uname = (data as any).username as string | null;
          name = full || uname || name;
        }
      }

      // Who should be inserted?
      // - If the signed-in user equals the target, insert self.
      // - Otherwise try owner-adds (current user must be the competition owner).
      const userIdToInsert = myId && targetUserId === myId ? myId : targetUserId;
      if (userIdToInsert) {
        await supabase.from('competition_participants').insert({
          competition_id: inv.competitionId,
          user_id: userIdToInsert,
        });
        addParticipant(inv.competitionId, {
          id: userIdToInsert,
          name,
          co2ReducedKg: 0,
        });
        // Ensure the competitions list is refreshed for this device right away
        await loadCompetitionsFromSupabase();
      }
    } catch {
      // ignore errors; UI will still show local accept
    } finally {
      notify();
    }
  })();

  notify();
}

// For demo: decline an invite, do not add participant
export function declineInvite(inviteId: string) {
  const inv = invites.find((i) => i.id === inviteId);
  if (!inv) return;
  if (inv.status !== 'pending') return;
  inv.status = 'declined';
  notify();
}

export function resetInvitesStore() {
  invites = [];
  listeners.clear();
}


