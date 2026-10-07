import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { Purchase, Product } from 'expo-iap';

/** What a purchase error carries; `code` may be missing on some native paths. */
export interface StoreError {
  code?: string | null;
  message?: string;
}
import { ownedFromTransactions } from './ownership';

/**
 * The only file that talks to StoreKit 2 (through expo-iap). Everything else asks
 * this module, so the rest of the app works the same in Expo Go, where there is
 * no native store and every call reports "unavailable" instead of throwing.
 */

/** Expo Go has no expo-iap native module; this app is iPhone-only. */
export function isStoreSupported(): boolean {
  return Platform.OS === 'ios' && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

type Iap = typeof import('expo-iap');
let iap: Iap | null = null;

/** Loaded on first use, never at import time, and only where it can work. */
function lib(): Iap | null {
  if (!isStoreSupported()) return null;
  if (!iap) {
    try {
      iap = require('expo-iap') as Iap;
    } catch {
      return null;
    }
  }
  return iap;
}

export interface StoreProduct {
  id: string;
  /** Localised by the App Store, e.g. "€5.99" or "5,99 €". The only price the UI shows. */
  displayPrice: string;
}

/** Opens the StoreKit connection. False when there is no store (Expo Go, no network…). */
export async function connect(): Promise<boolean> {
  const m = lib();
  if (!m) return false;
  try {
    return (await m.initConnection()) !== false;
  } catch {
    return false;
  }
}

/** Products that exist in App Store Connect; unknown ids are simply missing. */
export async function loadProducts(ids: string[]): Promise<Record<string, StoreProduct>> {
  const m = lib();
  if (!m) return {};
  const list = ((await m.fetchProducts({ skus: ids, type: 'in-app' })) ?? []) as Product[];
  const out: Record<string, StoreProduct> = {};
  for (const p of list) out[p.id] = { id: p.id, displayPrice: p.displayPrice };
  return out;
}

/** Current entitlements: owned, unrevoked non-consumables (family-shared included). */
export async function currentOwned(): Promise<string[]> {
  const m = lib();
  if (!m) return [];
  const purchases = (await m.getAvailablePurchases({ onlyIncludeActiveItemsIOS: true })) as Purchase[];
  return ownedFromTransactions(purchases as any);
}

/** AppStore.sync(), then the entitlements again. */
export async function restore(): Promise<string[]> {
  const m = lib();
  if (!m) return [];
  await m.restorePurchases();
  return currentOwned();
}

/** Starts the Apple purchase sheet. The outcome arrives through `listen`. */
export async function startPurchase(productId: string): Promise<void> {
  const m = lib();
  if (!m) throw new Error('store unavailable');
  await m.requestPurchase({ request: { apple: { sku: productId } }, type: 'in-app' });
}

/** Tells StoreKit we are done; consumables (tips) can then be bought again. */
export async function finish(purchase: Purchase, consumable: boolean): Promise<void> {
  const m = lib();
  if (!m) return;
  await m.finishTransaction({ purchase, isConsumable: consumable });
}

export type ErrorKind = 'cancelled' | 'pending' | 'failed';

export function errorKind(error: StoreError): ErrorKind {
  const code = String(error.code ?? '');
  if (code === 'user-cancelled') return 'cancelled';
  if (code === 'deferred-payment' || code === 'pending') return 'pending';
  return 'failed';
}

/**
 * Transaction updates (new purchases, Ask to Buy approvals, refunds, replays on
 * launch) and purchase errors. Returns the unsubscribe function.
 */
export function listen(
  onPurchase: (purchase: Purchase) => void,
  onError: (error: StoreError) => void
): () => void {
  const m = lib();
  if (!m) return () => {};
  const a = m.purchaseUpdatedListener(onPurchase);
  const b = m.purchaseErrorListener(onError);
  return () => {
    a.remove();
    b.remove();
  };
}
