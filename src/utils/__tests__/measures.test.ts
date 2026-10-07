import { formatIngredientLine, formatQuantity, scaleAmount } from '../measures';
import recipes from '../../../design_handoff_mocktail_1.2/data/recipes.json';

describe('formatQuantity', () => {
  it('writes halves, quarters, thirds and eighths as glyphs', () => {
    expect(formatQuantity(1.5, 'en')).toBe('1½');
    expect(formatQuantity(0.25, 'en')).toBe('¼');
    expect(formatQuantity(2 / 3, 'en')).toBe('⅔');
    expect(formatQuantity(0.125, 'en')).toBe('⅛');
    expect(formatQuantity(3, 'en')).toBe('3');
  });

  it('rounds the rest to one decimal; Ukrainian uses a comma', () => {
    expect(formatQuantity(1.37, 'en')).toBe('1.4');
    expect(formatQuantity(1.37, 'uk')).toBe('1,4');
  });
});

describe('scaleAmount', () => {
  it('leaves an amount alone at one serving', () => {
    expect(scaleAmount('50 ml', 1)).toBe('50 ml');
    expect(scaleAmount('a handful', 4)).toBe('a handful');
    expect(scaleAmount('', 3)).toBe('');
  });

  it('scales integers, decimals and fractions', () => {
    expect(scaleAmount('50 ml', 3)).toBe('150 ml');
    expect(scaleAmount('0.5 oz', 3)).toBe('1½ oz');
    expect(scaleAmount('1/2 cup', 3)).toBe('1½ cups');
    expect(scaleAmount('½ cup', 2)).toBe('1 cup');
    expect(scaleAmount('¾ cup', 2)).toBe('1½ cups');
    expect(scaleAmount('1/3 cup', 2)).toBe('⅔ cup');
    expect(scaleAmount('1 1/2 oz', 2)).toBe('3 oz');
    expect(scaleAmount('1 1/2 oz', 3)).toBe('4½ oz');
  });

  it('scales both ends of a range and both parts of a + b', () => {
    expect(scaleAmount('4-6 leaves', 2)).toBe('8-12 leaves');
    expect(scaleAmount('120 g for stirring + 60 g for serving', 2)).toBe('240 g for stirring + 120 g for serving');
  });

  it('makes the unit word agree in English', () => {
    expect(scaleAmount('1 part', 3)).toBe('3 parts');
    expect(scaleAmount('1 slice', 2)).toBe('2 slices');
    expect(scaleAmount('1 wedge', 1)).toBe('1 wedge');
  });

  it('makes the unit word agree in Ukrainian: 1 / 2–4 / 5+ / after a fraction', () => {
    expect(scaleAmount('1 частина', 1, 'uk')).toBe('1 частина');
    expect(scaleAmount('1 частина', 3, 'uk')).toBe('3 частини');
    expect(scaleAmount('1 частина', 5, 'uk')).toBe('5 частин');
    expect(scaleAmount('1 частина', 11, 'uk')).toBe('11 частин');
    expect(scaleAmount('1 часточка', 2, 'uk')).toBe('2 часточки');
    expect(scaleAmount('0,5 листка', 3, 'uk')).toBe('1½ листка');
    expect(scaleAmount('0,7 л', 3, 'uk')).toBe('2,1 л');
  });

  it('does not scale times, temperatures, percentages or sizes', () => {
    expect(scaleAmount('0.0%', 4)).toBe('0.0%');
    expect(scaleAmount('brew 20 s', 3)).toBe('brew 20 s');
    expect(scaleAmount('12 с', 3, 'uk')).toBe('12 с');
    expect(scaleAmount('steep 5 min', 2)).toBe('steep 5 min');
    expect(scaleAmount('water at 80°C', 2)).toBe('water at 80°C');
    expect(scaleAmount('2 cm ginger', 3)).toBe('2 cm ginger');
    expect(scaleAmount('1-inch piece', 3)).toBe('1-inch piece');
  });

  it('still scales a word that only starts like a time unit', () => {
    expect(scaleAmount('2 slices', 2)).toBe('4 slices');
    expect(scaleAmount('6 mint leaves', 2)).toBe('12 mint leaves');
  });
});

describe('scaleAmount matches the prototype on every amount in recipes.json', () => {
  // The prototype logic, loaded as the handoff ships it.
  (global as any).window = {};
  require('../../../design_handoff_mocktail_1.2/reference/mf-data.js');
  const MF = (global as any).window.MF;
  // README adds times to the not-scaled list; the prototype's own code skips them.
  const hasTime = (s: string) => /\d\s?(s|с|sec|min|хв)(?![A-Za-zА-Яа-я])/i.test(s);

  const amounts: Array<[string, 'en' | 'uk']> = [];
  for (const d of (recipes as any).catalogue) for (const i of d.ingredients) amounts.push([i.measure, 'en']);
  for (const p of (recipes as any).packs) {
    for (const r of p.recipes) {
      for (const i of r.ingredients) amounts.push([i.amount, 'en']);
      for (const i of r.ingredients_uk || []) amounts.push([i.amount, 'uk']);
    }
  }

  it('has amounts to check', () => expect(amounts.length).toBeGreaterThan(400));

  for (const n of [1, 2, 3, 12]) {
    it(`× ${n}`, () => {
      const diffs = amounts
        .filter(([a]) => a && !hasTime(a))
        .map(([a, lang]) => [a, lang, scaleAmount(a, n, lang), MF.scale(a, n, lang)])
        .filter(([, , ours, theirs]) => ours !== theirs);
      expect(diffs).toEqual([]);
    });
  }
});

describe('formatIngredientLine', () => {
  it('number first → amount, two non-breaking spaces, name', () => {
    expect(formatIngredientLine('50 ml', 'Lime juice')).toBe('50 ml  Lime juice');
    expect(formatIngredientLine('½ cup', 'Milk')).toBe('½ cup  Milk');
  });

  it('a + b → name — amount', () => {
    expect(formatIngredientLine('120 g for stirring + 60 g for serving', 'Ice')).toBe(
      'Ice — 120 g for stirring + 60 g for serving'
    );
  });

  it('other text → name (amount), lower-case first letter', () => {
    expect(formatIngredientLine('A handful', 'Mint')).toBe('Mint (a handful)');
  });

  it('no amount → name only', () => {
    expect(formatIngredientLine('', 'Soda water')).toBe('Soda water');
    expect(formatIngredientLine(null, 'Soda water')).toBe('Soda water');
  });
});
