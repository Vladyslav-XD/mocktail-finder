import { NON_CONSUMABLE_IDS } from './products';

/** The part of a StoreKit transaction this app looks at. */
export interface TransactionLike {
  productId: string;
  purchaseState: 'pending' | 'purchased' | 'unknown';
  /** Set when Apple refunded or revoked it (Family Sharing ended, say). */
  revocationDateIOS?: number | null;
}

/**
 * Product ids the user owns right now: purchased non-consumables that were not
 * revoked. Pending (Ask to Buy) does not count until it arrives as purchased;
 * a refund locks again silently (TASKS.md → Decisions, answers 1 and 3).
 * Family-shared transactions count like any other.
 */
export function ownedFromTransactions(transactions: readonly TransactionLike[]): string[] {
  const owned = new Set<string>();
  for (const t of transactions) {
    if (!NON_CONSUMABLE_IDS.includes(t.productId)) continue;
    if (t.purchaseState !== 'purchased') continue;
    if (t.revocationDateIOS) continue;
    owned.add(t.productId);
  }
  return [...owned];
}

/** DEV switches (debug builds only): what to pretend the user owns. */
export interface DevOverrides {
  pro: boolean;
  everything: boolean;
  /** Pack product ids to pretend are owned. */
  packs: string[];
  storeDown: boolean;
}

export const NO_DEV_OVERRIDES: DevOverrides = { pro: false, everything: false, packs: [], storeDown: false };

/** Real ownership plus whatever the DEV switches add. Never removes a real purchase. */
export function withDevOverrides(
  owned: readonly string[],
  dev: DevOverrides,
  ids: { pro: string; everything: string }
): string[] {
  const out = new Set(owned);
  if (dev.pro) out.add(ids.pro);
  if (dev.everything) out.add(ids.everything);
  dev.packs.forEach(id => out.add(id));
  return [...out];
}
