import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { Header } from '../components/Header';
import { Chip } from '../components/Chip';
import { PackCard } from '../components/PackCard';
import { SectionTitle } from '../components/SectionTitle';
import { SearchBar } from '../components/SearchBar';
import { RecipeCard } from '../components/RecipeCard';
import { ShuffleIcon } from '../components/icons';
import { recipeImageSource } from '../utils/recipeImage';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Recipe } from '../data/mockData';
import { PACKS } from '../data/packs';
import { SCREENS } from '../constants/screens';
import { CHARACTER_FILTERS, INGREDIENT_FILTERS, recipeHasIngredient } from '../constants/filters';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe, matchesSearch } from '../i18n/localizeRecipe';
import { DrinkTag } from '../utils/drinkTags';
import { AppDispatch, RootState } from '../store/store';
import { loadCatalogue } from '../store/catalogueSlice';
import { selectVisibleDrinks } from '../store/selectors';
import { usePurchases } from '../purchases/PurchasesContext';
import { usePaywall } from '../purchases/usePaywall';
import { PRODUCT_IDS } from '../purchases/products';

// "all" and "my" are pseudo-categories; the rest are real drink tags (all 15 from 1.1).
type Category = 'all' | 'my' | DrinkTag;
const CATEGORIES: Category[] = ['all', 'my', ...CHARACTER_FILTERS];
const PAGE = 5;

/**
 * Home (README → Screens → Home): Search → Collections → Category → Filter by
 * Ingredients → Featured Recipes. The Collections row hides while a search, a
 * category or an ingredient filter is on. Tapping an unlocked collection lists its
 * drinks ("<collection> · 10 drinks", "All recipes" back); a locked one opens its sheet.
 */
