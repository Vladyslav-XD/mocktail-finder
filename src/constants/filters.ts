import { ALL_TAGS, DrinkTag } from '../utils/drinkTags';
import type { en } from '../i18n/en';

/** Ingredient key from the handoff (`ing.<key>` in the dictionaries) that names a chip. */
export type IngredientChipKey = keyof typeof en.ing;

/**
 * Character chips on the home screen. Every chip is a real tag from
 * utils/drinkTags — the same words that appear in card subtitles.
 * "Sweet" is left out: two thirds of the drinks have it, so it filters nothing.
 */
export const CHARACTER_FILTERS: DrinkTag[] = ALL_TAGS.filter(t => t !== 'Sweet');

/**
 * "What do you have at hand" chips. Each matches an ingredient line
 * ("1 cup Apple juice") or the drink name. Chosen from what the database
 * actually contains — every chip returns at least a few drinks. `label` is the
 * English id the filter state keeps; the chip shows `ing.<key>` in the current language.
 */
export const INGREDIENT_FILTERS: Array<{ label: string; key: IngredientChipKey; pattern: RegExp }> = [
  { label: 'Orange', key: 'orange', pattern: /orange/i },
  { label: 'Lemon', key: 'lemon', pattern: /lemon/i },
  { label: 'Lime', key: 'lime', pattern: /\blime/i },
  { label: 'Apple', key: 'apple', pattern: /\bapple/i },
  { label: 'Pineapple', key: 'pineapple', pattern: /pineapple/i },
  { label: 'Banana', key: 'banana', pattern: /banana/i },
  { label: 'Berries', key: 'berries', pattern: /berr/i },
  { label: 'Ginger', key: 'ginger', pattern: /ginger(?! ale| beer|ale)/i },
  { label: 'Mint', key: 'mint', pattern: /\bmint/i },
  { label: 'Milk', key: 'milk', pattern: /milk/i },
  { label: 'Yoghurt', key: 'yoghurt', pattern: /yog(h)?urt/i },
];

export function recipeHasIngredient(
  recipe: { title: string; ingredients?: string[] },
  label: string
): boolean {
  const filter = INGREDIENT_FILTERS.find(f => f.label === label);
  if (!filter) return false;
  if (filter.pattern.test(recipe.title)) return true;
  return (recipe.ingredients || []).some(line => filter.pattern.test(line));
}
