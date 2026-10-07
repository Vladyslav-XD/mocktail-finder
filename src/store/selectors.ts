import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './store';
import { deriveEntitlements } from '../purchases/entitlements';

const selectOwned = (state: RootState) => state.entitlements.owned;
const selectOwn = (state: RootState) => state.myRecipes.recipes;
const selectCatalogue = (state: RootState) => state.catalogue.recipes;
const selectPackRecipes = (state: RootState) => state.packs.recipes;

export const selectEntitlements = createSelector([selectOwned], deriveEntitlements);
export const selectIsPro = (state: RootState) => selectEntitlements(state).isPro;
export const selectUnlockedPacks = (state: RootState) => selectEntitlements(state).unlockedPacks;

/**
 * Every drink the user can see (README → Logic reference → Visible drinks):
 * own recipes (newest first), the catalogue, then the unlocked collections.
 */
export const selectVisibleDrinks = createSelector(
  [selectOwn, selectCatalogue, selectPackRecipes, selectEntitlements],
  (own, catalogue, packRecipes, entitlements) => [
    ...[...own].reverse(),
    ...catalogue,
    ...packRecipes.filter(r => r.packId && entitlements.unlockedPacks.includes(r.packId)),
  ]
);
