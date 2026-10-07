import { configureStore } from '@reduxjs/toolkit';
import myRecipes, { hydrateRecipes } from '../myRecipesSlice';
import catalogue, { recipesLoaded } from '../catalogueSlice';
import packs from '../packsSlice';
import entitlements, { setOwned } from '../entitlementsSlice';
import { selectIsPro, selectUnlockedPacks, selectVisibleDrinks } from '../selectors';
import { PACK_PRODUCT_IDS, PRODUCT_IDS } from '../../purchases/products';
import { Recipe } from '../../data/mockData';
import recipes from '../../../design_handoff_mocktail_1.2/data/recipes.json';

const catalogueRecipes: Recipe[] = (recipes as any).catalogue.map((d: any) => ({
  id: d.id.replace(/^db-/, ''),
  title: d.name,
  subtitle: '',
  imageUrl: '',
  isFavorite: false,
}));

const own: Recipe = { id: '1', title: 'Mine', subtitle: '', imageUrl: '', isFavorite: false };

function makeStore() {
  const store = configureStore({ reducer: { myRecipes, catalogue, packs, entitlements } });
  store.dispatch(recipesLoaded(catalogueRecipes));
  store.dispatch(hydrateRecipes([own]));
  return store;
}

describe('selectVisibleDrinks', () => {
  it('Free: own + 58 catalogue drinks, no collection', () => {
    const store = makeStore();
    const visible = selectVisibleDrinks(store.getState() as any);
    expect(visible).toHaveLength(59);
    expect(visible[0].id).toBe('1');
    expect(selectIsPro(store.getState() as any)).toBe(false);
  });

  it('Everything: 58 + 60 = 118 drinks besides the own recipe', () => {
    const store = makeStore();
    store.dispatch(setOwned([PRODUCT_IDS.everything]));
    const visible = selectVisibleDrinks(store.getState() as any);
    expect(visible.filter(r => r.id !== '1')).toHaveLength(118);
    expect(selectIsPro(store.getState() as any)).toBe(true);
  });

  it('one collection adds its ten drinks; locking it again removes them', () => {
    const store = makeStore();
    store.dispatch(setOwned([PACK_PRODUCT_IDS['dry-january']]));
    expect(selectUnlockedPacks(store.getState() as any)).toEqual(['dry-january']);
    const visible = selectVisibleDrinks(store.getState() as any);
    expect(visible).toHaveLength(69);
    expect(visible.slice(59).every(r => r.packId === 'dry-january')).toBe(true);

    store.dispatch(setOwned([]));
    expect(selectVisibleDrinks(store.getState() as any)).toHaveLength(59);
  });
});
