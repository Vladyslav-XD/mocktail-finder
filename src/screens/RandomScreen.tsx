import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShuffleIcon, HeartIcon, ShareIcon, ArrowLeftIcon } from '../components/icons';
import { useNavigation } from '@react-navigation/native';
import { Badge } from '../components/Badge';
import { spacing } from '../theme/spacing';
import { RecipeDetails } from '../api/api';
import { fetchDetailsCached } from '../api/detailsCache';
import { Recipe } from '../data/mockData';
import { tagsToSubtitle } from '../utils/drinkTags';
import { PhotoScrim } from '../components/PhotoScrim';
import { recipeImageSource } from '../utils/recipeImage';
import { useFavorites } from '../context/FavoritesContext';
import { shareRecipe, splitInstructions } from '../utils/recipeText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe, tagLabels } from '../i18n/localizeRecipe';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { loadCatalogue } from '../store/catalogueSlice';
import { selectVisibleDrinks } from '../store/selectors';

const WINDOW_WIDTH = Dimensions.get('window').width;

export const RandomScreen = () => {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [details, setDetails] = useState<Partial<RecipeDetails> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [headerHeight, setHeaderHeight] = useState(460);
  const navigation = useNavigation<any>();
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { lang, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  // Catalogue + own recipes + unlocked collections, the same list Home shows.
  const allRecipes = useSelector(selectVisibleDrinks);
  const catalogueStatus = useSelector((state: RootState) => state.catalogue.status);
  const loadError = catalogueStatus === 'error';
  // Guards against a slow earlier lookup overwriting the details of a newer pick.
  const requestId = useRef(0);

  const loadInitialData = () => {
    dispatch(loadCatalogue());
  };

  const pickRandomRecipe = async (recipesArray = allRecipes) => {
    if (recipesArray.length === 0) return;
    setLoading(true);
    const randomIndex = Math.floor(Math.random() * recipesArray.length);
    const randomRecipe = recipesArray[randomIndex];
    
    if (currentRecipe) {
      setHistory(prev => [...prev, currentRecipe]);
    }
    setCurrentRecipe(randomRecipe);
    setDetails(null);
    const myRequest = ++requestId.current;
    
    if (randomRecipe.ingredients) {
      setDetails({
        ingredients: randomRecipe.ingredients,
        instructions: randomRecipe.instructions || '',
        tags: randomRecipe.tags,
      });
      setLoading(false);
      return;
    }

    try {
      const recipeDetails = await fetchDetailsCached(randomRecipe.id);
      if (myRequest !== requestId.current) return; // user already shuffled again
      setDetails(recipeDetails);
    } catch {
      if (myRequest !== requestId.current) return;
      setDetails({});
    } finally {
      if (myRequest === requestId.current) setLoading(false);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevRecipe = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentRecipe(prevRecipe);
      setDetails(null);
      const myRequest = ++requestId.current;
      
      if (prevRecipe.ingredients) {
        setDetails({
          ingredients: prevRecipe.ingredients,
          instructions: prevRecipe.instructions || '',
          tags: prevRecipe.tags,
        });
        setLoading(false);
      } else {
        setLoading(true);
        fetchDetailsCached(prevRecipe.id).then(res => {
          if (myRequest !== requestId.current) return;
          setDetails(res);
          setLoading(false);
        }).catch(() => {
          if (myRequest !== requestId.current) return;
          setDetails({});
          setLoading(false);
        });
      }
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    // Opened from Home the list is already there; otherwise (or after an error) load it.
    if (catalogueStatus === 'idle') loadInitialData();
  }, []);

  useEffect(() => {
    // First pick as soon as there is something to pick from.
    if (!currentRecipe && catalogueStatus === 'ready' && allRecipes.length > 0) pickRandomRecipe(allRecipes);
  }, [catalogueStatus, allRecipes.length]);

  const parseInstructions = splitInstructions;

  // Waiting for the list or the first pick. An error, or a list with nothing in it,
  // falls through to the message below.
  const nothingToPick = catalogueStatus === 'ready' && allRecipes.length === 0;
  if (loading && !currentRecipe && !loadError && !nothingToPick) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.activeBadgeBG} />
      </View>
    );
  }

  if (!currentRecipe) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: colors.background, paddingHorizontal: spacing.xl }]}>
        <Text style={[styles.errorText, { color: colors.title }]}>{t(loadError ? 'loadError' : 'noRecipes')}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.activeBadgeBG }]}
          onPress={loadInitialData}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.retryBtnText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={[styles.linkBtnText, { color: colors.subtitle }]}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isFav = isFavorite(currentRecipe.id);
  const tags = details?.tags || currentRecipe.tags || [];
  // The pick with its details merged in, in the language on screen.
  const shown = localizeRecipe(
    { ...currentRecipe, ingredients: details?.ingredients, instructions: details?.instructions, tags },
    lang,
    t
  );
  const ingredientsToDisplay = shown.ingredients || [];
  const stepsToDisplay = shown.steps?.length ? shown.steps : parseInstructions(shown.instructions || '');
  // A user recipe shows its own description; a database drink shows its tags as chips below.
  const description =
    currentRecipe.subtitle && currentRecipe.subtitle !== tagsToSubtitle(tags) ? currentRecipe.subtitle : '';

  const handleShare = () =>
    shareRecipe(
      {
        title: shown.title,
        ingredients: ingredientsToDisplay,
        instructions: shown.instructions,
        steps: shown.steps,
        imageUrl: currentRecipe.imageUrl,
      },
      t
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky header, opaque for the same reason as on the details screen. */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: colors.background, paddingBottom: spacing.s }}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={recipeImageSource(currentRecipe.id, currentRecipe.imageUrl)}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <PhotoScrim />
          <View style={{ position: 'absolute', top: insets.top + spacing.s, left: spacing.l, right: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('a11yBack')} style={[styles.shuffleButton, { backgroundColor: colors.surface }]} activeOpacity={0.8} onPress={handleBack}>
              <ArrowLeftIcon size={24} color={colors.title} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('a11yShuffle')} style={[styles.shuffleButton, { backgroundColor: colors.activeBadgeBG }]} activeOpacity={0.8} onPress={() => pickRandomRecipe()}>
              <ShuffleIcon size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[styles.card, styles.titleCard, { backgroundColor: colors.surface, marginTop: -40, marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 }]}>
            <Text style={[styles.recipeTitle, { color: colors.title }]}>{shown.title}</Text>
            {!!description && (
              <Text style={[styles.recipeSubtitle, { color: colors.subtitle }]}>{description}</Text>
            )}
            <View style={styles.badgeWrapper}>
              {(tags.length > 0 ? tagLabels(tags, t) : [t('randomPick')]).map(tag => (
                <View key={tag} style={[{ backgroundColor: `${colors.activeBadgeBG}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }]}>
                  <Text style={[{ color: colors.activeBadgeBG, fontWeight: '500' }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + spacing.l }]}
      >
        <View style={{ paddingHorizontal: spacing.l }}>
          {loading ? (
             <View style={[styles.card, { alignItems: 'center', paddingVertical: spacing.xxl, backgroundColor: colors.surface }]}>
               <ActivityIndicator size="large" color={colors.activeBadgeBG} />
             </View>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardSectionTitle, { color: colors.title }]}>{t('ingredients')}</Text>
                {ingredientsToDisplay.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.activeBadgeBG }]} />
                    <Text style={[styles.listText, { color: colors.title }]}>{item}</Text>
                  </View>
                ))}
                {ingredientsToDisplay.length === 0 && (
                  <Text style={[styles.listText, { color: colors.subtitle }]}>{t('noIngredients')}</Text>
                )}
              </View>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <Text style={[styles.cardSectionTitle, { color: colors.title }]}>{t('steps')}</Text>
                {stepsToDisplay.length === 0 && (
                  <Text style={[styles.listText, { color: colors.subtitle }]}>{t('noSteps')}</Text>
                )}
                {stepsToDisplay.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumberCircle, { backgroundColor: colors.activeBadgeBG }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.listText, { color: colors.title }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.activeBadgeBG }]} activeOpacity={0.8} onPress={() => toggleFavorite(currentRecipe)}>
              <HeartIcon size={20} color="#ffffff" focused={isFav} />
              <Text style={styles.primaryButtonText}>
                {isFav ? t('savedFav') : t('addFav')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]} activeOpacity={0.8} onPress={handleShare}>
              <ShareIcon size={20} color={colors.title} />
              <Text style={[styles.secondaryButtonText, { color: colors.title }]}>{t('shareRecipe')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  linkBtn: {
    marginTop: spacing.m,
    padding: spacing.s,
  },
  linkBtnText: {
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imageContainer: {
    width: WINDOW_WIDTH,
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  safeAreaContext: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  shuffleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  contentWrap: {
    marginTop: -40,
    paddingHorizontal: spacing.l,
  },
  card: {
    borderRadius: 14,
    padding: spacing.l,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  titleCard: {
    alignItems: 'flex-start',
  },
  recipeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeSubtitle: {
    fontSize: 15,
    marginBottom: spacing.m,
  },
  badgeWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.s,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.m,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.m,
    marginLeft: spacing.xs,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.l,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  listText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionRow: {
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  secondaryButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
});
