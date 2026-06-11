import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const BRANDFETCH_KEY_STORE = 'brandfetch_api_key';

// Web fallback — SecureStore is native-only
let webKey = '';

export async function getBrandfetchKey(): Promise<string> {
  if (Platform.OS === 'web') return webKey;
  try {
    return (await SecureStore.getItemAsync(BRANDFETCH_KEY_STORE)) ?? '';
  } catch {
    return '';
  }
}

export async function setBrandfetchKey(key: string): Promise<void> {
  if (Platform.OS === 'web') { webKey = key.trim(); return; }
  await SecureStore.setItemAsync(BRANDFETCH_KEY_STORE, key.trim());
}

export async function clearBrandfetchKey(): Promise<void> {
  if (Platform.OS === 'web') { webKey = ''; return; }
  await SecureStore.deleteItemAsync(BRANDFETCH_KEY_STORE);
}
