/**
 * Ingredient keys for My Bar: one canonical key per thing you might have at home
 * ("Fresh lime juice", "Lime", "Juice of 1 lime" → `lime`). Rules and order are the
 * prototype's (`keyOf` in design_handoff_mocktail_1.2/reference/mf-data.js); the
 * first rule that matches wins, and `null` means "not something to tick".
 * Keys come from English names only.
 */

/** Always available; never asked for and never "missing". */
export const ALWAYS_AVAILABLE = ['ice', 'water', 'sugar', 'salt'] as const;

const RULES: Array<[RegExp, string | null]> = [
  [/^fruit( juice)?$|^garnish$/, null],
  [/triple sec/, 'triplesec0'], [/vermouth/, 'vermouth0'], [/coffee liqueur/, 'coffeeliq0'], [/amaretto/, 'amaretto0'], [/b[ée]n[ée]dictine/, 'benedictine0'],
  [/gin (substitute|alternative)|substitute gin|juniper/, 'gin0'], [/\brum\b/, 'rum0'], [/vodka/, 'vodka0'], [/tequila/, 'tequila0'], [/whisk/, 'whiskey0'],
  [/aperitif/, 'bitter0'], [/sparkling.*wine|wine.*sparkling/, 'sparkling0'], [/red wine/, 'redwine0'],
  [/tonic/, 'tonic'], [/ginger ale/, 'gingerale'], [/lemon.?(lime )?soda/, 'lemonsoda'], [/soda|seltzer|carbonated/, 'soda'], [/\bcola\b|coke/, 'cola'],
  [/ice cream|sherbet/, 'icecream'], [/\bice\b/, 'ice'], [/aquafaba/, 'aquafaba'], [/water/, 'water'],
  [/grenadine/, 'grenadine'], [/agave/, 'agave'], [/sugar syrup|simple syrup|syrup 1:1|1:1 syrup/, 'sugarsyrup'], [/chocolate|cocoa/, 'chocolate'],
  [/raspberry syrup/, 'raspberrysyrup'], [/blackberry syrup/, 'blackberrysyrup'], [/elderflower/, 'elderflower'], [/coconut syrup/, 'coconutsyrup'], [/cura[cç]ao/, 'curacao'], [/orgeat/, 'orgeat'],
  [/cherry syrup/, 'cherrysyrup'], [/mint syrup/, 'mintsyrup'], [/vanilla syrup/, 'vanillasyrup'], [/lychee/, 'lychee'], [/syrup/, null],
  [/vanilla/, 'vanilla'], [/marshmallow/, 'marshmallows'], [/almond/, 'almond'], [/butter/, 'butter'], [/\begg/, 'eggs'],
  [/condensed/, 'condensed'], [/coconut/, 'coconut'], [/half-and-half/, 'milk'], [/cream/, 'cream'], [/milk/, 'milk'], [/yog/, 'yoghurt'], [/honey/, 'honey'],
  [/grapefruit/, 'grapefruit'], [/lime/, 'lime'], [/lemon/, 'lemon'], [/orange/, 'orange'], [/pineapple/, 'pineapple'], [/apple/, 'apple'], [/banana/, 'banana'],
  [/strawberr/, 'strawberries'], [/cranberr/, 'cranberry'], [/berr/, 'berries'], [/mango/, 'mango'], [/\bgrapes?\b/, 'grapes'], [/passion ?fruit/, 'passionfruit'], [/peach/, 'peach'],
  [/kiwi/, 'kiwi'], [/papaya/, 'papaya'], [/cantaloupe|melon/, 'melon'], [/guava/, 'guava'], [/cherr/, 'cherry'], [/tomato/, 'tomato'], [/carrot/, 'carrot'], [/celery salt/, 'celerysalt'], [/celery/, 'celery'],
  [/espresso|coffee/, 'coffee'], [/green tea/, 'greentea'], [/thai tea/, 'thaitea'], [/\btea\b|earl grey/, 'blacktea'],
  [/mint/, 'mint'], [/basil/, 'basil'], [/cilantro|coriander/, 'coriander'], [/ginger/, 'ginger'], [/cinnamon/, 'cinnamon'], [/cardamom/, 'cardamom'], [/clove/, 'cloves'], [/nutmeg/, 'nutmeg'],
  [/cumin/, 'cumin'], [/black pepper/, 'blackpepper'], [/cayenne/, 'cayenne'], [/asafoetida/, 'asafoetida'], [/black salt|kala namak/, 'blacksalt'], [/tamarind/, 'tamarind'],
  [/corn ?starch|cornflour/, 'cornflour'], [/masa/, 'masa'], [/pistachio/, 'pistachios'], [/worcester/, 'worcestershire'], [/tabasco/, 'tabasco'], [/horseradish/, 'horseradish'],
  [/sugar/, 'sugar'], [/^salt|salt for/, 'salt'],
];

/** The key for one English ingredient name, or null. */
export function keyOf(name: string | null | undefined): string | null {
  const text = String(name || '').toLowerCase();
  for (const [rx, key] of RULES) if (rx.test(text)) return key;
  return null;
}

/** A drink's keys: unique, in recipe order, without the always-available ones. */
export function drinkKeys(ingredientNames: string[]): string[] {
  const out: string[] = [];
  for (const name of ingredientNames) {
    const key = keyOf(name);
    if (key && !(ALWAYS_AVAILABLE as readonly string[]).includes(key) && !out.includes(key)) out.push(key);
  }
  return out;
}
