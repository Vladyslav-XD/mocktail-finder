import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { XIcon } from './icons';

interface ChipProps {
  label: string;
  onPress: () => void;
  /** Filter chip that is on: brand fill. */
  active?: boolean;
  /**
   * Removable chip (My Bar → Your bar): brand border, tip-panel fill and a small ×.
   * The whole chip is the remove button.
   */
  removable?: boolean;
  /** VoiceOver label for a removable chip: "Remove Lime". */
  removeLabel?: string;
}

/** Pill chip, 36 high (32 when removable). Lives in one horizontally scrolling row. */
export const Chip = ({ label, onPress, active = false, removable = false, removeLabel }: ChipProps) => {
  const { colors } = useTheme();

  const look = removable
    ? { borderColor: colors.brand, backgroundColor: colors.tipPanel, color: colors.title }
    : active
      ? { borderColor: colors.brand, backgroundColor: colors.brand, color: colors.onBrand }
      : { borderColor: colors.badgeBorder, backgroundColor: colors.badgeBG, color: colors.badgeTitle };

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={removable ? removeLabel ?? label : label}
      accessibilityState={removable ? undefined : { selected: active }}
      style={[
        styles.chip,
        removable && styles.removable,
        { borderColor: look.borderColor, backgroundColor: look.backgroundColor },
      ]}
    >
      <Text numberOfLines={1} style={[type.label, { color: look.color }]}>
        {label}
      </Text>
      {removable && <XIcon size={sizes.icon.xs} color={colors.brandText} strokeWidth={sizes.stroke.bold} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: sizes.chip,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    borderWidth: sizes.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  removable: {
    height: sizes.chipRemovable,
    paddingLeft: spacing.sm,
    paddingRight: spacing.s,
    gap: spacing.s,
  },
});
