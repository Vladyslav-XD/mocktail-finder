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
