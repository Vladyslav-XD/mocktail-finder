import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  /** filled = brand fill (main action) · outline = brand border · text = no frame (Restore, Clear). */
  variant?: 'filled' | 'outline' | 'text';
  /** Drawn left of the label in the label's colour. */
  icon?: (color: string) => React.ReactNode;
  /** Drawn right of the label (the small lock on a Pro button). */
  trailing?: (color: string) => React.ReactNode;
  /** danger = error colour for an outline button (Delete). */
  tone?: 'brand' | 'danger';
  /** Free user on a Pro button: 50 %, still tappable (it opens the paywall). */
  locked?: boolean;
  disabled?: boolean;
  /** Purchasing: spinner instead of the label, presses ignored. */
  busy?: boolean;
  /** 44 instead of 48 (inside cards). */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Full-width button, 48 high, radius 12 (README → Screens → Recipe, Paywall). */
export const Button = ({
  label,
  onPress,
  variant = 'filled',
  icon,
  trailing,
  tone = 'brand',
  locked = false,
  disabled = false,
  busy = false,
  compact = false,
  style,
}: ButtonProps) => {
  const { colors } = useTheme();
  const accent = tone === 'danger' ? colors.error : colors.brand;
  const fg = variant === 'filled' ? colors.onBrand : variant === 'outline' ? accent : colors.subtitle;

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      style={[
        styles.base,
        { height: compact ? sizes.buttonCompact : sizes.button },
        variant === 'filled' && { backgroundColor: accent },
        variant === 'outline' && [styles.outline, { borderColor: accent }],
        (disabled || locked) && styles.disabled,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon?.(fg)}
          <Text numberOfLines={1} style={[type.button, { color: fg }]}>
            {label}
          </Text>
          {trailing?.(fg)}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.control,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
  },
  outline: {
    borderWidth: sizes.outline,
  },
  disabled: {
    opacity: opacity.disabled,
  },
});
