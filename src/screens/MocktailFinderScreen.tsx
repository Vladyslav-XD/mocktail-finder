import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { SearchBar } from '../components/SearchBar';
import { RecipeCard } from '../components/RecipeCard';
import { recipeImageSource } from '../utils/recipeImage';
import { ShuffleIcon } from '../components/icons';
import { spacing } from '../theme/spacing';
import { Recipe } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SCREENS } from '../constants/screens';
import { CHARACTER_FILTERS, INGREDIENT_FILTERS, recipeHasIngredient } from '../constants/filters';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe, matchesSearch } from '../i18n/localizeRecipe';
import { DrinkTag } from '../utils/drinkTags';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { loadCatalogue } from '../store/catalogueSlice';
import { selectVisibleDrinks } from '../store/selectors';

// "all" and "my" are pseudo-categories; the rest are real drink tags.
type Category = 'all' | 'my' | DrinkTag;
const CATEGORIES: Category[] = ['all', 'my', ...CHARACTER_FILTERS];

export const MocktailFinderScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [activeIngredients, setActiveIngredients] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState<number>(5);

  const navigation = useNavigation<StackNavigationProp<any>>();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { lang, t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const customRecipes = useSelector((state: RootState) => state.myRecipes.recipes);
  const allAvailableRecipes = useSelector(selectVisibleDrinks);
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
    setDisplayLimit(5);
  }, [searchQuery, activeCategory, activeIngredients]);

  const toggleIngredient = useCallback((ing: string) => {
    setActiveIngredients(prev =>
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  }, []);

  const filteredRecipes = useMemo(() => {
    return allAvailableRecipes.filter(recipe => {
      // Search matches the name or any ingredient ("ginger" finds Masala Chai), in the
      // language on screen and in English.
      if (searchQuery.trim() && !matchesSearch(recipe, localizeRecipe(recipe, lang, t), searchQuery)) {
        return false;
      }

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
  }, [allAvailableRecipes, searchQuery, activeCategory, activeIngredients, customRecipes, lang, t]);

  const handleClearIngredients = useCallback(() => setActiveIngredients([]), []);
  const handleNavigateRandom = useCallback(() => navigation.navigate(SCREENS.RANDOM_TAB), [navigation]);
  const handleLoadMore = useCallback(() => setDisplayLimit(prev => prev + 5), []);

  const renderHeader = useCallback(() => (
    <>
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('search')}
        />
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.categoryTitle }]}>{t('category')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              label={cat === 'all' ? t('all') : cat === 'my' ? t('myRecipes') : t(`tagChip.${cat}`)}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.categoryTitle }]}>{t('filterIng')}</Text>
        <View style={styles.wrapList}>
          <Badge
            label={t('all')}
            active={activeIngredients.length === 0}
            onPress={handleClearIngredients}
          />
          {INGREDIENT_FILTERS.map((ing) => (
            <Badge
              key={ing.label}
              label={t(`ing.${ing.key}`)}
              active={activeIngredients.includes(ing.label)}
              onPress={() => toggleIngredient(ing.label)}
            />
          ))}
        </View>
      </View>
      <View style={[styles.section, { paddingBottom: spacing.s }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.categoryTitle, marginBottom: 0, paddingHorizontal: 0 }]}>{t('featured')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', backgroundColor: colors.activeBadgeBG, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
              onPress={handleNavigateRandom}
            >
              <ShuffleIcon size={16} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', marginLeft: 8, fontWeight: '600', fontSize: 14 }}>{t('surpriseBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {filteredRecipes.length === 0 && !loading && !error && (
          <Text style={[styles.emptyText, { color: colors.subtitle }]}>
            {fillingIn ? t('loadingDetails') : t('noMatch')}
          </Text>
        )}
      </View>
    </>
  ), [searchQuery, activeCategory, activeIngredients, filteredRecipes.length, loading, fillingIn, error, colors, t, toggleIngredient, handleClearIngredients, handleNavigateRandom]);

  const renderFooter = useCallback(() => {
    if (filteredRecipes.length > displayLimit) {
      return (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.browseMoreBtn, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]}
            activeOpacity={0.8}
            onPress={handleLoadMore}
          >
            <Text style={[styles.browseMoreText, { color: colors.title }]}>{t('browseMore')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filteredRecipes.length, displayLimit, colors, t, handleLoadMore]);

  const renderItem = useCallback(({ item }: { item: Recipe }) => {
    const shown = localizeRecipe(item, lang, t);
    return (
    <View style={styles.recipeListItem}>
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
  }, [isFavorite, toggleFavorite, navigation, lang, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Mocktail Finder"
        subtitle=""
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.activeBadgeBG} />
          <Text style={[styles.loadingText, { color: colors.title }]}>{t('loadingRecipes')}</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.title }]}>{t('loadError')}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.activeBadgeBG }]}
            onPress={() => loadRecipes()}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.retryBtnText}>{t('tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes.slice(0, displayLimit)}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader()}
          ListFooterComponent={renderFooter()}
          contentContainerStyle={styles.scrollContent}
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
  scrollContent: {
    paddingBottom: 100,
  },
  searchWrapper: {
    paddingHorizontal: spacing.l,
    marginTop: spacing.m,
  },
  section: {
    marginTop: spacing.l,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.s,
  },
  totalCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  horizontalList: {
    paddingHorizontal: spacing.l,
  },
  wrapList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.l,
  },
  recipeListItem: {
    paddingHorizontal: spacing.l,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: spacing.l,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    paddingHorizontal: spacing.l,
    fontSize: 15,
    marginTop: spacing.s,
  },
  footerContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  browseMoreBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
    alignItems: 'center',
  },
  browseMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
