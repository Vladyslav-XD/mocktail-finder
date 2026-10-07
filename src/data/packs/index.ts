import { Recipe } from '../mockData';
import { DrinkTag, tagsToSubtitle } from '../../utils/drinkTags';
import { formatIngredientLine } from '../../utils/measures';
import dryJanuary from './dry-january.json';
import eveningClassics from './evening-classics.json';
import winterWarmers from './winter-warmers.json';
import summerGarden from './summer-garden.json';
import tropicalEscape from './tropical-escape.json';
import partyBrunch from './party-brunch.json';

/**
 * The six paid collections, copied verbatim from design_handoff_mocktail_1.2/data/recipes.json
 * (one file per pack, English and Ukrainian). Order = the Home row.
 */

export interface PackIngredient {
  name: string;
  amount: string;
}

export interface PackRecipe {
  id: string;
  name: string;
  name_uk: string;
  tags: string[];
  description: string;
  description_uk: string;
  time_min: number;
  glass: string;
  glass_uk: string;
  glass_ml: number;
  servings: number;
  ingredients: PackIngredient[];
  ingredients_uk: PackIngredient[];
  steps: string[];
  steps_uk: string[];
  photo: string;
}

export interface Pack {
  id: string;
  title: string;
  title_uk: string;
  subtitle: string;
  subtitle_uk: string;
  description: string;
  description_uk: string;
  /** StoreKit product id (TASKS.md → Products). */
  productId: string;
  /** Reference only. Prices on screen come from StoreKit. */
  price: string;
  cover: string;
  recipes: PackRecipe[];
}

export const PACKS: Pack[] = [dryJanuary, eveningClassics, winterWarmers, summerGarden, tropicalEscape, partyBrunch];

const PREFIX = 'pack:';

/** `pack:<packId>:<recipeId>` — the id a collection drink has everywhere in the app. */
export const packRecipeId = (packId: string, recipeId: string) => `${PREFIX}${packId}:${recipeId}`;

export const isPackRecipeId = (id: string) => id.startsWith(PREFIX);

/** The pack and source entry behind a collection drink id. */
export function findPackRecipe(id: string): { pack: Pack; recipe: PackRecipe } | undefined {
  if (!isPackRecipeId(id)) return undefined;
  const [packId, recipeId] = id.slice(PREFIX.length).split(':');
  const pack = PACKS.find(p => p.id === packId);
  const recipe = pack?.recipes.find(r => r.id === recipeId);
  return pack && recipe ? { pack, recipe } : undefined;
}

/** A collection drink in the shape every screen already uses (English; see i18n/localizeRecipe). */
export function packToRecipe(pack: Pack, r: PackRecipe): Recipe {
  const tags = r.tags as DrinkTag[];
  return {
    id: packRecipeId(pack.id, r.id),
    title: r.name,
    subtitle: tagsToSubtitle(tags),
    // The photo is bundled (data/packPhotos); there is no web address to share.
    imageUrl: '',
    isFavorite: false,
    ingredients: r.ingredients.map(i => formatIngredientLine(i.amount, i.name)),
    instructions: r.steps.join(' '),
    steps: r.steps,
    tags,
    packId: pack.id,
    description: r.description,
  };
}

/** Every collection drink, 60 in all, in pack order. */
export const ALL_PACK_RECIPES: Recipe[] = PACKS.flatMap(p => p.recipes.map(r => packToRecipe(p, r)));
