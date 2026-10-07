/**
 * Derives short "character" tags for a drink from its ingredients, measures,
 * instructions and category. TheCocktailDB has no taste metadata, so this is
 * the app's own vocabulary — the same words drive the card subtitles and the
 * Category filter on the home screen.
 *
 * Temperature (at most one): Hot · Iced · Frozen
 * Character: Chocolate · Coffee · Tea · Citrus · Tropical · Berry · Minty · Spiced ·
 *            Savoury · Creamy · Sparkling · Fruity · Sweet
 */

export const TEMPERATURE_TAGS = ['Hot', 'Iced', 'Frozen'] as const;
export const STRONG_TAGS = ['Chocolate', 'Coffee', 'Tea', 'Citrus', 'Tropical', 'Berry', 'Minty', 'Spiced', 'Savoury'] as const;
export const SOFT_TAGS = ['Creamy', 'Sparkling', 'Fruity', 'Sweet'] as const;

/**
 * Only collection drinks carry these (their tags are hand-written in recipes.json);
 * deriveTags never produces them and they are not Category filters.
 */
export const COLLECTION_ONLY_TAGS = ['Bitter', 'Herbal'] as const;

export type DrinkTag =
  | (typeof TEMPERATURE_TAGS)[number]
  | (typeof STRONG_TAGS)[number]
  | (typeof SOFT_TAGS)[number]
  | (typeof COLLECTION_ONLY_TAGS)[number];

/** Order used for filter chips on the home screen. */
export const ALL_TAGS: DrinkTag[] = [
  'Iced', 'Frozen', 'Hot',
  'Citrus', 'Tropical', 'Berry', 'Fruity',
  'Creamy', 'Sparkling', 'Chocolate', 'Coffee', 'Tea',
  'Minty', 'Spiced', 'Sweet', 'Savoury',
];

export interface DrinkFacts {
  /** Ingredient names in recipe order (measures optional). */
  ingredients: Array<{ name: string; measure?: string | null }>;
  instructions?: string | null;
  category?: string | null;
  /** Drink name; a tag whose keyword appears in the name is shown first ("Drinking Chocolate"). */
  name?: string | null;
}

/** Ingredient-name patterns per character tag. Order inside a tag does not matter. */
const INGREDIENT_RULES: Array<[DrinkTag, RegExp]> = [
  ['Chocolate', /chocolate|cocoa/],
  ['Coffee', /coffee|espresso/],
  ['Tea', /\btea\b|\bchai\b/],
  ['Citrus', /lemon|lime|orange|grapefruit|citrus|tangerine|mandarin/],
  ['Tropical', /pineapple|mango|papaya|passion|guava|coconut/],
  ['Berry', /berr|cranberr|raspberr|blueberr/],
  ['Minty', /\bmint|peppermint|spearmint/],
  ['Spiced', /^ginger(?! ale| beer|ale)|cinnamon|cardamom|cardamon|clove|nutmeg|cayenne|pepper|cumin|coriander|spice|anise|chili/],
  ['Savoury', /tomato|celery|cumin|asafoetida|curry|^salt$/],
  ['Creamy', /\bmilk|cream|yog(h)?urt|half-and-half|sherbet|buttermilk|ice cream|kefir/],
  // \bcola\b: plain /cola/ would match "chocolate".
  ['Sparkling', /soda|seltzer|ginger ale|gingerale|ginger beer|tonic|\bcola\b|\bcoke\b|carbonated|sparkling|7-up|sprite|lemon-lime|fizzy/],
  ['Fruity', /apple|banana|peach|grape|melon|cantaloupe|kiwi|\bfruit|cherry|pear|plum|apricot|watermelon|nectar/],
  ['Sweet', /sugar|syrup|honey|grenadine|sherbet|condensed|marshmallow|nectar|maple|agave/],
];

