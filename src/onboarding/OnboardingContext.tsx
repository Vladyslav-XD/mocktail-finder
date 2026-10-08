import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { navigationRef } from '../navigation/navigationRef';
import { SCREENS } from '../constants/screens';
import { RootState } from '../store/store';
import { usePurchases } from '../purchases/PurchasesContext';
import { usePaywall } from '../purchases/usePaywall';
import { ALL_PACK_RECIPES } from '../data/packs';
import { Recipe } from '../data/mockData';
import { useOverlayCount } from './OverlayContext';
import { afterHint, CoachKey, CoachScreen, hintFor, HintContext, PAID_FEATURE, tourSequence } from './logic';
import { OnboardingSaved, saveOnboarding } from './storage';

/** Facts screens report while focused (README → Hints conditions). */
type Facts = Pick<HintContext, 'recipeIsFavourite' | 'homeUnfiltered' | 'addHasPhoto' | 'myBarSegment' | 'shopHasItems'>;

const DEFAULT_FACTS: Facts = {
  recipeIsFavourite: false,
  homeUnfiltered: true,
  addHasPhoto: false,
  myBarSegment: 'have',
  shopHasItems: false,
};

/** What the overlay draws right now. */
export interface CoachState {
  key: CoachKey;
  mode: 'tour' | 'hint';
  /** Tour position (index in the sequence) and length. */
  step: number;
  length: number;
  user: 'new' | 'upd';
  isPro: boolean;
}

interface OnboardingApi {
  current: CoachState | null;
  primary: () => void;
  secondary: () => void;
  /** Screens report facts and opened recipes. */
  setFacts: (facts: Partial<Facts>) => void;
  recipeOpened: () => void;
  /** Target registry for CoachTarget. */
  register: (id: string, view: View | null) => void;
  target: (id: string) => View | null;
  /** DEV: start again as a new or an updating user. */
  devReset: (user: 'new' | 'upd') => void;
}

const OnboardingContext = createContext<OnboardingApi | null>(null);

/** Route name → which hint rules apply; About and the paywall count as overlays. */
function screenOf(route: string | undefined): CoachScreen | 'overlay' {
  switch (route) {
    case SCREENS.MOCKTAIL_FINDER:
      return 'home';
    case SCREENS.RECIPE_DETAILS:
      return 'recipe';
    case SCREENS.ADD_RECIPE_TAB:
      return 'add';
    case SCREENS.MY_BAR_TAB:
      return 'myBar';
    case SCREENS.ABOUT:
    case SCREENS.PAYWALL:
      return 'overlay';
    default:
      return 'other';
  }
}

