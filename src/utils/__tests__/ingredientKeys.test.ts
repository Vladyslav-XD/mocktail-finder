import { drinkKeys, keyOf } from '../ingredientKeys';
import { DRINK_KEYS, INGREDIENT_GROUPS } from '../../data/ingredients';
import { en } from '../../i18n/en';
import recipes from '../../../design_handoff_mocktail_1.2/data/recipes.json';

const R = recipes as any;

describe('keyOf', () => {
  it('maps common names to one key', () => {
    expect(keyOf('Lime juice')).toBe('lime');
    expect(keyOf('Fresh lime')).toBe('lime');
    expect(keyOf('Grapefruit juice')).toBe('grapefruit');
    expect(keyOf('Pineapple juice')).toBe('pineapple');
    expect(keyOf('Apple juice')).toBe('apple');
    expect(keyOf('Soda water')).toBe('soda');
    expect(keyOf('Ginger ale')).toBe('gingerale');
    expect(keyOf('Fresh ginger')).toBe('ginger');
    expect(keyOf('Agave tequila substitute 0.0%')).toBe('tequila0');
    expect(keyOf('Coconut syrup')).toBe('coconutsyrup');
    expect(keyOf('Coconut cream')).toBe('coconut');
    expect(keyOf('Half-and-half')).toBe('milk');
    expect(keyOf('Ice cream')).toBe('icecream');
  });

  it('knows the always-available ones and what is not an ingredient', () => {
    expect(keyOf('Ice')).toBe('ice');
    expect(keyOf('Water')).toBe('water');
    expect(keyOf('Salt for rim')).toBe('salt');
    expect(keyOf('Sugar')).toBe('sugar');
    expect(keyOf('Fruit')).toBeNull();
    expect(keyOf('Garnish')).toBeNull();
    expect(keyOf('Syrup')).toBeNull();
    expect(keyOf('')).toBeNull();
  });

  it('matches the prototype on every ingredient name in recipes.json', () => {
    (global as any).window = {};
    require('../../../design_handoff_mocktail_1.2/reference/mf-data.js');
    const MF = (global as any).window.MF;
    const names: string[] = [
      ...R.catalogue.flatMap((d: any) => d.ingredients.map((i: any) => i.name)),
      ...R.packs.flatMap((p: any) => p.recipes.flatMap((r: any) => r.ingredients.map((i: any) => i.name))),
    ];
    const diffs = names.map(n => [n, keyOf(n), MF.keyOf(n)]).filter(([, a, b]) => a !== b);
    expect(diffs).toEqual([]);
  });
});

describe('drinkKeys', () => {
  it('is unique, in order, without ice, water, sugar and salt', () => {
    expect(drinkKeys(['Lime juice', 'Ice', 'Fresh lime', 'Sugar', 'Mint', 'Soda water', 'Water'])).toEqual([
      'lime',
      'mint',
      'soda',
    ]);
  });
});

describe('DRINK_KEYS (generated)', () => {
  it('covers the 58 catalogue drinks and 60 collection drinks', () => {
    expect(Object.keys(DRINK_KEYS)).toHaveLength(118);
    expect(Object.keys(DRINK_KEYS).filter(id => id.startsWith('pack:'))).toHaveLength(60);
  });

  it('still matches keyOf', () => {
    for (const d of R.catalogue) {
      expect([d.id, DRINK_KEYS[d.id.replace(/^db-/, '')]]).toEqual([d.id, drinkKeys(d.ingredients.map((i: any) => i.name))]);
    }
    for (const p of R.packs) {
      for (const r of p.recipes) {
        const id = `pack:${p.id}:${r.id}`;
        expect([id, DRINK_KEYS[id]]).toEqual([id, drinkKeys(r.ingredients.map((i: any) => i.name))]);
      }
    }
  });

  it('every key used sits in a group and has a name in both languages', () => {
    const grouped = new Set<string>(INGREDIENT_GROUPS.flatMap(g => [...g.items]));
    const used = new Set(Object.values(DRINK_KEYS).flat());
    expect([...used].filter(k => !grouped.has(k))).toEqual([]);
    expect([...grouped].filter(k => !(k in en.ing))).toEqual([]);
  });

  it('every group has a title in the dictionary', () => {
    expect(INGREDIENT_GROUPS.map(g => g.key).filter(k => !(k in en))).toEqual([]);
  });
});
