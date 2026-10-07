import { Recipe } from '../data/mockData';
import { COCKTAILDB_BASE_URL } from './config';
import { deriveTags, DrinkTag } from '../utils/drinkTags';
import type { IngredientPart } from '../data/mockData';

export const API_URL = `${COCKTAILDB_BASE_URL}/filter.php?a=Non_Alcoholic`;
export const API_DETAILS_URL = `${COCKTAILDB_BASE_URL}/lookup.php?i=`;

const REQUEST_TIMEOUT_MS = 15000;

/** What one lookup.php call gives us, in the shape the screens use. */
export interface RecipeDetails {
  ingredients: string[];
  /** The same ingredients with measure and name apart (servings, shopping list, line formats). */
  parts: IngredientPart[];
  instructions: string;
  tags: DrinkTag[];
  category?: string;
  glass?: string;
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The non-alcoholic list. The endpoint returns only id, name and photo, so the
 * subtitle is empty here and is filled from details — see recipes.ts.
 */
export const fetchMocktailList = async (): Promise<Recipe[]> => {
  const data = await fetchJson(API_URL);
  const drinks: any[] = Array.isArray(data?.drinks) ? data.drinks : [];

  return drinks.map((item: any) => ({
    id: String(item.idDrink),
    title: item.strDrink,
    subtitle: '',
    imageUrl: item.strDrinkThumb,
    isFavorite: false,
  }));
};

export const fetchMocktailDetails = async (id: string): Promise<RecipeDetails> => {
  const data = await fetchJson(`${API_DETAILS_URL}${encodeURIComponent(id)}`);
  if (!Array.isArray(data?.drinks) || data.drinks.length === 0) {
    throw new Error(`Drink ${id} not found`);
  }
  const drink = data.drinks[0];
  const ingredients: string[] = [];
  const facts: Array<{ name: string; measure: string }> = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== '') {
      const name = ingredient.trim();
      const amount = (measure || '').trim();
      ingredients.push(amount ? `${amount} ${name}` : name);
      facts.push({ name, measure: amount });
    }
  }

  return {
    ingredients,
    parts: facts.map(f => ({ amount: f.measure, name: f.name })),
    instructions: drink.strInstructions || '',
    tags: deriveTags({
      name: drink.strDrink,
      ingredients: facts,
      instructions: drink.strInstructions,
      category: drink.strCategory,
    }),
    category: drink.strCategory || undefined,
    glass: drink.strGlass || undefined,
  };
};
