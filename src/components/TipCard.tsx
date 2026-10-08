import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { duration, useReduceMotion } from '../theme/motion';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { TIP_ICONS } from './icons/barIcons';

export type TipKind = keyof typeof TIP_ICONS;

interface TipCardProps {
  kind: TipKind;
  label: string;
  /** StoreKit price, or null when the store is unreachable (shown as "—", card at 50 %). */
  price: string | null;
  busy: boolean;
  thanked: boolean;
  thanksLabel: string;
  onPress: () => void;
}

/** Each icon hops in turn: the "wave" (prototype `mftippop`, offsets 0 / 0.35 / 0.7 s). */
const WAVE_OFFSET: Record<TipKind, number> = { tipSmall: 0, tipMedium: 350, tipLarge: 700 };
const HOP = { rise: -3, scale: 1.07 };

/** Tip jar card (README → Screens → About): icon, name, price; "Thanks!" after a tip. Unlocks nothing. */
export const TipCard = ({ kind, label, price, busy, thanked, thanksLabel, onPress }: TipCardProps) => {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    const loop = Animated.loop(
      Animated.timing(wave, { toValue: 1, duration: duration.tipWave, easing: Easing.linear, useNativeDriver: true })
    );
    const start = setTimeout(() => loop.start(), WAVE_OFFSET[kind]);
    return () => {
      clearTimeout(start);
      loop.stop();
    };
  }, [kind, reduceMotion, wave]);

  // Rest until 60 %, hop at 68 %, land at 77 % (prototype keyframes).
  const steps = [0, 0.6, 0.68, 0.77, 1];
  const translateY = reduceMotion ? 0 : wave.interpolate({ inputRange: steps, outputRange: [0, 0, HOP.rise, 0, 0] });
  const scale = reduceMotion ? 1 : wave.interpolate({ inputRange: steps, outputRange: [1, 1, HOP.scale, 1, 1] });
  const Icon = TIP_ICONS[kind];
  const unavailable = price == null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={unavailable || busy}
      activeOpacity={opacity.pressed}
      accessibilityRole="button"
      accessibilityLabel={[label, price, thanked ? thanksLabel : null].filter(Boolean).join(', ')}
      accessibilityState={{ disabled: unavailable, busy }}
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }, unavailable && styles.dim]}
    >
      <View style={[styles.icon, { backgroundColor: colors.iconBG }]}>
        <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
          <Icon size={sizes.icon.xl} color={colors.brand} />
        </Animated.View>
      </View>
      <Text numberOfLines={1} style={[type.bodyS, { color: colors.title }]}>{label}</Text>
      <View style={styles.price}>
        {busy ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <Text style={[type.titleM, { color: colors.title }]}>{price ?? '—'}</Text>
        )}
      </View>
      {thanked && (
        <View style={[styles.thanks, { backgroundColor: colors.brand }]}>
          <Text style={[type.pill, { color: colors.onBrand }]}>{thanksLabel}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: sizes.tipCard,
    borderRadius: radius.card,
    borderWidth: sizes.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dim: {
    opacity: opacity.disabled,
  },
  icon: {
    width: sizes.featureIcon,
    height: sizes.featureIcon,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  price: {
    minHeight: type.titleM.lineHeight,
    justifyContent: 'center',
  },
  thanks: {
    marginTop: spacing.xs,
    height: sizes.pill,
    paddingHorizontal: spacing.s,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
});
