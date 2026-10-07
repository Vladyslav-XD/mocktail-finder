/**
 * Which picture to show for a recipe.
 *
 * Drinks from TheCocktailDB ship with our own photo in `assets/drinks/`, collection
 * drinks with theirs in `assets/packs/`, so the
 * app looks the same offline and the styling is consistent. Anything we have no file
 * for — a recipe the user wrote, or a drink id added to the database later — keeps
 * whatever the recipe carries: the user's own photo, or the TheCocktailDB thumbnail.
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
