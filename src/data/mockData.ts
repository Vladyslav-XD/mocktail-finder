import type { DrinkTag } from '../utils/drinkTags';

/** One ingredient with its measure apart from its name: "50 ml" + "Lime juice". */
export interface IngredientPart {
  /** As written; may be empty ("Soda water") or text ("a handful"). */
  amount: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  /** Card subtitle: derived tags for database drinks, the user's short description for their own. */
  subtitle: string;
  /** https URL (database drink) or "recipe-photo:<file>" (photo attached to a user recipe, see utils/recipePhotos). */
  imageUrl: string;
  isFavorite: boolean;
  /** "measure ingredient" lines in recipe order. */
  ingredients?: string[];
  /**
   * The same ingredients, measure and name apart. Catalogue drinks get them from the
   * details cache, user recipes from the form (saved since 1.2). Older recipes have
   * only `ingredients`.
   */
  parts?: IngredientPart[];
  instructions?: string;
  duration?: string;
  /** Legacy single category of user recipes created before tags existed. */
  category?: string;
  /** Character tags (see utils/drinkTags). Derived for database drinks, chosen for user recipes. */
  tags?: DrinkTag[];
  /**
   * Steps as written, one per entry. Collection drinks have them (a step can hold
   * several sentences); everything else splits `instructions` (utils/recipeText).
   */
  steps?: string[];
  /** Collection drinks: the pack they belong to (data/packs). */
  packId?: string;
  /** Collection drinks: one-line description from recipes.json. */
  description?: string;
}
