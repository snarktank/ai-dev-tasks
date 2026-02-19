import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { Stack } from 'expo-router';
import { isValidEmail, isValidUsername } from '@/lib/users-store';
import { supabase } from '@/src/lib/supabase';
import {
  getInboundPending,
  subscribeFriendRequests,
  addFriendRequest,
  hasAnyRelation,
  type FriendRequest,
} from '@/lib/friend-requests-store';
import { areFriends } from '@/lib/friendships';
import { addFriend } from '@/lib/users-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchFriendScreen() {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [senderById, setSenderById] = useState<Record<string, { name: string; username: string }>>({});
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<null | { id: string; name: string; username: string }>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { data: me } = await supabase.auth.getUser();
      const myId = me?.user?.id;
      if (!myId) return;
      setIncoming(getInboundPending(myId));
      unsub = subscribeFriendRequests(() => {
        setIncoming(getInboundPending(myId));
      });
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Ladda avsändarens för- och efternamn + användarnamn för inkommande förfrågningar
  useEffect(() => {
    (async () => {
      const ids = Array.from(new Set(incoming.map((r) => r.fromUserId)));
      if (ids.length === 0) {
        setSenderById({});
        return;
      }
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, full_name, first_name, last_name')
        .in('id', ids);
      const map: Record<string, { name: string; username: string }> = {};
      for (const p of (profs as any[]) ?? []) {
        const fullName =
          p.full_name ||
          [p.first_name, p.last_name].filter(Boolean).join(' ') ||
          p.username ||
          'Användare';
        map[p.id] = { name: fullName, username: p.username ?? 'user' };
      }
      setSenderById(map);
    })();
  }, [incoming]);

  const incomingDetailed = useMemo(
    () =>
      incoming.map((r) => ({
        req: r,
        name: senderById[r.fromUserId]?.name ?? 'Användare',
        username: senderById[r.fromUserId]?.username ?? 'user',
      })),
    [incoming, senderById]
  );

  const onAdd = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      Alert.alert('Ange e‑post eller användarnamn');
      return;
    }
    let username = '';
    if (isValidEmail(trimmed)) {
      username = trimmed.split('@')[0].toLowerCase();
    } else if (isValidUsername(trimmed)) {
      username = trimmed.replace(/^@/, '').toLowerCase();
    }
    if (!username) {
      Alert.alert('Ogiltig input', 'Skriv en giltig e‑post eller ett användarnamn.');
      return;
    }
    setSearching(true);
    setFound(null);
    (async () => {
      try {
        // slå upp användare via username
        const { data: prof, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, first_name, last_name, email')
          .ilike('username', username)
          .single();
        if (error || !prof) {
          Alert.alert('Hittade inte användare', 'Kontrollera användarnamnet.');
          setFound(null);
          return;
        }
        const fullName =
          (prof as any)?.full_name ||
          ([ (prof as any)?.first_name, (prof as any)?.last_name ].filter(Boolean).join(' ')) ||
          (prof as any)?.username ||
          ((prof as any)?.email ?? 'user').split('@')[0];
        setFound({
          id: (prof as any).id,
          name: fullName,
          username: (prof as any).username ?? ((prof as any)?.email ?? 'user').split('@')[0],
        });
      } finally {
        setSearching(false);
      }
    })();
  };

  const onSendToFound = async () => {
    if (!found) return;
    setSubmitting(true);
    try {
      const { data: me } = await supabase.auth.getUser();
      const myId = me?.user?.id;
      if (!myId) {
        Alert.alert('Logga in', 'Du måste vara inloggad för att skicka en förfrågan.');
        return;
      }
      if (found.id === myId) {
        Alert.alert('Ogiltigt', 'Du kan inte skicka en förfrågan till dig själv.');
        return;
      }
      if (await areFriends(found.id)) {
        Alert.alert('Redan vänner', 'Ni är redan vänner.');
        return;
      }
      if (hasAnyRelation(myId, found.id)) {
        Alert.alert('Redan skickad', 'Det finns redan en aktiv förfrågan mellan er.');
        return;
      }
      await addFriendRequest({ toUserId: found.id });
      Alert.alert('Vänförfrågan skickad', `@${found.username} har fått en förfrågan.`);
      setFound(null);
      setQuery('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 56, paddingBottom: insets.bottom }]}>
      <ImageBackground 
        source={require('@/assets/images/main_background/bg_friend.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Stack.Screen options={{ title: 'Sök ny vän' }} />
      <View style={styles.card}>
        <Text style={styles.label}>Sök på användarnamn eller e‑post</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="@anvandarnamn eller namn@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.button, (searching || submitting) && styles.disabled]}
          onPress={onAdd}
          disabled={searching || submitting}
        >
          <Text style={styles.buttonText}>{searching ? 'Söker...' : 'Sök'}</Text>
        </TouchableOpacity>
      </View>
      {found && (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.resultName}>{found.name}</Text>
          <Text style={styles.resultUser}>@{found.username}</Text>
          <TouchableOpacity
            style={[styles.button, submitting && styles.disabled, { marginTop: 12 }]}
            onPress={onSendToFound}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>Skicka vänförfrågan</Text>
          </TouchableOpacity>
        </View>
      )}
      {incomingDetailed.length > 0 && (
        <View style={[styles.card, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>Vänförfrågningar</Text>
          {incomingDetailed.map(({ req, name, username }) => (
            <View key={req.id} style={styles.requestRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{name}</Text>
                <Text style={styles.requestUser}>@{username}</Text>
              </View>
              <TouchableOpacity
                accessibilityLabel="Acceptera"
                style={styles.acceptBtn}
                onPress={async () => {
                  try {
                    const { error } = await supabase.rpc('respond_friend_request', {
                      p_friend_request_id: req.id,
                      p_accept: true,
                    });
                    if (error) throw new Error(error.message);
                    Alert.alert('Klart', `Du och @${username} är nu vänner.`);
                  } catch (e: any) {
                    Alert.alert('Fel', e?.message ?? 'Kunde inte acceptera förfrågan.');
                  }
                }}
              >
                <Text style={styles.acceptText}>Acceptera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Neka"
                style={styles.declineBtn}
                onPress={async () => {
                  try {
                    const { error } = await supabase.rpc('respond_friend_request', {
                      p_friend_request_id: req.id,
                      p_accept: false,
                    });
                    if (error) throw new Error(error.message);
                  } catch (e: any) {
                    Alert.alert('Fel', e?.message ?? 'Kunde inte neka förfrågan.');
                  }
                }}
              >
                <Text style={styles.declineText}>Neka</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', padding: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
  },
  label: { fontWeight: '700', color: '#1f1f1f', marginBottom: 8 },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  button: {
    backgroundColor: '#2f7147',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  sectionTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
    fontSize: 16,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6e6e6',
  },
  requestName: { fontWeight: '700', color: '#1f1f1f' },
  requestUser: { color: '#6f6f6f', fontSize: 12 },
  resultName: { fontWeight: '700', color: '#1f1f1f' },
  resultUser: { color: '#6f6f6f', fontSize: 12, marginTop: 2 },
  acceptBtn: {
    backgroundColor: '#2f7147',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  acceptText: { color: '#fff', fontWeight: '700' },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: '#b83a3a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  declineText: { color: '#b83a3a', fontWeight: '700' },
});

