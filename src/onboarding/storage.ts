import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { CoachKey, detectTourUser, TourUser } from './logic';

/** Persisted in `@mocktail-finder/onboarding`. */
export interface OnboardingSaved {
  tourDone: boolean;
  user: TourUser;
  seen: Partial<Record<CoachKey, boolean>>;
  /** App launches since 1.2 was installed. */
  sessions: number;
}

/**
 * Reads the onboarding state; on the first 1.2 launch decides new install vs update
 * from 1.1 (favourites, own recipes or a saved theme). Counts this launch as a session.
 */
export async function loadOnboarding(): Promise<OnboardingSaved> {
  const saved = await loadJson<OnboardingSaved | null>(STORAGE_KEYS.onboarding, null);
  let state: OnboardingSaved;
  if (saved && typeof saved === 'object' && saved.user) {
    state = { ...saved, seen: saved.seen || {}, sessions: (saved.sessions || 0) + 1 };
  } else {
    const [favourites, ownRecipes, theme] = await Promise.all([
      loadJson<unknown[]>(STORAGE_KEYS.favorites, []),
      loadJson<unknown[]>(STORAGE_KEYS.myRecipes, []),
      AsyncStorage.getItem(STORAGE_KEYS.theme).catch(() => null),
    ]);
    state = {
      tourDone: false,
      user: detectTourUser({
        favourites: Array.isArray(favourites) ? favourites.length : 0,
        ownRecipes: Array.isArray(ownRecipes) ? ownRecipes.length : 0,
        themeSaved: theme != null,
      }),
      seen: {},
      sessions: 1,
    };
  }
  saveJson(STORAGE_KEYS.onboarding, state);
  return state;
}

export const saveOnboarding = (state: OnboardingSaved) => saveJson(STORAGE_KEYS.onboarding, state);
