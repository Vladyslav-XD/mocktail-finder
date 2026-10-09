import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';

interface FeatureRowProps {
  /** Draws the icon in the colour it is given. */
  icon: (color: string) => React.ReactNode;
  title: string;
  subtitle: string;
  /**
   * The feature the user tapped to get here (paywall opened from a locked
   * Servings row, say): mint fill, brand border, filled icon circle.
   */
  highlighted?: boolean;
}

/** Paywall feature row: round icon, title, one or two lines of explanation. */
export const FeatureRow = ({ icon, title, subtitle, highlighted = false }: FeatureRowProps) => {
  const { colors } = useTheme();

  return (
    <View
      accessible
      style={[
        styles.row,
        highlighted && { borderColor: colors.brand, backgroundColor: colors.tipPanel },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: highlighted ? colors.brand : colors.iconBG }]}>
        {icon(highlighted ? colors.onBrand : colors.brandText)}
      </View>
      <View style={styles.texts}>
        <Text style={[type.body, styles.title, { color: colors.title }]}>{title}</Text>
        <Text style={[type.bodyS, styles.subtitle, { color: colors.subtitle }]}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.sm,
    // The highlight bleeds past the text column so the icon stays aligned with
    // the title above; border plus padding equals the bleed.
    marginHorizontal: -(spacing.sm + sizes.hairline),
    borderRadius: radius.group,
    borderWidth: sizes.hairline,
    borderColor: 'transparent',
  },
  icon: {
    width: sizes.featureIcon,
    height: sizes.featureIcon,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: type.label.fontWeight,
  },
  subtitle: {
    marginTop: spacing.xs / 2,
  },
});
