import { configureStore } from '@reduxjs/toolkit';
import myRecipesReducer, { hydrateRecipes } from './myRecipesSlice';
import catalogueReducer from './catalogueSlice';
import packsReducer from './packsSlice';
import entitlementsReducer from './entitlementsSlice';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { Recipe } from '../data/mockData';
import { DrinkTag, tagsToSubtitle } from '../utils/drinkTags';

export const store = configureStore({
  reducer: {
    myRecipes: myRecipesReducer,
    catalogue: catalogueReducer,
    packs: packsReducer,
    entitlements: entitlementsReducer,
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

/** Reads persisted user recipes into the store. Resolves when done (never rejects). */
export async function hydrateStore(): Promise<void> {
  const saved = await loadJson<Recipe[]>(STORAGE_KEYS.myRecipes, []);
  store.dispatch(hydrateRecipes(Array.isArray(saved) ? saved.map(migrateRecipe) : []));
}

// Persist user recipes whenever they change (after hydration, so an empty
// initial state never overwrites what is already on disk).
let lastPersisted: Recipe[] | null = null;
store.subscribe(() => {
  const { recipes, hydrated } = store.getState().myRecipes;
  if (!hydrated || recipes === lastPersisted) return;
  lastPersisted = recipes;
  saveJson(STORAGE_KEYS.myRecipes, recipes);
});
