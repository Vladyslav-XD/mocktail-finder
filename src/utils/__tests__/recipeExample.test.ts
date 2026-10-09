import { translate } from '../../i18n';
import { exampleRecipe, splitExampleLine } from '../recipeExample';

describe('splitExampleLine', () => {
  it('splits "amount · name"', () => {
    expect(splitExampleLine('2 tsp · sugar')).toEqual({ amount: '2 tsp', name: 'sugar' });
    expect(splitExampleLine('6 листочків · м\'ята')).toEqual({ amount: '6 листочків', name: 'м\'ята' });
  });

  it('a line without the dot is all name', () => {
    expect(splitExampleLine('ice')).toEqual({ amount: '', name: 'ice' });
  });
});

describe('exampleRecipe', () => {
  it('English: mint lemonade with four ingredients and two steps', () => {
    const ex = exampleRecipe((k, p) => translate('en', k, p));
    expect(ex.title).toBe('Mint lemonade');
    expect(ex.subtitle).toBe('Sharp, sweet and very cold.');
    expect(ex.ingredients).toEqual([
      { amount: '1', name: 'lemon' },
      { amount: '2 tsp', name: 'sugar' },
      { amount: '6 leaves', name: 'mint' },
      { amount: '200 ml', name: 'soda water' },
    ]);
    expect(ex.steps).toHaveLength(2);
  });

  it('Ukrainian: the same shape, Ukrainian text', () => {
    const ex = exampleRecipe((k, p) => translate('uk', k, p));
    expect(ex.title).toBe("Лимонад з м'ятою");
    expect(ex.ingredients[3]).toEqual({ amount: '200 мл', name: 'содова' });
    expect(ex.steps[1]).toBe('Додайте лід, долийте содову, перемішайте.');
  });
});
