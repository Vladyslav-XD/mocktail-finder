import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Pill } from './Pill';

interface SectionTitleProps {
  title: string;
  /** "New" pill after the title (Collections, for users updating from 1.1). */
  pill?: string;
  /** Link on the right: "Everything · €12.99", "All recipes", "Clear ticked". */
  action?: { label: string; onPress: () => void };
  /** Text on the right that is not a link: "3 ingredients". */
  detail?: string;
}

/** Section heading on Home, My Bar and in cards: Title S in the category colour. */
export const SectionTitle = ({ title, pill, action, detail }: SectionTitleProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text accessibilityRole="header" numberOfLines={1} style={[type.titleS, styles.title, { color: colors.categoryTitle }]}>
          {title}
        </Text>
        {!!pill && <Pill label={pill} />}
      </View>
      {!!detail && <Text style={[type.bodyS, { color: colors.subtitle }]}>{detail}</Text>}
      {!!action && (
        <TouchableOpacity activeOpacity={opacity.pressed} onPress={action.onPress} accessibilityRole="link" hitSlop={spacing.s}>
          <Text numberOfLines={1} style={[type.label, { color: colors.brandText }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.ml,
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexShrink: 1,
  },
  title: {
    flexShrink: 1,
  },
});
