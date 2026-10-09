import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { STARTER_KEYS } from '../onboarding/logic';
import type { en } from '../i18n/en';
import { Button } from './Button';
import { Chip } from './Chip';

type IngKey = keyof typeof en.ing;
const LINES = ['barStart1', 'barStart2', 'barStart3'] as const;

interface BarStarterCardProps {
  /** Ticks one starter ingredient; the first tick turns this card into "Your bar". */
  onTick: (key: string) => void;
  /** "More ingredients": the Add ingredients sheet. */
  onMore: () => void;
}

/** My Bar → What I have (Pro, bar empty): how it works, the 13 starter chips, More ingredients. */
export const BarStarterCard = ({ onTick, onMore }: BarStarterCardProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
        {t('barStartT')}
      </Text>

      <View style={styles.lines}>
        {LINES.map((key, i) => (
          <View key={key} style={styles.line}>
            <View style={[styles.number, { backgroundColor: colors.brand }]}>
              <Text style={[type.pill, { color: colors.onBrand }]}>{i + 1}</Text>
            </View>
            <Text style={[type.bodyS, styles.lineText, { color: colors.title }]}>{t(key)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chips}>
        {STARTER_KEYS.map(k => (
          <Chip key={k} label={t(`ing.${k as IngKey}`)} onPress={() => onTick(k)} />
        ))}
      </View>

      <Button label={t('barStartMore')} variant="outline" compact onPress={onMore} style={styles.more} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    padding: spacing.m,
  },
  lines: {
    gap: spacing.s,
    marginTop: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  number: {
    width: sizes.stepNumber,
    height: sizes.stepNumber,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineText: {
    flex: 1,
    minWidth: 0,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  more: {
    marginTop: spacing.m,
  },
});
