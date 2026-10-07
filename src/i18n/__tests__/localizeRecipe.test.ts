import { translate, Language, Translate } from '..';
import { localizeRecipe, matchesSearch } from '../localizeRecipe';
import { Recipe } from '../../data/mockData';

const tFor = (lang: Language): Translate => (key, params) => translate(lang, key, params);

// Afterglow, id 12560, as the API + details cache give it.
const afterglow: Recipe = {
  id: '12560',
  title: 'Afterglow',
  subtitle: 'Iced · Citrus · Tropical',
  imageUrl: 'https://example.com/afterglow.jpg',
  isFavorite: false,
  ingredients: ['1 part Grenadine', '4 parts Orange juice', '4 parts Pineapple juice'],
  instructions: 'Mix. Serve over ice.',
  tags: ['Iced', 'Citrus', 'Tropical'],
};

const own: Recipe = {
  id: '1728300000000',
  title: 'Garden Fizz',
  subtitle: 'My summer drink',
  imageUrl: 'recipe-photo:1728300000000.jpg',
  isFavorite: false,
  ingredients: ['50 ml lime juice'],
  instructions: 'Shake.',
  tags: ['Citrus'],
};

describe('localizeRecipe', () => {
  it('English leaves a catalogue drink as it is', () => {
    expect(localizeRecipe(afterglow, 'en', tFor('en'))).toEqual(afterglow);
  });

  it('Ukrainian replaces name, ingredient lines, instructions and the tag subtitle', () => {
    const r = localizeRecipe(afterglow, 'uk', tFor('uk'));
    expect(r.title).toBe('Афтерглоу');
    expect(r.ingredients).toEqual(['1 частина Гренадин', '4 частини Апельсиновий сік', '4 частини Ананасовий сік']);
    expect(r.instructions).toBe('Змішайте. Подавайте з льодом.');
    expect(r.subtitle).toBe('З льодом · Цитрусовий · Тропічний');
    // Everything else stays: id, photo, English tags for the filters.
    expect(r.id).toBe(afterglow.id);
    expect(r.imageUrl).toBe(afterglow.imageUrl);
    expect(r.tags).toEqual(afterglow.tags);
  });

  it('does not touch the stored recipe', () => {
    const copy = JSON.parse(JSON.stringify(afterglow));
    localizeRecipe(afterglow, 'uk', tFor('uk'));
    expect(afterglow).toEqual(copy);
  });

  it('an ingredient line Ukrainian lacks stays English', () => {
    const longer = { ...afterglow, ingredients: [...afterglow.ingredients!, 'Ice'] };
    expect(localizeRecipe(longer, 'uk', tFor('uk')).ingredients![3]).toBe('Ice');
  });

  it('an unknown id keeps its English text but gets Ukrainian tags', () => {
    const r = localizeRecipe({ ...afterglow, id: '99999' }, 'uk', tFor('uk'));
    expect(r.title).toBe('Afterglow');
    expect(r.ingredients).toEqual(afterglow.ingredients);
    expect(r.subtitle).toBe('З льодом · Цитрусовий · Тропічний');
  });

  it('a user recipe keeps its own words', () => {
    expect(localizeRecipe(own, 'uk', tFor('uk'))).toEqual(own);
  });

  it('a drink whose details are not loaded yet is left alone', () => {
    const bare = { ...afterglow, subtitle: '', ingredients: undefined, tags: undefined, instructions: undefined };
    expect(localizeRecipe(bare, 'uk', tFor('uk')).title).toBe('Афтерглоу');
    expect(localizeRecipe(bare, 'en', tFor('en'))).toEqual(bare);
  });
});

describe('matchesSearch', () => {
  const shown = localizeRecipe(afterglow, 'uk', tFor('uk'));

  it('finds by the shown name, the English name and ingredients in either language', () => {
    expect(matchesSearch(afterglow, shown, 'афтер')).toBe(true);
    expect(matchesSearch(afterglow, shown, 'after')).toBe(true);
    expect(matchesSearch(afterglow, shown, 'ананас')).toBe(true);
    expect(matchesSearch(afterglow, shown, 'pineapple')).toBe(true);
    expect(matchesSearch(afterglow, shown, '  ')).toBe(true);
    expect(matchesSearch(afterglow, shown, 'кава')).toBe(false);
  });
});

describe('localizeRecipe, collection drinks', () => {
  const { ALL_PACK_RECIPES } = require('../../data/packs');
  const margarita: Recipe = ALL_PACK_RECIPES.find((r: Recipe) => r.id === 'pack:dry-january:dry-january-virgin-margarita');

  it('is built from the pack in English, ice line in the a + b format', () => {
    expect(margarita.title).toBe('Virgin Margarita');
    expect(margarita.ingredients).toContain('Ice — 100 g for shaking + 80 g for serving');
    expect(margarita.ingredients![0]).toBe('50 ml  Agave tequila substitute 0.0%');
    expect(margarita.steps).toHaveLength(3);
    expect(margarita.packId).toBe('dry-january');
  });

  it('switches to the pack’s own Ukrainian', () => {
    const r = localizeRecipe(margarita, 'uk', tFor('uk'));
    expect(r.title).toBe('Безалкогольна Маргарита');
    expect(r.ingredients).toContain('Лід — 100 г для шейкера + 80 г для подачі');
    expect(r.steps![0]).toMatch(/^Змочіть половину краю/);
    expect(r.description).toMatch(/^Сухувата агавова база/);
    expect(r.subtitle).toBe('З льодом · Цитрусовий');
  });

  it('has 60 drinks, none with a "0 g" ice line', () => {
    expect(ALL_PACK_RECIPES).toHaveLength(60);
    const zero = ALL_PACK_RECIPES.flatMap((r: Recipe) => r.ingredients || []).filter((l: string) => /\b0 g\b/.test(l));
    expect(zero).toEqual([]);
  });
});
