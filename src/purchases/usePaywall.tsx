import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { navigationRef } from '../navigation/navigationRef';
import { SCREENS } from '../constants/screens';
import { CollectionSheet } from '../components/CollectionSheet';

/**
 * Opens the paywall or a collection's sheet. Every locked thing calls this, so the
 * paywall never appears uninvited (README → Logic reference → Purchases).
 */
export type PaywallFeature = 'mybar' | 'shop' | 'serv' | 'card';

interface PaywallApi {
  /** The feature the user tapped is highlighted and listed first. */
  openPaywall: (feature?: PaywallFeature) => void;
  openCollection: (packId: string) => void;
}

const PaywallContext = createContext<PaywallApi>({ openPaywall: () => {}, openCollection: () => {} });

/** Inside the NavigationContainer; draws the one collection sheet the app has. */
export const PaywallProvider = ({ children }: { children: React.ReactNode }) => {
  const [packId, setPackId] = useState<string | null>(null);

  const openPaywall = useCallback((feature?: PaywallFeature) => {
    if (navigationRef.isReady()) navigationRef.navigate(SCREENS.PAYWALL, { feature });
  }, []);
  const openCollection = useCallback((id: string) => setPackId(id), []);
  const close = useCallback(() => setPackId(null), []);

  const api = useMemo(() => ({ openPaywall, openCollection }), [openPaywall, openCollection]);

  return (
    <PaywallContext.Provider value={api}>
      {children}
      <CollectionSheet packId={packId} onClose={close} />
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => useContext(PaywallContext);
