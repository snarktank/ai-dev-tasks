import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Link, Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TouchableOpacity, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasCompletedOnboarding, setOnboardingCompleted, resetOnboarding } from '@/lib/onboarding-storage';
import { isLoggedIn, clearToken } from '@/lib/session';
import Onboarding from '@/components/Onboarding';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  
  // State för att hålla reda på onboarding- och inloggningsstatus
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  /**
   * Kontrollerar onboarding- och inloggningsstatus när appen startar.
   * Detta körs endast en gång vid app-start.
   */
  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      // UTVECKLINGSLÄGE: Återställer onboarding och sessions vid varje app-start
      // Kommentera bort raderna nedan när du är klar med att testa onboarding
      await resetOnboarding();
      await clearToken(); // Rensar gamla sessions så vi alltid startar från början
      
      // Kolla om onboarding redan är genomförd
      const onboardingCompleted = await hasCompletedOnboarding();
      
      // Kolla om användaren är inloggad
      const loggedIn = await isLoggedIn();
      
      setUserLoggedIn(loggedIn);
      setShowOnboarding(!onboardingCompleted);
      
      // Navigera till rätt skärm baserat på status
      if (!onboardingCompleted) {
        // Visa onboarding (hanteras av showOnboarding state)
        setIsCheckingStatus(false);
        return;
      }

      // Lägg till en liten delay för att säkerställa att router är redo
      setTimeout(() => {
        if (!loggedIn) {
          // Användaren har klarat onboarding men är inte inloggad -> visa login
          router.replace('/login');
        } else {
          // Användaren är inloggad -> visa huvudappen
          router.replace('/(tabs)');
        }
        setIsCheckingStatus(false);
      }, 150);
    } catch (error) {
      console.error('Fel vid kontroll av app-status:', error);
      // Vid fel, navigera till login som fallback
      setIsCheckingStatus(false);
      setTimeout(() => {
        router.replace('/login');
      }, 150);
    }
  };

  /**
   * Hanterar när användaren slutför onboardingen.
   * Sparar status och navigerar till login-sidan.
   */
  const handleOnboardingComplete = async () => {
    await setOnboardingCompleted();
    setShowOnboarding(false);
    setIsCheckingStatus(false);
    
    // Säkerställ att vi inte är "inloggade" från tidigare sessions
    await clearToken();
    setUserLoggedIn(false);
    
    // Små delay för att säkerställa att state uppdateras innan navigation
    setTimeout(() => {
      router.replace('/login');
    }, 100);
  };

  // Visa en tom skärm medan vi kollar status
  if (isCheckingStatus) {
    return (
      <View style={{ flex: 1, backgroundColor: '#a7c7a3' }}>
        <StatusBar style="auto" />
      </View>
    );
  }

  // Visa onboarding om användaren inte har gått igenom det än
  if (showOnboarding) {
    return (
      <>
        <Onboarding onComplete={handleOnboardingComplete} />
        <StatusBar style="light" />
      </>
    );
  }

  // Visa normal app-navigation
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: 'Logga in',
            headerBackVisible: false,
            gestureEnabled: false,
            headerShown: false,
          }}
        />
        <Stack.Screen name="register" options={{ title: 'Skapa konto' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
