import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Button } from './Button';
import { Chip } from './Chip';
import { PlusIcon } from './icons';

const SHOWN_CHIPS = 8;

interface BarSummaryCardProps {
  /** Ticked keys still in a visible drink, with their names in the current language. */
  items: Array<{ key: string; label: string }>;
  onRemove: (key: string) => void;
  onAdd: () => void;
  onClear: () => void;
}

/** My Bar → What I have (Pro): "Your bar", the ticked items as chips, Add / Clear. */
export const BarSummaryCard = ({ items, onRemove, onAdd, onClear }: BarSummaryCardProps) => {
  const { colors } = useTheme();
  const { t, plural } = useLanguage();
  const extra = items.length - SHOWN_CHIPS;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
          {t('yourBar')}
        </Text>
        <Text style={[type.bodyS, { color: colors.subtitle }]}>{plural('nIngr', items.length)}</Text>
      </View>

      {items.length > 0 ? (
        <View style={styles.chips}>
          {items.slice(0, SHOWN_CHIPS).map(item => (
            <Chip
              key={item.key}
              label={item.label}
              removable
              removeLabel={t('a11yRemove', { name: item.label })}
              onPress={() => onRemove(item.key)}
            />
          ))}
          {extra > 0 && (
            <TouchableOpacity
              activeOpacity={opacity.pressed}
              onPress={onAdd}
              accessibilityRole="button"
              style={[styles.more, { borderColor: colors.border, backgroundColor: colors.background }]}
            >
              <Text style={[type.label, styles.moreText, { color: colors.subtitle }]}>+{extra}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text style={[type.bodyS, styles.empty, { color: colors.subtitle }]}>{t('barEmpty')}</Text>
      )}

      <View style={styles.actions}>
        <Button
          label={t('addIngr')}
          variant="outline"
          compact
          icon={c => <PlusIcon size={sizes.icon.m} color={c} />}
          onPress={onAdd}
          style={styles.add}
        />
        {items.length > 0 && <Button label={t('clearAll')} variant="text" compact onPress={onClear} />}
      </View>
      <Text style={[type.caption, styles.note, { color: colors.textMuted }]}>{t('alwaysIn')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    padding: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.sm,
  },
  more: {
    height: sizes.chipRemovable,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: sizes.hairline,
    justifyContent: 'center',
  },
  moreText: {
    fontWeight: type.button.fontWeight,
  },
  empty: {
    marginTop: spacing.s,
  },
  actions: {
    // Ukrainian "Додати інгредієнти" needs the whole row on the smallest iPhone:
    // then Clear wraps under it instead of the label being cut.
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  add: {
    flexGrow: 1,
  },
  note: {
    marginTop: spacing.sm,
    fontWeight: type.body.fontWeight,
  },
});
