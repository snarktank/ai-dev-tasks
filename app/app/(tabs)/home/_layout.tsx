import { Stack, Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { fetchUnreadCount, subscribeToNotifications } from '@/src/services/notifications';
import { supabase } from '@/src/lib/supabase';

export default function HomeStackLayout() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    fetchUnreadCount().then(setUnreadCount);

    // Subscribe to new notifications
    const unsubscribe = subscribeToNotifications(() => {
      fetchUnreadCount().then(setUnreadCount);
    });

    // Subscribe to updates (when notifications are marked as read)
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id;
      if (!uid) return;
      
      channel = supabase
        .channel('realtime:notifications_read:' + uid)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
          () => {
            fetchUnreadCount().then(setUnreadCount);
          }
        )
        .subscribe();
    })();

    return () => {
      unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerStyle: { backgroundColor: 'transparent' },
        headerTitleStyle: { color: '#1f1f1f' },
        headerTintColor: '#1f1f1f',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Hem',
          headerRight: () => (
            <Link href="/notifications" asChild>
              <TouchableOpacity
                accessibilityLabel="Visa notiser"
                style={{
                  backgroundColor: '#2f7147',
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome6 name="bell" size={18} color="#fff" solid />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
