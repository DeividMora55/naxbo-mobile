import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { AuthTokens } from '@/types/api';

const ACCESS = 'naxvo_access_token';
const REFRESH = 'naxvo_refresh_token';

function webStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function getItem(key: string): Promise<string | null> {
  const storage = webStorage();
  if (Platform.OS === 'web') return storage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  const storage = webStorage();
  if (Platform.OS === 'web') {
    if (!storage) throw new Error('El navegador no permite guardar la sesión localmente.');
    storage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeItem(key: string): Promise<void> {
  const storage = webStorage();
  if (Platform.OS === 'web') {
    storage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function getAccessToken() {
  return getItem(ACCESS);
}

export function getRefreshToken() {
  return getItem(REFRESH);
}

export async function saveTokens(tokens: AuthTokens) {
  await Promise.all([
    setItem(ACCESS, tokens.access_token),
    setItem(REFRESH, tokens.refresh_token),
  ]);
}

export async function clearTokens() {
  await Promise.all([removeItem(ACCESS), removeItem(REFRESH)]);
}
