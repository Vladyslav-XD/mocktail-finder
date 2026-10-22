import { Recipe } from '../mockData';
import { deriveTags, tagsToSubtitle } from '../../utils/drinkTags';
import catalogue from './catalogue.json';

/**
 * The 58 free drinks (TheCocktailDB's non-alcoholic list), bundled since 1.2 task 12, so the
 * catalogue needs no network. Built once from design_handoff_mocktail_1.2/data/recipes.json;
 * `category`, which recipes.json lacks, comes from the API snapshot in __tests__/fixtures.
 * Ids are TheCocktailDB's idDrink, so favourites, data/drinkPhotos and data/uk keep working.
 */
export interface CatalogueDrink {
  id: string;
  name: string;
  category: string;
  ingredients: Array<{ measure: string; name: string }>;
  instructions: string;
}

export const CATALOGUE_DRINKS: CatalogueDrink[] = catalogue.drinks;

/** A catalogue drink in the shape every screen uses, built the way the API lookup used to be. */
export function catalogueToRecipe(d: CatalogueDrink): Recipe {
  const tags = deriveTags({ name: d.name, ingredients: d.ingredients, instructions: d.instructions, category: d.category });
  return {
    id: d.id,
    title: d.name,
    subtitle: tagsToSubtitle(tags),
    // The photo is bundled (data/drinkPhotos); there is no web address.
    imageUrl: '',
    isFavorite: false,
    ingredients: d.ingredients.map(i => (i.measure ? `${i.measure} ${i.name}` : i.name)),
    parts: d.ingredients.map(i => ({ amount: i.measure, name: i.name })),
    instructions: d.instructions,
    tags,
  };
}

/** All 58, in the order the API listed them (= the Home list). */
export const CATALOGUE: Recipe[] = CATALOGUE_DRINKS.map(catalogueToRecipe);

const BY_ID = new Map(CATALOGUE.map(r => [r.id, r]));

export const catalogueRecipe = (id: string): Recipe | undefined => BY_ID.get(id);

/**
 * A saved copy of a catalogue drink (favourites from 1.0–1.2) with the bundled details
 * merged in, so it shows ingredients, steps and tags. Anything else comes back as it is.
 */
export function withDetails(recipe: Recipe): Recipe {
  const d = BY_ID.get(recipe.id);
  if (!d) return recipe;
  return {
    ...recipe,
    ingredients: d.ingredients,
    parts: d.parts,
    instructions: d.instructions,
    tags: d.tags,
    subtitle: recipe.subtitle || d.subtitle,
  };
}
