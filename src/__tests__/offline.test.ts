import fs from 'fs';
import path from 'path';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import catalogue from '../store/catalogueSlice';
import myRecipes from '../store/myRecipesSlice';
import packs from '../store/packsSlice';
import entitlements from '../store/entitlementsSlice';
import { selectVisibleDrinks } from '../store/selectors';
import { CATALOGUE, catalogueRecipe } from '../data/catalogue';
import { drinkPhoto } from '../data/drinkPhotos';
import { localizeRecipe, matchesSearch } from '../i18n/localizeRecipe';
import { translate, Language, Translate } from '../i18n';
import { recipeHasIngredient } from '../constants/filters';
import { barResults } from '../utils/myBar';
import { bilingualParts, ingredientLines } from '../utils/recipeParts';
import { OLD_DETAILS_CACHES, removeOldCaches } from '../storage/storage';

/**
 * 1.2 task 12: the 58 free drinks are bundled. Everything here runs with the network
 * switched off: any fetch fails the test.
 */
const tFor = (lang: Language): Translate => (key, params) => translate(lang, key, params);
const realFetch = global.fetch;

beforeAll(() => {
  global.fetch = jest.fn(() => {
    throw new Error('network used');
  }) as unknown as typeof fetch;
});
afterAll(() => {
  global.fetch = realFetch;
});

function freshStore() {
  return configureStore({ reducer: { catalogue, myRecipes, packs, entitlements } });
}

describe('offline catalogue', () => {
  it('a new store holds the 58 drinks, each with ingredients, steps, tags and a bundled photo', () => {
    const drinks = selectVisibleDrinks(freshStore().getState() as any);
    expect(drinks).toHaveLength(58);
    for (const d of drinks) {
      expect([d.id, d.ingredients!.length > 0, !!d.instructions, d.tags!.length > 0, !!drinkPhoto(d.id)]).toEqual([
        d.id,
        true,
        true,
        true,
        true,
      ]);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('search finds a drink by its English and Ukrainian name and by an ingredient', () => {
    const find = (q: string, lang: Language) =>
      CATALOGUE.filter(r => matchesSearch(r, localizeRecipe(r, lang, tFor(lang)), q)).map(r => r.title);
    expect(find('after', 'en')).toContain('Afterglow');
    expect(find('афтер', 'uk')).toContain('Afterglow');
    expect(find('guava', 'en').length).toBeGreaterThan(0);
  });

  it('category chips and ingredient chips find drinks', () => {
    const tagged = (tag: string) => CATALOGUE.filter(r => r.tags!.includes(tag as any)).length;
    ['Iced', 'Hot', 'Citrus', 'Creamy', 'Coffee'].forEach(tag => expect([tag, tagged(tag) > 0]).toEqual([tag, true]));
    expect(CATALOGUE.filter(r => recipeHasIngredient(r, 'Lime')).length).toBeGreaterThan(0);
    expect(catalogueRecipe('12780')!.tags).toContain('Hot');
  });

  it('My Bar: lime, mint and soda water make drinks from the bundle', () => {
    const { canMake, missingOne } = barResults(CATALOGUE, ['lime', 'mint', 'soda']);
    expect(canMake.length + missingOne.length).toBeGreaterThan(0);
  });

  it('servings scale the bundled measures, in English and in Ukrainian', () => {
    const afterglow = catalogueRecipe('12560')!;
    const parts = bilingualParts(afterglow);
    expect(ingredientLines(parts, 2, 'en')[0]).toMatch(/^2 parts\s+Grenadine$/);
    expect(ingredientLines(parts, 2, 'uk')[0]).toMatch(/^2 частини\s+Гренадин$/);
  });

  it('removes the old details caches at start', async () => {
    await AsyncStorage.multiSet(OLD_DETAILS_CACHES.map(k => [k, '{}'] as [string, string]));
    await removeOldCaches();
    expect(await AsyncStorage.multiGet(OLD_DETAILS_CACHES)).toEqual(OLD_DETAILS_CACHES.map(k => [k, null]));
  });
});

describe('no network in the app code', () => {
  const ROOT = path.join(__dirname, '..', '..');
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '__tests__') walk(full);
      } else if (/\.(ts|tsx|js|json)$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(path.join(ROOT, 'src'));
  files.push(path.join(ROOT, 'App.tsx'));
  const read = (f: string) => fs.readFileSync(f, 'utf8');
  const rel = (f: string) => path.relative(ROOT, f);

  it('no address of TheCocktailDB or Unsplash', () => {
    const domains = ['thecocktaildb', 'unsplash'].map(d => `${d}.com`);
    const hits = files.filter(f => domains.some(d => read(f).toLowerCase().includes(d))).map(rel);
    expect(hits).toEqual([]);
  });

  it('no fetch, XMLHttpRequest or WebSocket (StoreKit goes through expo-iap)', () => {
    const hits = files.filter(f => /\bfetch\(|XMLHttpRequest|new WebSocket/.test(read(f))).map(rel);
    expect(hits).toEqual([]);
  });

  it('no image loaded from the web', () => {
    const hits = files.filter(f => /uri:\s*['"`]https?:/.test(read(f))).map(rel);
    expect(hits).toEqual([]);
  });
});