export const MocktailFinderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [activePack, setActivePack] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(PAGE);

  const navigation = useNavigation<StackNavigationProp<any>>();
  const dispatch = useDispatch<AppDispatch>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { lang, t, plural } = useLanguage();
  const { price, unlockedPacks, ownsEverything } = usePurchases();
  const { openPaywall, openCollection } = usePaywall();
  const customRecipes = useSelector((state: RootState) => state.myRecipes.recipes);
  const visibleDrinks = useSelector(selectVisibleDrinks);
  const { status, fillingIn } = useSelector((state: RootState) => state.catalogue);
  const loading = status === 'idle' || status === 'loading';
  const error = status === 'error';

  const loadRecipes = useCallback(() => {
    dispatch(loadCatalogue());
  }, [dispatch]);

  useEffect(() => {
    // Once per app run; Surprise and My Bar read the same list from the store.
    if (status === 'idle') loadRecipes();
  }, [status, loadRecipes]);

  useEffect(() => {
    setDisplayLimit(PAGE);
  }, [searchQuery, activeCategory, activeIngredients, activePack]);

  const chooseCategory = useCallback((cat: Category) => {
    setActivePack(null);
    setActiveCategory(cat);
  }, []);

  const toggleIngredient = useCallback((label: string) => {
    setActivePack(null);
    setActiveIngredients(prev => (prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]));
  }, []);

  const clearIngredients = useCallback(() => {
    setActivePack(null);
    setActiveIngredients([]);
  }, []);

  const openPack = useCallback(
    (packId: string) => {
      if (!unlockedPacks.includes(packId)) {
        openCollection(packId);
        return;
      }
      setActivePack(packId);
      setActiveCategory('all');
      setActiveIngredients([]);
      setSearchQuery('');
    },
    [unlockedPacks, openCollection]
  );

  const pack = activePack ? PACKS.find(p => p.id === activePack) : undefined;
  const filtersOn = !!searchQuery.trim() || activeCategory !== 'all' || activeIngredients.length > 0;
  const everythingPrice = ownsEverything ? null : price(PRODUCT_IDS.everything);

  const filteredRecipes = useMemo(() => {
    const searchHit = (recipe: Recipe) =>
      !searchQuery.trim() || matchesSearch(recipe, localizeRecipe(recipe, lang, t), searchQuery);

    if (activePack) return visibleDrinks.filter(r => r.packId === activePack && searchHit(r));

    return visibleDrinks.filter(recipe => {
      // Search matches the name or any ingredient ("ginger" finds Masala Chai), in the
      // language on screen and in English.
      if (!searchHit(recipe)) return false;

      if (activeCategory === 'my') {
        if (!customRecipes.some(cr => cr.id === recipe.id)) return false;
      } else if (activeCategory !== 'all') {
        // Real tags only. A drink whose details have not arrived yet has no tags
        // and is simply not shown until they do.
        if (!recipe.tags || !recipe.tags.includes(activeCategory)) return false;
      }

      if (activeIngredients.length > 0) {
        if (!activeIngredients.some(label => recipeHasIngredient(recipe, label))) return false;
      }
      return true;
    });
  }, [visibleDrinks, searchQuery, activeCategory, activeIngredients, activePack, customRecipes, lang, t]);

  const handleNavigateRandom = useCallback(() => navigation.navigate(SCREENS.RANDOM_TAB), [navigation]);
  const handleLoadMore = useCallback(() => setDisplayLimit(prev => prev + PAGE), []);

  const renderHeader = () => (
    <>
      <View style={styles.padded}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search')} />

        {!filtersOn && (
          <SectionTitle
            title={t('collections')}
            action={everythingPrice ? { label: `${t('everything')} · ${everythingPrice}`, onPress: () => openPaywall() } : undefined}
          />
        )}
      </View>
      {!filtersOn && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packRow}>
          {PACKS.map(p => (
            <PackCard
              key={p.id}
              packId={p.id}
              title={lang === 'uk' ? p.title_uk : p.title}
              subtitle={lang === 'uk' ? p.subtitle_uk : p.subtitle}
              locked={!unlockedPacks.includes(p.id)}
              price={price(p.productId)}
              unlockedLabel={t('unlocked')}
              onPress={() => openPack(p.id)}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.padded}>
        <SectionTitle title={t('category')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {CATEGORIES.map(cat => (
          <Chip
            key={cat}
            label={cat === 'all' ? t('all') : cat === 'my' ? t('myRecipes') : t(`tagChip.${cat}`)}
            active={!activePack && activeCategory === cat}
            onPress={() => chooseCategory(cat)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        <SectionTitle title={t('filterIng')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        <Chip label={t('all')} active={!activePack && activeIngredients.length === 0} onPress={clearIngredients} />
        {INGREDIENT_FILTERS.map(ing => (
          <Chip
            key={ing.label}
            label={t(`ing.${ing.key}`)}
            active={!activePack && activeIngredients.includes(ing.label)}
            onPress={() => toggleIngredient(ing.label)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        {pack ? (
          <SectionTitle
            title={`${lang === 'uk' ? pack.title_uk : pack.title} · ${pack.recipes.length} ${plural('drinks', pack.recipes.length)}`}
            action={{ label: t('allRecipes'), onPress: () => setActivePack(null) }}
          />
        ) : (
          <View style={styles.featuredRow}>
            <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
              {t('featured')}
            </Text>
            <TouchableOpacity
              style={[styles.surprise, { backgroundColor: colors.brand }]}
              onPress={handleNavigateRandom}
              activeOpacity={opacity.pressed}
              accessibilityRole="button"
            >
              <ShuffleIcon size={sizes.icon.s} color={colors.onBrand} />
              <Text style={[type.label, { color: colors.onBrand }]}>{t('surpriseBtn')}</Text>
            </TouchableOpacity>
          </View>
        )}
        {filteredRecipes.length === 0 && !loading && !error && (
          <Text style={[type.body, styles.emptyText, { color: colors.subtitle }]}>
            {fillingIn ? t('loadingDetails') : t('noMatch')}
          </Text>
        )}
      </View>
    </>
  );

  const renderFooter = () =>
    filteredRecipes.length > displayLimit ? (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.browseMore, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={opacity.pressed}
          onPress={handleLoadMore}
          accessibilityRole="button"
        >
          <Text style={[type.button, { color: colors.title }]}>{t('browseMore')}</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  const renderItem = useCallback(
    ({ item }: { item: Recipe }) => {
      const shown = localizeRecipe(item, lang, t);
      return (
        <View style={styles.padded}>
          <RecipeCard
            title={shown.title}
            subtitle={shown.subtitle}
            imageUrl={recipeImageSource(item.id, item.imageUrl)}
            isFavorite={isFavorite(item.id)}
            onFavoritePress={() => toggleFavorite(item)}
            onPress={() => navigation.navigate(SCREENS.RECIPE_DETAILS, { recipe: item })}
          />
        </View>
      );
    },
    [isFavorite, toggleFavorite, navigation, lang, t]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Mocktail Finder" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand} />
          <Text style={[type.body, styles.loadingText, { color: colors.title }]}>{t('loadingRecipes')}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[type.body, styles.errorText, { color: colors.title }]}>{t('loadError')}</Text>
          <TouchableOpacity
            style={[styles.retry, { backgroundColor: colors.brand }]}
            onPress={loadRecipes}
            activeOpacity={opacity.pressed}
            accessibilityRole="button"
          >
            <Text style={[type.button, { color: colors.onBrand }]}>{t('tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes.slice(0, displayLimit)}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl * 2,
  },
  padded: {
    paddingHorizontal: spacing.screen,
  },
  packRow: {
    paddingHorizontal: spacing.screen,
    gap: spacing.sm,
  },
  chipRow: {
    paddingHorizontal: spacing.screen,
    gap: spacing.s,
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.ml,
    marginBottom: spacing.m,
  },
  surprise: {
    height: sizes.chipRemovable,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  emptyText: {
    marginBottom: spacing.m,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screen,
  },
  loadingText: {
    marginTop: spacing.m,
  },
  errorText: {
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.l,
    height: sizes.button,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.control,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  browseMore: {
    height: sizes.button,
    borderRadius: radius.control,
    borderWidth: sizes.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
