import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { duration, useReduceMotion } from '../theme/motion';
import { opacity, radius, shadows, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Chip } from '../components/Chip';
import { Pill } from '../components/Pill';
import { RootState } from '../store/store';
import { selectVisibleDrinks } from '../store/selectors';
import { toggleKey } from '../store/pantrySlice';
import { barResults } from '../utils/myBar';
import { COACH_TARGET, CoachKey, PAID_FEATURE, STARTER_KEYS, stepCounter } from './logic';
import { CoachState, useOnboarding } from './OnboardingContext';
import type { en } from '../i18n/en';

type IngKey = keyof typeof en.ing;
type Rect = { x: number; y: number; w: number; h: number };

const APP_ICON = require('../../assets/icon.png');
/** Ring corner per target (prototype). */
const RING_RADIUS: Record<string, number> = { coll: 22, serv: 16, shop: 18, card: 18, photo: 18, bartab: 18, surprise: 22, fav: 24, swipe: 18 };
const HOLE_PAD = 6;
const GAP = 12;
const CARET = 14;
/** A hint hides while its target is under the status bar or behind the tab bar. */
const EDGE_TOP = 50;
const EDGE_BOTTOM = 96;
const PULSE_SPREAD = 16;
/** "Pro" pill: the product name, the same in both languages. */
const PRO_PILL = 'Pro';

/**
 * Tour and hints over the real screens (README → Tour and hints). Tour: dim backdrop
 * with a cut-out and a 3 px brand ring, the UI underneath blocked. Hint: a pulsing
 * ring and a bubble, no dim, the UI stays usable.
 */
export const CoachOverlay = () => {
  const onboarding = useOnboarding();
  const current = onboarding?.current ?? null;
  const { height } = useWindowDimensions();
  const [rect, setRect] = useState<Rect | null>(null);
  const targetId = current ? COACH_TARGET[current.key] : null;

  // Measure the target now and again while it is shown: screens scroll and settle.
  useEffect(() => {
    setRect(null);
    if (!targetId || !onboarding) return;
    let alive = true;
    const measure = () => {
      const view = onboarding.target(targetId);
      view?.measureInWindow((x, y, w, h) => {
        if (!alive) return;
        setRect(prev => (prev && prev.x === x && prev.y === y && prev.w === w && prev.h === h ? prev : w > 0 ? { x, y, w, h } : null));
      });
    };
    measure();
    const id = setInterval(measure, 300);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [targetId, current?.key, current?.mode, onboarding]);

  if (!current || !onboarding) return null;
  if (targetId && !rect) return null;
  const tour = current.mode === 'tour';
  const offScreen = !!rect && targetId !== 'bartab' && (rect.y + rect.h < EDGE_TOP || rect.y > height - EDGE_BOTTOM);
  if (offScreen && !tour) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={tour ? 'auto' : 'box-none'}>
      {tour && <Backdrop rect={rect} targetId={targetId} />}
      {rect && targetId && <Ring rect={rect} radiusValue={RING_RADIUS[targetId] ?? 18} pulse={!tour} />}
      <Bubble state={current} rect={rect} />
    </View>
  );
};

/** Dim everywhere except the target (four rectangles around the hole). */
const Backdrop = ({ rect, targetId }: { rect: Rect | null; targetId: string | null }) => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const fill = { backgroundColor: colors.coachDim };
  if (!rect || !targetId) return <View style={[StyleSheet.absoluteFill, fill]} />;
  const top = rect.y - HOLE_PAD;
  const left = rect.x - HOLE_PAD;
  const right = rect.x + rect.w + HOLE_PAD;
  const bottom = rect.y + rect.h + HOLE_PAD;
  return (
    <>
      <View style={[styles.abs, fill, { top: 0, left: 0, right: 0, height: Math.max(0, top) }]} />
      <View style={[styles.abs, fill, { top: bottom, left: 0, right: 0, height: Math.max(0, height - bottom) }]} />
      <View style={[styles.abs, fill, { top, left: 0, width: Math.max(0, left), height: bottom - top }]} />
      <View style={[styles.abs, fill, { top, left: right, width: Math.max(0, width - right), height: bottom - top }]} />
    </>
  );
};

