import { Language, pluralCategory } from '../i18n';

/**
 * Amounts for the Servings stepper (1–12) and the ingredient-line formats.
 * Behaviour follows design_handoff_mocktail_1.2/reference/mf-data.js (`scale`,
 * `fmtQty`, `ingLine`); README → Logic reference → Servings / Ingredient line.
 */

/** Unicode fractions the app writes, nearest first match within 0.02. */
const FRACTIONS: Array<[number, string]> = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];
const FRACTION_VALUE: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 };

/** 1.5 → "1½", 0.25 → "¼", 2 → "2", 1.37 → "1.4" (English) / "1,4" (Ukrainian). */
export function formatQuantity(q: number, lang: Language): string {
  const whole = Math.floor(q + 1e-9);
  const rest = q - whole;
  if (rest < 0.02) return String(whole);
  for (const [value, glyph] of FRACTIONS) {
    if (Math.abs(rest - value) < 0.02) return (whole || '') + glyph;
  }
  const text = String(Math.round(q * 10) / 10);
  return lang === 'uk' ? text.replace('.', ',') : text;
}

/**
 * Unit words that follow the number: English [one, many]; Ukrainian [1, 2–4, 5+]
 * plus an optional fourth form after a fraction ("1½ листка").
 */
const UNIT_FORMS: Record<Language, string[][]> = {
  en: [
    ['part', 'parts'], ['cup', 'cups'], ['wedge', 'wedges'], ['wheel', 'wheels'], ['strip', 'strips'],
    ['half-wedge', 'half-wedges'], ['half-wheel', 'half-wheels'], ['berry', 'berries'], ['piece', 'pieces'],
    ['bean', 'beans'], ['leaf', 'leaves'], ['fruit', 'fruits'], ['half', 'halves'], ['stick', 'sticks'],
    ['sprig', 'sprigs'], ['pod', 'pods'], ['stalk', 'stalks'], ['slice', 'slices'], ['pinch', 'pinches'],
    ['dash', 'dashes'], ['drop', 'drops'], ['scoop', 'scoops'], ['can', 'cans'], ['chunk', 'chunks'],
    ['cube', 'cubes'], ['inch', 'inches'],
  ],
  uk: [
    ['частина', 'частини', 'частин'], ['чашка', 'чашки', 'чашок'], ['часточка', 'часточки', 'часточок'],
    ['кружальце', 'кружальця', 'кружалець'], ['смужка', 'смужки', 'смужок'],
    ['півкружальце', 'півкружальця', 'півкружалець'], ['ягода', 'ягоди', 'ягід'],
    ['листок', 'листки', 'листків', 'листка'], ['плід', 'плоди', 'плодів', 'плода'],
    ['половинка', 'половинки', 'половинок'], ['паличка', 'палички', 'паличок'],
    ['бутон', 'бутони', 'бутонів', 'бутона'], ['коробочка', 'коробочки', 'коробочок'],
    ['гілочка', 'гілочки', 'гілочок'], ['стебло', 'стебла', 'стебел'], ['скибка', 'скибки', 'скибок'],
    ['тонка', 'тонкі', 'тонких'], ['розчавлена', 'розчавлені', 'розчавлених'],
    ['шматок', 'шматки', 'шматків', 'шматка'], ['дрібка', 'дрібки', 'дрібок'],
  ],
};

const UNIT_LOOKUP: Record<Language, Record<string, string[]>> = { en: {}, uk: {} };
(Object.keys(UNIT_FORMS) as Language[]).forEach(lang =>
  UNIT_FORMS[lang].forEach(forms => forms.forEach(word => (UNIT_LOOKUP[lang][word] = forms)))
);

function unitForm(forms: string[], value: number, lang: Language): string {
  if (lang === 'en') return value > 1 ? forms[1] : forms[0];
  const rounded = Math.round(value * 1000) / 1000;
  if (!Number.isInteger(rounded)) return forms[3] || forms[1];
  const cat = pluralCategory('uk', rounded);
  return cat === 'one' ? forms[0] : cat === 'few' ? forms[1] : forms[2];
}

/**
 * One token at a time: "1 1/2", "3/4", "1½" / "½", a plain number, or a word.
 * No lookbehind (Hermes).
 */
const TOKEN =
  /(\d+)\s+(\d+)\/(\d+)|(\d+)\/(\d+)|(\d*)([½¼¾⅓⅔⅛])|(\d+(?:[.,]\d+)?)|([A-Za-zÀ-ÿА-Яа-яІіЇїЄєҐґ][A-Za-zÀ-ÿА-Яа-яІіЇїЄєҐґ'’-]*)/g;

/** After a number, these mean "do not scale": a time, size, temperature, percentage. */
const NOT_SCALED_AFTER = /^(:|-inch|-дюйм|\s?(cm|см)(?![A-Za-zА-Яа-я])|\s?°|\s?%|\s?(s|с|sec|min|хв)(?![A-Za-zА-Яа-я]))/i;

/**
 * Multiplies every number in an amount by `servings` and fixes the unit word that
 * follows it: "1 1/2 oz" × 2 → "3 oz", "1 part" × 3 → "3 parts", "4-6" × 2 → "8-12",
 * "120 g for stirring + 60 g for serving" scales both. Times ("20 s"), temperatures,
 * percentages ("0.0%") and sizes ("2 cm") stay as written. Ukrainian writes a comma.
 */
export function scaleAmount(text: string | null | undefined, servings: number, lang: Language = 'en'): string {
  if (!text) return '';
  let last: number | null = null;
  // Words since the last number; only the first few words after a number are its unit.
  let gap = 9;
  return String(text).replace(TOKEN, (match, a, b, c, d, e, f, g, h, word, offset: number, all: string) => {
    if (word) {
      gap++;
      if (last == null || gap > 3 || all[offset - 1] === '-') return match;
      const forms = UNIT_LOOKUP[lang][word.toLowerCase()];
      return forms ? unitForm(forms, last, lang) : match;
    }
    const after = all.slice(offset + match.length);
    if (all[offset - 1] === ':' || NOT_SCALED_AFTER.test(after)) {
      return match;
    }
    const value = a
      ? +a + +b / +c
      : d
        ? +d / +e
        : g
          ? (f ? +f : 0) + FRACTION_VALUE[g]
          : parseFloat(h.replace(',', '.'));
    last = value * servings;
    gap = 0;
    return formatQuantity(last, lang);
  });
}

/**
 * The three line formats (README → Logic reference → Ingredient line):
 * a number first → "50 ml  Lime juice" (two spaces, non-breaking);
 * " + " inside → "Ice — 120 g for stirring + 60 g for serving";
 * other text → "Mint (a handful)"; no amount → the name alone.
 */
export function formatIngredientLine(amount: string | null | undefined, name: string): string {
  const am = (amount || '').trim();
  if (!am) return name;
  if (/ \+ /.test(am)) return `${name} — ${am}`;
  if (/^[\d½¼¾⅓⅔⅛]/.test(am)) return `${am}  ${name}`;
  return `${name} (${am.charAt(0).toLowerCase()}${am.slice(1)})`;
}
