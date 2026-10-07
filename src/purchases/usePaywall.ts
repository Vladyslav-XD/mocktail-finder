/**
 * Opens the paywall or a collection's sheet. Every locked thing calls this, so the
 * paywall never appears uninvited (README → Logic reference → Purchases).
 *
 * TEMPORARY (task 5): the paywall and the collection sheet arrive in task 8, which
 * replaces this file with the real implementation behind the same two calls. Until
 * then a tap on a locked collection or on "Everything" does nothing on screen.
 */
export type PaywallFeature = 'mybar' | 'shop' | 'serv' | 'card';

export function usePaywall() {
  return {
    openPaywall: (feature?: PaywallFeature) => {
      if (__DEV__) console.info('[paywall] task 8 — would open the paywall', feature ?? '');
    },
    openCollection: (packId: string) => {
      if (__DEV__) console.info('[paywall] task 8 — would open the collection sheet', packId);
    },
  };
}