/** 3 px brand ring; for a hint it also pulses outwards (1.6 s), still with Reduce Motion. */
const Ring = ({ rect, radiusValue, pulse }: { rect: Rect; radiusValue: number; pulse: boolean }) => {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pulse || reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(anim, { toValue: 1, duration: duration.hintPulse, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion, anim]);

  const frame = {
    left: rect.x - HOLE_PAD,
    top: rect.y - HOLE_PAD,
    width: rect.w + HOLE_PAD * 2,
    height: rect.h + HOLE_PAD * 2,
    borderRadius: radiusValue,
  };
  // The pulse grows by 16 px each side while fading (prototype `mfpulse`, 70 % of the loop).
  const grow = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1 + (PULSE_SPREAD * 2) / frame.width, 1 + (PULSE_SPREAD * 2) / frame.width] });
  const fade = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.75, 0, 0] });

  return (
    <>
      {pulse && !reduceMotion && (
        <Animated.View
          pointerEvents="none"
          style={[styles.abs, frame, { backgroundColor: colors.coachRing, opacity: fade, transform: [{ scale: grow }] }]}
        />
      )}
      <View pointerEvents="none" style={[styles.abs, frame, { borderWidth: sizes.coachRing, borderColor: colors.coachRing }]} />
    </>
  );
};

