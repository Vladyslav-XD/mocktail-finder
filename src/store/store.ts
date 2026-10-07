import { configureStore } from '@reduxjs/toolkit';
import myRecipesReducer, { hydrateRecipes } from './myRecipesSlice';
import catalogueReducer from './catalogueSlice';
import packsReducer from './packsSlice';
import entitlementsReducer from './entitlementsSlice';
import shoppingListReducer, { hydrateShoppingList } from './shoppingListSlice';
import pantryReducer, { hydratePantry } from './pantrySlice';
import type { ShoppingItem } from '../utils/shoppingList';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { Recipe } from '../data/mockData';
import { DrinkTag, tagsToSubtitle } from '../utils/drinkTags';

export const store = configureStore({
  reducer: {
    myRecipes: myRecipesReducer,
    catalogue: catalogueReducer,
    packs: packsReducer,
    entitlements: entitlementsReducer,
    shoppingList: shoppingListReducer,
    pantry: pantryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Single "category" of recipes created before tags existed → the matching tag. */
const LEGACY_CATEGORY_TO_TAG: Record<string, DrinkTag> = {
  Citrus: 'Citrus',
  Berry: 'Berry',
  Mint: 'Minty',
  Tropical: 'Tropical',
  Sparkling: 'Sparkling',
};

/** Brings a recipe saved by an older build up to the current shape (tags). */
export function migrateRecipe(recipe: Recipe): Recipe {
  if (recipe.tags || !recipe.category) return recipe;
  const tag = LEGACY_CATEGORY_TO_TAG[recipe.category];
  const tags: DrinkTag[] = tag ? [tag] : [];
  return { ...recipe, tags, subtitle: recipe.subtitle || tagsToSubtitle(tags) };
}

/** Reads persisted user recipes, the shopping list and My Bar into the store. Resolves when done (never rejects). */
export async function hydrateStore(): Promise<void> {
  const [saved, shopping, pantry] = await Promise.all([
    loadJson<Recipe[]>(STORAGE_KEYS.myRecipes, []),
    loadJson<ShoppingItem[]>(STORAGE_KEYS.shoppingList, []),
    loadJson<string[]>(STORAGE_KEYS.pantry, []),
  ]);
  store.dispatch(hydrateRecipes(Array.isArray(saved) ? saved.map(migrateRecipe) : []));
  store.dispatch(hydrateShoppingList(Array.isArray(shopping) ? shopping : []));
  store.dispatch(hydratePantry(Array.isArray(pantry) ? pantry.filter(k => typeof k === 'string') : []));
}

// Persist user recipes whenever they change (after hydration, so an empty
// initial state never overwrites what is already on disk).
let lastPersisted: Recipe[] | null = null;
let lastShopping: ShoppingItem[] | null = null;
let lastPantry: string[] | null = null;
store.subscribe(() => {
  const { myRecipes, shoppingList, pantry } = store.getState();
  if (pantry.hydrated && pantry.ticked !== lastPantry) {
    lastPantry = pantry.ticked;
    saveJson(STORAGE_KEYS.pantry, pantry.ticked);
  }
  if (myRecipes.hydrated && myRecipes.recipes !== lastPersisted) {
    lastPersisted = myRecipes.recipes;
    saveJson(STORAGE_KEYS.myRecipes, myRecipes.recipes);
  }
  if (shoppingList.hydrated && shoppingList.items !== lastShopping) {
    lastShopping = shoppingList.items;
    saveJson(STORAGE_KEYS.shoppingList, shoppingList.items);
  }
});
