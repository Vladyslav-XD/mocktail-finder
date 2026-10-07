/**
 * Recipe list as the screens want it: list items merged with whatever details
 * are already cached, plus helpers to fill the rest in progressively.
 */
import { Recipe } from '../data/mockData';
import { fetchMocktailList, RecipeDetails } from './api';
import { getCachedDetails, prefetchDetails } from './detailsCache';
import { tagsToSubtitle } from '../utils/drinkTags';

/** Merges details into a list item so its card has a subtitle and the recipe screen needs no request. */
export function withDetails(recipe: Recipe, details?: RecipeDetails): Recipe {
  const d = details ?? getCachedDetails(recipe.id);
  if (!d) return recipe;
  return {
    ...recipe,
    ingredients: d.ingredients,
    parts: d.parts,
    instructions: d.instructions,
    tags: d.tags,
    // User recipes keep their own description; database drinks get the tag line.
    subtitle: recipe.subtitle || tagsToSubtitle(d.tags),
  };
}

/** The non-alcoholic list with cached details merged in. */
export async function fetchMocktails(): Promise<Recipe[]> {
  const list = await fetchMocktailList();
  return list.map(item => withDetails(item));
}

/**
 * Loads details for every drink that has none yet and calls `onUpdate` with
 * the list re-merged each time a batch arrives. Resolves when done.
 */
export async function fillInDetails(
  recipes: Recipe[],
  onUpdate: (update: (current: Recipe[]) => Recipe[]) => void
): Promise<void> {
  const missing = recipes.filter(r => !r.tags).map(r => r.id);
  if (missing.length === 0) return;
  await prefetchDetails(missing, batch => {
    onUpdate(current => current.map(r => (batch[r.id] ? withDetails(r, batch[r.id]) : r)));
  });
}
