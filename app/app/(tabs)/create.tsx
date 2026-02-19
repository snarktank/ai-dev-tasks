import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Pressable, Image, RefreshControl, Alert, TextInput, Keyboard } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MISSION_IMAGES, safeMissionImageKey } from '@/src/constants/missionImages';
import { fetchMissions, fetchTodayCounts, logUserAction, logUserActionWithCo2, type Mission } from '@/src/services/missions';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    transport: false,
    mat: false,
    'återvinning': false,
    konsumtion: false,
    hem: false,
  });
  const [countsMap, setCountsMap] = useState<Record<string, number>>({});
  const [quantityValue, setQuantityValue] = useState<string>('');
  const [quantityError, setQuantityError] = useState<string>('');

  const CATEGORIES = useMemo(
    () => [
      { key: 'transport', label: 'Transport' },
      { key: 'mat', label: 'Mat' },
      { key: 'återvinning', label: 'Återvinning' },
      { key: 'konsumtion', label: 'Konsumtion' },
      { key: 'hem', label: 'Hem' },
    ] as const,
    []
  );

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Mission[]> = {};
    for (const c of CATEGORIES) {
      groups[c.key] = [];
    }
    // Helper: normalize incoming DB category to one of our static keys
    const sanitize = (v: string) =>
      v
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // strip diacritics
    const normalizeKey = (raw: string): typeof CATEGORIES[number]['key'] | null => {
      const s = sanitize(raw);
      // direct matches to our keys
      if (s === 'transport') return 'transport';
      if (s === 'mat' || s === 'food' || s === 'kost') return 'mat';
      if (s === 'atervinning' || s === 'recycling') return 'återvinning';
      if (s === 'konsumtion' || s === 'consumption' || s === 'shopping' || s === 'inkop' || s === 'inköp')
        return 'konsumtion';
      if (s === 'hem' || s === 'home' || s === 'household' || s === 'bostad') return 'hem';
      // attempt exact diacritic form (if DB happens to use it)
      if (raw === 'återvinning') return 'återvinning';
      // unknown -> null (we will optionally fall back)
      return null;
    };
    for (const m of missions) {
      const key = normalizeKey(m.category) ?? 'konsumtion'; // fallback to a visible category
      groups[key].push(m);
    }
    return groups;
  }, [missions, CATEGORIES]);

  const openConfirm = (mission: Mission) => {
    setSelectedMission(mission);
    setQuantityValue('');
    setQuantityError('');
  };

  const confirmDo = async () => {
    if (!selectedMission) return;
    const current = countsMap[selectedMission.id] ?? 0;
    const max = Math.max(0, selectedMission.max_per_day ?? 0);
    if (current >= max) {
      Alert.alert('Gräns nådd', 'Du har nått max för idag.');
      setSelectedMission(null);
      return;
    }
    try {
      if (selectedMission.quantity_mode === 1) {
        const raw = (quantityValue ?? '').trim().replace(',', '.');
        const val = Number.parseFloat(raw);
        if (!Number.isFinite(val) || val <= 0) {
          setQuantityError('Ange ett tal större än 0.');
          return;
        }
        if (val > 1000) {
          setQuantityError('Maxvärde är 1000.');
          return;
        }
        const multiplier = Number(selectedMission.quantity_multiplier ?? 0);
        if (!(multiplier > 0)) {
          Alert.alert('Fel', 'Den här uppgiften saknar giltig multiplier.');
          return;
        }
        const co2 = Math.round(val * multiplier * 100) / 100; // 2 decimaler
        await logUserActionWithCo2(selectedMission, co2);
      } else {
        await logUserAction(selectedMission);
      }
      setCountsMap((prev) => ({ ...prev, [selectedMission.id]: (prev[selectedMission.id] ?? 0) + 1 }));
    } catch (e: any) {
      Alert.alert('Fel', e?.message ?? 'Kunde inte logga handlingen.');
    }
    setSelectedMission(null);
  };

  const closeConfirm = () => {
    setSelectedMission(null);
  };

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadData = async () => {
    try {
      const list = await fetchMissions();
      setMissions(list);
      const ids = list.map((m) => m.id);
      const counts = await fetchTodayCounts(ids);
      setCountsMap(counts);
    } catch (e: any) {
      // Surface a helpful error so it's clear why categories are empty
      Alert.alert('Fel vid hämtning', e?.message ?? 'Kunde inte hämta uppdrag. Kontrollera anslutning och behörigheter.');
      setMissions([]);
      setCountsMap({});
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/main_background/bg_skapa.jpeg')}
        resizeMode="cover"
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 56, paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {CATEGORIES.map((cat) => (
          <View key={cat.key} style={styles.section}>
            <TouchableOpacity
              onPress={() => toggle(cat.key)}
              style={styles.sectionHeader}
              accessibilityLabel={`Växla ${cat.label}`}
            >
              <Text style={styles.sectionTitle}>{cat.label}</Text>
              <IconSymbol
                name="chevron.down"
                size={16}
                color="#1f1f1f"
                style={{ transform: [{ rotate: expanded[cat.key] ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>
            {expanded[cat.key] &&
              (groupedByCategory[cat.key]?.length
                ? groupedByCategory[cat.key].map((m) => {
                    const imgKey = safeMissionImageKey(m.image_key);
                    const count = countsMap[m.id] ?? 0;
                    const max = Math.max(1, m.max_per_day ?? 1);
                    const percent = Math.min(100, Math.round((count / max) * 100));
                    const disabled = count >= max;
                    return (
                      <View key={m.id} style={styles.card}>
                        <View style={styles.cardImage}>
                          <Image
                            source={MISSION_IMAGES[imgKey]}
                            style={styles.cardImageImg}
                            resizeMode="cover"
                            accessible
                            accessibilityLabel={`Illustration för ${m.title}`}
                          />
                        </View>
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardName}>{m.title}</Text>
                          <Text style={styles.cardCount}>Idag: {count} / {max}</Text>
                        </View>
                        {m.description ? <Text style={styles.cardDesc}>{m.description}</Text> : null}
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${percent}%` }]} />
                        </View>
                        <TouchableOpacity
                          onPress={() => openConfirm(m)}
                          style={[styles.doBtn, disabled && styles.doBtnDisabled]}
                          disabled={disabled}
                          accessibilityLabel={`Utför ${m.title}`}
                        >
                          <Text style={styles.doBtnText}>{disabled ? 'Max utförd idag' : 'Gör'}</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                : (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>Inga uppdrag ännu.</Text>
                  </View>
                ))}
          </View>
        ))}
      </ScrollView>

      {selectedMission && (
        <View style={styles.modalWrap} pointerEvents="box-none">
          <BlurView
            intensity={35}
            tint="light"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          {/* Tap outside should only dismiss the keyboard, not close the mission modal */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => Keyboard.dismiss()} />
          <View style={styles.modalCenter} pointerEvents="box-none">
            <View style={styles.modalCard} accessibilityRole="dialog" accessibilityLabel={selectedMission.title}>
              <Pressable onPress={() => Keyboard.dismiss()}>
                <Text style={styles.modalTitle}>{selectedMission.title}</Text>
                <View style={styles.modalIllustration}>
                  <Image
                    source={MISSION_IMAGES[safeMissionImageKey(selectedMission.image_key)]}
                    style={styles.modalIllustrationImg}
                    resizeMode="cover"
                    accessible
                    accessibilityLabel={`Illustration för ${selectedMission.title}`}
                  />
                </View>
                <Text style={styles.modalText}>
                  {selectedMission.description ??
                    'Att panta sparar energi och minskar behovet av nya råvaror. Fortsätt bidra!'}
                </Text>
              </Pressable>
              {selectedMission.quantity_mode === 1 ? (
                <View style={{ gap: 6, marginBottom: 8 }}>
                  <Text style={{ color: '#1f1f1f', fontWeight: '600', textAlign: 'center' }}>
                    Ange mängd ({selectedMission.quantity_unit ?? ''})
                  </Text>
                  <TextInput
                    value={quantityValue}
                    onChangeText={(t) => {
                      setQuantityValue(t);
                      if (quantityError) setQuantityError('');
                    }}
                    placeholder={`Ange värde i ${selectedMission.quantity_unit ?? ''}`}
                    keyboardType="decimal-pad"
                    inputMode="decimal"
                    style={styles.modalInput}
                  />
                  {quantityError ? <Text style={styles.modalError}>{quantityError}</Text> : null}
                  {Number(selectedMission.quantity_multiplier ?? 0) > 0 && (quantityValue || '').trim() ? (
                    <Text style={styles.modalHint}>
                      ≈ {(Math.round((Number((quantityValue || '').trim().replace(',', '.')) || 0) * Number(selectedMission.quantity_multiplier) * 100) / 100).toFixed(2)} kg CO₂e
                    </Text>
                  ) : null}
                </View>
              ) : null}
              <Pressable onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalBtns}>
                  <TouchableOpacity onPress={closeConfirm} style={[styles.modalBtn, styles.modalCancel]}>
                    <Text style={styles.modalBtnCancelText}>Avbryt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDo} style={[styles.modalBtn, styles.modalPrimary]}>
                    <Text style={styles.modalBtnText}>{selectedMission.quantity_mode === 1 ? 'Spara' : 'Gör'}</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  section: {
    gap: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    fontSize: 16,
    marginBottom: 0,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eaeaea',
  },
  cardImageImg: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  cardName: {
    fontWeight: '700',
    color: '#1f1f1f',
    fontSize: 16,
  },
  cardCount: {
    color: '#2a2a2a',
    fontSize: 12,
  },
  cardDesc: {
    color: '#2a2a2a',
  },
  emptyWrap: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#2a2a2a',
    fontStyle: 'italic',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2f7147',
  },
  doBtn: {
    backgroundColor: '#2f7147',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  doBtnDisabled: {
    opacity: 0.6,
  },
  doBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  modalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 560,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f1f1f',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalIllustration: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  modalIllustrationImg: {
    width: '100%',
    height: '100%',
  },
  modalText: {
    color: '#2a2a2a',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.2)',
    color: '#1f1f1f',
  },
  modalError: {
    color: '#e53935',
    textAlign: 'center',
  },
  modalHint: {
    color: '#2a2a2a',
    textAlign: 'center',
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: '#e53935',
    minWidth: 96,
  },
  modalPrimary: {
    backgroundColor: '#2f7147',
    flex: 1,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
  modalBtnCancelText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },
});


