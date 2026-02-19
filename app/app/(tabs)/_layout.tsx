import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0, // Android shadow
        },
        tabBarBackground: () => (
          <>
            <BlurView
              intensity={55}
              tint={(colorScheme ?? 'light') as 'light' | 'dark' | 'default'}
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.10)' }]}
            />
          </>
        ),
      }}>
      {/* Hidden redirect screen for root path */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Hem',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="house" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Tävlingar',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="trophy" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Skapa',
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitleStyle: { color: '#1f1f1f' },
          headerTintColor: '#1f1f1f',
          headerShadowVisible: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="circle-plus" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Information',
          tabBarLabel: 'info',
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitleStyle: { color: '#1f1f1f' },
          headerTintColor: '#1f1f1f',
          headerShadowVisible: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="circle-info" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="acount"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="user-large" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
