import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Counts open sheets and modals, so hints never appear over one (README → Hints).
 * Kept apart from the onboarding provider: sheets live below it and above it.
 */
interface OverlayApi {
  open: number;
  change: (delta: number) => void;
}

const OverlayContext = createContext<OverlayApi>({ open: 0, change: () => {} });

export const OverlayProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(0);
  const change = useCallback((delta: number) => setOpen(n => Math.max(0, n + delta)), []);
  const api = useMemo(() => ({ open, change }), [open, change]);
  return <OverlayContext.Provider value={api}>{children}</OverlayContext.Provider>;
};

/** A sheet or modal calls this with its visibility. */
export function useOverlayOpen(visible: boolean) {
  const { change } = useContext(OverlayContext);
  useEffect(() => {
    if (!visible) return;
    change(1);
    return () => change(-1);
  }, [visible, change]);
}

export const useOverlayCount = () => useContext(OverlayContext).open;
