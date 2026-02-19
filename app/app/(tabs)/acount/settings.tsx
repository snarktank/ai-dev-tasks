import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getCurrentUser, getFriends, isValidUsername, updateCurrentUser } from '@/lib/users-store';
import { logout } from '@/lib/session';
import { supabase } from '@/src/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import BackgroundPickerCarousel from '@/src/components/profile/BackgroundPickerCarousel';
import { DEFAULT_PROFILE_BG, safeBackgroundKey, type ProfileBackgroundKey } from '@/src/constants/profileBackgrounds';

export default function SettingsScreen() {
  const router = useRouter();
  const me = getCurrentUser();
  const [name, setName] = useState(me.name);
  const [username, setUsername] = useState(me.username);
  const [saving, setSaving] = useState(false);
  const [bgKey, setBgKey] = useState<ProfileBackgroundKey>(DEFAULT_PROFILE_BG);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const myId = userRes.user?.id;
        if (!myId) return;
        const { data: prof } = await supabase
          .from('profiles')
          .select('background_key')
          .eq('id', myId)
          .single();
        setBgKey(safeBackgroundKey((prof as any)?.background_key));
      } catch {
        setBgKey(DEFAULT_PROFILE_BG);
      }
    })();
  }, []);

  const onSave = async () => {
    const trimmedName = name.trim();
    const trimmedUser = username.trim();
    const normalizedUser = trimmedUser.toLowerCase();
    if (!trimmedName) {
      Alert.alert('Namn krävs');
      return;
    }
    if (!isValidUsername(normalizedUser)) {
      Alert.alert('Ogiltigt användarnamn', 'Minst 3 tecken, a-ö, siffror, _ eller .');
      return;
    }
    setSaving(true);
    try {
      // Optimistisk uppdatering lokalt så profilfliken byter bakgrund direkt
      updateCurrentUser({ name: trimmedName, username: normalizedUser, backgroundKey: bgKey });
      // Kontrollera unikt användarnamn (case-insensitivt) globalt, exkludera mig själv
      const { data: userRes } = await supabase.auth.getUser();
      const myId = userRes.user?.id;
      if (normalizedUser !== me.username.toLowerCase()) {
        const { data: taken } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', normalizedUser)
          .limit(1);
        const conflict = (taken ?? []).some((r) => r.id !== myId);
        if (conflict) {
          Alert.alert('Upptaget användarnamn', 'Välj ett annat unikt användarnamn.');
          return;
        }
      }
      // Uppdatera i Supabase-profil
      if (myId) {
        await supabase
          .from('profiles')
          .update({ username: normalizedUser, full_name: trimmedName, background_key: bgKey })
          .eq('id', myId);
      }
      // Lokalt är redan uppdaterat optimistiskt ovan
      Alert.alert('Sparat');
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
        paddingTop: insets.top + 56,
        paddingBottom: 16 + insets.bottom + tabBarHeight,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: 'Profilinställningar' }} />
      <View style={styles.card}>
        <Text style={styles.label}>Namn</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="För- och efternamn" />

        <Text style={styles.label}>Användarnamn</Text>
        <TextInput value={username} onChangeText={setUsername} style={styles.input} placeholder="unikt_användarnamn" autoCapitalize="none" />

        <Text style={styles.label}>Profiltema</Text>
        <BackgroundPickerCarousel initialKey={bgKey} onChange={(k) => setBgKey(k)} />

        <TouchableOpacity style={[styles.button, saving && styles.disabled]} onPress={onSave} disabled={saving}>
          <Text style={styles.buttonText}>Spara</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Profilbildsuppdatering kan läggas till senare.</Text>
      <TouchableOpacity
        accessibilityLabel="Logga ut"
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
        style={[styles.logoutBtn, { marginBottom: 4 + tabBarHeight }]}
      >
        <Text style={styles.logoutText}>Logga ut</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7c7a3',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: '700',
    color: '#1f1f1f',
    marginTop: 8,
    marginBottom: 6,
  },
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
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  hint: {
    marginTop: 12,
    color: '#1f1f1f',
    fontSize: 12,
  },
  logoutBtn: {
    backgroundColor: '#b83a3a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});


