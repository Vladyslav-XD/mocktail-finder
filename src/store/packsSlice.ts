import { createSlice } from '@reduxjs/toolkit';
import { Recipe } from '../data/mockData';
import { ALL_PACK_RECIPES } from '../data/packs';

/**
 * All 60 collection drinks, bundled with the app and in the store from the first
 * frame. Which of them are visible is decided by the entitlements (selectors.ts).
 */
export interface PacksState {
  recipes: Recipe[];
}

const packsSlice = createSlice({
  name: 'packs',
  initialState: { recipes: ALL_PACK_RECIPES } as PacksState,
  reducers: {},
});

export default packsSlice.reducer;
