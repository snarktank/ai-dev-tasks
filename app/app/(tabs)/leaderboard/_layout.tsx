import { Stack } from 'expo-router';
import React from 'react';

export default function LeaderboardStackLayout() {
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


