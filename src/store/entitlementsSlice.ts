import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Product ids the user owns (non-consumables), as StoreKit reports them. Purchases
 * (task 4) keep this current; until then it is empty, i.e. Free. Derived flags are
 * in selectors.ts (`deriveEntitlements`).
 */
export interface EntitlementsState {
  owned: string[];
}

const entitlementsSlice = createSlice({
  name: 'entitlements',
  initialState: { owned: [] } as EntitlementsState,
  reducers: {
    setOwned: (state, action: PayloadAction<string[]>) => {
      state.owned = [...new Set(action.payload)];
    },
  },
});

export const { setOwned } = entitlementsSlice.actions;
export default entitlementsSlice.reducer;
