import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { spacing } from '../theme/spacing';
import { Recipe } from '../data/mockData';
import { HeartIcon, ShareIcon, ArrowLeftIcon, TrashIcon, PencilIcon } from '../components/icons';
import { SCREENS } from '../constants/screens';
import { PhotoScrim } from '../components/PhotoScrim';
import { recipeImageSource } from '../utils/recipeImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '../context/FavoritesContext';
import { RecipeDetails } from '../api/api';
import { fetchDetailsCached } from '../api/detailsCache';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe, tagLabels } from '../i18n/localizeRecipe';
import { useToast } from '../components/Toast';
import { shareRecipe, splitInstructions } from '../utils/recipeText';
import { tagsToSubtitle } from '../utils/drinkTags';
import { resolveImageUri, deleteRecipePhoto } from '../utils/recipePhotos';
import { removeRecipe } from '../store/myRecipesSlice';
import { RootState } from '../store/store';

type ParamList = {
  RecipeDetails: {
    recipe: Recipe;
  };
};

export const RecipeDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'RecipeDetails'>>();
  const navigation = useNavigation<any>();
  const routeRecipe = route.params.recipe;
  const dispatch = useDispatch();
  // The store copy is the live one, so an edit shows here the moment it is saved.
  // Only the user's own recipes are in it — TheCocktailDB drinks are not ours to change.
  const ownRecipe = useSelector((state: RootState) =>
    state.myRecipes.recipes.find(own => own.id === routeRecipe.id)
  );
  const isOwnRecipe = !!ownRecipe;
  const recipe = ownRecipe ?? routeRecipe;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(recipe.id);

  const { colors } = useTheme();
  const { lang, t } = useLanguage();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [details, setDetails] = useState<RecipeDetails | null>(null);
  // A recipe that already carries ingredients renders at once, no spinner frame.
  const [loading, setLoading] = useState<boolean>(!recipe.ingredients);
  const [error, setError] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(380);

  const imageOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      imageOpacity.setValue(0);
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, [imageOpacity])
  );

  const loadDetails = useCallback(() => {
    // The screen instance can be reused for another recipe (e.g. opened from the
    // Favourites tab while this screen is already on top), so start from a clean slate.
    setDetails(null);
    setError(false);
    // Anything that already carries ingredients (a user recipe, or a drink whose
    // details were merged from the cache) needs no request.
    if (recipe.ingredients) {
      setLoading(false);
      return () => {};
    }
    let cancelled = false;
    setLoading(true);
    fetchDetailsCached(recipe.id)
      .then(data => {
        if (cancelled) return;
        setDetails(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipe.id, recipe.ingredients]);

  useEffect(() => loadDetails(), [loadDetails]);

  const tags = details?.tags || recipe.tags || [];
  // The recipe with its details merged in, in the language on screen.
  const shown = localizeRecipe(
    {
      ...recipe,
      ingredients: details?.ingredients || recipe.ingredients,
      instructions: details?.instructions || recipe.instructions,
      tags,
    },
    lang,
    t
  );
  const ingredientsToDisplay = shown.ingredients || [];
  const stepsToDisplay = shown.steps?.length ? shown.steps : splitInstructions(shown.instructions);
  // Database drinks carry the tag line as their subtitle; showing it twice (text + chips) is noise.
  const description = recipe.subtitle && recipe.subtitle !== tagsToSubtitle(tags) ? recipe.subtitle : '';

  const handleShare = () =>
    shareRecipe(
      {
        title: shown.title,
        ingredients: ingredientsToDisplay,
        instructions: shown.instructions,
        steps: shown.steps,
        imageUrl: recipe.imageUrl,
      },
      t
    );

  const handleDelete = () =>
    Alert.alert(t('delQ'), t('delText'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('del'),
        style: 'destructive',
        onPress: async () => {
          // Drop the photo file first: once the recipe is out of the store nothing
          // points at the file any more, and it would stay behind forever.
          await deleteRecipePhoto(recipe.imageUrl);
          if (isFav) toggleFavorite(recipe);
          dispatch(removeRecipe(recipe.id));
          navigation.goBack();
          toast.show(t('recipeDeleted'));
        },
      },
    ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sticky header. It is opaque (colors.background) so the list passes cleanly
          underneath it instead of showing through the gutters beside the title card. */}
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: colors.background, paddingBottom: spacing.s }}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={{ position: 'relative' }}>
          <Animated.Image source={recipeImageSource(recipe.id, recipe.imageUrl)} style={[styles.image, { opacity: imageOpacity }]} />
          <PhotoScrim />
          <View style={{ position: 'absolute', top: insets.top + spacing.s, left: spacing.l, right: spacing.l, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
             <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('a11yBack')} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }} onPress={() => navigation.goBack()}>
               <ArrowLeftIcon size={24} color={colors.title} />
             </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 12 }}>
          <View style={[{ backgroundColor: colors.surface, padding: spacing.l, borderRadius: 16, marginTop: -40, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.title }]}>{shown.title}</Text>
              {!!description && (
                <Text style={[styles.subtitle, { color: colors.subtitle }]}>{description}</Text>
              )}
            </View>
            {tags.length > 0 && (
              <View style={styles.tagRow}>
                {tagLabels(tags, t).map(tag => (
                  <View key={tag} style={[styles.infoBadge, { backgroundColor: `${colors.activeBadgeBG}15` }]}>
                    <Text style={[styles.infoText, { color: colors.activeBadgeBG }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight + spacing.l, paddingHorizontal: spacing.l, paddingBottom: 100 }}
      >

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.activeBadgeBG} />
            <Text style={[styles.loadingText, { color: colors.title }]}>{t('loadingRecipe')}</Text>
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.errorText, { color: colors.title }]}>{t('recipeLoadError')}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: colors.activeBadgeBG }]}
              onPress={() => loadDetails()}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.retryBtnText}>{t('tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.title }]}>{t('ingredients')}</Text>
              <View style={styles.ingredientsList}>
                {ingredientsToDisplay.map((ing, idx) => (
                  <View key={idx} style={styles.ingredientItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.ingredientBullet, { color: colors.activeBadgeBG }]}>•</Text>
                      <Text style={[styles.ingredientText, { color: colors.title }]}>{ing}</Text>
                    </View>
                  </View>
                ))}
                {ingredientsToDisplay.length === 0 && (
                  <Text style={[styles.instructionsText, { color: colors.subtitle }]}>{t('noIngredients')}</Text>
                )}
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <Text style={[styles.cardTitle, { color: colors.title }]}>{t('steps')}</Text>
              <View style={styles.stepsList}>
                {stepsToDisplay.length === 0 && (
                  <Text style={[styles.instructionsText, { color: colors.subtitle }]}>{t('noSteps')}</Text>
                )}
                {stepsToDisplay.map((step, idx) => (
                  <View key={idx} style={styles.stepItem}>
                    <View style={[styles.stepBadge, { backgroundColor: colors.activeBadgeBG }]}>
                      <Text style={styles.stepNumber}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: colors.categoryTitle }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={[styles.addFavoriteBtn, { backgroundColor: colors.activeBadgeBG }]} onPress={() => toggleFavorite(recipe)} activeOpacity={0.8}>
              <HeartIcon size={20} color={'#ffffff'} focused={isFav} />
              <Text style={styles.addFavoriteBtnText}>
                {isFav ? t('savedFav') : t('addFav')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]} onPress={handleShare} activeOpacity={0.8}>
              <ShareIcon size={20} color={colors.title} />
              <Text style={[styles.shareBtnText, { color: colors.title }]}>{t('shareRecipe')}</Text>
            </TouchableOpacity>

            {isOwnRecipe && (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={[styles.ownerBtn, { borderColor: colors.badgeBorder, backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate(SCREENS.EDIT_RECIPE, { recipe })}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <PencilIcon size={18} color={colors.title} />
                  <Text style={[styles.ownerBtnText, { color: colors.title }]}>{t('edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ownerBtn, { borderColor: colors.error }]}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <TrashIcon size={18} color={colors.error} />
                  <Text style={[styles.ownerBtnText, { color: colors.error }]}>{t('del')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.l,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.m,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.m,
    gap: spacing.s,
  },
  infoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  infoText: {
    fontWeight: '500',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.l,
  },
  ingredientsList: {
    marginBottom: spacing.l,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ingredientBullet: {
    fontSize: 20,
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
  },
  instructionsText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  stepsList: {
    flexDirection: 'column',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
    marginTop: 2,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  addFavoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: spacing.m,
  },
  addFavoriteBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.s,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    // The scroll view already pads 100 at the bottom, so this only has to separate
    // Share from the Delete button that follows it on a user's own recipe.
    marginBottom: spacing.m,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  // Edit and Delete belong to the recipe's owner and read as one pair, apart from
  // Favourites and Share above them.
  ownerActions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  ownerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    // Outlined, not filled: destructive, but not the loudest thing on the screen.
    backgroundColor: 'transparent',
  },
  ownerBtnText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
  },
  errorText: {
    textAlign: 'center',
    marginTop: spacing.m,
    fontSize: 15,
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
});
