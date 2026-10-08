import { afterHint, detectTourUser, HintContext, hintFor, stepCounter, tourSequence } from '../logic';

const base: HintContext = {
  screen: 'recipe',
  overlayOpen: false,
  navCount: 2,
  tourEndNav: 1,
  seen: {},
  isPro: false,
  user: 'new',
  proTipSession: false,
  opened: 1,
  recipeIsFavourite: false,
  homeUnfiltered: true,
  addHasPhoto: false,
  myBarSegment: 'have',
  shopHasItems: false,
};

describe('tour', () => {
  it('new install: welcome + 7 steps, update: what’s new + 6', () => {
    expect(tourSequence('new', false)).toEqual(['welcome', 'coll', 'serv', 'shop', 'card', 'photo', 'bar', 'pro']);
    expect(tourSequence('upd', false)).toEqual(['whatsnew', 'coll', 'serv', 'shop', 'card', 'bar', 'pro']);
  });

  it('Pro users skip the last step', () => {
    expect(tourSequence('new', true)).not.toContain('pro');
    expect(tourSequence('upd', true)).toHaveLength(6);
  });

  it('counter: none on the first card, then "1 of 7"', () => {
    expect(stepCounter(0, 8)).toBeNull();
    expect(stepCounter(1, 8)).toEqual({ a: 1, b: 7 });
    expect(stepCounter(7, 8)).toEqual({ a: 7, b: 7 });
  });

  it('update = any 1.1 data on the first 1.2 launch', () => {
    expect(detectTourUser({ favourites: 0, ownRecipes: 0, themeSaved: false })).toBe('new');
    expect(detectTourUser({ favourites: 2, ownRecipes: 0, themeSaved: false })).toBe('upd');
    expect(detectTourUser({ favourites: 0, ownRecipes: 1, themeSaved: false })).toBe('upd');
    expect(detectTourUser({ favourites: 0, ownRecipes: 0, themeSaved: true })).toBe('upd');
  });
});

describe('hintFor', () => {
  it('waits for a navigation after the tour and never covers a sheet', () => {
    expect(hintFor({ ...base, navCount: 1, tourEndNav: 1 })).toBeNull();
    expect(hintFor({ ...base, overlayOpen: true })).toBeNull();
    expect(hintFor(base)).toBe('serv');
  });

  it('recipe: Servings → Shopping list → Share as a card → Keep the ones you love', () => {
    expect(hintFor({ ...base, seen: { serv: true } })).toBe('shop');
    expect(hintFor({ ...base, seen: { serv: true, shop: true } })).toBe('card');
    expect(hintFor({ ...base, seen: { serv: true, shop: true, card: true } })).toBe('fav');
  });

  it('fav needs an opened recipe that is not saved, and is not for update users', () => {
    const done = { serv: true, shop: true, card: true };
    expect(hintFor({ ...base, seen: done, opened: 0 })).toBeNull();
    expect(hintFor({ ...base, seen: done, recipeIsFavourite: true })).toBeNull();
    expect(hintFor({ ...base, seen: done, user: 'upd' })).toBeNull();
  });

  it('a Free user who dismissed a paid hint gets no more paid hints this session', () => {
    expect(hintFor({ ...base, proTipSession: true })).toBe('fav');
    expect(hintFor({ ...base, proTipSession: true, isPro: true })).toBe('serv');
  });

  it('home: Collections, then Can’t decide? after an opened recipe; not while filtered', () => {
    const home = { ...base, screen: 'home' as const };
    expect(hintFor(home)).toBe('coll');
    expect(hintFor({ ...home, seen: { coll: true } })).toBe('surprise');
    expect(hintFor({ ...home, seen: { coll: true }, opened: 0 })).toBeNull();
    expect(hintFor({ ...home, homeUnfiltered: false })).toBeNull();
  });

  it('add recipe: Your own recipes until a photo is added', () => {
    const add = { ...base, screen: 'add' as const };
    expect(hintFor(add)).toBe('photo');
    expect(hintFor({ ...add, addHasPhoto: true })).toBeNull();
    expect(hintFor({ ...add, user: 'upd' })).toBeNull();
  });

  it('my bar: What’s at home?, then Pro for Free users who saw the four Pro hints', () => {
    const bar = { ...base, screen: 'myBar' as const };
    expect(hintFor(bar)).toBe('bar');
    expect(hintFor({ ...bar, seen: { bar: true } })).toBeNull();
    expect(hintFor({ ...bar, seen: { bar: true, serv: true, shop: true, card: true } })).toBe('pro');
    expect(hintFor({ ...bar, isPro: true, seen: { bar: true, serv: true, shop: true, card: true } })).toBeNull();
  });

  it('shopping list: Tick or remove, Pro with items', () => {
    const shop = { ...base, screen: 'myBar' as const, myBarSegment: 'shop' as const, isPro: true, shopHasItems: true };
    expect(hintFor(shop)).toBe('swipe');
    expect(hintFor({ ...shop, shopHasItems: false })).toBe('bar');
  });
});

describe('afterHint', () => {
  it('marks seen; a Free user’s paid hint pauses the rest of the session', () => {
    expect(afterHint('serv', { seen: {}, proTipSession: false }, false)).toEqual({ seen: { serv: true }, proTipSession: true });
    expect(afterHint('serv', { seen: {}, proTipSession: false }, true)).toEqual({ seen: { serv: true }, proTipSession: false });
    expect(afterHint('coll', { seen: {}, proTipSession: false }, false)).toEqual({ seen: { coll: true }, proTipSession: false });
  });
});
