import { I18n } from 'i18n-js';
import { en, PluralForms } from './en';
import { uk } from './uk';

/**
 * Strings for every screen. Dictionaries are generated from
 * design_handoff_mocktail_1.2/COPY_EN_UK.md; UK English is the source language,
 * and any key Ukrainian lacks falls back to English.
 */

export type Language = 'en' | 'uk';
/** What the user picked in About → Language. 'system' follows the iPhone. */
export type LanguageSetting = 'system' | Language;

export const isLanguageSetting = (value: unknown): value is LanguageSetting =>
  value === 'system' || value === 'en' || value === 'uk';

/** System = Ukrainian when the iPhone language is Ukrainian, otherwise English. */
export function resolveLanguage(setting: LanguageSetting, deviceLanguageCode?: string | null): Language {
  if (setting !== 'system') return setting;
  return deviceLanguageCode?.toLowerCase() === 'uk' ? 'uk' : 'en';
}

/**
 * Plural category. English one / other. Ukrainian: 1, 21, 31… → one; 2–4, 22–24…
 * → few; everything else, including 11–14 → many. Fractions take the "few" form
 * ("1,5 частини").
 */
export function pluralCategory(lang: Language, n: number): 'one' | 'other' | 'few' | 'many' {
  if (lang === 'en') return n === 1 ? 'one' : 'other';
  if (!Number.isInteger(n)) return 'few';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
}

const i18n = new I18n({ en, uk });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
// Copy uses {n}, {x}, {a}, {b}, {name}.
i18n.placeholder = /\{(.*?)\}/gm;
i18n.pluralization.register('en', (_i18n, count) => [pluralCategory('en', count)]);
i18n.pluralization.register('uk', (_i18n, count) => [pluralCategory('uk', count), 'other']);

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends PluralForms
      ? never
      : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

type PluralLeaves<T> = { [K in keyof T & string]: T[K] extends PluralForms ? K : never }[keyof T & string];

/** A key whose value is one string, e.g. 'search' or 'tag.Citrus'. */
export type TKey = Leaves<typeof en>;
/** A key with plural forms, e.g. 'drinks' or 'added'. */
export type PluralKey = PluralLeaves<typeof en>;
export type TParams = Record<string, string | number>;

export function translate(lang: Language, key: TKey, params?: TParams): string {
  return i18n.t(key, { locale: lang, ...params });
}

/** The right plural form for `n`; `{n}` in the string is filled with n. */
export function pluralize(lang: Language, key: PluralKey, n: number, params?: TParams): string {
  return i18n.t(key, { locale: lang, count: n, n, ...params });
}

export type Translate = (key: TKey, params?: TParams) => string;
export type Pluralize = (key: PluralKey, n: number, params?: TParams) => string;
