import { PACKS } from '../data/packs';

/**
 * App Store product ids (TASKS.md → Decisions → Products). Fixed: Cowork creates the
 * same ids in App Store Connect. Prices never live here; they come from StoreKit.
 */
const BASE = 'com.filonexperiencedesign.mocktailfinder';

export const PRODUCT_IDS = {
  pro: `${BASE}.pro`,
  everything: `${BASE}.everything`,
  tipSmall: `${BASE}.tip.small`,
  tipMedium: `${BASE}.tip.medium`,
  tipLarge: `${BASE}.tip.large`,
} as const;

/** One non-consumable per collection; the id is the pack's `productId` in recipes.json. */
export const PACK_PRODUCT_IDS: Record<string, string> = Object.fromEntries(PACKS.map(p => [p.id, p.productId]));

/** Tips are consumable and unlock nothing. */
export const TIP_PRODUCT_IDS: string[] = [PRODUCT_IDS.tipSmall, PRODUCT_IDS.tipMedium, PRODUCT_IDS.tipLarge];

/** Everything that can be owned (non-consumables). */
export const NON_CONSUMABLE_IDS: string[] = [PRODUCT_IDS.pro, PRODUCT_IDS.everything, ...Object.values(PACK_PRODUCT_IDS)];
