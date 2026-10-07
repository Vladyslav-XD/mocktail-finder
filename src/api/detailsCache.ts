/**
 * Cache of per-drink details (ingredients, instructions, tags).
 *
 * TheCocktailDB's list endpoint returns only id, name and photo, so anything
 * shown on a card beyond the name needs one lookup per drink. Those lookups
 * are done once, kept in memory and persisted to AsyncStorage, so the second
 * launch shows subtitles instantly and the recipe screen never waits.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { fetchMocktailDetails, RecipeDetails } from './api';

interface CacheEntry {
  details: RecipeDetails;
  savedAt: number;
}

/** Entries older than this are refreshed in the background (the database rarely changes). */
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const memory = new Map<string, CacheEntry>();
/** Lookups in progress, so a card prefetch and an opened recipe share one request. */
const inFlight = new Map<string, Promise<RecipeDetails>>();
let hydrated = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

/** Reads the persisted cache into memory. Safe to call more than once. */
export async function loadDetailsCache(): Promise<void> {
  if (hydrated) return;
  // 1.1 kept details without the measure/name split; they are fetched again once.
  AsyncStorage.removeItem(STORAGE_KEYS.detailsV1).catch(() => {});
  const saved = await loadJson<Record<string, CacheEntry>>(STORAGE_KEYS.details, {});
  if (saved && typeof saved === 'object') {
    for (const [id, entry] of Object.entries(saved)) {
      if (entry && entry.details && !memory.has(id)) memory.set(id, entry);
    }
  }
  hydrated = true;
}

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  // Coalesce bursts of prefetch results into one write.
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const obj: Record<string, CacheEntry> = {};
    memory.forEach((entry, id) => {
      obj[id] = entry;
    });
    saveJson(STORAGE_KEYS.details, obj);
  }, 500);
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.savedAt < MAX_AGE_MS;
}

/** Cached details, if any (stale entries are still returned; they are refreshed by prefetch). */
export function getCachedDetails(id: string): RecipeDetails | undefined {
  return memory.get(id)?.details;
}

/** Details from cache, or from the network (and then cached). Rejects only on network failure with nothing cached. */
export function fetchDetailsCached(id: string): Promise<RecipeDetails> {
  const cached = memory.get(id);
  if (cached && isFresh(cached)) return Promise.resolve(cached.details);
  const pending = inFlight.get(id);
  if (pending) return pending;

  const request = fetchMocktailDetails(id)
    .then(details => {
      memory.set(id, { details, savedAt: Date.now() });
      schedulePersist();
      return details;
    })
    .catch(error => {
      if (cached) return cached.details; // stale is better than nothing offline
      throw error;
    })
    .finally(() => {
      inFlight.delete(id);
    });
  inFlight.set(id, request);
  return request;
}

/**
 * Fetches details for every id that is missing or stale, a few at a time.
 * `onBatch` receives each group of newly loaded details so the UI can update
 * progressively instead of once at the end.
 */
export async function prefetchDetails(
  ids: string[],
  onBatch?: (batch: Record<string, RecipeDetails>) => void,
  concurrency = 4
): Promise<void> {
  const pending = ids.filter(id => {
    const entry = memory.get(id);
    return !entry || !isFresh(entry);
  });
  for (let i = 0; i < pending.length; i += concurrency) {
    const chunk = pending.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(id => fetchDetailsCached(id).then(details => [id, details] as const).catch(() => null))
    );
    const batch: Record<string, RecipeDetails> = {};
    for (const result of results) {
      if (result) batch[result[0]] = result[1];
    }
    if (onBatch && Object.keys(batch).length > 0) onBatch(batch);
  }
}
