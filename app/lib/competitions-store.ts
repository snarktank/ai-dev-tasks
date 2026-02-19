import { getCurrentUser } from './users-store';
import { fetchMyTotalCo2Saved, fetchMyCo2SavedSince, subscribeCo2TotalUpdated } from '@/src/services/missions';
import { supabase } from '@/src/lib/supabase';

export type Participant = {
  id: string;
  name: string;
  co2ReducedKg: number;
};

export type Competition = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  participants: Participant[];
  updatedAt: string; // YYYY-MM-DD
};

let competitions: Competition[] = [];

type Listener = (current: Competition[]) => void;
const listeners = new Set<Listener>();

let co2SyncStarted = false;

function notify() {
  const snapshot = [...competitions];
  listeners.forEach((l) => l(snapshot));
}

export function getCompetitions(): Competition[] {
  return competitions;
}

export function getCompetitionById(id: string): Competition | undefined {
  return competitions.find((c) => c.id === id);
}

export async function createCompetition(input: {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  invitePolicy?: 'owner_only' | 'all_members';
}) {
  // Ensure we use Supabase auth user id for RLS
  const { data: meData } = await supabase.auth.getUser();
  const meAuth = meData?.user;
  if (!meAuth?.id) {
    throw new Error('Du måste vara inloggad för att skapa en tävling.');
  }
  const me = getCurrentUser();
  
  // Use RPC to create competition (handles owner_id and invite_policy server-side)
  const { data, error } = await supabase.rpc('create_competition', {
    p_name: input.name,
    p_description: input.description ?? null,
    p_start_date: input.startDate ?? null,
    p_end_date: input.endDate ?? null,
    p_invite_policy: input.invitePolicy ?? 'owner_only',
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  const newId = data as string;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const updatedAt = `${yyyy}-${mm}-${dd}`;
  
  const newComp: Competition = {
    id: newId,
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    participants: [{ id: me.id, name: me.name || 'Du', co2ReducedKg: 0 }],
    updatedAt,
  };
  
  // Refresh from server to ensure consistency
  await loadCompetitionsFromSupabase();
  startCo2Sync();
  void refreshMyCo2ForCompetition(newComp.id);
  return newComp;
}

export function addParticipant(competitionId: string, participant: Participant) {
  const comp = competitions.find((c) => c.id === competitionId);
  if (!comp) return;
  // Avoid duplicates by id
  if (comp.participants.some((p) => p.id === participant.id)) return;
  comp.participants = [...comp.participants, participant];
  // Update timestamp
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  comp.updatedAt = `${yyyy}-${mm}-${dd}`;
  notify();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// --- CO2 syncing for current user ---
async function computeMyCo2ForCompetition(comp: Competition): Promise<number> {
  if (comp.startDate && /^\d{4}-\d{2}-\d{2}$/.test(comp.startDate)) {
    return fetchMyCo2SavedSince(comp.startDate);
  }
  return fetchMyTotalCo2Saved();
}

function setMyCo2InCompetition(competitionId: string, co2ReducedKg: number) {
  const me = getCurrentUser();
  const comp = competitions.find((c) => c.id === competitionId);
  if (!comp) return;
  const idx = comp.participants.findIndex((p) => p.id === me.id);
  if (idx === -1) return;
  comp.participants = comp.participants.map((p) =>
    p.id === me.id ? { ...p, co2ReducedKg } : p
  );
  notify();
}

export async function refreshMyCo2ForCompetition(competitionId: string): Promise<void> {
  const comp = competitions.find((c) => c.id === competitionId);
  if (!comp) return;
  try {
    const value = await computeMyCo2ForCompetition(comp);
    setMyCo2InCompetition(competitionId, value);
  } catch {
    // Swallow errors to avoid breaking UI; value remains as-is
  }
}

function startCo2Sync() {
  if (co2SyncStarted) return;
  co2SyncStarted = true;
  // When local CO2 total updates (after logging an action), recompute across all competitions
  subscribeCo2TotalUpdated(() => {
    const ids = competitions.map((c) => c.id);
    ids.forEach((id) => {
      void refreshMyCo2ForCompetition(id);
    });
  });
  // Also run an initial population pass for any preloaded competitions
  competitions.forEach((c) => {
    void refreshMyCo2ForCompetition(c.id);
  });
}

// --- Load competitions from Supabase ---
export async function loadCompetitionsFromSupabase(): Promise<void> {
  try {
    const me = getCurrentUser();
    // First get all competitions
    const { data: comps, error } = await supabase
      .from('competitions')
      .select('id, name, description, start_date, end_date, updated_at')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    
    // Filter out competitions where current user has left
    let compIds = (comps ?? []).map((c: any) => c.id as string);
    if (compIds.length > 0) {
      const { data: myParticipations } = await supabase
        .from('competition_participants')
        .select('competition_id')
        .eq('user_id', me.id)
        .in('competition_id', compIds)
        .not('left_at', 'is', null);
      const leftCompIds = new Set((myParticipations ?? []).map((p: any) => p.competition_id as string));
      compIds = compIds.filter(id => !leftCompIds.has(id));
    }
    let participantsByComp: Record<string, string[]> = {};
    let allUserIds = new Set<string>();
    if (compIds.length) {
      const { data: parts } = await supabase
        .from('competition_participants')
        .select('competition_id, user_id')
        .in('competition_id', compIds)
        .is('left_at', null);
      participantsByComp = {};
      (parts ?? []).forEach((row: any) => {
        const cid = row.competition_id as string;
        const uid = row.user_id as string;
        (participantsByComp[cid] ||= []).push(uid);
        allUserIds.add(uid);
      });
    }
    // Resolve names from profiles
    const idToName: Record<string, { name: string; username: string }> = {};
    if (allUserIds.size > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, username, email')
        .in('id', Array.from(allUserIds));
      (profs ?? []).forEach((row: any) => {
        const full =
          row.full_name ||
          [row.first_name, row.last_name].filter(Boolean).join(' ') ||
          row.username ||
          (row.email ?? 'user').split('@')[0];
        const uname = row.username || (row.email ?? 'user').split('@')[0];
        idToName[row.id as string] = { name: String(full), username: String(uname) };
      });
    }
    const mapped: Competition[] = (comps ?? [])
      .filter((row: any) => compIds.includes(row.id as string))
      .map((row: any) => {
        const d = new Date(row.updated_at as string);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const ids = participantsByComp[row.id as string] ?? [me.id];
        const participants: Participant[] = ids.map((uid: string) => ({
          id: uid,
          name:
            uid === me.id
              ? (me.name || 'Du')
              : (idToName[uid]?.name ?? uid.slice(0, 6)),
          co2ReducedKg: 0,
        }));
        return {
          id: row.id as string,
          name: row.name as string,
          description: (row.description as string | null) ?? undefined,
          startDate: (row.start_date as string | null) ?? undefined,
          endDate: (row.end_date as string | null) ?? undefined,
          participants,
          updatedAt: `${yyyy}-${mm}-${dd}`,
        };
      });
    competitions = mapped;
    notify();
    startCo2Sync();
    // Populate current user's CO2 values
    for (const c of mapped) {
      void refreshMyCo2ForCompetition(c.id);
    }
    startCompetitionsRealtime();
  } catch {
    // ignore
  }
}

let listRealtimeStarted = false;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

function startCompetitionsRealtime() {
  if (listRealtimeStarted) return;
  listRealtimeStarted = true;
  try {
    realtimeChannel = supabase
      .channel('realtime:competitions:list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => {
        void loadCompetitionsFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competition_participants' }, () => {
        void loadCompetitionsFromSupabase();
      })
      .subscribe();
  } catch {
    // ignore
  }
}

export function resetCompetitionsStore() {
  competitions = [];
  co2SyncStarted = false;
  listRealtimeStarted = false;
  
  // Rensa realtime-prenumeration
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  
  listeners.clear();
}


