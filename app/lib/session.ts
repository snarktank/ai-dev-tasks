import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { resetUserStore } from './users-store';
import { resetCompetitionsStore } from './competitions-store';
import { resetInvitesStore } from './invites-store';
import { resetFriendRequestsStore } from './friend-requests-store';
import { resetActionsStore } from './actions-store';
import { resetNotificationsStore } from './notifications-store';
import { resetMissionsStore } from '@/src/services/missions';

const TOKEN_KEY = 'auth_token';

export async function setToken(token: string) {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore quota errors
    }
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function isLoggedIn() {
  const t = await getToken();
  return !!t;
}

/**
 * Loggar ut användaren och rensar all appdata
 */
export async function logout() {
  // Logga ut från Supabase
  await supabase.auth.signOut();
  
  // Rensa token
  await clearToken();
  
  // Rensa alla stores och services
  resetUserStore();
  resetCompetitionsStore();
  resetInvitesStore();
  resetFriendRequestsStore();
  resetActionsStore();
  resetNotificationsStore();
  resetMissionsStore();
}


