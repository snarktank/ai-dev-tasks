import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { getFriends, isValidEmail, isValidUsername, subscribeUsers } from '@/lib/users-store';
import { getPendingInvitesForCompetition, subscribeInvites, addPendingInvites, syncPendingInvitesForCompetition } from '@/lib/invites-store';
import { subscribeFriendRequests } from '@/lib/friend-requests-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { supabase } from '@/src/lib/supabase';
import { createInvite as createDbInvite } from '@/src/services/invites';
import { useFocusEffect } from '@react-navigation/native';

type SelectableFriend = {
  id: string;
  name: string;
  username: string;
  email: string;
};

export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friends, setFriends] = useState<SelectableFriend[]>(() => getFriends() as unknown as SelectableFriend[]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState(() => (typeof id === 'string' ? getPendingInvitesForCompetition(id) : []));
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  React.useEffect(() => {
    const unsub = subscribeInvites(() => {
      if (typeof id === 'string') {
        setPending(getPendingInvitesForCompetition(id));
      }
    });
    const unsubUsers = subscribeUsers(() => {
      setFriends(getFriends() as unknown as SelectableFriend[]);
    });
    const unsubFriendReq = subscribeFriendRequests(() => {
      // no-op; subscribe triggers store refresh which cascades via subscribeUsers
    });
    return unsub;
  }, [id]);

  // On focus, refresh pending invites for this competition from server,
  // so that already-sent invites are reflected when re-entering.
  useFocusEffect(
    React.useCallback(() => {
      if (typeof id === 'string') {
        void syncPendingInvitesForCompetition(id);
      }
    }, [id])
  );

  // Build a set of friend userIds already invited to this competition (pending)
  const invitedFriendIds = useMemo(() => {
    const ids = new Set<string>();
    for (const inv of pending) {
      if (inv.target.type === 'friend') {
        ids.add((inv.target as { type: 'friend'; userId: string }).userId);
      }
    }
    return ids;
  }, [pending]);

  const toggle = (userId: string) => {
    setSelected((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const onSendSelected = async () => {
    const friendIds = Object.keys(selected).filter((k) => selected[k]);
    if (friendIds.length === 0 || typeof id !== 'string') {
      Alert.alert('Välj minst en vän');
      return;
    }
    setSubmitting(true);
    try {
      let ok = 0;
      let fail = 0;
      let firstError: string | null = null;
      // Skip already invited friends just in case
      const filtered = friendIds.filter((uid) => !invitedFriendIds.has(uid));
      for (const userId of filtered) {
        try {
          await createDbInvite(id, userId);
          ok++;
        } catch (e: any) {
          if (!firstError) firstError = e?.message ?? String(e);
          fail++;
        }
      }
      // Immediately reflect locally to prevent re-inviting right away
      if (filtered.length > 0) {
        addPendingInvites(id, filtered.map((uid) => ({ type: 'friend', userId: uid } as const)));
      }
      const base = `Skickade ${ok} inbjudning(ar)` + (fail ? `, misslyckades: ${fail}` : '');
      if (fail && firstError) {
        Alert.alert('Klar (med fel)', `${base}\n\nFel: ${firstError}`);
      } else {
        Alert.alert('Klar', base);
      }
      setSelected({});
    } catch (e) {
      Alert.alert('Något gick fel', 'Försök igen senare.');
    } finally {
      setSubmitting(false);
    }
  };

  const onInviteQuery = async () => {
    if (typeof id !== 'string') return;
    const trimmed = query.trim();
    if (!trimmed) {
      Alert.alert('Ange ett användarnamn eller en e‑postadress');
      return;
    }
    let userId: string | null = null;
    if (isValidEmail(trimmed)) {
      const { data } = await supabase.from('profiles').select('id').eq('email', trimmed).single();
      userId = (data as any)?.id ?? null;
    } else if (isValidUsername(trimmed)) {
      const { data } = await supabase.from('profiles').select('id').eq('username', trimmed).single();
      userId = (data as any)?.id ?? null;
    }
    if (!userId) {
      Alert.alert('Hittade inte användaren', 'Kontrollera stavning eller använd en giltig e‑post.');
      return;
    }
    setSubmitting(true);
    try {
      await createDbInvite(id, userId);
      Alert.alert('Inbjudan skickad', 'Notis skickas till användaren.');
      // Reflect locally
      addPendingInvites(id, [{ type: 'friend', userId }]);
      setQuery('');
    } catch (e) {
      Alert.alert('Något gick fel', 'Försök igen senare.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFriend = ({ item }: { item: SelectableFriend }) => {
    const isAlreadyInvited = invitedFriendIds.has(item.id);
    const checked = !isAlreadyInvited && !!selected[item.id];
    return (
      <TouchableOpacity
        style={styles.friendRow}
        onPress={() => {
          if (!isAlreadyInvited) toggle(item.id);
        }}
        disabled={isAlreadyInvited}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checkboxChecked,
            isAlreadyInvited && styles.checkboxDisabled,
          ]}
        />
        <View style={styles.friendMain}>
          <Text style={[styles.friendName, isAlreadyInvited && styles.friendNameDisabled]}>
            {item.name}
          </Text>
          <Text style={[styles.friendMeta, isAlreadyInvited && styles.friendMetaDisabled]}>
            @{item.username}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 56,
          paddingBottom: 16 + insets.bottom + tabBarHeight,
        },
      ]}
    >
      <Stack.Screen options={{ title: 'Bjud in vänner' }} />

      <Text style={styles.sectionTitle}>Vänlista</Text>
      <FlatList
        data={friends}
        keyExtractor={(f) => f.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={[styles.primaryBtn, submitting && styles.btnDisabled]}
        onPress={onSendSelected}
        disabled={submitting}
      >
        <Text style={styles.primaryBtnText}>Skicka inbjudan</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Sök och bjud in nya</Text>
      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sök på användarnamn eller e‑post"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.secondaryBtn, submitting && styles.btnDisabled]}
          onPress={onInviteQuery}
          disabled={submitting}
        >
          <Text style={styles.secondaryBtnText}>Bjud in</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7c7a3',
    padding: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
  },
  listContent: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2f7147',
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#2f7147',
  },
  checkboxDisabled: {
    borderColor: '#bdbdbd',
    backgroundColor: '#e9e9e9',
  },
  friendMain: {
    flex: 1,
  },
  friendName: {
    fontWeight: '600',
    color: '#1f1f1f',
  },
  friendNameDisabled: {
    color: '#b0b0b0',
  },
  friendMeta: {
    color: '#2a2a2a',
    fontSize: 12,
  },
  friendMetaDisabled: {
    color: '#b0b0b0',
  },
  primaryBtn: {
    backgroundColor: '#2f7147',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  secondaryBtn: {
    backgroundColor: '#2f7147',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pendingText: {
    color: '#1f1f1f',
  },
  acceptBtn: {
    backgroundColor: '#2f7147',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});


