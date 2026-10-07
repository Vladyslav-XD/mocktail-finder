import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { MinusIcon, PlusIcon } from './icons';

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** VoiceOver name of the value, e.g. "Servings". */
  accessibilityLabel: string;
  /** VoiceOver labels of the two buttons: "Fewer servings", "More servings". */
  decrementLabel: string;
  incrementLabel: string;
  /**
   * Free user on a Pro control: drawn at 50 %, and any tap calls `onLockedPress`
   * (opens the paywall) instead of changing the value.
   */
  locked?: boolean;
  onLockedPress?: () => void;
  /** Set false when the row around it is already drawn at 50 % (Recipe → Servings). */
  dimWhenLocked?: boolean;
}

/** − value + with round 36 px buttons. */
export const Stepper = ({
  value,
  min,
  max,
  onChange,
  accessibilityLabel,
  decrementLabel,
  incrementLabel,
  locked = false,
  onLockedPress,
  dimWhenLocked = true,
}: StepperProps) => {
  const { colors } = useTheme();

  const step = (delta: number) => {
    if (locked) {
      onLockedPress?.();
      return;
    }
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };

  const button = (delta: number) => {
    const disabled = !locked && (delta < 0 ? value <= min : value >= max);
    const Icon = delta < 0 ? MinusIcon : PlusIcon;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={delta < 0 ? decrementLabel : incrementLabel}
        accessibilityState={{ disabled }}
        activeOpacity={opacity.pressed}
        disabled={disabled}
        onPress={() => step(delta)}
        hitSlop={spacing.xs}
        style={[styles.button, { backgroundColor: colors.iconBG }, disabled && styles.disabled]}
      >
        <Icon size={sizes.icon.m} color={colors.title} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.row, locked && dimWhenLocked && styles.locked]}>
      {button(-1)}
      <Text
        accessibilityLabel={`${accessibilityLabel}, ${value}`}
        style={[type.titleM, styles.value, { color: colors.title }]}
      >
        {value}
      </Text>
      {button(1)}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locked: {
    opacity: opacity.locked,
  },
  button: {
    width: sizes.stepperButton,
    height: sizes.stepperButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: opacity.disabled,
  },
  value: {
    minWidth: sizes.icon.xl,
    textAlign: 'center',
    fontWeight: type.button.fontWeight,
    fontVariant: ['tabular-nums'],
  },
});
