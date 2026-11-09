import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Child } from './logic';

const KEY = 'santaList_v1';
const PIN_KEY = 'santaList_pin';

export async function loadKids(): Promise<Child[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw).kids as Child[]) : [];
  } catch {
    return [];
  }
}

export async function saveKids(kids: Child[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ kids }));
}

export async function loadPin(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PIN_KEY);
  } catch {
    return null;
  }
}

export async function savePin(pin: string) {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

/** "Forgot PIN": wipe everything and return the app to its default state. */
export async function resetAll() {
  await AsyncStorage.removeItem(KEY);
  try {
    await SecureStore.deleteItemAsync(PIN_KEY);
  } catch {}
}
