import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  favorites: '@mocktail-finder/favorites/v1',
  myRecipes: '@mocktail-finder/my-recipes/v1',
  /**
   * Per-drink details from TheCocktailDB (ingredients, instructions, derived tags).
   * v2 (1.2) adds measure and name apart; v1 is dropped on launch and fetched again.
   */
  details: '@mocktail-finder/details/v2',
  detailsV1: '@mocktail-finder/details/v1',
  /** Appearance choice: 'system' | 'light' | 'dark'. */
  theme: '@mocktail-finder/theme',
  /** Language choice: 'system' | 'en' | 'uk'. */
  language: '@mocktail-finder/language',
  /** Owned product ids from StoreKit, so the first frame after launch is already right. */
  entitlements: '@mocktail-finder/entitlements',
  /** Shopping list items (Pro), see utils/shoppingList. */
  shoppingList: '@mocktail-finder/shopping-list',
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
