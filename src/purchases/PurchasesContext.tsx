import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { Purchase } from 'expo-iap';
import { setOwned } from '../store/entitlementsSlice';
import { selectEntitlements } from '../store/selectors';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../components/Toast';
import { PACKS } from '../data/packs';
import { NON_CONSUMABLE_IDS, PACK_PRODUCT_IDS, PRODUCT_IDS, TIP_PRODUCT_IDS } from './products';
import { DevOverrides, NO_DEV_OVERRIDES, withDevOverrides } from './ownership';
import * as StoreKit from './storeKit';

/**
 * Purchases through Apple only (StoreKit 2 via expo-iap). README → Logic reference →
 * Purchases; TASKS.md → Decisions. No accounts, no analytics, no server: StoreKit's
 * own entitlements are the truth, cached on the device so the first frame is right.
 */

const ALL_PRODUCT_IDS = [...NON_CONSUMABLE_IDS, ...TIP_PRODUCT_IDS];

/** Owned product ids from the last launch. App.tsx reads it during the splash. */
export async function loadCachedOwned(): Promise<string[]> {
  const saved = await loadJson<string[]>(STORAGE_KEYS.entitlements, []);
  return Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : [];
}

interface PurchasesContextType {
  /** The App Store answers. False in Expo Go, offline, or with the DEV "store down" switch. */
  available: boolean;
  /** Products still loading (the paywall shows a 0.6 s skeleton on prices). */
  loading: boolean;
  /** StoreKit's displayPrice, or null when the product cannot be bought right now. */
  price: (productId: string) => string | null;
  isPro: boolean;
  ownsEverything: boolean;
  unlockedPacks: string[];
  /** Product whose Apple sheet is open, if any. */
  purchasing: string | null;
  /** Tips bought this session: their card shows "Thanks!". */
  thankedTips: string[];
  buy: (productId: string) => Promise<void>;
  restore: () => Promise<void>;
  tip: (productId: string) => Promise<void>;
  /** DEV switches; null outside debug builds. */
  dev: (DevOverrides & { set: (patch: Partial<DevOverrides>) => void }) | null;
}

const PurchasesContext = createContext<PurchasesContextType | null>(null);

