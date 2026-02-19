import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getCompetitions } from '@/lib/competitions-store';
import { getCurrentUser, subscribeUsers, setCurrentUser, type User } from '@/lib/users-store';
import { getMyFriendIds } from '@/lib/friendships';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { isLoggedIn } from '@/lib/session';
import { supabase } from '@/src/lib/supabase';
import { Image } from 'expo-image';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {
  DEFAULT_PROFILE_BG,
  PROFILE_BACKGROUNDS_PORTRAIT,
  safeBackgroundKey,
  type ProfileBackgroundKey,
} from '@/src/constants/profileBackgrounds';
// friend_requests is no longer used for friend counts/lists; we rely on public.friendships

type FriendWithTotal = User & { totalCo2: number };

function formatRankLabel(rank: number | null): string {
  if (!rank || rank < 1 || !Number.isFinite(rank)) return '—';
  if (rank <= 10) return `${rank}a`;
  if (rank <= 50) return 'Top 50';
  if (rank <= 100) return 'Top 100';
  const bucket = Math.ceil(rank / 100) * 100;
  return `Top ${bucket}`;
}

function computeFriendTotals(): FriendWithTotal[] { return []; }

function computeMyRank(myId: string): number {
  const comps = getCompetitions();
  const friends = getFriends();
  const totals: Record<string, number> = {};
  for (const c of comps) {
    for (const p of c.participants) {
      totals[p.id] = (totals[p.id] ?? 0) + p.co2ReducedKg;
    }
  }
  const myTotal = totals[myId] ?? 0;
  const leaderboard = [
    ...friends.map((f) => ({ id: f.id, total: totals[f.id] ?? 0 })),
    { id: myId, total: myTotal },
  ].sort((a, b) => b.total - a.total);
  const idx = leaderboard.findIndex((e) => e.id === myId);
  return idx >= 0 ? idx + 1 : 1;
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const extraTopSpacing = 24; // push content a bit further down
  const [me, setMe] = useState(getCurrentUser());
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [friends, setFriends] = useState<FriendWithTotal[]>(computeFriendTotals());
  const [friendCount, setFriendCount] = useState<number>(0);
  const [bgKey, setBgKey] = useState<ProfileBackgroundKey>(DEFAULT_PROFILE_BG);
  const [worldRank, setWorldRank] = useState<number | null>(null);
  const [worldRankLabel, setWorldRankLabel] = useState<string>('—');

  async function loadFriendTotalsFromSupabase() {
    try {
      const ids = await getMyFriendIds();
      if (ids.length === 0) {
        setFriends([]);
        return;
      }
      const { data: actions } = await supabase
        .from('user_actions')
        .select('user_id, co2_saved_kg')
        .in('user_id', ids);
      const totals = new Map<string, number>();
      for (const row of (actions as any[]) ?? []) {
        const uid = String((row as any).user_id ?? '');
        const val = Number((row as any).co2_saved_kg ?? 0) || 0;
        totals.set(uid, (totals.get(uid) ?? 0) + val);
      }
      // Fetch basic profile info for friend names/usernames
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, full_name, first_name, last_name, email')
        .in('id', ids);
      const mapped: FriendWithTotal[] = (profs as any[] ?? []).map((p) => {
        const fullName =
          p.full_name ||
          [p.first_name, p.last_name].filter(Boolean).join(' ') ||
          p.username ||
          (p.email ?? 'user').split('@')[0];
        return {
          id: p.id,
          name: fullName,
          username: p.username ?? (p.email ?? 'user').split('@')[0],
          email: p.email ?? '',
          createdAt: new Date().toISOString().slice(0, 10),
          totalCo2: totals.get(p.id as string) ?? 0,
        } as FriendWithTotal;
      });
      setFriends(mapped.sort((a, b) => b.totalCo2 - a.totalCo2));
    } catch {
      setFriends([]);
    }
  }

  async function refreshWorldRank(forUserId: string) {
    try {
      const { data, error } = await supabase
        .from('user_actions')
        .select('user_id, co2_saved_kg');
      if (error) {
        setWorldRank(null);
        setWorldRankLabel('—');
        return;
      }
      const totals = new Map<string, number>();
      for (const row of (data as any[]) ?? []) {
        const uid = String((row as any).user_id ?? '');
        const val = Number((row as any).co2_saved_kg ?? 0) || 0;
        totals.set(uid, (totals.get(uid) ?? 0) + val);
      }
      const sorted = [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([uid]) => uid);
      const idx = sorted.findIndex((uid) => uid === forUserId);
      const position = idx >= 0 ? idx + 1 : null;
      setWorldRank(position);
      setWorldRankLabel(formatRankLabel(position));
    } catch {
      setWorldRank(null);
      setWorldRankLabel('—');
    }
  }

  useEffect(() => {
    (async () => {
      // Kontrollera Supabase-session i första hand (mer robust än lokalt token)
      setCheckingAuth(true);
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const ok = await isLoggedIn();
        if (!ok) {
          // Små delay för att säkerställa att router är redo
          setTimeout(() => {
            router.replace('/login');
          }, 100);
          return;
        }
      }
      // Hämta inloggad användare från Supabase och uppdatera profilvisningen
      const userRes = await supabase.auth.getUser();
      const user = userRes.data.user;
      if (user) {
        // Ladda antal vänner från Supabase (accepted relationer)
        try {
          const myId = user.id;
          const { data: rels } = await supabase
            .from('friendships')
            .select('user_low,user_high')
            .or(`user_low.eq.${myId},user_high.eq.${myId}`);
          const ids = new Set<string>();
          for (const r of (rels as any[]) ?? []) {
            ids.add(r.user_low === myId ? r.user_high : r.user_low);
          }
          setFriendCount(ids.size);
        } catch {
          // ignore
        }
        let username: string | undefined;
        let fullName: string | undefined;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name, first_name, last_name, background_key')
            .eq('id', user.id)
            .single();
          username = (profile as any)?.username ?? undefined;
          // Försök använda full_name, annars sätt ihop first/last om de finns
          const pfFirst: string | undefined = (profile as any)?.first_name;
          const pfLast: string | undefined = (profile as any)?.last_name;
          fullName = (profile as any)?.full_name ?? ([pfFirst, pfLast].filter(Boolean).join(' ') || undefined);
          const key: string | null | undefined = (profile as any)?.background_key;
          setBgKey(safeBackgroundKey(key));
          // Uppdatera lokalt state för instant UI (utan att vänta på realtime)
          updateCurrentUser({ backgroundKey: safeBackgroundKey(key) });
        } catch {
          // Ignorera fel vid läsning av profil
        }
        // Ladda global rank
        await refreshWorldRank(user.id);
        // Ladda vänners CO2-besparing
        await loadFriendTotalsFromSupabase();
        const meta = user.user_metadata ?? {};
        const metaFirst = typeof meta.first_name === 'string' ? meta.first_name : '';
        const metaLast = typeof meta.last_name === 'string' ? meta.last_name : '';
        const fallbackName = [metaFirst, metaLast].filter(Boolean).join(' ');
        const emailPrefix = (user.email ?? '').split('@')[0] ?? 'user';
        const nextMe: User = {
          id: user.id,
          name: fullName || fallbackName || username || emailPrefix,
          username: username || (typeof meta.username === 'string' ? meta.username : emailPrefix),
          email: user.email ?? '',
          avatarUrl: undefined,
          createdAt: user.created_at ?? new Date().toISOString(),
          friendsCount: me.friendsCount,
        };
        setMe(nextMe);
        setCurrentUser(nextMe);
      }
      setCheckingAuth(false);
    })();
  }, []);

  useEffect(() => {
    const unsub = subscribeUsers(() => {
      setMe(getCurrentUser());
      void loadFriendTotalsFromSupabase();
      const k = getCurrentUser().backgroundKey;
      if (k) setBgKey(k);
    });
    // Realtime för ändrade relationer påverkar vännantal
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let channelRank: ReturnType<typeof supabase.channel> | null = null;
    let channelFriendTotals: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      try {
        const { data: me } = await supabase.auth.getUser();
        const myId = me?.user?.id;
        if (!myId) return;
        async function reloadCount() {
          const { data: rels } = await supabase
            .from('friend_requests')
            .select('from_user_id, to_user_id')
            .eq('status', 'accepted')
            .or(`from_user_id.eq.${myId},to_user_id.eq.${myId}`);
          const otherIds = Array.from(
            new Set(
              (rels ?? []).map((r: any) => (r.from_user_id === myId ? r.to_user_id : r.from_user_id))
            )
          );
          setFriendCount(otherIds.length);
        }
        async function reloadRank() {
          await refreshWorldRank(myId);
        }
        channel = supabase
          .channel('realtime:friend_count:' + myId)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'friendships', filter: `user_low=eq.${myId}` },
            reloadCount
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'friendships', filter: `user_high=eq.${myId}` },
            reloadCount
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${myId}` },
            (payload: any) => {
              const key = (payload?.new as any)?.background_key ?? (payload?.old as any)?.background_key ?? null;
              setBgKey(safeBackgroundKey(key));
            }
          )
          .subscribe();
        // Lyssna på globala insättningar i user_actions för att uppdatera rank
        channelRank = supabase
          .channel('realtime:world_rank')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'user_actions' },
            reloadRank
          )
          .subscribe();
        // Lyssna på user_actions för att uppdatera vänners totals
        channelFriendTotals = supabase
          .channel('realtime:friends_totals:' + myId)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'user_actions' },
            () => { void loadFriendTotalsFromSupabase(); }
          )
          .subscribe();
      } catch {
        // ignore
      }
    })();
    return () => {
      unsub();
      if (channel) supabase.removeChannel(channel);
      if (channelRank) supabase.removeChannel(channelRank);
      if (channelFriendTotals) supabase.removeChannel(channelFriendTotals);
    };
  }, []);

  const top3 = useMemo(() => friends.slice(0, 3), [friends]);

  if (checkingAuth) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: headerHeight + extraTopSpacing }]}>
      {/* Full-screen background image (top-aligned cover) */}
      <View style={styles.bgContainer} pointerEvents="none">
        <Image
          source={PROFILE_BACKGROUNDS_PORTRAIT[bgKey]}
          style={styles.bgImage}
          contentFit="cover"
          contentPosition="top center"
        />
        <View style={styles.bgOverlay} />
      </View>
      <Stack.Screen
        options={{
          title: 'Profil',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          headerRight: () => (
            <Link href="/(tabs)/acount/settings" asChild>
              <TouchableOpacity style={styles.headerBtn} accessibilityLabel="Profilinställningar">
                <FontAwesome6 name="gear" size={18} color="#fff" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{me.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{me.name}</Text>
        <Text style={styles.username}>@{me.username}</Text>
      </View>

      <View style={styles.statsRow}>
        <Link href="/(tabs)/acount/friends" asChild>
          <TouchableOpacity style={styles.statBox} accessibilityLabel="Visa vänner">
            <Text style={styles.statNumber}>{friendCount}</Text>
            <Text style={styles.statLabel}>Vänner</Text>
          </TouchableOpacity>
        </Link>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{worldRankLabel}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Vänner (topp 3)</Text>
        <Link href="/(tabs)/acount/friends" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>Visa alla</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {top3.length === 0 ? (
        <Text style={styles.emptyText}>Inga vänner ännu. Lägg till en ny vän!</Text>
      ) : (
        <View style={styles.listContent}>
          {top3.map((item) => (
            <Link key={item.id} href={{ pathname: '/(tabs)/acount/friend/[id]', params: { id: item.id } }} asChild>
              <TouchableOpacity style={styles.friendRow} accessibilityLabel={`Visa profil för ${item.name}`}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={styles.friendMain}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendUser}>@{item.username}</Text>
              </View>
              <Text style={styles.friendCo2}>{item.totalCo2.toFixed(1)} kg</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      )}

      <Link href="/(tabs)/acount/search" asChild>
        <TouchableOpacity style={styles.newFriendBtn} accessibilityLabel="Ny vän">
          <IconSymbol name="person.badge.plus" size={18} color="#fff" />
          <Text style={styles.newFriendText}>Ny vän</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7c7a3',
    paddingHorizontal: 16,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#a7c7a3',
    opacity: 0.2,
  },
  headerBtn: {
    backgroundColor: '#2f7147',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 54,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2f7147',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
  },
  username: {
    color: '#2a2a2a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1f1f1f',
  },
  statLabel: {
    color: '#2a2a2a',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    fontSize: 16,
  },
  emptyText: {
    color: '#1f1f1f',
    marginTop: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#1f1f1f',
    textDecorationLine: 'underline',
  },
  listContent: {
    marginTop: 8,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f7147',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  friendAvatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  friendMain: {
    flex: 1,
  },
  friendName: {
    fontWeight: '700',
    color: '#1f1f1f',
  },
  friendUser: {
    color: '#2a2a2a',
    fontSize: 12,
  },
  friendCo2: {
    fontWeight: '700',
    color: '#1f1f1f',
  },
  newFriendBtn: {
    marginTop: 8,
    backgroundColor: '#2f7147',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  newFriendText: {
    color: '#fff',
    fontWeight: '700',
  },
});


