import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Modal, Alert } from 'react-native';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getCompetitionById, subscribe, type Competition } from '@/lib/competitions-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { supabase } from '@/src/lib/supabase';
import { fetchUserCo2SavedSince, fetchUserTotalCo2Saved } from '@/src/services/missions';

// Hämta alltid aktuell användar-ID friskt från Supabase för att undvika caching-problem
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

export default function CompetitionDetailScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [competition, setCompetition] = useState<Competition | undefined>(() =>
    id ? getCompetitionById(id) : undefined
  );
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<Array<{ id: string; name: string; username?: string; co2ReducedKg: number }>>([]);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [canInvite, setCanInvite] = useState<boolean | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [invitePolicy, setInvitePolicy] = useState<'owner_only' | 'all_members'>('owner_only');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  // Hämta aktuell användar-ID när komponenten laddas
  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId);
  }, []);

  useEffect(() => {
    const unsub = subscribe(() => {
      if (typeof id === 'string') {
        setCompetition(getCompetitionById(id));
        void loadLeaderboard();
      }
    });
    return unsub;
  }, [id]);

  async function loadLeaderboard() {
    if (typeof id !== 'string') return;
    try {
      // Hämta alltid aktuell användar-ID friskt
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      // Fetch competition (for start date, owner_id, invite_policy)
      const { data: compRow } = await supabase
        .from('competitions')
        .select('id,name,start_date,owner_id,invite_policy')
        .eq('id', id)
        .single();
      const startDate: string | undefined = (compRow as any)?.start_date ?? competition?.startDate;
      const fetchedOwnerId: string | null = (compRow as any)?.owner_id ?? null;
      const fetchedInvitePolicy: 'owner_only' | 'all_members' = (compRow as any)?.invite_policy ?? 'owner_only';
      
      setOwnerId(fetchedOwnerId);
      setInvitePolicy(fetchedInvitePolicy);
      // Fetch participants from Supabase (authoritative) - only active participants (not left)
      const { data: parts } = await supabase
        .from('competition_participants')
        .select('user_id')
        .eq('competition_id', id)
        .is('left_at', null);
      const userIds = ((parts as any[]) ?? []).map((p) => p.user_id as string);
      if (userIds.length === 0) {
        setEntries([]);
        return;
      }
      // Fetch names from profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, full_name, first_name, last_name, username, email')
        .in('id', userIds);
      const idToName: Record<string, { name: string; username?: string }> = {};
      // Prefill from local participants if present
      (competition?.participants ?? []).forEach((p) => {
        if (p.name) {
          idToName[p.id] = { name: p.name };
        }
      });
      (profs ?? []).forEach((p: any) => {
        const full =
          p.full_name ||
          [p.first_name, p.last_name].filter(Boolean).join(' ') ||
          p.username ||
          (p.email ?? 'user').split('@')[0];
        const uname = p.username || (p.email ?? 'user').split('@')[0];
        idToName[p.id as string] = { name: String(full), username: String(uname) };
      });
      // Compute CO2 for each
      const values = await Promise.all(
        userIds.map(async (uid) => {
          const co2 = startDate
            ? await fetchUserCo2SavedSince(uid, startDate)
            : await fetchUserTotalCo2Saved(uid);
          const entryName = idToName[uid]?.name ?? uid.slice(0, 6);
          const entryUsername = idToName[uid]?.username;
          return { id: uid, name: entryName, username: entryUsername, co2ReducedKg: co2 };
        })
      );
      setEntries(values);
      
      // Determine if current user can invite
      if (userId && fetchedOwnerId) {
        const isActiveParticipant = userIds.includes(userId);
        if (!isActiveParticipant) {
          setCanInvite(false);
        } else if (fetchedInvitePolicy === 'owner_only') {
          // Only owner can see invite button when policy is owner_only
          setCanInvite(userId === fetchedOwnerId);
        } else if (fetchedInvitePolicy === 'all_members') {
          // All participants can see invite button when policy is all_members
          setCanInvite(true);
        } else {
          setCanInvite(false);
        }
      } else {
        setCanInvite(false);
      }
    } catch {
      // ignore
      setCanInvite(false);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      if (typeof id === 'string') {
        setCompetition(getCompetitionById(id));
      }
      void loadLeaderboard();
      setRefreshing(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    void loadLeaderboard();
    // Subscribe to participant changes and user_actions inserts to refresh
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      if (typeof id === 'string') {
        channel = supabase
          .channel('realtime:competition:' + id)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'competition_participants', filter: `competition_id=eq.${id}` },
            () => { void loadLeaderboard(); }
          )
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'user_actions' },
            () => { void loadLeaderboard(); }
          )
          .subscribe();
      }
    } catch {
      // ignore
    }
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => b.co2ReducedKg - a.co2ReducedKg);
  }, [entries]);

  const renderItem = ({ item, index }: { item: { id: string; name: string; username?: string; co2ReducedKg: number }; index: number }) => {
    const isMe = item.id === currentUserId;
    return (
      <View style={[styles.row, isMe && styles.meRow]}>
        <Text style={styles.rank}>{index + 1}</Text>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={[styles.name, isMe && styles.meName]}>{item.name}</Text>
            {item.username ? <Text style={styles.usernameText}>@{item.username}</Text> : null}
          </View>
        </View>
        <Text style={styles.points}>{item.co2ReducedKg.toFixed(1)} kg CO₂e</Text>
      </View>
    );
  };

  const handleLeaveCompetition = async () => {
    if (!currentUserId || typeof id !== 'string') return;
    Alert.alert(
      'Lämna tävling',
      'Är du säker på att du vill lämna denna tävling?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Lämna',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('competition_participants')
                .update({ left_at: new Date().toISOString() })
                .eq('competition_id', id)
                .eq('user_id', currentUserId);
              setShowActionsMenu(false);
              router.back();
            } catch (e: any) {
              Alert.alert('Fel', e?.message || 'Kunde inte lämna tävlingen.');
            }
          },
        },
      ]
    );
  };

  const handleInvitePress = () => {
    setShowActionsMenu(false);
    if (typeof id === 'string') {
      router.push({
        pathname: '/(tabs)/leaderboard/competition/[id]/invite' as any,
        params: { id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: (typeof name === 'string' && name) ? name : competition?.name ?? `Tävling #${id || ''}`,
          headerRight: () =>
            typeof id === 'string' ? (
              <TouchableOpacity
                style={styles.headerBtnIcon}
                accessibilityLabel="Fler åtgärder"
                onPress={() => setShowActionsMenu(true)}
              >
                <FontAwesome6 name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />
      {sorted.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Inga deltagare ännu</Text>
          <Text style={styles.emptyText}>Bjud in vänner för att komma igång.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: insets.top + 56,
              paddingBottom: 100 + insets.bottom + tabBarHeight,
            },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}

      <Modal
        visible={showActionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsMenu(false)}
        >
          <View style={styles.actionsMenu}>
            {canInvite === true && (
              <TouchableOpacity style={styles.actionItem} onPress={handleInvitePress}>
                <Text style={styles.actionText}>Bjud in</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionItem} onPress={handleLeaveCompetition}>
              <Text style={[styles.actionText, styles.actionTextDestructive]}>Lämna tävling</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => setShowActionsMenu(false)}>
              <Text style={styles.actionText}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7c7a3',
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 80,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
  },
  meRow: {
    borderWidth: 2,
    borderColor: '#2f7147',
  },
  rank: {
    width: 24,
    textAlign: 'center',
    fontWeight: '700',
    color: '#1f1f1f',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2f7147',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  name: {
    fontWeight: '600',
    color: '#1f1f1f',
  },
  meName: {
    textDecorationLine: 'underline',
  },
  usernameText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  points: {
    fontWeight: '600',
    color: '#1f1f1f',
  },
  headerBtnIcon: {
    backgroundColor: '#2f7147',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    fontSize: 18,
    marginBottom: 6,
  },
  emptyText: {
    color: '#2a2a2a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionsMenu: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },
  actionItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
    textAlign: 'center',
  },
  actionTextDestructive: {
    color: '#dc2626',
  },
});