export const PurchasesProvider = ({
  children,
  initialOwned = [],
}: {
  children: React.ReactNode;
  initialOwned?: string[];
}) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { t, lang } = useLanguage();
  const entitlements = useSelector(selectEntitlements);

  const [realOwned, setRealOwned] = useState<string[]>(initialOwned);
  const [storeUp, setStoreUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Record<string, StoreKit.StoreProduct>>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [thankedTips, setThankedTips] = useState<string[]>([]);
  const [dev, setDev] = useState<DevOverrides>(NO_DEV_OVERRIDES);

  // Purchases started in this session (or left pending): only these get a toast.
  // Replays and refunds on launch change state silently.
  const asked = useRef(new Set<string>());
  // Listeners are registered once; they read the latest text and language from here.
  const latest = useRef({ t, lang, toast });
  latest.current = { t, lang, toast };

  // What the rest of the app sees: real ownership plus DEV switches.
  useEffect(() => {
    dispatch(setOwned(withDevOverrides(realOwned, dev, PRODUCT_IDS)));
  }, [dispatch, realOwned, dev]);

  const updateOwned = useCallback((owned: string[]) => {
    setRealOwned(owned);
    saveJson(STORAGE_KEYS.entitlements, owned);
  }, []);

  const welcomeText = useCallback((productId: string) => {
    const { t: tr, lang: lg } = latest.current;
    if (productId === PRODUCT_IDS.pro || productId === PRODUCT_IDS.everything) return tr('welcomePro');
    const pack = PACKS.find(p => PACK_PRODUCT_IDS[p.id] === productId);
    return pack ? tr('unlockedToast', { x: lg === 'uk' ? pack.title_uk : pack.title }) : null;
  }, []);

  const onPurchase = useCallback(
    async (purchase: Purchase) => {
      const { t: tr, toast: tst } = latest.current;
      const id = purchase.productId;
      const wasAsked = asked.current.has(id);

      if (purchase.purchaseState === 'pending') {
        // Ask to Buy: stays locked; the approved transaction arrives later.
        if (wasAsked) tst.show(tr('pendingToast'));
        setPurchasing(current => (current === id ? null : current));
        return;
      }
      if (purchase.purchaseState !== 'purchased') return;

      if (TIP_PRODUCT_IDS.includes(id)) {
        // Consumable: finish at once so it can be bought again. Unlocks nothing.
        await StoreKit.finish(purchase, true).catch(() => {});
        setThankedTips(list => (list.includes(id) ? list : [...list, id]));
        if (wasAsked) tst.show(tr('thanksToast'));
      } else if (NON_CONSUMABLE_IDS.includes(id)) {
        const revoked = !!(purchase as { revocationDateIOS?: number | null }).revocationDateIOS;
        setRealOwned(current => {
          const next = revoked ? current.filter(x => x !== id) : current.includes(id) ? current : [...current, id];
          saveJson(STORAGE_KEYS.entitlements, next);
          return next;
        });
        await StoreKit.finish(purchase, false).catch(() => {});
        const text = !revoked && wasAsked ? welcomeText(id) : null;
        if (text) tst.show(text);
      }
      asked.current.delete(id);
      setPurchasing(current => (current === id ? null : current));
    },
    [welcomeText]
  );

  const onError = useCallback((error: StoreKit.StoreError & { productId?: string | null }) => {
    const { t: tr, toast: tst } = latest.current;
    const kind = StoreKit.errorKind(error);
    // Cancelled: close silently. Pending keeps the product in `asked` so its approval gets a toast.
    if (kind === 'pending') tst.show(tr('pendingToast'));
    if (kind === 'failed') tst.show(tr('failedToast'));
    if (kind !== 'pending' && error.productId) asked.current.delete(error.productId);
    setPurchasing(null);
  }, []);

  // Connect, load prices and entitlements, listen for updates. Never blocks the UI.
  useEffect(() => {
    let alive = true;
    if (!StoreKit.isStoreSupported()) {
      setStoreUp(false);
      setLoading(false);
      return;
    }
    const stop = StoreKit.listen(p => void onPurchase(p), onError);
    (async () => {
      const ok = await StoreKit.connect();
      if (!alive) return;
      setStoreUp(ok);
      if (!ok) {
        setLoading(false);
        return;
      }
      try {
        const loaded = await StoreKit.loadProducts(ALL_PRODUCT_IDS);
        if (alive) setProducts(loaded);
      } catch {
        // No prices: every buy button reads "Not available right now".
      }
      if (alive) setLoading(false);
      try {
        const owned = await StoreKit.currentOwned();
        if (alive) updateOwned(owned);
      } catch {
        // Keep the cached flags until StoreKit answers.
      }
    })();
    return () => {
      alive = false;
      stop();
    };
  }, [onPurchase, onError, updateOwned]);

  const available = storeUp && !dev.storeDown;

  const price = useCallback(
    (productId: string) => (available && products[productId] ? products[productId].displayPrice : null),
    [available, products]
  );

  const start = useCallback(
    async (productId: string) => {
      if (!price(productId) || purchasing) return;
      asked.current.add(productId);
      setPurchasing(productId);
      try {
        await StoreKit.startPurchase(productId);
      } catch (e) {
        onError({ ...(e as StoreKit.StoreError), productId });
      }
    },
    [price, purchasing, onError]
  );

  const restore = useCallback(async () => {
    if (!available) {
      toast.show(t('unavailable'));
      return;
    }
    try {
      const owned = await StoreKit.restore();
      updateOwned(owned);
      toast.show(t(owned.length > 0 ? 'restored' : 'nothingRestore'));
    } catch {
      toast.show(t('failedToast'));
    }
  }, [available, toast, t, updateOwned]);

  const devApi = useMemo(
    () => (__DEV__ ? { ...dev, set: (patch: Partial<DevOverrides>) => setDev(d => ({ ...d, ...patch })) } : null),
    [dev]
  );

  const value = useMemo<PurchasesContextType>(
    () => ({
      available,
      loading,
      price,
      isPro: entitlements.isPro,
      ownsEverything: entitlements.ownsEverything,
      unlockedPacks: entitlements.unlockedPacks,
      purchasing,
      thankedTips,
      buy: start,
      restore,
      tip: start,
      dev: devApi,
    }),
    [available, loading, price, entitlements, purchasing, thankedTips, start, restore, devApi]
  );

  return <PurchasesContext.Provider value={value}>{children}</PurchasesContext.Provider>;
};

export function usePurchases(): PurchasesContextType {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases outside PurchasesProvider');
  return ctx;
}
