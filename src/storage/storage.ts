import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  favorites: '@mocktail-finder/favorites/v1',
  myRecipes: '@mocktail-finder/my-recipes/v1',
  /** Appearance choice: 'system' | 'light' | 'dark'. */
  theme: '@mocktail-finder/theme',
  /** Language choice: 'system' | 'en' | 'uk'. */
  language: '@mocktail-finder/language',
  /** Owned product ids from StoreKit, so the first frame after launch is already right. */
  entitlements: '@mocktail-finder/entitlements',
  /** Shopping list items (Pro), see utils/shoppingList. */
  shoppingList: '@mocktail-finder/shopping-list',
  /** My Bar: ticked ingredient keys. */
  pantry: '@mocktail-finder/pantry',
  /** Tour state, seen hints, session counter (onboarding/storage). */
  onboarding: '@mocktail-finder/onboarding',
} as const;

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    if (__DEV__) console.warn(`[storage] failed to load ${key}`, error);
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (__DEV__) console.warn(`[storage] failed to save ${key}`, error);
  }
}

/**
 * The TheCocktailDB details caches of 1.1 (v1) and the 1.2 test builds (v2). The catalogue
 * is bundled since 1.2 task 12, so they are only removed; once gone, this does nothing.
 */
export const OLD_DETAILS_CACHES = ['@mocktail-finder/details/v1', '@mocktail-finder/details/v2'];

export async function removeOldCaches(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(OLD_DETAILS_CACHES);
  } catch (error) {
    if (__DEV__) console.warn('[storage] failed to remove the old details caches', error);
  }
}
