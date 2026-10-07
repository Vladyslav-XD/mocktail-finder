import type { Recipe } from '../data/mockData';
import { findPackRecipe } from '../data/packs';
import ukDrinks from '../data/uk/drinks.json';
import type { Language } from '../i18n';
import { keyOf } from './ingredientKeys';
import { formatIngredientLine, scaleAmount } from './measures';

/**
 * Every ingredient of a drink with name and measure apart, in both languages where
 * we have them: [English, Ukrainian or null]. Collection drinks carry both; catalogue
 * drinks take English from TheCocktailDB and Ukrainian from Cowork's file; a user
 * recipe has only what was typed. Lines saved before 1.2 have no split at all.
 */
export interface BiPart {
  name: [string, string | null];
  amount: [string, string | null];
  /** My Bar key, from the English name (null: nothing to tick). */
  key: string | null;
  /** False for a 1.1 line with measure and name together; only its numbers can scale. */
  split: boolean;
}

type UkDrink = { ingredients?: Array<{ measure?: string; name?: string }> };
const UK_DRINKS = ukDrinks as Record<string, UkDrink>;

export function bilingualParts(recipe: Recipe): BiPart[] {
  const pack = findPackRecipe(recipe.id);
  if (pack) {
    const { ingredients, ingredients_uk } = pack.recipe;
    return ingredients.map((p, i) => ({
      name: [p.name, ingredients_uk[i]?.name ?? null],
      amount: [p.amount, ingredients_uk[i]?.amount ?? null],
      key: keyOf(p.name),
      split: true,
    }));
  }
  if (recipe.parts?.length) {
    const uk = UK_DRINKS[recipe.id]?.ingredients;
    return recipe.parts.map((p, i) => ({
      name: [p.name, uk?.[i]?.name || null],
      amount: [p.amount, uk?.[i]?.name ? uk[i].measure ?? null : null],
      key: keyOf(p.name),
      split: true,
    }));
  }
  // A line without a split ("50 ml lime juice"): shown as written, numbers still scale.
  return (recipe.ingredients || []).map(line => ({ name: [line, null], amount: ['', null], key: keyOf(line), split: false }));
}

/** Servings the recipe is written for; the stepper starts here. */
export function baseServings(recipe: Recipe): number {
  return findPackRecipe(recipe.id)?.recipe.servings || 1;
}

function pick(pair: [string, string | null], lang: Language): { text: string; lang: Language } {
  return lang === 'uk' && pair[1] != null ? { text: pair[1], lang: 'uk' } : { text: pair[0], lang: 'en' };
}

/** The amount for `factor` × the written servings, in the language it is written in. */
export function scaledAmount(amount: [string, string | null], factor: number, lang: Language): string {
  const a = pick(amount, lang);
  return factor === 1 ? a.text : scaleAmount(a.text, factor, a.lang);
}

export function partName(part: BiPart, lang: Language): string {
  return pick(part.name, lang).text;
}

/** A measure at the start of a line: numbers/fractions, then at most one unit word. */
const LEADING_MEASURE = /^([\d½¼¾⅓⅔⅛][\d\s/.,½¼¾⅓⅔⅛-]*(?:\s?[A-Za-zА-Яа-яІіЇїЄєҐґ.]+)?)\s+(.+)$/;

/** Ingredient lines for the recipe screen (README → Logic reference → Ingredient line). */
export function ingredientLines(parts: BiPart[], factor: number, lang: Language): string[] {
  return parts.map(p => {
    if (!p.split) {
      // No split: scale only the measure the line starts with, never a number in the
      // name ("1 can 7-Up" → "2 cans 7-Up").
      const line = partName(p, lang);
      const m = factor === 1 ? null : line.match(LEADING_MEASURE);
      return m ? `${scaleAmount(m[1], factor, lang)} ${m[2]}` : line;
    }
    return formatIngredientLine(scaledAmount(p.amount, factor, lang), partName(p, lang));
  });
}

/**
 * One line for the share card, written as on the recipe screen (Vlad, 7 Oct; the
 * prototype lower-cased the names): "3 parts  Grenadine  ·  Ice — 120 g + 60 g  ·  …".
 */
export function cardIngredientLine(parts: BiPart[], factor: number, lang: Language): string {
  // Non-breaking spaces inside each ingredient, so the card wraps only between them.
  return ingredientLines(parts, factor, lang)
    .map(line => line.replace(/ /g, '\u00a0'))
    .join('  ·  ');
}
