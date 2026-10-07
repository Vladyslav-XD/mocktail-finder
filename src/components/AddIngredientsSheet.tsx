import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { INGREDIENT_GROUPS } from '../data/ingredients';
import { RootState } from '../store/store';
import { selectVisibleDrinks } from '../store/selectors';
import { clearPantry, toggleKey } from '../store/pantrySlice';
import { barResults, groupItems, keyFrequency, mostUsed, shownTicks } from '../utils/myBar';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { IngredientGroup } from './IngredientGroup';
import { SearchIcon, XIcon } from './icons';
import { GROUP_ICONS } from './icons/barIcons';
import type { en } from '../i18n/en';
import { translate } from '../i18n';

type IngKey = keyof typeof en.ing;

interface AddIngredientsSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * My Bar → Add ingredients (README → Screens → My Bar): search, "Most used" (top 10
 * by number of drinks), then the nine groups with "a of b ticked". Only keys some
 * visible drink uses are offered. The button reads "Show N drinks" ("Done" for none).
 */
export const AddIngredientsSheet = ({ visible, onClose }: AddIngredientsSheetProps) => {
  const { colors } = useTheme();
  const { t, plural } = useLanguage();
  const dispatch = useDispatch();
  const ticked = useSelector((state: RootState) => state.pantry.ticked);
  const drinks = useSelector(selectVisibleDrinks);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ popular: true });

  // Every opening starts clean: no search, only Most used open (prototype).
  useEffect(() => {
    if (visible) {
      setQuery('');
      setOpen({ popular: true });
    }
  }, [visible]);

  const freq = useMemo(() => keyFrequency(drinks), [drinks]);
  const label = (key: string) => t(`ing.${key as IngKey}`);
  const q = query.trim().toLowerCase();
  // Searches the name on screen and the English one ("lime" finds Лайм).
  const matches = (key: string) =>
    !q || label(key).toLowerCase().includes(q) || translate('en', `ing.${key as IngKey}`).toLowerCase().includes(q);

  const shown = shownTicks(ticked, freq);
  const canMake = barResults(drinks, ticked).canMake.length;

  const groups = [
    ...(q ? [] : [{ key: 'popular', title: t('popular'), items: mostUsed(freq), hint: t('popularSub') }]),
    ...INGREDIENT_GROUPS.map(g => ({ key: g.key, title: t(g.key), items: groupItems(g.key, freq, matches), hint: '' })),
  ].filter(g => g.items.length > 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} fullHeight closeLabel={t('a11yClose')}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <View style={styles.titles}>
            <Text accessibilityRole="header" numberOfLines={1} style={[type.titleL, { color: colors.title }]}>
              {t('yourBar')}
            </Text>
            <Text style={[type.bodyS, { color: colors.subtitle }]}>{plural('nIngr', shown.length)}</Text>
          </View>
          {shown.length > 0 && <Button label={t('clearAll')} variant="text" compact onPress={() => dispatch(clearPantry())} />}
        </View>
        <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <SearchIcon size={sizes.icon.m} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('findIngr')}
            placeholderTextColor={colors.searchPlaceholder}
            style={[type.body, styles.input, { color: colors.title }]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              activeOpacity={opacity.pressed}
              accessibilityRole="button"
              accessibilityLabel={t('a11yClose')}
              style={[styles.clear, { backgroundColor: colors.iconBG }]}
            >
              <XIcon size={sizes.icon.xs} color={colors.subtitle} strokeWidth={sizes.stroke.bold} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.fill} contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {groups.map(group => {
          const count = group.items.filter(k => ticked.includes(k)).length;
          const Icon = GROUP_ICONS[group.key as keyof typeof GROUP_ICONS];
          return (
            <IngredientGroup
              key={group.key}
              icon={c => <Icon size={sizes.icon.m} color={c} />}
              title={group.title}
              subtitle={count ? t('nOfM', { a: count, b: group.items.length }) : group.hint || plural('nIngr', group.items.length)}
              hasTicks={count > 0}
              // While searching every group with a hit is open.
              open={!!q || !!open[group.key]}
              onToggle={() => setOpen(o => ({ ...o, [group.key]: !o[group.key] }))}
              tiles={group.items.map(k => ({ key: k, label: label(k), on: ticked.includes(k) }))}
              onTile={k => dispatch(toggleKey(k))}
            />
          );
        })}
        {groups.length === 0 && <Text style={[type.body, styles.none, { color: colors.subtitle }]}>{t('nothingFound')}</Text>}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.sheetBg }]}>
        <Button label={canMake ? plural('showN', canMake) : t('done')} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  top: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  search: {
    marginTop: spacing.sm,
    height: sizes.tile,
    borderWidth: sizes.hairline,
    borderRadius: radius.control,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
  },
  clear: {
    width: sizes.icon.xl,
    height: sizes.icon.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xs,
    paddingBottom: spacing.l,
    gap: spacing.s,
  },
  none: {
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    borderTopWidth: sizes.hairline,
  },
});
