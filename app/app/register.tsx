import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { setToken } from '@/lib/session';
import { updateCurrentUser } from '@/lib/users-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const onSubmit = async () => {
    try {
      setLoading(true);
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();
      const trimmedUser = username.trim();
      const normalizedUser = trimmedUser.toLowerCase();
      const trimmedEmail = email.trim();
      const normalizedEmail = trimmedEmail.toLowerCase();
      if (!trimmedFirst) {
        Alert.alert('Förnamn krävs');
        return;
      }
      if (!trimmedLast) {
        Alert.alert('Efternamn krävs');
        return;
      }
      if (!trimmedUser) {
        Alert.alert('Användarnamn krävs');
        return;
      }
      if (!/^[a-z0-9_.]{3,}$/.test(normalizedUser)) {
        Alert.alert('Ogiltigt användarnamn', 'Minst 3 tecken. Tillåtna: a-ö, siffror, _ och .');
        return;
      }
      if (!trimmedEmail) {
        Alert.alert('E-post krävs');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        Alert.alert('Ogiltig e-postadress');
        return;
      }
      if (!password) {
        Alert.alert('Lösenord krävs');
        return;
      }
      // Kontrollera unikt användarnamn (case-insensitivt) mot Supabase
      try {
        const { data: taken } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', normalizedUser)
          .limit(1);
        if (taken && taken.length > 0) {
          Alert.alert('Upptaget användarnamn', 'Välj ett annat unikt användarnamn.');
          return;
        }
      } catch {
        // Vid nätverksfel, var försiktig: avbryt istället för att skapa dubletter
        Alert.alert('Kunde inte verifiera användarnamnet', 'Försök igen om en stund.');
        return;
      }
      // Förkontroll: unik e-post i profiles om kolumnen finns (ignorera om den saknas)
      try {
        const { data: emailRows } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', normalizedEmail)
          .limit(1);
        if (emailRows && emailRows.length > 0) {
          Alert.alert('E‑post upptagen', 'E‑postadressen används redan. Välj en annan.');
          return;
        }
      } catch {
        // Ignorera – lita på Auths unikhet för e‑post om kolumnen saknas
      }
      // Skapa användare i Supabase Auth. `profiles`-posten skapas automatiskt via DB-trigger efter signup.
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            username: normalizedUser,
            first_name: trimmedFirst,
            last_name: trimmedLast,
          },
        },
      });
      if (error) {
        const msg = (error as any)?.message?.toString?.() ?? '';
        if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('exists')) {
          Alert.alert('E‑post upptagen', 'E‑postadressen används redan. Välj en annan.');
        } else {
          Alert.alert('Fel', msg || 'Kunde inte skapa konto.');
        }
        return;
      }
      // Om e-postverifiering är avstängd kan session finnas direkt -> navigera till profil.
      if (data.session) {
        if (data.session.access_token) {
          await setToken(data.session.access_token);
        }
        // Försök skapa/uppdatera profil med användarnamn och e‑post direkt
        try {
          const { data: userRes } = await supabase.auth.getUser();
          const authUser = userRes.user;
          if (authUser?.id) {
            await supabase
              .from('profiles')
              .upsert(
                {
                  id: authUser.id,
                  username: normalizedUser,
                  first_name: trimmedFirst,
                  last_name: trimmedLast,
                  full_name: [trimmedFirst, trimmedLast].filter(Boolean).join(' ') || undefined,
                  email: normalizedEmail,
                },
                { onConflict: 'id' }
              );
          }
        } catch {
          // ignoreras; profilen kan fyllas vid nästa inloggning
        }
        updateCurrentUser({
          name: [trimmedFirst, trimmedLast].filter(Boolean).join(' ') || normalizedUser,
          username: normalizedUser,
        });
        router.replace('/(tabs)/acount');
        return;
      }
      // För projekt där verifiering är avstängd men ingen session returneras, försök logga in direkt.
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (!signInError) {
        if (signInData.session?.access_token) {
          await setToken(signInData.session.access_token);
        }
        // Upsert profil efter lyckad inloggning
        try {
          const { data: userRes } = await supabase.auth.getUser();
          const authUser = userRes.user;
          if (authUser?.id) {
            await supabase
              .from('profiles')
              .upsert(
                {
                  id: authUser.id,
                  username: normalizedUser,
                  first_name: trimmedFirst,
                  last_name: trimmedLast,
                  full_name: [trimmedFirst, trimmedLast].filter(Boolean).join(' ') || undefined,
                  email: normalizedEmail,
                },
                { onConflict: 'id' }
              );
          }
        } catch {
          // ignoreras
        }
        updateCurrentUser({
          name: [trimmedFirst, trimmedLast].filter(Boolean).join(' ') || normalizedUser,
          username: normalizedUser,
        });
        router.replace('/(tabs)/acount');
        return;
      }
      // Om verifiering krävs får användaren mail – be dem logga in efter att ha verifierat.
      Alert.alert('Verifiering skickad', 'Kolla din e-post för att bekräfta kontot. Logga in efter verifiering.');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Fel', e?.message ?? 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 56, paddingBottom: 16 + insets.bottom }]}>
      <Stack.Screen options={{ title: 'Skapa konto' }} />
      <View style={styles.card}>
        <Text style={styles.label}>Förnamn</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Förnamn"
          style={styles.input}
        />
        <Text style={styles.label}>Efternamn</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Efternamn"
          style={styles.input}
        />
        <Text style={styles.label}>Användarnamn</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="t.ex. frode"
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>E-post</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="din@mail.se"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Text style={styles.label}>Lösenord</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          secureTextEntry
          style={styles.input}
        />
        <TouchableOpacity onPress={onSubmit} style={styles.primaryBtn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Skapa konto</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a7c7a3', padding: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 16 },
  label: { color: '#2a2a2a', marginTop: 8, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#e5e5e5' },
  primaryBtn: { marginTop: 16, backgroundColor: '#2f7147', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});


