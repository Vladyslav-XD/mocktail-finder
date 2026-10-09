import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { ChevronRightIcon } from './icons';

interface AboutRowProps {
  /** Draws the row icon in the colour it is given (brand). */
  icon: (color: string) => React.ReactNode;
  label: string;
  /** Current value on the right ("System", "Dark"); links have none. */
  value?: string;
  onPress: () => void;
  /** No divider under the last row of a group. */
  last?: boolean;
  /** VoiceOver hint: what the row does when it is not obvious from the label. */
  hint?: string;
  /** Quieter row (Restore Purchases): icon and label in `subtitle` (4.8:1 light), Body S, same height. */
  muted?: boolean;
}

/** One row of the About list: icon, label, value, chevron. 50 high. */
export const AboutRow = ({ icon, label, value, onPress, last = false, muted = false, hint }: AboutRowProps) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityHint={hint}
      style={[styles.row, !last && { borderBottomWidth: sizes.hairline, borderBottomColor: colors.border }]}
    >
      <View accessible={false}>{icon(muted ? colors.subtitle : colors.brand)}</View>
      <Text numberOfLines={1} style={[muted ? type.bodyS : type.body, styles.label, { color: muted ? colors.subtitle : colors.title }]}>
        {label}
      </Text>
      {!!value && <Text style={[type.body, { color: colors.subtitle }]}>{value}</Text>}
      <ChevronRightIcon size={sizes.icon.m} color={colors.subtitle} />
    </TouchableOpacity>
  );
};

/** The bordered card the rows sit in. */
export const AboutGroup = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  return <View style={[styles.group, { borderColor: colors.border, backgroundColor: colors.surface }]}>{children}</View>;
};

const styles = StyleSheet.create({
  row: {
    height: sizes.optionRow,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  group: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
});
