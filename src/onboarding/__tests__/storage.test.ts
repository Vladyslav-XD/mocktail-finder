import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../storage/storage';
import { loadOnboarding } from '../storage';
import { hydrateStore, savedRecipes, store } from '../../store/store';
import { ONBOARDING_FALLBACK, orFallback } from '../../utils/startup';

const afterglow = { id: '12560', title: 'Afterglow', subtitle: 'Citrus · Fruity', imageUrl: 'https://x/a.jpg', isFavorite: true };
const ownRecipe = {
  id: 'user-1',
  title: 'Test Lemonade',
  subtitle: 'My summer drink',
  imageUrl: 'recipe-photo:user-1.jpg',
  isFavorite: false,
  ingredients: ['50 ml lemon juice', '200 ml soda water'],
  instructions: 'Stir. Top up.',
  tags: ['Citrus'],
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('first 1.2 launch', () => {
  it('clean install: new-user tour, not done', async () => {
    const state = await loadOnboarding();
    expect(state).toEqual({ tourDone: false, user: 'new', seen: {}, sessions: 1 });
  });

  it('install over 1.1 with favourites, own recipes and a theme: update tour, not done', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([afterglow]));
    await AsyncStorage.setItem(STORAGE_KEYS.myRecipes, JSON.stringify([ownRecipe]));
    await AsyncStorage.setItem(STORAGE_KEYS.theme, JSON.stringify('dark'));
    const state = await loadOnboarding();
    expect(state).toEqual({ tourDone: false, user: 'upd', seen: {}, sessions: 1 });
  });

  it.each([
    ['favourites only', STORAGE_KEYS.favorites, JSON.stringify([afterglow])],
    ['own recipes only', STORAGE_KEYS.myRecipes, JSON.stringify([ownRecipe])],
    ['saved theme only', STORAGE_KEYS.theme, JSON.stringify('light')],
  ])('install over 1.1 with %s counts as an update', async (_label, key, value) => {
    await AsyncStorage.setItem(key, value);
    expect((await loadOnboarding()).user).toBe('upd');
  });

  it('install over 1.1 with a broken recipe entry still counts as an update', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.myRecipes, JSON.stringify([ownRecipe, null]));
    const state = await loadOnboarding();
    expect(state.tourDone).toBe(false);
    expect(state.user).toBe('upd');
  });

  it('the next launch keeps the tour pending and counts the session', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify([afterglow]));
    await loadOnboarding();
    const second = await loadOnboarding();
    expect(second).toEqual({ tourDone: false, user: 'upd', seen: {}, sessions: 2 });
  });
});

describe('startup with broken 1.1 data (build 6 bug)', () => {
  it('drops entries that are not recipes', () => {
    expect(savedRecipes([ownRecipe, null, 3, 'x', { title: 'no id' }])).toEqual([ownRecipe]);
    expect(savedRecipes(null)).toEqual([]);
    expect(savedRecipes({})).toEqual([]);
  });

  it('hydrateStore resolves and keeps the good recipes when one entry is broken', async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.myRecipes, JSON.stringify([ownRecipe, null]));
    await expect(hydrateStore()).resolves.toBeUndefined();
    expect(store.getState().myRecipes.recipes.map(r => r.id)).toEqual(['user-1']);
  });

  it('one failed read gives its fallback and the others still arrive', async () => {
    const [theme, onboarding] = await Promise.all([
      orFallback(Promise.resolve('dark'), 'system'),
      orFallback(Promise.reject(new Error('broken')), ONBOARDING_FALLBACK),
    ]);
    expect(theme).toBe('dark');
    expect(onboarding.tourDone).toBe(false);
  });
});
