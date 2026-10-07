import { PACKS } from '../data/packs';
import { PACK_PRODUCT_IDS, PRODUCT_IDS, TIP_PRODUCT_IDS } from './products';

export interface Entitlements {
  isPro: boolean;
  /** Pack ids whose drinks are open. */
  unlockedPacks: string[];
  ownsEverything: boolean;
}

/**
 * What the owned product ids unlock (TASKS.md → Decisions):
 * isPro = owns(pro) || owns(everything); a collection is open with Everything or its
 * own product. Tips never unlock anything; unknown ids are ignored.
 */
export function deriveEntitlements(ownedProductIds: readonly string[]): Entitlements {
  const owned = new Set(ownedProductIds.filter(id => !TIP_PRODUCT_IDS.includes(id)));
  const ownsEverything = owned.has(PRODUCT_IDS.everything);
  return {
    ownsEverything,
    isPro: ownsEverything || owned.has(PRODUCT_IDS.pro),
    unlockedPacks: PACKS.filter(p => ownsEverything || owned.has(PACK_PRODUCT_IDS[p.id])).map(p => p.id),
  };
}