// "blended" is left out on purpose: "stir until blended" is mixing, not a blender.
const BLEND_RE = /\b(blend|blender|liquify|liquefy|whiz|frappe)\b/;
const ICE_RE = /\b(ice|iced|on the rocks)\b/;
const COLD_RE = /\b(chill|chilled|cold|cool|fridge|refrigerator|seltzer|sherbet|ice cream)\b/;
const HOT_RE = /\b(simmer|boil|boiling|steaming|heat|heated|heating|warm|hot|microwave|nuke|brew|melt|saucepan)\b/;

function temperatureTag(facts: DrinkFacts, character: Set<DrinkTag>): DrinkTag | null {
  const ins = (facts.instructions || '').toLowerCase();
  const measures = facts.ingredients.map(i => (i.measure || '').toLowerCase()).join(' ');
  const text = `${ins} ${measures}`;
  const names = facts.ingredients.map(i => i.name.trim().toLowerCase());

  const hasIceIngredient = names.some(n => n === 'ice' || n.startsWith('ice cube') || n === 'crushed ice');
  const frozenFruit = facts.ingredients.some(i => /frozen/.test((i.measure || '').toLowerCase()));
  const blended = BLEND_RE.test(ins);
  const iceCue = hasIceIngredient || ICE_RE.test(text) || /\bshak(e|er|en)\b/.test(ins);
  const coldCue = iceCue || COLD_RE.test(text);
  const hotCue = HOT_RE.test(text);

  if (blended && (hasIceIngredient || frozenFruit)) return 'Frozen';
  if (coldCue) return 'Iced';
  if (hotCue) return 'Hot';

  const cat = (facts.category || '').toLowerCase();
  if (cat.includes('cocoa') || cat.includes('coffee') || cat.includes('tea')) return 'Hot';
  if (cat.includes('soft drink') || character.has('Sparkling')) return 'Iced';
  return null;
}

/** Every tag that applies, temperature first, character tags in ingredient order. */
export function deriveTags(facts: DrinkFacts): DrinkTag[] {
  const found = new Map<DrinkTag, number>(); // tag → position of first matching ingredient
  facts.ingredients.forEach((ing, index) => {
    const name = ing.name.trim().toLowerCase();
    for (const [tag, re] of INGREDIENT_RULES) {
      if (re.test(name) && !found.has(tag)) found.set(tag, index);
    }
  });

  // Savoury only makes sense without a sweetener; a pinch of salt in a sweet lassi is not "savoury".
  if (found.has('Savoury') && found.has('Sweet')) found.delete('Savoury');
  // Salt alone (no tomato/cumin/curry) is seasoning, not a flavour.
  if (found.has('Savoury') && !facts.ingredients.some(i => /tomato|celery|cumin|asafoetida|curry/.test(i.name.toLowerCase()))) {
    found.delete('Savoury');
  }

  const characterSet = new Set<DrinkTag>(found.keys());
  const temperature = temperatureTag(facts, characterSet);

  // Tags whose keyword is in the drink's own name come first: the name says what matters.
  const title = (facts.name || '').toLowerCase();
  const boosted = new Set<DrinkTag>();
  for (const [tag, re] of INGREDIENT_RULES) {
    if (found.has(tag) && re.test(title)) boosted.add(tag);
  }

  const byPosition = (group: readonly DrinkTag[], onlyBoosted: boolean) =>
    group
      .filter(t => found.has(t) && boosted.has(t) === onlyBoosted)
      .sort((a, b) => (found.get(a) as number) - (found.get(b) as number));

  const ordered: DrinkTag[] = [];
  if (temperature) ordered.push(temperature);
  ordered.push(
    ...byPosition([...STRONG_TAGS, ...SOFT_TAGS], true),
    ...byPosition(STRONG_TAGS, false),
    ...byPosition(SOFT_TAGS, false),
  );
  return ordered;
}

/** Up to three tags for a card subtitle, joined with a middle dot. */
export function tagsToSubtitle(tags: DrinkTag[], max = 3): string {
  return tags.slice(0, max).join(' · ');
}
