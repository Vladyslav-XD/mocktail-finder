/**
 * Which picture to show for a recipe.
 *
 * Catalogue drinks ship with our own photo in `assets/drinks/`, collection drinks with
 * theirs in `assets/packs/`, so the app looks the same offline and the styling is
 * consistent. A recipe the user wrote keeps whatever it carries.
 */
import type { ImageSourcePropType } from 'react-native';
import { drinkPhoto } from '../data/drinkPhotos';
import { packPhoto } from '../data/packPhotos';
import { resolveImageUri } from './recipePhotos';

export function recipeImageSource(
  id: string | number | undefined | null,
  imageUrl: string
): ImageSourcePropType {
  return drinkPhoto(id) ?? packPhoto(id) ?? { uri: resolveImageUri(imageUrl) };
}