/** The card: pill and counter, title, text, list / starter chips, buttons. */
const Bubble = ({ state, rect }: { state: CoachState; rect: Rect | null }) => {
  const onboarding = useOnboarding()!;
  const { colors } = useTheme();
  const { t, plural } = useLanguage();
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();
  const ticked = useSelector((s: RootState) => s.pantry.ticked);
  const drinks = useSelector(selectVisibleDrinks);
  const tour = state.mode === 'tour';
  const upd = state.user === 'upd';
  const key = state.key;

  const copy = key === 'welcome' && state.school ? { title: t('tourSchoolT'), text: t('tourSchoolS') } : content(key, t);
  const paidPill = !state.isPro ? PRO_PILL : upd ? t('obNew') : '';
  const pill =
    key === 'whatsnew' ? t('obNew') : key === 'coll' || key === 'swipe' ? (upd ? t('obNew') : '') : PAID_FEATURE[key] && key !== 'pro' ? paidPill : '';
  const counter = tour ? stepCounter(state.step, state.length) : null;
  const isLast = tour && state.step === state.length - 1;
  const upsell = !tour && !!PAID_FEATURE[key] && !state.isPro;

  const primaryLabel =
    key === 'welcome' || key === 'whatsnew'
      ? t('obStart')
      : key === 'pro'
        ? t('obLearnMore')
        : tour
          ? isLast ? t('obDone') : t('obNext')
          : t('obGotIt');
  const secondaryLabel = tour ? (key === 'pro' ? t('obNotNow') : t('obSkip')) : key === 'pro' ? t('obNotNow') : upsell ? t('seePro') : '';

  const canMake = key === 'bar' || key === 'pro' ? barResults(drinks, ticked).canMake.length : 0;
  const ready = canMake ? plural('obReady', canMake) : t('obReadyNone');

  // Below the target when it sits in the top half, above it otherwise; centred without one.
  let place: object = { top: '50%', transform: [{ translateY: -height * 0.2 }] };
  let caret: { top: boolean; x: number } | null = null;
  if (rect) {
    const holeTop = rect.y - HOLE_PAD;
    const holeBottom = rect.y + rect.h + HOLE_PAD;
    const x = Math.max(spacing.sm, Math.min(width - spacing.m * 2 - CARET * 2, rect.x + rect.w / 2 - spacing.m - CARET / 2));
    if (rect.y + rect.h / 2 < height / 2) {
      place = { top: holeBottom + GAP };
      caret = { top: true, x };
    } else {
      place = { bottom: height - holeTop + GAP };
      caret = { top: false, x };
    }
  } else if (!tour) {
    place = { bottom: sizes.toastBottom };
  }

  return (
    <View style={[styles.bubbleWrap, place]} pointerEvents="box-none">
      <View
        accessibilityViewIsModal={tour}
        style={[styles.bubble, shadows.toast, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}
      >
        {caret && (
          <View
            style={[
              styles.caret,
              { left: caret.x, backgroundColor: colors.surface, borderColor: colors.border },
              caret.top ? styles.caretTop : styles.caretBottom,
            ]}
          />
        )}
        {key === 'welcome' && <Image source={APP_ICON} style={styles.icon} />}
        {(!!pill || !!counter) && (
          <View style={styles.meta}>
            {!!pill && <Pill label={pill} />}
            <View style={styles.fill} />
            {counter && <Text style={[type.caption, { color: colors.textMuted }]}>{t('obStepOf', counter)}</Text>}
          </View>
        )}
        <Text accessibilityRole="header" style={[type.titleM, (pill || counter) && styles.titleGap, { color: colors.title }]}>
          {copy.title}
        </Text>
        <Text style={[type.bodyS, styles.text, { color: colors.subtitle }]}>{copy.text}</Text>

        {key === 'whatsnew' && (
          <View style={styles.list}>
            {t('obWN').split(' / ').map(line => (
              <View key={line} style={styles.listRow}>
                <View style={[styles.bullet, { backgroundColor: colors.brand }]} />
                <Text style={[type.body, styles.fill, { color: colors.title }]}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {tour && key === 'bar' && (
          <View style={styles.chips}>
            {STARTER_KEYS.map(k => (
              <Chip key={k} label={t(`ing.${k as IngKey}`)} active={ticked.includes(k)} onPress={() => dispatch(toggleKey(k))} />
            ))}
          </View>
        )}
        {((tour && key === 'bar') || (key === 'pro' && canMake > 0)) && (
          <Text style={[type.titleS, styles.ready, { color: colors.brand }]}>{ready}</Text>
        )}

        <View style={styles.actions}>
          {!!secondaryLabel && (
            <TouchableOpacity onPress={onboarding.secondary} activeOpacity={opacity.pressed} accessibilityRole="button" hitSlop={spacing.s}>
              <Text style={[type.button, { color: colors.subtitle }]}>{secondaryLabel}</Text>
            </TouchableOpacity>
          )}
          <View style={styles.fill} />
          <TouchableOpacity
            onPress={onboarding.primary}
            activeOpacity={opacity.pressed}
            accessibilityRole="button"
            style={[styles.primary, { backgroundColor: colors.brand }]}
          >
            <Text style={[type.button, { color: colors.onBrand }]}>{primaryLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

function content(key: CoachKey, t: ReturnType<typeof useLanguage>['t']): { title: string; text: string } {
  switch (key) {
    case 'welcome':
      return { title: t('obWelcomeT'), text: t('obWelcomeS') };
    case 'whatsnew':
      return { title: t('obWhatsNewT'), text: t('obWhatsNewS') };
    case 'coll':
      return { title: t('obCollT'), text: t('obCollS') };
    case 'serv':
      return { title: t('obServT'), text: t('obServS') };
    case 'shop':
      return { title: t('obShopT'), text: t('obShopS') };
    case 'card':
      return { title: t('obCardT'), text: t('obCardS') };
    case 'photo':
      return { title: t('obPhotoT'), text: t('obPhotoS') };
    case 'bar':
      return { title: t('obBarT'), text: t('obBarS') };
    case 'pro':
      return { title: t('obProT'), text: t('obProS') };
    case 'surprise':
      return { title: t('obSurpT'), text: t('obSurpS') };
    case 'fav':
      return { title: t('obFavT'), text: t('obFavS') };
    case 'swipe':
      return { title: t('obSwipeT'), text: t('obSwipeS') };
  }
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
  fill: {
    flex: 1,
  },
  bubbleWrap: {
    position: 'absolute',
    left: spacing.m,
    right: spacing.m,
  },
  bubble: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    padding: spacing.m,
  },
  caret: {
    position: 'absolute',
    width: CARET,
    height: CARET,
    transform: [{ rotate: '45deg' }],
  },
  caretTop: {
    top: -CARET / 2 - sizes.hairline,
    borderLeftWidth: sizes.hairline,
    borderTopWidth: sizes.hairline,
  },
  caretBottom: {
    bottom: -CARET / 2 - sizes.hairline,
    borderRightWidth: sizes.hairline,
    borderBottomWidth: sizes.hairline,
  },
  icon: {
    width: sizes.appIconSmall,
    height: sizes.appIconSmall,
    borderRadius: radius.appIcon56,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  titleGap: {
    marginTop: spacing.s,
  },
  text: {
    marginTop: spacing.xs,
  },
  list: {
    marginTop: spacing.sm,
    gap: spacing.s,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
  },
  bullet: {
    width: sizes.bullet,
    height: sizes.bullet,
    borderRadius: radius.pill,
    marginTop: spacing.s,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.sm,
  },
  ready: {
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.m,
  },
  primary: {
    height: sizes.buttonCompact - spacing.xs,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
});
