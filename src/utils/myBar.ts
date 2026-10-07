import type { Recipe } from '../data/mockData';
import { DRINK_KEYS, INGREDIENT_GROUPS } from '../data/ingredients';
import { ALWAYS_AVAILABLE, drinkKeys } from './ingredientKeys';

/**
 * My Bar (README → Logic reference → My Bar). A drink needs its ingredient keys;
 * ice, water, sugar and salt are always in. "Can make" = every key ticked; "missing
 * one" = exactly one not ticked. Only the visible drinks count, so when a collection
 * locks again its keys drop out of the sheet while the user's ticks stay saved.
 */

/** Keys of one drink: the generated table for the 118, keyOf for the user's own. */
export function keysOf(recipe: Recipe): string[] {
  const known = DRINK_KEYS[recipe.id];
  if (known) return known;
  const names = recipe.parts?.length ? recipe.parts.map(p => p.name) : recipe.ingredients || [];
  return drinkKeys(names);
}

/** How many visible drinks use each key. */
export function keyFrequency(drinks: readonly Recipe[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const drink of drinks) for (const key of keysOf(drink)) freq[key] = (freq[key] || 0) + 1;
  return freq;
}

const byFrequency = (freq: Record<string, number>) => (a: string, b: string) => (freq[b] || 0) - (freq[a] || 0);

/** "Most used": the ten keys in the most drinks. */
export function mostUsed(freq: Record<string, number>, count = 10): string[] {
  return Object.keys(freq).sort(byFrequency(freq)).slice(0, count);
}

/** Group items present in the visible drinks, most used first, matching the search. */
export function groupItems(
  groupKey: (typeof INGREDIENT_GROUPS)[number]['key'],
  freq: Record<string, number>,
  matches: (key: string) => boolean = () => true
): string[] {
  const group = INGREDIENT_GROUPS.find(g => g.key === groupKey);
  return (group ? [...group.items] : []).filter(k => freq[k] && matches(k)).sort(byFrequency(freq));
}

export interface BarResults {
  canMake: Recipe[];
  /** Each with the one key it lacks. */
  missingOne: Array<{ recipe: Recipe; missing: string }>;
}

export function barResults(drinks: readonly Recipe[], ticked: readonly string[]): BarResults {
  const have = new Set<string>([...ticked, ...ALWAYS_AVAILABLE]);
  const canMake: Recipe[] = [];
  const missingOne: BarResults['missingOne'] = [];
  for (const drink of drinks) {
    const keys = keysOf(drink);
    if (!keys.length) continue;
    const missing = keys.filter(k => !have.has(k));
    if (missing.length === 0) canMake.push(drink);
    else if (missing.length === 1) missingOne.push({ recipe: drink, missing: missing[0] });
  }
  return { canMake, missingOne };
}

/** Ticked keys that still belong to a visible drink, in group order (the "Your bar" chips). */
export function shownTicks(ticked: readonly string[], freq: Record<string, number>): string[] {
  return INGREDIENT_GROUPS.flatMap(g => g.items.filter(k => ticked.includes(k) && freq[k]));
}
