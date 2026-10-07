import { ALL_PACK_RECIPES } from '../../data/packs';
import { Recipe } from '../../data/mockData';
import { baseServings, bilingualParts, cardIngredientLine, ingredientLines } from '../recipeParts';
import { addToShoppingList, itemAmount, itemName, shoppingListText } from '../shoppingList';

const margarita = ALL_PACK_RECIPES.find(r => r.id === 'pack:dry-january:dry-january-virgin-margarita')!;

// Afterglow as the API gives it (details cache v2).
const afterglow: Recipe = {
  id: '12560',
  title: 'Afterglow',
  subtitle: '',
  imageUrl: '',
  isFavorite: false,
  ingredients: ['1 part Grenadine', '4 parts Orange juice', '4 parts Pineapple juice'],
  parts: [
    { amount: '1 part', name: 'Grenadine' },
    { amount: '4 parts', name: 'Orange juice' },
    { amount: '4 parts', name: 'Pineapple juice' },
  ],
};

const nb = '  ';

describe('bilingualParts', () => {
  it('collection drinks: both languages from the pack', () => {
    const parts = bilingualParts(margarita);
    expect(parts[0]).toEqual({
      name: ['Agave tequila substitute 0.0%', 'Агавовий замінник текіли 0.0%'],
      amount: ['50 ml', '50 мл'],
      key: 'tequila0',
      split: true,
    });
    expect(baseServings(margarita)).toBe(1);
  });

  it('catalogue drinks: English from the API, Ukrainian from Cowork', () => {
    expect(bilingualParts(afterglow)[1]).toEqual({
      name: ['Orange juice', 'Апельсиновий сік'],
      amount: ['4 parts', '4 частини'],
      key: 'orange',
      split: true,
    });
  });

  it('a 1.1 recipe without a split keeps its lines', () => {
    const old: Recipe = { ...afterglow, id: '1700000000000', parts: undefined, ingredients: ['50 ml lime juice'] };
    expect(bilingualParts(old)).toEqual([{ name: ['50 ml lime juice', null], amount: ['', null], key: 'lime', split: false }]);
  });
});

describe('ingredientLines', () => {
  it('English, 1 serving: handoff formats, ice as "a + b"', () => {
    const lines = ingredientLines(bilingualParts(margarita), 1, 'en');
    expect(lines[0]).toBe(`50 ml${nb}Agave tequila substitute 0.0%`);
    expect(lines).toContain('Ice — 100 g for shaking + 80 g for serving');
  });

  it('Ukrainian × 3, both ice amounts scaled', () => {
    const lines = ingredientLines(bilingualParts(margarita), 3, 'uk');
    expect(lines[0]).toBe(`150 мл${nb}Агавовий замінник текіли 0.0%`);
    expect(lines).toContain('Лід — 300 г для шейкера + 240 г для подачі');
    expect(lines).toContain(`3 часточки${nb}Лайм`);
  });

  it('catalogue × 2 with plural units', () => {
    expect(ingredientLines(bilingualParts(afterglow), 2, 'en')[0]).toBe(`2 parts${nb}Grenadine`);
    expect(ingredientLines(bilingualParts(afterglow), 2, 'uk')[0]).toBe(`2 частини${nb}Гренадин`);
  });

  it('a 1.1 line scales only its leading measure', () => {
    const old: Recipe = { ...afterglow, id: '1', parts: undefined, ingredients: ['1 can 7-Up', 'Mint'] };
    expect(ingredientLines(bilingualParts(old), 2, 'en')).toEqual(['2 cans 7-Up', 'Mint']);
    expect(ingredientLines(bilingualParts(old), 1, 'en')).toEqual(['1 can 7-Up', 'Mint']);
  });
});

describe('cardIngredientLine', () => {
  it('lower-case names, amounts first, ice as name — amount', () => {
    expect(cardIngredientLine(bilingualParts(afterglow), 1, 'en')).toBe(
      '1 part grenadine  ·  4 parts orange juice  ·  4 parts pineapple juice'
    );
    expect(cardIngredientLine(bilingualParts(margarita), 1, 'en')).toContain('ice — 100 g for shaking + 80 g for serving');
  });
});

describe('shopping list', () => {
  it('adds at the current servings, skips ice and water, counts what it added', () => {
    const { items, added } = addToShoppingList([], bilingualParts(margarita), 2);
    expect(added).toBe(6); // seven lines, ice skipped
    expect(items.map(i => i.key)).not.toContain('ice');
    expect(itemAmount(items[0], 'en')).toBe('100 ml');
    expect(itemName(items[0], 'uk')).toBe('Агавовий замінник текіли 0.0%');
  });

  it('the same ingredient twice reads "a + b" and is un-ticked', () => {
    const lime = bilingualParts(margarita).filter(p => p.key === 'lime');
    let { items } = addToShoppingList([], lime, 1);
    items = items.map(i => ({ ...i, ticked: true }));
    items = addToShoppingList(items, lime.slice(0, 1), 2).items;
    const juice = items.find(i => i.key === 'lime juice')!;
    expect(itemAmount(juice, 'en')).toBe('25 ml + 50 ml');
    expect(juice.ticked).toBe(false);
  });

  it('shares as text in the current language', () => {
    const { items } = addToShoppingList([], bilingualParts(afterglow), 1);
    expect(shoppingListText(items, 'uk')).toBe(
      '• Гренадин — 1 частина\n• Апельсиновий сік — 4 частини\n• Ананасовий сік — 4 частини'
    );
  });
});
