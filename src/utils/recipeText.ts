import { Share } from 'react-native';
import type { Translate } from '../i18n';

/** The live App Store listing; appended to every shared recipe. */
export const APP_STORE_URL = 'https://apps.apple.com/app/id6811610325';

/**
 * Split free-form instructions into steps.
 * Splits after sentence punctuation followed by whitespace, so "0.5 oz" or
 * "1.5 cups" stay intact (a plain split on "." would break them).
 */
export function splitInstructions(instructions?: string | null): string[] {
  if (!instructions) return [];
  return instructions
    .replace(/\r\n|\r/g, '\n')
    // Sentence end → line break. Also handles the DB's occasional "ice.Add juice" (no space),
    // while "1.5 oz" survives because a digit follows the dot. No lookbehind: Hermes-safe.
    .replace(/([.!?])(?:\s+|(?=[A-ZА-ЯІЇЄҐ]))/g, '$1\n')
    .split(/\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => (/[.!?]$/.test(s) ? s : `${s}.`));
}

interface ShareableRecipe {
  title: string;
  ingredients?: string[];
  instructions?: string | null;
  imageUrl?: string;
}

/**
 * Plain-text message for the native share sheet (Messages, WhatsApp, Mail, Notes…),
 * in the language on screen. Pass the recipe as shown (already localised).
 */
export function buildShareMessage(recipe: ShareableRecipe, t: Translate): string {
  const lines: string[] = [t('shareIntro', { name: recipe.title })];

  const ingredients = (recipe.ingredients || []).map(i => i.trim()).filter(Boolean);
  if (ingredients.length) {
    lines.push('', `${t('ingredients')}:`, ...ingredients.map(i => `• ${i}`));
  }

  const steps = splitInstructions(recipe.instructions);
  if (steps.length) {
    lines.push('', `${t('steps')}:`, ...steps.map((s, i) => `${i + 1}. ${s}`));
  }

  // Only a web address is useful to the recipient; a photo stored on this phone is not.
  if (recipe.imageUrl && /^https?:\/\//.test(recipe.imageUrl)) lines.push('', recipe.imageUrl);
  if (APP_STORE_URL) lines.push('', t('shareGet', { url: APP_STORE_URL }));

  return lines.join('\n');
}

/** Opens the native share sheet; resolves quietly if the user dismisses it. */
export async function shareRecipe(recipe: ShareableRecipe, t: Translate): Promise<void> {
  try {
    await Share.share({ message: buildShareMessage(recipe, t), title: recipe.title });
  } catch {
    // dismissed or sharing unavailable — nothing to do
  }
}
