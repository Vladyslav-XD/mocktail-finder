import { Recipe } from '../../data/mockData';
import { ALL_PACK_RECIPES } from '../../data/packs';
import { DRINK_KEYS } from '../../data/ingredients';
import { barResults, groupItems, keyFrequency, keysOf, mostUsed, shownTicks } from '../myBar';

const drink = (id: string): Recipe => ({ id, title: id, subtitle: '', imageUrl: '', isFavorite: false });
const catalogue: Recipe[] = Object.keys(DRINK_KEYS).filter(id => !id.startsWith('pack:')).map(drink);

describe('keysOf', () => {
  it('uses the generated table for catalogue and collection drinks', () => {
    expect(keysOf(drink('12560'))).toEqual(DRINK_KEYS['12560']);
    expect(keysOf(ALL_PACK_RECIPES[0])).toEqual(DRINK_KEYS[ALL_PACK_RECIPES[0].id]);
  });

  it('derives keys for a user recipe from its ingredient names', () => {
    const own: Recipe = { ...drink('1700'), parts: [{ amount: '50 ml', name: 'Lime juice' }, { amount: '', name: 'Ice' }, { amount: '', name: 'Fresh mint' }] };
    expect(keysOf(own)).toEqual(['lime', 'mint']);
  });
});

describe('frequency, Most used, groups', () => {
  const freq = keyFrequency(catalogue);

  it('Most used = ten keys, most drinks first', () => {
    const top = mostUsed(freq);
    expect(top).toHaveLength(10);
    for (let i = 1; i < top.length; i++) expect(freq[top[i - 1]]).toBeGreaterThanOrEqual(freq[top[i]]);
  });

  it('a group shows only keys some visible drink uses, filtered by the search', () => {
    const fruit = groupItems('gFruit', freq);
    expect(fruit.every(k => freq[k] > 0)).toBe(true);
    expect(groupItems('gFruit', freq, k => k === 'lime')).toEqual(['lime']);
    // No 0.0% bases in the free catalogue: the group is empty until a collection opens.
    expect(groupItems('gBases', freq)).toEqual([]);
    expect(groupItems('gBases', keyFrequency([...catalogue, ...ALL_PACK_RECIPES])).length).toBeGreaterThan(0);
  });
});

describe('barResults', () => {
  const lemonade: Recipe = { ...drink('own-1'), parts: [{ amount: '', name: 'Lemon juice' }, { amount: '', name: 'Sugar' }, { amount: '', name: 'Water' }] };
  const fizz: Recipe = { ...drink('own-2'), parts: [{ amount: '', name: 'Lime juice' }, { amount: '', name: 'Fresh mint' }, { amount: '', name: 'Soda water' }] };

  it('ice, water, sugar and salt are always in', () => {
    expect(barResults([lemonade], ['lemon']).canMake).toEqual([lemonade]);
  });

  it('can make / missing one, with the missing key named', () => {
    expect(barResults([fizz], ['lime', 'mint', 'soda']).canMake).toEqual([fizz]);
    expect(barResults([fizz], ['lime', 'mint'])).toEqual({ canMake: [], missingOne: [{ recipe: fizz, missing: 'soda' }] });
    expect(barResults([fizz], ['lime'])).toEqual({ canMake: [], missingOne: [] });
  });

  it('lime + mint + soda water finds drinks in the catalogue', () => {
    const { canMake, missingOne } = barResults(catalogue, ['lime', 'mint', 'soda']);
    expect(canMake.length + missingOne.length).toBeGreaterThan(0);
  });
});

describe('shownTicks', () => {
  it('keeps ticks saved but shows only keys of visible drinks, in group order', () => {
    const freq = keyFrequency(catalogue);
    expect(shownTicks(['soda', 'gin0', 'lime'], freq)).toEqual(['lime', 'soda']);
  });
});
