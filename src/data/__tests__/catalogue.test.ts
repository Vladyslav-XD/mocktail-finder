import { CATALOGUE, CATALOGUE_DRINKS, catalogueRecipe, withDetails } from '../catalogue';
import { DRINK_KEYS } from '../ingredients';
import { drinkPhoto } from '../drinkPhotos';
import ukDrinks from '../uk/drinks.json';
import { deriveTags } from '../../utils/drinkTags';
import { drinkKeys } from '../../utils/ingredientKeys';
import { scaleAmount } from '../../utils/measures';
import { INGREDIENT_FILTERS, recipeHasIngredient } from '../../constants/filters';

type ApiDrink = { name: string; category: string; instructions: string; ingredients: Array<{ measure: string; name: string }> };

// What TheCocktailDB gave the app before 1.2 task 12 (lookup.php, snapshot of 22 Oct 2026).
const API: Record<string, ApiDrink> = require('./fixtures/cocktaildb-api-2026-10-22.json').drinks;
const UK = ukDrinks as Record<string, { ingredients: unknown[] }>;

/** A drink as the old API path built it (src/api/api.ts). */
function fromApi(id: string) {
  const a = API[id];
  return {
    title: a.name,
    ingredients: a.ingredients.map(i => (i.measure ? `${i.measure} ${i.name}` : i.name)),
    tags: deriveTags({ name: a.name, ingredients: a.ingredients, instructions: a.instructions, category: a.category }),
  };
}

describe('bundled catalogue', () => {
  it('has the 58 drinks the API listed, with the same ids', () => {
    expect(CATALOGUE).toHaveLength(58);
    expect(CATALOGUE.map(r => r.id).sort()).toEqual(Object.keys(API).sort());
  });

  it('names, ingredients, measures and instructions are what the API gave', () => {
    for (const d of CATALOGUE_DRINKS) {
      const a = API[d.id];
      expect([d.id, d.name, d.instructions, d.ingredients]).toEqual([d.id, a.name, a.instructions, a.ingredients]);
    }
  });

  it('cards and recipes get the same lines and tags as from the API (drinkTags)', () => {
    for (const r of CATALOGUE) {
      const api = fromApi(r.id);
      expect([r.id, r.title, r.ingredients, r.tags]).toEqual([r.id, api.title, api.ingredients, api.tags]);
    }
  });

  it('ingredient chips pick the same drinks', () => {
    for (const f of INGREDIENT_FILTERS) {
      const bundled = CATALOGUE.filter(r => recipeHasIngredient(r, f.label)).map(r => r.id).sort();
      const api = Object.keys(API).filter(id => recipeHasIngredient(fromApi(id), f.label)).sort();
      expect([f.label, bundled]).toEqual([f.label, api]);
    }
  });

  it('My Bar keys match the generated table', () => {
    for (const r of CATALOGUE) {
      expect([r.id, drinkKeys(r.parts!.map(p => p.name))]).toEqual([r.id, DRINK_KEYS[r.id]]);
    }
  });

  it('every measure parses for servings: a number scales, words stay', () => {
    for (const r of CATALOGUE) {
      for (const { amount } of r.parts!) {
        const hasNumber = /[0-9½¼¾⅓⅔⅛]/.test(amount);
        expect([r.id, amount, scaleAmount(amount, 2) !== scaleAmount(amount, 1)]).toEqual([r.id, amount, hasNumber]);
      }
    }
  });

  it('every drink has its Ukrainian text and its bundled photo', () => {
    for (const r of CATALOGUE) {
      expect([r.id, UK[r.id]?.ingredients.length, !!drinkPhoto(r.id)]).toEqual([r.id, r.parts!.length, true]);
    }
  });

  it('fills a favourite saved by an older version and leaves own recipes alone', () => {
    const saved = { id: '12560', title: 'Afterglow', subtitle: '', imageUrl: '', isFavorite: true };
    const filled = withDetails(saved);
    const bundled = catalogueRecipe('12560')!;
    expect([filled.ingredients, filled.parts, filled.subtitle, filled.isFavorite]).toEqual([
      bundled.ingredients,
      bundled.parts,
      bundled.subtitle,
      true,
    ]);
    const own = { id: 'own-1', title: 'Mine', subtitle: 'My drink', imageUrl: '', isFavorite: false };
    expect(withDetails(own)).toBe(own);
  });
});
