/**
 * Which picture to show for a recipe.
 *
 * Catalogue drinks ship with our own photo in `assets/drinks/`, collection drinks with
 * theirs in `assets/packs/`, so the app looks the same offline and the styling is
 * consistent. A recipe the user wrote shows the photo they added; without one it gets
 * the bundled placeholder, never an image from the web.
 */
import type { ImageSourcePropType } from 'react-native';
import { drinkPhoto } from '../data/drinkPhotos';
import { packPhoto } from '../data/packPhotos';
import { isRecipePhoto, resolveImageUri } from './recipePhotos';

/** An empty set in the style of our photos (backdrop and table, built from their edges). */
export const RECIPE_PLACEHOLDER: ImageSourcePropType = require('../../assets/recipe-placeholder.jpg');

export function recipeImageSource(
  id: string | number | undefined | null,
  imageUrl: string
): ImageSourcePropType {
  // Only a photo stored on this phone counts. 1.0 and 1.1 saved the Unsplash stock image's
  // address for a recipe without one; that, like any web address, gets the placeholder.
  return drinkPhoto(id) ?? packPhoto(id) ?? (isRecipePhoto(imageUrl) ? { uri: resolveImageUri(imageUrl) } : RECIPE_PLACEHOLDER);
}
