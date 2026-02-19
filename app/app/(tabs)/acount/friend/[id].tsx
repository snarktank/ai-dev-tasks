import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getUserById } from '@/lib/users-store';
import { supabase } from '@/src/lib/supabase';
import { Image } from 'expo-image';
import { areFriends } from '@/lib/friendships';
import {
  DEFAULT_PROFILE_BG,
  PROFILE_BACKGROUNDS_PORTRAIT,
  safeBackgroundKey,
  type ProfileBackgroundKey,
} from '@/src/constants/profileBackgrounds';
import { useHeaderHeight } from '@react-navigation/elements';

function weeksSince(dateIso: string): number {
  const created = new Date(dateIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
}

function formatRankLabel(rank: number | null): string {
  if (!rank || rank < 1 || !Number.isFinite(rank)) return '—';
  if (rank <= 10) return `${rank}a`;
  if (rank <= 50) return 'Top 50';
  if (rank <= 100) return 'Top 100';
  const bucket = Math.ceil(rank / 100) * 100;
  return `Top ${bucket}`;
}

export default function FriendProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userFromStore = typeof id === 'string' ? getUserById(id) : undefined;
  
  // State för att hålla användarprofil (från store eller Supabase)
  const [user, setUser] = useState<any>(userFromStore);
  const [isLoading, setIsLoading] = useState(!userFromStore);
  
  const [relationLabel, setRelationLabel] = useState('');
  const [bgKey, setBgKey] = useState<ProfileBackgroundKey>(DEFAULT_PROFILE_BG);
  const headerHeight = useHeaderHeight();
  const extraTopSpacing = 24;
  const [channelRef, setChannelRef] = useState<ReturnType<typeof supabase.channel> | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [rankLabel, setRankLabel] = useState<string>('—');

  async function refreshWorldRank(forUserId: string) {
    try {
      // Naive global ranking: sum all user_actions per user and compute index
      const { data, error } = await supabase
        .from('user_actions')
        .select('user_id, co2_saved_kg');
      if (error) {
        setRank(null);
        setRankLabel('—');
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
      setRank(position);
      setRankLabel(formatRankLabel(position));
    } catch {
      setRank(null);
      setRankLabel('—');
    }
  }

  useEffect(() => {
    (async () => {
      if (typeof id !== 'string') return;
      
      // Om användaren inte finns i store, ladda från Supabase
      if (!userFromStore) {
        try {
          const { data: prof, error } = await supabase
            .from('profiles')
            .select('id, username, email, created_at, background_key, full_name, first_name, last_name')
            .eq('id', id)
            .single();
          
          if (error || !prof) {
            console.error('Fel vid laddning av profil:', error);
            setIsLoading(false);
            return;
          }
          
          // Bygg displaynamn från profilen (prioritera full_name, sedan first/last, sedan username)
          const fullName = (prof as any).full_name || '';
          const firstName = (prof as any).first_name || '';
          const lastName = (prof as any).last_name || '';
          const displayName = fullName || 
                             [firstName, lastName].filter(Boolean).join(' ') || 
                             (prof as any).username || 
                             (prof as any).email?.split('@')[0] || 
                             'Användare';
          
          // Skapa ett användarobjekt
          const loadedUser = {
            id: (prof as any).id,
            name: displayName,
            username: (prof as any).username || 'user',
            email: (prof as any).email || '',
            createdAt: (prof as any).created_at || new Date().toISOString(),
            friendsCount: 0,
            backgroundKey: (prof as any).background_key,
          };
          
          setUser(loadedUser);
          setIsLoading(false);
          
          // Sätt även background key
          setBgKey(safeBackgroundKey((prof as any).background_key));
        } catch (err) {
          console.error('Fel vid laddning av profil:', err);
          setIsLoading(false);
          return;
        }
      } else {
        // Användaren finns redan i store
        setUser(userFromStore);
        setIsLoading(false);
      }
      
      // Load friend's background key
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('background_key')
          .eq('id', id)
          .single();
        const key: string | null | undefined = (prof as any)?.background_key;
        setBgKey(safeBackgroundKey(key));
      } catch {
        setBgKey(DEFAULT_PROFILE_BG);
      }
      // Realtime for background/profile changes
      try {
        const ch = supabase
          .channel('realtime:friend_profile:' + id)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${id}` },
            (payload: any) => {
              const key = (payload?.new as any)?.background_key ?? (payload?.old as any)?.background_key ?? null;
              setBgKey(safeBackgroundKey(key));
            }
          )
          .subscribe();
        setChannelRef(ch);
      } catch {
        // ignore
      }
      // Compute and subscribe to world rank updates
      await refreshWorldRank(id);
      try {
        const rankChannel = supabase
          .channel('realtime:user_actions_global_rank:' + id)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'user_actions' },
            () => { void refreshWorldRank(id); }
          )
          .subscribe();
        // Merge by just keeping one ref; cleanup will remove any active channel refs below
        setChannelRef(rankChannel);
      } catch {
        // ignore
      }
      const { data: me } = await supabase.auth.getUser();
      const myId = me?.user?.id;
      if (!myId) return;
      // 1) Check friendships
      const friends = await areFriends(id);
      if (friends) {
        setRelationLabel(' • Vänner');
      } else {
        // 2) Otherwise, see if there is a pending friend_request
        const { data: pend } = await supabase
          .from('friend_requests')
          .select('from_user_id, to_user_id, status, created_at')
          .eq('status', 'pending')
          .or(`and(from_user_id.eq.${myId},to_user_id.eq.${id}),and(from_user_id.eq.${id},to_user_id.eq.${myId})`)
          .order('created_at', { ascending: false })
          .limit(1);
        const r = (pend ?? [])[0] as { from_user_id: string; to_user_id: string; status: string } | undefined;
        if (r?.status === 'pending' && r.from_user_id === myId) {
          setRelationLabel(' • Förfrågan skickad');
        } else if (r?.status === 'pending' && r.to_user_id === myId) {
          setRelationLabel(' • Förfrågan till dig');
        } else {
          setRelationLabel('');
        }
      }
    })();
    return () => {
      if (channelRef) supabase.removeChannel(channelRef);
    };
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + extraTopSpacing }]}>
        <Stack.Screen
          options={{
            title: 'Profil',
            headerTransparent: true,
            headerStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
          }}
        />
        <Text style={styles.missing}>Laddar profil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: headerHeight + extraTopSpacing }]}>
        <Stack.Screen
          options={{
            title: 'Profil',
            headerTransparent: true,
            headerStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
          }}
        />
        <Text style={styles.missing}>Kunde inte hitta profilen.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: headerHeight + extraTopSpacing }]}>
      {/* Full-screen background image (top-aligned cover) */}
      <View style={styles.bgContainer} pointerEvents="none">
        <Image source={PROFILE_BACKGROUNDS_PORTRAIT[bgKey]} style={styles.bgImage} contentFit="cover" contentPosition="top center" />
        <View style={styles.bgOverlay} />
      </View>
      <Stack.Screen
        options={{
          title: 'Profil',
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}{relationLabel}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{rankLabel}</Text>
          <Text style={styles.statLabel}>Rank</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{weeksSince(user.createdAt)}</Text>
          <Text style={styles.statLabel}>Tid i appen (v)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a7c7a3', paddingHorizontal: 16 },
  missing: { color: '#1f1f1f' },
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
  profileHeader: { alignItems: 'center', marginBottom: 54 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2f7147',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 28 },
  name: { fontSize: 18, fontWeight: '700', color: '#1f1f1f' },
  username: { color: '#2a2a2a' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: { fontWeight: '700', fontSize: 18, color: '#1f1f1f' },
  statLabel: { color: '#2a2a2a', marginTop: 4 },
});


