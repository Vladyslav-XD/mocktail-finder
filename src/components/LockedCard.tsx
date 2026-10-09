import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Button } from './Button';
import { LockIcon } from './icons';

interface LockedCardProps {
  title: string;
  text: string;
  /** "Get Pro · €5.99", or "Not available right now" when the store is unreachable. */
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
}

/** What a Free user sees in place of a Pro feature (My Bar, both segments). */
export const LockedCard = ({ title, text, actionLabel, onAction, actionDisabled }: LockedCardProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={[styles.lock, { backgroundColor: colors.iconBG }]}>
        <LockIcon size={sizes.icon.xl} color={colors.brandText} />
      </View>
      <Text accessibilityRole="header" style={[type.titleM, styles.title, { color: colors.title }]}>
        {title}
      </Text>
      <Text style={[type.bodyS, styles.text, { color: colors.subtitle }]}>{text}</Text>
      <Button label={actionLabel} onPress={onAction} disabled={actionDisabled} style={styles.action} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.ml,
    paddingBottom: spacing.ml,
    alignItems: 'center',
  },
  lock: {
    width: sizes.lockCircle,
    height: sizes.lockCircle,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  text: {
    marginTop: spacing.s,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.m,
    alignSelf: 'stretch',
  },
});
