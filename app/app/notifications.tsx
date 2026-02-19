import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ImageBackground } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { supabase } from '@/src/lib/supabase';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, subscribeToNotifications, type NotificationRow } from '@/src/services/notifications';
import { acceptInvite as acceptDbInvite, declineInvite as declineDbInvite } from '@/src/services/invites';
import { loadCompetitionsFromSupabase } from '@/lib/competitions-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [profileCache, setProfileCache] = useState<Record<string, { name: string; username: string }>>({});
  const insets = useSafeAreaInsets();

  const typeIconMap = useMemo<Record<string, string>>(
    () => ({
      competition_invite: 'envelope',
      friend_request: 'user-plus',
      friend_request_accepted: 'user-check',
    }),
    []
  );

  function formatTimeAgo(iso: string): string {
    const created = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - created);
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) {
      const v = Math.max(1, minutes);
      return `${v} min`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} h`;
    }
    const days = Math.floor(hours / 24);
    return `${days} d`;
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const ok = !!data?.user?.id;
      setLoggedIn(ok);
      if (!ok) {
        setLoading(false);
        return;
      }
      try {
        const rows = await fetchNotifications();
        setItems(rows);
      } catch (e: any) {
        Alert.alert('Kunde inte hämta notiser', e?.message ?? 'Försök igen senare.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    const unsub = subscribeToNotifications((row) => {
      setItems((prev) => [row, ...prev]);
    });
    return () => { unsub(); };
  }, [loggedIn]);

  // Fetch missing sender profiles for friend_request notifications lacking name/username
  useEffect(() => {
    (async () => {
      const pendingFetches: string[] = [];
      for (const it of items) {
        if (it.type !== 'friend_request' || !it.metadata) continue;
        const meta = it.metadata as any;
        const fromUserId = meta?.from_user_id as string | undefined;
        const hasNames = Boolean(meta?.from_name) && Boolean(meta?.from_username);
        if (fromUserId && !hasNames && !profileCache[fromUserId]) {
          pendingFetches.push(fromUserId);
        }
      }
      if (pendingFetches.length === 0) return;
      try {
        // Fetch profiles in parallel but capped by Supabase API (batch sequentially to simplify)
        const updates: Record<string, { name: string; username: string }> = {};
        for (const uid of pendingFetches) {
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('id, username, full_name, first_name, last_name, email')
              .eq('id', uid)
              .single();
            if (prof) {
              const fullName =
                (prof as any).full_name ||
                ([ (prof as any).first_name, (prof as any).last_name ].filter(Boolean).join(' ')) ||
                (prof as any).username ||
                ((prof as any).email ?? 'user').split('@')[0];
              const username =
                (prof as any).username || ((prof as any).email ?? 'user').split('@')[0];
              updates[uid] = { name: fullName, username };
            }
          } catch {
            // ignore individual fetch failure
          }
        }
        if (Object.keys(updates).length > 0) {
          setProfileCache((prev) => ({ ...prev, ...updates }));
        }
      } catch {
        // ignore
      }
    })();
  }, [items, profileCache]);

  const onRefresh = useCallback(() => {
    if (!loggedIn) return;
    setRefreshing(true);
    (async () => {
      try {
        const rows = await fetchNotifications();
        setItems(rows);
      } catch (e: any) {
        Alert.alert('Kunde inte uppdatera notiser', e?.message ?? 'Försök igen senare.');
      } finally {
        setRefreshing(false);
      }
    })();
  }, [loggedIn]);

  // Markera alla olästa notiser som lästa när sidan får fokus
  useFocusEffect(
    useCallback(() => {
      if (!loggedIn || items.length === 0) return;
      
      const unreadItems = items.filter((item) => !item.read_at);
      if (unreadItems.length === 0) return;

      (async () => {
        try {
          await markAllNotificationsRead();
          // Uppdatera lokalt state för att visa alla som lästa
          setItems((prev) => prev.map((item) => ({
            ...item,
            read_at: item.read_at ?? new Date().toISOString(),
          })));
        } catch (e: any) {
          // Ignorera fel tyst - viktigt att inte störa användarupplevelsen
          console.error('Kunde inte markera notiser som lästa:', e);
        }
      })();
    }, [loggedIn, items])
  );

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/main_background/bg_notification.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Stack.Screen options={{ title: 'Notiser', headerBackTitle: 'Hem' }} />
      {!loggedIn ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Logga in för att se notiser.</Text>
        </View>
      ) : loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Laddar...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Inga notiser just nu.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: insets.top + 56,
              paddingBottom: 24 + insets.bottom,
            },
          ]}
          renderItem={({ item }) => {
            const unread = !item.read_at;
            const createdRel = formatTimeAgo(item.created_at);
            const meta = (item.metadata ?? {}) as any;
            let fromName = meta?.from_name as string | undefined;
            let fromUsername = meta?.from_username as string | undefined;
            const fromUserId = (meta?.from_user_id as string | undefined) ?? undefined;
            if ((!fromName || !fromUsername) && fromUserId && profileCache[fromUserId]) {
              // fill from cache when available
              fromName = fromName || profileCache[fromUserId].name;
              fromUsername = fromUsername || profileCache[fromUserId].username;
            }
            if ((!fromName || !fromUsername) && item.type === 'friend_request' && item.body) {
              // Försök extrahera "Namn (@användare)" från body om metadata saknas
              const match = item.body.match(/^(.*?)\s+\(@([^)]+)\)/);
              if (match) {
                if (!fromName) fromName = match[1]?.trim();
                if (!fromUsername) fromUsername = match[2]?.trim();
              }
            }
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={async () => {
                  if (item.type === 'competition_invite' && item.metadata && (item.metadata as any).invite_id) {
                    const inviteId = (item.metadata as any).invite_id as string;
                    const compId = (item.metadata as any).competition_id as string | undefined;
                    Alert.alert(
                      'Inbjudan',
                      'Vill du gå med i tävlingen?',
                      [
                        {
                          text: 'Avböj',
                          style: 'cancel',
                          onPress: async () => {
                            try {
                              await declineDbInvite(inviteId);
                              await markNotificationRead(item.id);
                              setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
                            } catch (e: any) {
                              Alert.alert('Fel', e?.message ?? 'Kunde inte avböja.');
                            }
                          },
                        },
                        {
                          text: 'Acceptera',
                          style: 'default',
                          onPress: async () => {
                            try {
                              await acceptDbInvite(inviteId);
                              await markNotificationRead(item.id);
                              setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
                              await loadCompetitionsFromSupabase();
                              Alert.alert('Klart', 'Du har gått med i tävlingen.');
                            } catch (e: any) {
                              Alert.alert('Fel', e?.message ?? 'Kunde inte acceptera.');
                            }
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  } else if (item.type === 'friend_request' && item.metadata && (item.metadata as any).friend_request_id) {
                    const requestId = (item.metadata as any).friend_request_id as string;
                    const fromName = (item.metadata as any).from_name as string | undefined;
                    const fromUsername = (item.metadata as any).from_username as string | undefined;
                    const label = fromName ? `${fromName}${fromUsername ? ` (@${fromUsername})` : ''}` : 'Användare';
                    Alert.alert(
                      'Vänförfrågan',
                      `${label} vill bli vän med dig.`,
                      [
                        {
                          text: 'Neka',
                          style: 'cancel',
                          onPress: async () => {
                            try {
                              const { error } = await supabase.rpc('respond_friend_request', {
                                p_friend_request_id: requestId,
                                p_accept: false,
                              });
                              if (error) throw new Error(error.message);
                              await markNotificationRead(item.id);
                              setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
                            } catch (e: any) {
                              Alert.alert('Fel', e?.message ?? 'Kunde inte neka förfrågan.');
                            }
                          },
                        },
                        {
                          text: 'Acceptera',
                          style: 'default',
                          onPress: async () => {
                            try {
                              const { error } = await supabase.rpc('respond_friend_request', {
                                p_friend_request_id: requestId,
                                p_accept: true,
                              });
                              if (error) throw new Error(error.message);
                              await markNotificationRead(item.id);
                              setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n)));
                              Alert.alert('Klart', 'Förfrågan accepterad.');
                            } catch (e: any) {
                              Alert.alert('Fel', e?.message ?? 'Kunde inte acceptera förfrågan.');
                            }
                          },
                        },
                      ],
                      { cancelable: true }
                    );
                  } else {
                    // Standard: markera som läst
                    setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)));
                    try {
                      await markNotificationRead(item.id);
                    } catch (e: any) {
                      Alert.alert('Kunde inte markera som läst', e?.message ?? 'Försök igen senare.');
                    }
                  }
                }}
              >
                <View style={styles.badge}>
                  {typeIconMap[item.type] ? (
                    <FontAwesome6 name={typeIconMap[item.type] as any} size={18} color="#fff" />
                  ) : (
                    <Text style={styles.badgeText}>
                      {item.type}
                    </Text>
                  )}
                </View>
                <View style={styles.main}>
                  <Text style={[styles.title, unread && styles.unread]}>{item.title}</Text>
                  {item.type === 'friend_request' ? (
                    (fromName || fromUsername) ? (
                      <>
                        <Text style={styles.sender}>{fromName ? fromName : 'Okänd'}</Text>
                        {fromUsername ? <Text style={styles.senderUsername}>@{fromUsername}</Text> : null}
                      </>
                    ) : (
                      item.body ? <Text style={styles.msg}>{item.body}</Text> : null
                    )
                  ) : (
                    item.body ? <Text style={styles.msg}>{item.body}</Text> : null
                  )}
                  <Text style={styles.date}>{createdRel}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  listContent: { padding: 16 },
  row: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#2f7147',
    width: 35.2,
    height: 35.2,
    borderRadius: 17.6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  badgeIcon: { width: 26, height: 26 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  main: { flex: 1, position: 'relative', paddingBottom: 18 },
  title: { fontWeight: '700', color: '#1f1f1f' },
  unread: { textDecorationLine: 'underline' },
  sender: { color: '#2a2a2a', marginTop: 4, fontSize: 14 },
  senderUsername: { color: '#6b7280', marginTop: 2, fontSize: 13 },
  msg: { color: '#2a2a2a', marginTop: 2 },
  date: { color: '#2a2a2a', fontSize: 12, position: 'absolute', right: 0, bottom: 0 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  accept: { backgroundColor: '#2f7147' },
  decline: { backgroundColor: '#b83a3a' },
  actionText: { color: '#fff', fontWeight: '700' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#1f1f1f' },
});


