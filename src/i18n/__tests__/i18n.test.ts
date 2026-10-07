import { en } from '../en';
import { uk } from '../uk';
import { pluralCategory, pluralize, resolveLanguage, translate } from '..';

describe('resolveLanguage', () => {
  it('follows the iPhone only for Ukrainian', () => {
    expect(resolveLanguage('system', 'uk')).toBe('uk');
    expect(resolveLanguage('system', 'UK')).toBe('uk');
    expect(resolveLanguage('system', 'en')).toBe('en');
    expect(resolveLanguage('system', 'de')).toBe('en');
    expect(resolveLanguage('system', 'ru')).toBe('en');
    expect(resolveLanguage('system', undefined)).toBe('en');
  });

  it('an explicit choice wins over the iPhone', () => {
    expect(resolveLanguage('en', 'uk')).toBe('en');
    expect(resolveLanguage('uk', 'en')).toBe('uk');
  });
});

describe('pluralCategory', () => {
  it('English: one / other', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect([0, 2, 5, 21].map(n => pluralCategory('en', n))).toEqual(['other', 'other', 'other', 'other']);
  });

  it('Ukrainian: 1 / 2–4 / 5+, with 11–14 in the last form', () => {
    expect([1, 21, 31, 101].map(n => pluralCategory('uk', n))).toEqual(['one', 'one', 'one', 'one']);
    expect([2, 3, 4, 22, 24, 102].map(n => pluralCategory('uk', n))).toEqual(['few', 'few', 'few', 'few', 'few', 'few']);
    expect([0, 5, 9, 11, 12, 13, 14, 20, 25, 111, 112].map(n => pluralCategory('uk', n))).toEqual(
      Array(11).fill('many')
    );
    expect(pluralCategory('uk', 1.5)).toBe('few');
  });
});

describe('pluralize', () => {
  it('fills {n} and picks the form', () => {
    expect(pluralize('en', 'added', 1)).toBe('Added 1 ingredient');
    expect(pluralize('en', 'added', 3)).toBe('Added 3 ingredients');
    expect(pluralize('uk', 'added', 1)).toBe('Додано 1 інгредієнт');
    expect(pluralize('uk', 'added', 2)).toBe('Додано 2 інгредієнти');
    expect(pluralize('uk', 'added', 5)).toBe('Додано 5 інгредієнтів');
    expect(pluralize('uk', 'added', 12)).toBe('Додано 12 інгредієнтів');
    expect(pluralize('uk', 'added', 22)).toBe('Додано 22 інгредієнти');
  });

  it('works for forms without a number in them', () => {
    expect(pluralize('en', 'saved', 2)).toBe('recipes saved');
    expect(pluralize('uk', 'saved', 1)).toBe('рецепт збережено');
    expect(pluralize('uk', 'drinks', 10)).toBe('напоїв');
  });
});

describe('translate', () => {
  it('fills placeholders', () => {
    expect(translate('en', 'unlockedToast', { x: 'Dry January' })).toBe('Dry January unlocked');
    expect(translate('uk', 'nOfM', { a: 2, b: 9 })).toBe('2 з 9 відмічено');
  });

  it('reads nested tag and ingredient names', () => {
    expect(translate('en', 'tag.Citrus')).toBe('Citrus');
    expect(translate('uk', 'tag.Citrus')).toBe('Цитрусовий');
    expect(translate('uk', 'tagChip.Citrus')).toBe('Цитрусові');
    expect(translate('uk', 'tagChip.Fruity')).toBe('Фруктові');
    expect(translate('uk', 'tagChip.Savoury')).toBe('Солоні');
    expect(translate('uk', 'ing.lime')).toBe('Лайм');
  });

  it('falls back to English for a key Ukrainian lacks', () => {
    // The Category chip form exists only for the 15 chips; Sweet falls back to its card form.
    expect(translate('uk', 'tagChip.Sweet')).toBe('Солодкий');
  });

  it('has the 1.1 strings Cowork added', () => {
    expect(translate('uk', 'tryAgain')).toBe('Спробувати ще раз');
    expect(translate('uk', 'shareIntro', { name: 'Фрапе' })).toBe('Фрапе — безалкогольний рецепт із Mocktail Finder');
  });
});

describe('dictionaries', () => {
  // Every copy key must exist in Ukrainian too.

  it('Ukrainian has every key', () => {
    expect(Object.keys(en).filter(k => !(k in uk))).toEqual([]);
  });

  it('Ukrainian plurals have all three forms', () => {
    for (const [key, value] of Object.entries(uk)) {
      if (value && typeof value === 'object' && 'one' in value) {
        expect([key, Object.keys(value).sort()]).toEqual([key, ['few', 'many', 'one']]);
      }
    }
  });
});
