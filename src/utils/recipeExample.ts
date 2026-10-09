import type { Translate } from '../i18n';

export interface ExampleRecipe {
  title: string;
  subtitle: string;
  ingredients: Array<{ amount: string; name: string }>;
  steps: string[];
}

const ING_KEYS = ['exIng1', 'exIng2', 'exIng3', 'exIng4'] as const;
const STEP_KEYS = ['exStep1', 'exStep2'] as const;

/** "2 tsp · sugar" → amount and name; a line without " · " is all name. */
export function splitExampleLine(line: string): { amount: string; name: string } {
  const at = line.indexOf(' · ');
  return at < 0 ? { amount: '', name: line.trim() } : { amount: line.slice(0, at).trim(), name: line.slice(at + 3).trim() };
}

/** Add Recipe → "Show an example": the mint lemonade in the language on screen. */
export function exampleRecipe(t: Translate): ExampleRecipe {
  return {
    title: t('exName'),
    subtitle: t('exDesc'),
    ingredients: ING_KEYS.map(k => splitExampleLine(t(k))),
    steps: STEP_KEYS.map(k => t(k)),
  };
}
