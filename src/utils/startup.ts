import type { OnboardingSaved } from '../onboarding/storage';

/**
 * One startup read that fails gives its own fallback instead of failing the others.
 * Build 6: one rejected read made Promise.all drop the saved theme, the language and
 * the onboarding state, so the tour never showed after an update from 1.1.
 */
export function orFallback<T>(promise: Promise<T>, fallback: T): Promise<T> {
  return promise.catch(error => {
    if (__DEV__) console.warn('[startup] read failed, using the default', error);
    return fallback;
  });
}

/** When the onboarding state cannot be read: show the tour rather than skip it silently. */
export const ONBOARDING_FALLBACK: OnboardingSaved = { tourDone: false, user: 'new', seen: {}, sessions: 1 };
