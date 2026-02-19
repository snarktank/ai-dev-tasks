import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { type User } from '@/lib/users-store';
import { supabase } from '@/src/lib/supabase';
import { getMyFriendIds } from '@/lib/friendships';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

type FriendWithTotal = User & { totalCo2: number };

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendWithTotal[]>([]);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let actionsChannel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: me } = await supabase.auth.getUser();
      const myId = me?.user?.id;
      if (!myId) return;
      async function load() {
        // Hämta vänners userIds via friendships
        const otherIds = await getMyFriendIds();
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, username, full_name, first_name, last_name, email')
          .in('id', otherIds.length ? otherIds : ['00000000-0000-0000-0000-000000000000']);
        // Sum CO2 totals for all friend ids in one query
        const { data: actions } = await supabase
          .from('user_actions')
          .select('user_id, co2_saved_kg')
          .in('user_id', otherIds.length ? otherIds : ['00000000-0000-0000-0000-000000000000']);
        const totals = new Map<string, number>();
        for (const row of (actions as any[]) ?? []) {
          const uid = String((row as any).user_id ?? '');
          const val = Number((row as any).co2_saved_kg ?? 0) || 0;
          totals.set(uid, (totals.get(uid) ?? 0) + val);
        }
        const mapped: FriendWithTotal[] =
          (profs ?? []).map((p: any) => {
            const fullName =
              p.full_name ||
              [p.first_name, p.last_name].filter(Boolean).join(' ') ||
              p.username ||
              (p.email ?? 'user').split('@')[0];
            const total = totals.get(p.id as string) ?? 0;
            return {
              id: p.id,
              name: fullName,
              username: p.username ?? (p.email ?? 'user').split('@')[0],
              email: p.email ?? '',
              createdAt: new Date().toISOString().slice(0, 10),
              totalCo2: total,
            } as FriendWithTotal;
          }) ?? [];
        // Sort by total saved CO2 desc
        setFriends(mapped.sort((a, b) => b.totalCo2 - a.totalCo2));
      }
      await load();
      // Realtime: uppdatera när friendships ändras
      channel = supabase
        .channel('realtime:friendships_list:' + myId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'friendships', filter: `user_low=eq.${myId}` },
          load
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'friendships', filter: `user_high=eq.${myId}` },
          load
        )
        .subscribe();
      // Realtime: uppdatera när user_actions får nya rader (någon vän loggar en handling)
      actionsChannel = supabase
        .channel('realtime:friends_user_actions')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_actions' },
          load
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
      if (actionsChannel) supabase.removeChannel(actionsChannel);
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 56 }]}>
      <Stack.Screen options={{ title: 'Vänner' }} />
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        {friends.length > 0 ? (
          <Text style={styles.subTitle}>
            Du har {friends.length} {friends.length === 1 ? 'vän' : 'vänner'}
          </Text>
        ) : (
          <Text style={styles.subTitle}>Du har ännu inga vänner.</Text>
        )}
      </View>
      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        renderItem={({ item }) => (
          <Link href={{ pathname: '/(tabs)/acount/friend/[id]', params: { id: item.id } }} asChild>
            <TouchableOpacity style={styles.row} accessibilityLabel={`Visa profil för ${item.name}`}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.main}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.user}>@{item.username} • Vän</Text>
            </View>
            <Text style={styles.co2}>{item.totalCo2.toFixed(1)} kg</Text>
            </TouchableOpacity>
          </Link>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 16 + insets.bottom + tabBarHeight },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a7c7a3' },
  subTitle: { color: '#1f1f1f' },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2f7147',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: '700' },
  main: { flex: 1 },
  name: { fontWeight: '700', color: '#1f1f1f' },
  user: { color: '#2a2a2a', fontSize: 12 },
  co2: { fontWeight: '700', color: '#1f1f1f' },
});


