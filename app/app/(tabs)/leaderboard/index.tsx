import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, Link } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { getCompetitions, subscribe, loadCompetitionsFromSupabase } from '@/lib/competitions-store';
import type { Competition } from '@/lib/competitions-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import BgSvg from '@/assets/images/Bakggrundscomp1.2 (kopia).svg';

export default function LeaderboardListScreen() {
  const [competitions, setCompetitions] = useState<Competition[]>(getCompetitions());
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    const unsub = subscribe(setCompetitions);
    // initial load from Supabase
    void loadCompetitionsFromSupabase();
    return unsub;
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    (async () => {
      await loadCompetitionsFromSupabase();
      setCompetitions(getCompetitions());
      setRefreshing(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: Competition }) => {
    return (
      <View style={styles.row}>
        <Link
          href={{
            pathname: '/(tabs)/leaderboard/competition/[id]',
            params: { id: item.id, name: item.name },
          }}
          asChild
        >
          <TouchableOpacity style={styles.rowTapArea}>
            <View style={styles.rowMain}>
              <Text style={styles.title}>{item.name}</Text>
              {item.description ? <Text style={styles.subtitle}>{item.description}</Text> : null}
            </View>
            <View style={styles.rowMeta}>
              <Text style={styles.meta}>{item.participants.length} deltagare</Text>
              <Text style={styles.meta}>Uppd: {item.updatedAt}</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BgSvg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice" />
      <Stack.Screen
        options={{
          title: 'Tävlingar',
          headerRight: () => (
            <Link href="/(tabs)/leaderboard/create" asChild>
              <TouchableOpacity style={styles.headerBtn}>
                <FontAwesome6 name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {competitions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Inga tävlingar ännu</Text>
          <Text style={styles.emptyText}>Skapa en privat tävling med “+” eller gå med via inbjudan.</Text>
          <Link href="/(tabs)/leaderboard/create" asChild>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Skapa tävling</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={competitions}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: insets.top + 56,
              paddingBottom: 60 + insets.bottom + tabBarHeight,
            },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginHorizontal: 0,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTapArea: {
    flex: 1,
  },
  rowMain: {
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  subtitle: {
    marginTop: 2,
    color: '#3a3a3a',
  },
  rowMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: '#2a2a2a',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#1f1f1f',
    fontSize: 18,
    marginBottom: 6,
  },
  emptyText: {
    color: '#2a2a2a',
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#2f7147',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  headerBtn: {
    backgroundColor: '#2f7147',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlassBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(47,113,71,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47,113,71,0.35)',
  },
  inviteSmallBtn: {
    // removed
  },
});


