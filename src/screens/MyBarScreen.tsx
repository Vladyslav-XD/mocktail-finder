import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../components/Header';
import { SegmentedControl } from '../components/SegmentedControl';
import { LockedCard } from '../components/LockedCard';
import { BarSummaryCard } from '../components/BarSummaryCard';
import { AddIngredientsSheet } from '../components/AddIngredientsSheet';
import { RecipeCard } from '../components/RecipeCard';
import { SectionTitle } from '../components/SectionTitle';
import { CheckRow } from '../components/CheckRow';
import { Button } from '../components/Button';
import { ShareIcon } from '../components/icons';
import { BagIcon } from '../components/icons/barIcons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { usePurchases } from '../purchases/PurchasesContext';
import { usePaywall } from '../purchases/usePaywall';
import { PRODUCT_IDS } from '../purchases/products';
import { localizeRecipe } from '../i18n/localizeRecipe';
import { recipeImageSource } from '../utils/recipeImage';
import { barResults, keyFrequency, shownTicks } from '../utils/myBar';
import { itemAmount, itemName, shoppingListText } from '../utils/shoppingList';
import { Recipe } from '../data/mockData';
import { SCREENS } from '../constants/screens';
import { RootState } from '../store/store';
import { selectVisibleDrinks } from '../store/selectors';
import { loadCatalogue } from '../store/catalogueSlice';
import type { AppDispatch } from '../store/store';
import { toggleKey, clearPantry } from '../store/pantrySlice';
import { clearTicked, removeItem, toggleItem } from '../store/shoppingListSlice';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import type { en } from '../i18n/en';

type Segment = 'have' | 'shop';
type IngKey = keyof typeof en.ing;

/**
 * My Bar (README → Screens → My Bar, Shopping list). Segmented "What I have | Shopping
 * list". Free sees a locked card per segment, never an empty screen; Pro gets the
 * Your bar card with "You can make now" / "Missing one ingredient", and the list.
 */
export const MyBarScreen = () => {
  const { colors } = useTheme();
  const { lang, t, plural } = useLanguage();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { isPro, price } = usePurchases();
  const { openPaywall } = usePaywall();
  const { isFavorite, toggleFavorite } = useFavorites();
  const drinks = useSelector(selectVisibleDrinks);
  const ticked = useSelector((state: RootState) => state.pantry.ticked);
  const items = useSelector((state: RootState) => state.shoppingList.items);
  const catalogueStatus = useSelector((state: RootState) => state.catalogue.status);
  const [segment, setSegment] = useState<Segment>('have');
  const [sheet, setSheet] = useState(false);

  // My Bar may be opened before Home has loaded the catalogue.
  useEffect(() => {
    if (catalogueStatus === 'idle') dispatch(loadCatalogue());
  }, [catalogueStatus, dispatch]);

  const freq = useMemo(() => keyFrequency(drinks), [drinks]);
  const results = useMemo(() => barResults(drinks, ticked), [drinks, ticked]);
  const label = (key: string) => t(`ing.${key as IngKey}`);
  const proPrice = price(PRODUCT_IDS.pro);

  const openRecipe = (recipe: Recipe) =>
    navigation.navigate(SCREENS.HOME_TAB, { screen: SCREENS.RECIPE_DETAILS, params: { recipe } });

  const card = (recipe: Recipe, subtitle?: string, subtitleColor?: string) => {
    const shown = localizeRecipe(recipe, lang, t);
    return (
      <RecipeCard
        key={recipe.id}
        title={shown.title}
        subtitle={subtitle ?? shown.subtitle}
        subtitleColor={subtitleColor}
        imageUrl={recipeImageSource(recipe.id, recipe.imageUrl)}
        isFavorite={isFavorite(recipe.id)}
        onFavoritePress={() => toggleFavorite(recipe)}
        onPress={() => openRecipe(recipe)}
      />
    );
  };

  const locked = (
    <>
      <LockedCard
        title={t(segment === 'shop' ? 'lockShopTitle' : 'lockTitle')}
        text={t(segment === 'shop' ? 'lockShopText' : 'lockText')}
        actionLabel={proPrice ? `${t('getPro')} · ${proPrice}` : t('unavailable')}
        actionDisabled={!proPrice}
        onAction={() => openPaywall(segment === 'shop' ? 'shop' : 'mybar')}
      />
      <Text style={[type.bodyS, styles.more, { color: colors.subtitle }]}>{t('lockMore')}</Text>
    </>
  );

  const have = (
    <>
      <BarSummaryCard
        items={shownTicks(ticked, freq).map(key => ({ key, label: label(key) }))}
        onRemove={key => dispatch(toggleKey(key))}
        onAdd={() => setSheet(true)}
        onClear={() => dispatch(clearPantry())}
      />
      <SectionTitle title={`${t('canMake')} (${results.canMake.length})`} />
      {results.canMake.length ? (
        results.canMake.map(r => card(r))
      ) : (
        <Text style={[type.body, { color: colors.subtitle }]}>{t('nothingYet')}</Text>
      )}
      {results.missingOne.length > 0 && (
        <>
          <SectionTitle title={`${t('missingOne')} (${results.missingOne.length})`} />
          {results.missingOne.map(({ recipe, missing }) =>
            card(recipe, `${t('missing')} ${label(missing).toLowerCase()}`, colors.error)
          )}
        </>
      )}
    </>
  );

  const tickedCount = items.filter(i => i.ticked).length;
  const shop = items.length ? (
    <>
      <SectionTitle
        title={`${items.length} ${plural('items', items.length)} · ${tickedCount} ${t('ticked')}`}
        action={tickedCount ? { label: t('clearTicked'), onPress: () => dispatch(clearTicked()) } : undefined}
      />
      <View style={styles.rows}>
        {items.map(item => (
          <CheckRow
            key={item.key}
            label={itemName(item, lang)}
            amount={itemAmount(item, lang)}
            checked={item.ticked}
            onToggle={() => dispatch(toggleItem(item.key))}
            onDelete={() => dispatch(removeItem(item.key))}
            deleteLabel={t('a11yDelete')}
          />
        ))}
      </View>
      <Button
        label={t('shareList')}
        variant="outline"
        icon={c => <ShareIcon size={sizes.icon.m} color={c} />}
        onPress={() => Share.share({ message: shoppingListText(items, lang) }).catch(() => {})}
        style={styles.share}
      />
    </>
  ) : (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.iconBG }]}>
        <BagIcon size={sizes.icon.xxl} color={colors.textMuted} />
      </View>
      <Text style={[type.body, styles.emptyText, { color: colors.subtitle }]}>{t('listEmpty')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('tabKitchen')} subtitle={t('kitchenSub')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SegmentedControl<Segment>
          segments={[
            { key: 'have', label: t('whatIHave') },
            { key: 'shop', label: t('shopList') },
          ]}
          value={segment}
          onChange={setSegment}
        />
        <View style={styles.body}>{!isPro ? locked : segment === 'have' ? have : shop}</View>
      </ScrollView>
      <AddIngredientsSheet visible={sheet} onClose={() => setSheet(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl * 2,
  },
  body: {
    marginTop: spacing.m,
  },
  more: {
    marginTop: spacing.m,
    paddingHorizontal: spacing.s,
    textAlign: 'center',
  },
  rows: {
    gap: spacing.s,
  },
  share: {
    marginTop: spacing.m,
  },
  empty: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyIcon: {
    width: sizes.emptyIcon,
    height: sizes.emptyIcon,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: sizes.emptyTextWidth,
  },
});
