import { Stack, router } from 'expo-router';
import React, { useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { isLoggedIn } from '@/lib/session';

export default function AccountStackLayout() {
  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const ok = await isLoggedIn();
        if (!ok) {
          router.replace('/login');
        }
      }
    })();
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
    />
  );
}


