import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, TouchableWithoutFeedback } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { createCompetition } from '@/lib/competitions-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import DateTimePicker, { AndroidEvent } from '@react-native-community/datetimepicker';

export default function CreateCompetitionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
  const [invitePolicy, setInvitePolicy] = useState<'owner_only' | 'all_members'>('owner_only');

  function formatYmd(d: Date | null): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function dateOnly(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function yesterday(): Date {
    const d = startOfToday();
    d.setDate(d.getDate() - 1);
    return d;
  }
  function tomorrow(): Date {
    const d = startOfToday();
    d.setDate(d.getDate() + 1);
    return d;
  }

  function openPicker(mode: 'start' | 'end') {
    setPickerMode(mode);
    setShowPicker(true);
  }

  function onChangeDate(event: AndroidEvent | any, selected?: Date) {
    // Android: dialog-based picker; close when dismissed or set
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed' || event?.type === 'set') {
        setShowPicker(false);
      }
    }
    if (!selected) return;
    const today = startOfToday();
    const chosen = dateOnly(selected);
    if (pickerMode === 'start') {
      // Only allow dates strictly before today
      if (chosen >= today) {
        Alert.alert('Ogiltigt startdatum', 'Startdatum måste vara före dagens datum.');
        return;
      }
      setStartDate(chosen);
      if (endDate && chosen && dateOnly(endDate) < chosen) {
        setEndDate(null);
      }
    } else {
      // Only allow dates strictly after today, and not before startDate if set
      if (chosen <= today) {
        Alert.alert('Ogiltigt slutdatum', 'Slutdatum måste vara efter dagens datum.');
        return;
      }
      if (startDate && chosen < dateOnly(startDate)) {
        Alert.alert('Ogiltigt slutdatum', 'Slutdatum kan inte vara före startdatum.');
        return;
      }
      setEndDate(chosen);
    }
  }

  const onCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Namn krävs', 'Ange ett namn för tävlingen.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      Alert.alert('Ogiltiga datum', 'Slutdatum kan inte vara före startdatum.');
      return;
    }
    try {
      // Precheck: must be logged in (auth.uid present)
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        Alert.alert('Inte inloggad', 'Logga in för att skapa en tävling.');
        return;
      }
      const comp = await createCompetition({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: startDate ? formatYmd(startDate) : undefined,
        endDate: endDate ? formatYmd(endDate) : undefined,
        invitePolicy,
      });
      Alert.alert('Tävling skapad', 'Inbjudningslänk har kopierats.');
      router.replace({
        pathname: '/(tabs)/leaderboard/competition/[id]',
        params: { id: comp.id, name: comp.name },
      });
    } catch (e: any) {
      Alert.alert(
        'Kunde inte skapa tävling',
        e?.message || 'Kontrollera att du är inloggad och försök igen.'
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 72, paddingBottom: 16 + insets.bottom }]}>
      <Stack.Screen options={{ title: 'Skapa tävling' }} />
      <View style={styles.card}>
        <Text style={styles.label}>Namn</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="T.ex. Kompisligan"
          style={styles.input}
        />

        <Text style={styles.label}>Beskrivning (valfritt)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Kort beskrivning"
          style={styles.input}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Startdatum (valfritt)</Text>
          {startDate ? (
            <TouchableOpacity onPress={() => { setStartDate(null); }}>
              <Text style={styles.undoText}>Ångra</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('start')}>
          <Text style={styles.dateBtnText}>
            {startDate ? formatYmd(startDate) : 'Välj startdatum'}
          </Text>
        </TouchableOpacity>

        <View style={styles.labelRow}>
          <Text style={styles.label}>Slutdatum (valfritt)</Text>
          {endDate ? (
            <TouchableOpacity onPress={() => setEndDate(null)}>
              <Text style={styles.undoText}>Ångra</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.dateBtn} onPress={() => openPicker('end')}>
          <Text style={styles.dateBtnText}>
            {endDate ? formatYmd(endDate) : 'Välj slutdatum'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Vem kan bjuda in?</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentButton, invitePolicy === 'owner_only' && styles.segmentButtonActive]}
            onPress={() => setInvitePolicy('owner_only')}
          >
            <Text style={[styles.segmentText, invitePolicy === 'owner_only' && styles.segmentTextActive]}>
              Bara ägare
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, invitePolicy === 'all_members' && styles.segmentButtonActive]}
            onPress={() => setInvitePolicy('all_members')}
          >
            <Text style={[styles.segmentText, invitePolicy === 'all_members' && styles.segmentTextActive]}>
              Alla deltagare
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onCreate} style={styles.button}>
          <Text style={styles.buttonText}>Skapa privat tävling</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.tip}>Tävlingar är privata. Bjud in med länk eller användarnamn/e-post.</Text>

      {showPicker && (
        Platform.OS === 'ios' ? (
          <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
            <View style={styles.pickerOverlay}>
              <TouchableWithoutFeedback onPress={() => { /* consume */ }}>
                <View style={styles.pickerCard}>
                  <DateTimePicker
                    value={
                      pickerMode === 'start'
                        ? (startDate ?? yesterday())
                        : (endDate ?? (startDate && dateOnly(startDate) > tomorrow() ? dateOnly(startDate) : tomorrow()))
                    }
                    mode="date"
                    display="spinner"
                    onChange={onChangeDate}
                    minimumDate={
                      pickerMode === 'end'
                        ? (startDate && dateOnly(startDate) > tomorrow() ? dateOnly(startDate) : tomorrow())
                        : undefined
                    }
                    maximumDate={
                      pickerMode === 'start' ? yesterday() : undefined
                    }
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <DateTimePicker
            value={
              pickerMode === 'start'
                ? (startDate ?? yesterday())
                : (endDate ?? (startDate && dateOnly(startDate) > tomorrow() ? dateOnly(startDate) : tomorrow()))
            }
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={
              pickerMode === 'end'
                ? (startDate && dateOnly(startDate) > tomorrow() ? dateOnly(startDate) : tomorrow())
                : undefined
            }
            maximumDate={
              pickerMode === 'start' ? yesterday() : undefined
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a7c7a3',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#1f1f1f',
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
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
  },
  dateBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  dateBtnText: {
    color: '#1f1f1f',
    fontWeight: '600',
  },
  undoText: {
    color: '#2f7147',
    fontWeight: '700',
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCard: {
    width: '92%',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tip: {
    marginTop: 12,
    fontSize: 12,
    color: '#1f1f1f',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  segmentButtonActive: {
    backgroundColor: '#2f7147',
  },
  segmentText: {
    fontWeight: '600',
    color: '#1f1f1f',
  },
  segmentTextActive: {
    color: '#ffffff',
  },
});


