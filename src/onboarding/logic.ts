/**
 * Tour and hints (README → Tour and hints; prototype `obSeq`, the hint chain in its
 * render). Pure functions, so the rules can be tested without a screen.
 */

/** Who the first 1.2 launch is for. */
export type TourUser = 'new' | 'upd';

/** Everything the tour or a hint can be about. */
export type CoachKey =
  | 'welcome'
  | 'whatsnew'
  | 'coll'
  | 'serv'
  | 'shop'
  | 'card'
  | 'photo'
  | 'bar'
  | 'pro'
  | 'surprise'
  | 'fav'
  | 'swipe';

/** On-screen element each key points at (null: a centred card, no target). */
export const COACH_TARGET: Record<CoachKey, string | null> = {
  welcome: null,
  whatsnew: null,
  coll: 'coll',
  serv: 'serv',
  shop: 'shop',
  card: 'card',
  photo: 'photo',
  bar: 'bartab',
  pro: null,
  surprise: 'surprise',
  fav: 'fav',
  swipe: 'swipe',
};

/** Hints about a Pro tool: Free users get "See Pro", and one dismissal pauses the rest for the session. */
export const PAID_FEATURE: Partial<Record<CoachKey, 'serv' | 'shop' | 'card' | 'mybar'>> = {
  serv: 'serv',
  shop: 'shop',
  card: 'card',
  bar: 'mybar',
  pro: 'mybar',
};

/** "What's at home?" starter set (README → Tour). */
export const STARTER_KEYS = [
  'lime', 'lemon', 'orange', 'banana', 'strawberries', 'milk', 'yoghurt', 'honey', 'soda', 'tonic', 'gingerale', 'mint', 'coffee',
];

/** The tour: new install vs update from 1.1; Pro users skip the last step. */
export function tourSequence(user: TourUser, isPro: boolean): CoachKey[] {
  const steps: CoachKey[] =
    user === 'upd'
      ? ['whatsnew', 'coll', 'serv', 'shop', 'card', 'bar', 'pro']
      : ['welcome', 'coll', 'serv', 'shop', 'card', 'photo', 'bar', 'pro'];
  return isPro ? steps.filter(k => k !== 'pro') : steps;
}

/** "1 of 7": the first card has no counter; the rest count from 1 to length − 1. */
export function stepCounter(index: number, length: number): { a: number; b: number } | null {
  return index > 0 ? { a: index, b: length - 1 } : null;
}

/** README → Tour: update = any 1.1 data on the first 1.2 launch. */
export function detectTourUser(facts: { favourites: number; ownRecipes: number; themeSaved: boolean }): TourUser {
  return facts.favourites > 0 || facts.ownRecipes > 0 || facts.themeSaved ? 'upd' : 'new';
}

export type CoachScreen = 'home' | 'recipe' | 'add' | 'myBar' | 'other';

/** What a hint needs to know about the moment. */
export interface HintContext {
  screen: CoachScreen;
  /** A sheet, modal, About or the paywall is open. */
  overlayOpen: boolean;
  /** Navigations in this session, and the count when the tour ended (hints wait for one more). */
  navCount: number;
  tourEndNav: number;
  seen: Partial<Record<CoachKey, boolean>>;
  isPro: boolean;
  user: TourUser;
  /** A Free user dismissed a paid hint in this session. */
  proTipSession: boolean;
  /** Recipes opened in this session. */
  opened: number;
  recipeIsFavourite: boolean;
  /** Home shows the list with no search, category or ingredient filter. */
  homeUnfiltered: boolean;
  addHasPhoto: boolean;
  myBarSegment: 'have' | 'shop';
  shopHasItems: boolean;
}

/**
 * The one hint to show now, or null (README → Hints during use). One at a time, each
 * once, only after a navigation that follows the tour, never over a sheet or modal.
 */
export function hintFor(c: HintContext): CoachKey | null {
  if (c.overlayOpen || c.navCount <= c.tourEndNav) return null;
  const s = c.seen;
  const upd = c.user === 'upd';
  const can = c.isPro || !c.proTipSession;

  if (c.screen === 'recipe') {
    if (can && !s.serv) return 'serv';
    if (can && !s.shop) return 'shop';
    if (can && !s.card) return 'card';
    if (!upd && !s.fav && c.opened >= 1 && !c.recipeIsFavourite) return 'fav';
    return null;
  }
  if (c.screen === 'home' && c.homeUnfiltered) {
    if (!s.coll) return 'coll';
    if (!upd && !s.surprise && c.opened >= 1) return 'surprise';
    return null;
  }
  if (c.screen === 'add') {
    return !upd && !s.photo && !c.addHasPhoto ? 'photo' : null;
  }
  if (c.screen === 'myBar') {
    if (c.myBarSegment === 'shop' && c.isPro && c.shopHasItems && !s.swipe) return 'swipe';
    if (can && !s.bar) return 'bar';
    if (can && !c.isPro && !s.pro && s.serv && s.shop && s.card && s.bar) return 'pro';
  }
  return null;
}

/** After "Got it" / "See Pro": the hint is seen; a Free user's paid hint pauses the rest. */
export function afterHint(
  key: CoachKey,
  state: { seen: Partial<Record<CoachKey, boolean>>; proTipSession: boolean },
  isPro: boolean
) {
  return {
    seen: { ...state.seen, [key]: true },
    proTipSession: state.proTipSession || (!!PAID_FEATURE[key] && !isPro),
  };
}
