/**
 * Photos attached to the user's own recipes.
 *
 * The picked image is copied into the app's documents folder (the picker's
 * own copy lives in a cache iOS may clear). Only the file NAME is stored in
 * the recipe, as `recipe-photo:<name>` — the absolute documents path contains
 * a container id that changes between app updates, so an absolute file:// URI
 * saved today could be dead after the next App Store update.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';
import type { Translate } from '../i18n';

const SCHEME = 'recipe-photo:';
const DIR_NAME = 'recipe-photos/';

function photoDir(): string {
  return `${FileSystem.documentDirectory ?? ''}${DIR_NAME}`;
}

/** true for a photo stored by the app (as opposed to an https image). */
export function isRecipePhoto(imageUrl?: string | null): boolean {
  return !!imageUrl && imageUrl.startsWith(SCHEME);
}

/** Turns a stored image reference into something <Image source={{ uri }}> can load. */
export function resolveImageUri(imageUrl: string): string {
  return isRecipePhoto(imageUrl) ? `${photoDir()}${imageUrl.slice(SCHEME.length)}` : imageUrl;
}

/**
 * Opens the system photo picker. Resolves with a temporary file URI, or null
 * if the user cancelled. Without `allowsEditing` iOS uses PHPicker, which is
 * privacy-preserving: the app receives only the chosen photo, with no library
 * permission prompt. (The editing variant would force a square crop that does
 * not match the 16:9 card, so cards and previews crop with `cover` instead.)
 */
export async function pickRecipePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    exif: false,
  });
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

/**
 * Opens the camera. Resolves with a temporary file URI, or null if the user
 * cancelled or refused access. Unlike the library picker this does need a
 * permission: iOS asks once, and after a refusal only Settings can undo it,
 * so that is what the alert points at.
 */
export async function takeRecipePhoto(t: Translate): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(t('cameraOffTitle'), t('cameraOffText'), [
      { text: t('obNotNow'), style: 'cancel' },
      { text: t('openSettings'), onPress: () => Linking.openSettings() },
    ]);
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 0.7, exif: false });
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

/** Copies a picked photo into the app's own folder and returns the stored reference. */
export async function persistRecipePhoto(tempUri: string, recipeId: string): Promise<string> {
  const dir = photoDir();
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const name = `${recipeId}.jpg`;
  // Editing a recipe reuses its id, so the destination may already exist — a copy
  // onto an existing file fails on iOS, so clear the way first.
  await FileSystem.deleteAsync(`${dir}${name}`, { idempotent: true });
  await FileSystem.copyAsync({ from: tempUri, to: `${dir}${name}` });
  return `${SCHEME}${name}`;
}

/** Removes a stored photo; silent if it is already gone or the image is remote. */
export async function deleteRecipePhoto(imageUrl?: string | null): Promise<void> {
  if (!imageUrl || !isRecipePhoto(imageUrl)) return;
  try {
    await FileSystem.deleteAsync(resolveImageUri(imageUrl), { idempotent: true });
  } catch (error) {
    if (__DEV__) console.warn('[recipePhotos] failed to delete', error);
  }
}
