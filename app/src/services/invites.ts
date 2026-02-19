import { supabase } from '@/src/lib/supabase';

export type CompetitionInvite = {
  id: string;
  competition_id: string;
  invited_user_id: string;
  invited_by_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
};

export async function createInvite(competitionId: string, invitedUserId: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    throw new Error('Du måste vara inloggad för att bjuda in.');
  }
  // Use the new invite_to_competition RPC that checks permissions
  const { error } = await supabase.rpc('invite_to_competition', {
    p_competition_id: competitionId,
    p_invited_user_id: invitedUserId,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function acceptInvite(inviteId: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user?.id) {
    throw new Error('Du måste vara inloggad för att acceptera.');
  }
  const userId = userData.user.id;
  const { data, error } = await supabase
    .from('competition_invites')
    .update({ status: 'accepted', responded_at: new Date().toISOString() } as any)
    .eq('id', inviteId)
    .select('id, competition_id')
    .single();
  if (error) throw new Error(error.message);
  const competitionId = (data as any).competition_id as string;
  // Lägg in användaren som participant (insert-self policy)
  const { error: partErr } = await supabase
    .from('competition_participants')
    .insert({ competition_id: competitionId, user_id: userId } as any);
  if (partErr && (partErr as any).code !== '23505') {
    // 23505 = redan participant, kan ignoreras
    throw new Error(partErr.message);
  }
}

export async function declineInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from('competition_invites')
    .update({ status: 'declined', responded_at: new Date().toISOString() } as any)
    .eq('id', inviteId);
  if (error) throw new Error(error.message);
}


