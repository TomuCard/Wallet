import * as SecureStore from 'expo-secure-store';

const BRANDFETCH_KEY_STORE = 'brandfetch_api_key';

export async function getBrandfetchKey(): Promise<string> {
  return (await SecureStore.getItemAsync(BRANDFETCH_KEY_STORE)) ?? '';
}

export async function setBrandfetchKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(BRANDFETCH_KEY_STORE, key.trim());
}

export async function clearBrandfetchKey(): Promise<void> {
  await SecureStore.deleteItemAsync(BRANDFETCH_KEY_STORE);
}