export const OnboardingProvider = ({ initial, children }: { initial: OnboardingSaved; children: React.ReactNode }) => {
  const { isPro, unlockedPacks } = usePurchases();
  const { openPaywall } = usePaywall();
  const overlays = useOverlayCount();
  const catalogue = useSelector((state: RootState) => state.catalogue.recipes);

  const [saved, setSaved] = useState<OnboardingSaved>(initial);
  const [tourOn, setTourOn] = useState(!initial.tourDone);
  const [step, setStep] = useState(0);
  // Session only: a new launch is a new session.
  const [navCount, setNavCount] = useState(0);
  const [tourEndNav, setTourEndNav] = useState(0);
  const [proTipSession, setProTipSession] = useState(false);
  const [opened, setOpened] = useState(0);
  const [facts, setFactsState] = useState<Facts>(DEFAULT_FACTS);
  const [route, setRoute] = useState<string | undefined>(undefined);
  const targets = useRef(new Map<string, View>());

  const persist = useCallback((next: OnboardingSaved) => {
    setSaved(next);
    saveOnboarding(next);
  }, []);

  const sequence = useMemo(() => tourSequence(saved.user, isPro), [saved.user, isPro]);

  /** The recipe the tour shows: Virgin Margarita when Dry January is open, otherwise Afterglow. */
  const tourRecipe = useCallback((): Recipe => {
    if (unlockedPacks.includes('dry-january')) return ALL_PACK_RECIPES[0];
    return (
      catalogue.find(r => r.id === '12560') ?? { id: '12560', title: 'Afterglow', subtitle: '', imageUrl: '', isFavorite: false }
    );
  }, [unlockedPacks, catalogue]);

  /** Takes the user to the screen a step is about (prototype `obNav`). */
  const goTo = useCallback(
    (key: CoachKey) => {
      if (!navigationRef.isReady()) return;
      const nav = navigationRef as any;
      if (key === 'serv' || key === 'shop' || key === 'card') {
        nav.navigate(SCREENS.MAIN_TABS, {
          screen: SCREENS.HOME_TAB,
          params: { screen: SCREENS.RECIPE_DETAILS, params: { recipe: tourRecipe() } },
        });
      } else if (key === 'photo') {
        nav.navigate(SCREENS.MAIN_TABS, { screen: SCREENS.ADD_RECIPE_TAB });
      } else if (key === 'bar' || key === 'pro') {
        nav.navigate(SCREENS.MAIN_TABS, { screen: SCREENS.MY_BAR_TAB });
      } else {
        nav.navigate(SCREENS.MAIN_TABS, { screen: SCREENS.HOME_TAB, params: { screen: SCREENS.MOCKTAIL_FINDER } });
      }
    },
    [tourRecipe]
  );

  const endTour = useCallback(
    (toPaywall = false) => {
      const seen = { ...saved.seen };
      sequence.slice(0, step + 1).forEach(k => (seen[k] = true));
      persist({ ...saved, tourDone: true, seen });
      setTourOn(false);
      setTourEndNav(navCount + 1);
      goTo('welcome');
      if (toPaywall) openPaywall('mybar');
    },
    [saved, sequence, step, persist, navCount, goTo, openPaywall]
  );

  // Hints compute from the moment; the tour from its step.
  const screen = screenOf(route);
  const hint = tourOn
    ? null
    : hintFor({
        screen: screen === 'overlay' ? 'other' : screen,
        overlayOpen: screen === 'overlay' || overlays > 0,
        navCount,
        tourEndNav,
        seen: saved.seen,
        isPro,
        user: saved.user,
        proTipSession,
        opened,
        ...facts,
      });

  const current: CoachState | null = tourOn
    ? { key: sequence[step], mode: 'tour', step, length: sequence.length, user: saved.user, isPro }
    : hint
      ? { key: hint, mode: 'hint', step: 0, length: 0, user: saved.user, isPro }
      : null;

  const primary = useCallback(() => {
    if (!current) return;
    if (current.mode === 'tour') {
      if (current.key === 'pro') return endTour(true);
      const next = step + 1;
      if (next >= sequence.length) return endTour();
      setStep(next);
      goTo(sequence[next]);
      return;
    }
    const after = afterHint(current.key, { seen: saved.seen, proTipSession }, isPro);
    persist({ ...saved, seen: after.seen });
    setProTipSession(after.proTipSession);
    if (current.key === 'pro') openPaywall('mybar');
  }, [current, endTour, step, sequence, goTo, saved, proTipSession, isPro, persist, openPaywall]);

  const secondary = useCallback(() => {
    if (!current) return;
    if (current.mode === 'tour') return endTour();
    const after = afterHint(current.key, { seen: saved.seen, proTipSession }, isPro);
    persist({ ...saved, seen: after.seen });
    setProTipSession(after.proTipSession);
    const paid = PAID_FEATURE[current.key];
    // "See Pro" goes to the paywall for that feature; "Not now" on the Pro hint just closes.
    if (paid && !isPro && current.key !== 'pro') openPaywall(paid);
  }, [current, endTour, saved, proTipSession, isPro, persist, openPaywall]);

  const setFacts = useCallback((f: Partial<Facts>) => setFactsState(prev => ({ ...prev, ...f })), []);
  const recipeOpened = useCallback(() => setOpened(n => n + 1), []);
  const onNavigate = useCallback(() => {
    setNavCount(n => n + 1);
    setRoute(navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined);
  }, []);
  const register = useCallback((id: string, view: View | null) => {
    if (view) targets.current.set(id, view);
    else targets.current.delete(id);
  }, []);
  const target = useCallback((id: string) => targets.current.get(id) ?? null, []);

  const devReset = useCallback(
    (user: 'new' | 'upd') => {
      persist({ ...saved, tourDone: false, user, seen: {} });
      setStep(0);
      setTourOn(true);
      setNavCount(0);
      setTourEndNav(0);
      setProTipSession(false);
      setOpened(0);
      goTo('welcome');
    },
    [saved, persist, goTo]
  );

  // Every navigation counts: hints wait for one after the tour, and the route decides the rules.
  useEffect(() => navigationRef.addListener('state', onNavigate), [onNavigate]);

  // The tour starts on Home once navigation is ready.
  useEffect(() => {
    if (!tourOn) return;
    const id = setInterval(() => {
      if (navigationRef.isReady()) {
        clearInterval(id);
        setRoute(navigationRef.getCurrentRoute()?.name);
      }
    }, 200);
    return () => clearInterval(id);
  }, [tourOn]);

  const api = useMemo<OnboardingApi>(
    () => ({ current, primary, secondary, setFacts, recipeOpened, register, target, devReset }),
    [current, primary, secondary, setFacts, recipeOpened, register, target, devReset]
  );

  return <OnboardingContext.Provider value={api}>{children}</OnboardingContext.Provider>;
};

export function useOnboarding(): OnboardingApi | null {
  return useContext(OnboardingContext);
}

/** A screen reports its facts while it is focused. */
export function useCoachFacts(facts: Partial<Facts>) {
  const onboarding = useOnboarding();
  const focused = useIsFocused();
  const key = JSON.stringify(facts);
  useEffect(() => {
    if (focused) onboarding?.setFacts(facts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, key]);
}

/** Wraps the element a tour step or hint points at, so the overlay can find it. */
export const CoachTarget = ({ id, children, style }: { id: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const onboarding = useOnboarding();
  const register = onboarding?.register;
  const ref = useCallback((view: View | null) => register?.(id, view), [register, id]);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
};
