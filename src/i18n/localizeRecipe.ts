import { Recipe } from '../data/mockData';
import { DrinkTag, tagsToSubtitle } from '../utils/drinkTags';
import ukDrinks from '../data/uk/drinks.json';
import { findPackRecipe } from '../data/packs';
import { formatIngredientLine } from '../utils/measures';
import type { Language, Translate } from '.';

/**
 * The Ukrainian layer for the 58 catalogue drinks (Cowork, src/data/uk/drinks.json);
 * collection drinks carry their own Ukrainian (data/packs).
 * Shape per drink: name, glass, ingredients [{ measure, name }] in the API's order,
 * instructions. Every field is optional: whatever is missing stays English.
 */
interface UkDrink {
  name?: string;
  glass?: string;
  ingredients?: Array<{ measure?: string; name?: string }>;
  instructions?: string;
}

const UK_DRINKS = ukDrinks as Record<string, UkDrink>;

/** Tag words in the current language, card form ("Цитрусовий"). */
export function tagLabels(tags: DrinkTag[], t: Translate): string[] {
  return tags.map(tag => t(`tag.${tag}`));
}

/**
 * The recipe as the screen should show it. Stored recipes stay English (favourites,
 * the details cache); this runs at render, so switching language needs no migration.
 * Filters and My Bar keep working on the English original.
 */
export function localizeRecipe(recipe: Recipe, lang: Language, t: Translate): Recipe {
  let out = recipe;

  // Catalogue drinks show their tags as the subtitle; a user recipe shows its own text.
  if (recipe.tags && (recipe.subtitle === '' || recipe.subtitle === tagsToSubtitle(recipe.tags))) {
    const subtitle = tagLabels(recipe.tags.slice(0, 3), t).join(' · ');
    if (subtitle !== recipe.subtitle) out = { ...out, subtitle };
  }

  if (lang !== 'uk') return out;

  // Collection drinks are bilingual in their own data.
  const pack = findPackRecipe(recipe.id);
  if (pack) {
    const r = pack.recipe;
    return {
      ...out,
      title: r.name_uk || recipe.title,
      ingredients: r.ingredients_uk?.length
        ? r.ingredients_uk.map(i => formatIngredientLine(i.amount, i.name))
        : recipe.ingredients,
      steps: r.steps_uk?.length ? r.steps_uk : recipe.steps,
      instructions: r.steps_uk?.length ? r.steps_uk.join(' ') : recipe.instructions,
      description: r.description_uk || recipe.description,
    };
  }

  const uk = UK_DRINKS[recipe.id];
  if (!uk) return out;

  const ingredients = recipe.ingredients?.map((line, i) => {
    const item = uk.ingredients?.[i];
    // An empty measure is a real value ("no amount"); a missing name is not.
    if (!item?.name || item.measure === undefined) return line;
    return `${item.measure} ${item.name}`.trim();
  });

  return {
    ...out,
    title: uk.name || recipe.title,
    ingredients,
    instructions: uk.instructions || recipe.instructions,
  };
}

/** Search hits the shown name and ingredients, and the English name as well. */
export function matchesSearch(recipe: Recipe, shown: Recipe, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const texts = [shown.title, recipe.title, ...(shown.ingredients || []), ...(recipe.ingredients || [])];
  return texts.some(text => text.toLowerCase().includes(q));
}
