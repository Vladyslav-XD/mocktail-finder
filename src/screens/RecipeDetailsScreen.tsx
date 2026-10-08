import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, useWindowDimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { opacity, radius, shadows, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Recipe } from '../data/mockData';
import { HeartIcon, ShareIcon, ArrowLeftIcon, LockIcon, ListIcon } from '../components/icons';
import { SCREENS } from '../constants/screens';
import { PhotoScrim } from '../components/PhotoScrim';
import { Button } from '../components/Button';
import { Stepper } from '../components/Stepper';
import { ShareCardSheet } from '../components/ShareCardSheet';
import { useToast } from '../components/Toast';
import { recipeImageSource } from '../utils/recipeImage';
import { useFavorites } from '../context/FavoritesContext';
import { RecipeDetails } from '../api/api';
import { fetchDetailsCached, getCachedDetails } from '../api/detailsCache';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe, tagLabels } from '../i18n/localizeRecipe';
import { shareRecipe, splitInstructions } from '../utils/recipeText';
import { tagsToSubtitle } from '../utils/drinkTags';
import { baseServings, bilingualParts, cardIngredientLine, ingredientLines } from '../utils/recipeParts';
import { addToShoppingList } from '../utils/shoppingList';
import { deleteRecipePhoto, isRecipePhoto, resolveImageUri } from '../utils/recipePhotos';
import { drinkPhoto } from '../data/drinkPhotos';
import { packPhoto } from '../data/packPhotos';
import { removeRecipe } from '../store/myRecipesSlice';
import { setShoppingList } from '../store/shoppingListSlice';
import { RootState } from '../store/store';
import { usePurchases } from '../purchases/PurchasesContext';
import { usePaywall } from '../purchases/usePaywall';
import { CoachTarget, useCoachFacts, useOnboarding } from '../onboarding/OnboardingContext';

type ParamList = {
  RecipeDetails: {
    recipe: Recipe;
  };
};

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;

/**
 * Recipe (README → Screens → Recipe): photo 300 high with round back / heart buttons,
 * title card, Ingredients with Servings 1–12, Steps, then Favourites, Share Recipe
 * (free) and the two Pro tools. A Free user sees Servings and the Pro buttons at 50 %
 * with a lock; any tap on them opens the paywall.
 */
export const RecipeDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'RecipeDetails'>>();
  const navigation = useNavigation<any>();
  const routeRecipe = route.params.recipe;
  const dispatch = useDispatch();
  // The store copy is the live one, so an edit shows here the moment it is saved.
  // Only the user's own recipes are in it — TheCocktailDB drinks are not ours to change.
  const ownRecipe = useSelector((state: RootState) => state.myRecipes.recipes.find(own => own.id === routeRecipe.id));
  const shoppingItems = useSelector((state: RootState) => state.shoppingList.items);
  const isOwnRecipe = !!ownRecipe;
  const recipe = ownRecipe ?? routeRecipe;
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(recipe.id);

  const { colors } = useTheme();
  const { lang, t, plural } = useLanguage();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const { isPro } = usePurchases();
  const { openPaywall } = usePaywall();

  const [details, setDetails] = useState<RecipeDetails | null>(null);
  // A recipe that already carries ingredients renders at once, no spinner frame.
  const [loading, setLoading] = useState<boolean>(!recipe.ingredients);
  const [error, setError] = useState(false);
  const [servings, setServings] = useState(() => baseServings(recipe));
  const [cardOpen, setCardOpen] = useState(false);
  const onboarding = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const { height: windowHeight } = useWindowDimensions();

  // Hints: count opened recipes, and whether this one is saved.
  const recipeOpened = onboarding?.recipeOpened;
  useEffect(() => recipeOpened?.(), [recipe.id, recipeOpened]);
  useCoachFacts({ recipeIsFavourite: isFav });

  // A tour step about a Pro tool scrolls its button into view (on a small iPhone the
  // buttons start below the edge; the prototype never needed to).
  const tourKey = onboarding?.current?.mode === 'tour' ? onboarding.current.key : null;
  useEffect(() => {
    if (tourKey !== 'serv' && tourKey !== 'shop' && tourKey !== 'card') return;
    const id = setTimeout(() => {
      onboarding?.target(tourKey)?.measureInWindow((_x, y, _w, h) => {
        const mid = windowHeight / 2;
        if (y + h > windowHeight * 0.75 || y < windowHeight * 0.15) {
          scrollRef.current?.scrollTo({ y: Math.max(0, scrollY.current + y - mid), animated: true });
        }
      });
    }, 400);
    return () => clearTimeout(id);
  }, [tourKey, onboarding, windowHeight, loading]);

  // Another recipe in the same screen instance starts at its own servings.
  useEffect(() => setServings(baseServings(recipe)), [recipe.id]);

  const loadDetails = useCallback(() => {
    setDetails(null);
    setError(false);
    // A catalogue drink whose cached copy predates the measure/name split (1.1) is
    // shown at once and upgraded quietly in the background.
    const needsParts = !isOwnRecipe && !recipe.packId && !recipe.parts && !getCachedDetails(recipe.id)?.parts;
    if (recipe.ingredients && !needsParts) {
      setLoading(false);
      return () => {};
    }
    let cancelled = false;
    setLoading(!recipe.ingredients);
    fetchDetailsCached(recipe.id)
      .then(data => {
        if (cancelled) return;
        setDetails(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (!recipe.ingredients) setError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recipe.id, recipe.ingredients, recipe.parts, recipe.packId, isOwnRecipe]);

  useEffect(() => loadDetails(), [loadDetails]);

  const tags = details?.tags || recipe.tags || [];
  const merged: Recipe = {
    ...recipe,
    ingredients: details?.ingredients || recipe.ingredients,
    parts: details?.parts || recipe.parts || (isOwnRecipe ? undefined : getCachedDetails(recipe.id)?.parts),
    instructions: details?.instructions || recipe.instructions,
    tags,
  };
  // In the language on screen.
  const shown = localizeRecipe(merged, lang, t);
  const parts = useMemo(() => bilingualParts(merged), [merged.id, merged.parts, merged.ingredients]);
  const factor = servings / baseServings(recipe);
  const lines = ingredientLines(parts, factor, lang);
  const steps = shown.steps?.length ? shown.steps : splitInstructions(shown.instructions);
  // Collection drinks have a description; a user recipe shows its own short text.
  const description =
    shown.description || (recipe.subtitle && recipe.subtitle !== tagsToSubtitle(tags) ? recipe.subtitle : '');

  const handleShare = () =>
    shareRecipe(
      { title: shown.title, ingredients: lines, instructions: shown.instructions, steps: shown.steps, imageUrl: recipe.imageUrl },
      t
    );

  const handleAddToList = () => {
    if (!isPro) return openPaywall('shop');
    const { items, added } = addToShoppingList(shoppingItems, parts, factor);
    dispatch(setShoppingList(items));
    toast.show(plural('added', added));
  };

  const handleShareCard = () => (isPro ? setCardOpen(true) : openPaywall('card'));

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

  const cardPhoto =
    drinkPhoto(recipe.id) ?? packPhoto(recipe.id) ?? (isRecipePhoto(recipe.imageUrl) || /^https?:/.test(recipe.imageUrl)
      ? { uri: resolveImageUri(recipe.imageUrl) }
      : null);

  const lockIcon = (color: string) => <LockIcon size={sizes.icon.s} color={color} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        onScroll={e => (scrollY.current = e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={[styles.photo, { backgroundColor: colors.iconBG }]}>
          <Image source={recipeImageSource(recipe.id, recipe.imageUrl)} style={styles.photoImage} resizeMode="cover" />
          <PhotoScrim />
          <View style={[styles.floatRow, { top: insets.top + spacing.s }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('a11yBack')}
              activeOpacity={opacity.pressed}
              onPress={() => navigation.goBack()}
              style={[styles.float, shadows.segment, { backgroundColor: colors.floatButton, shadowColor: colors.shadow }]}
            >
              <ArrowLeftIcon size={sizes.icon.l} color={colors.title} />
            </TouchableOpacity>
            <CoachTarget id="fav">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isFav ? t('savedFav') : t('addFav')}
              accessibilityState={{ selected: isFav }}
              activeOpacity={opacity.pressed}
              onPress={() => toggleFavorite(recipe)}
              style={[styles.float, shadows.segment, { backgroundColor: colors.floatButton, shadowColor: colors.shadow }]}
            >
              <HeartIcon size={sizes.icon.l} color={colors.favoriteHeart} focused={isFav} />
            </TouchableOpacity>
            </CoachTarget>
          </View>
        </View>

        <View style={styles.body}>
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text accessibilityRole="header" style={[type.titleL, { color: colors.title }]}>
              {shown.title}
            </Text>
            {tags.length > 0 && (
              <View style={styles.tags}>
                {tagLabels(tags, t).map(tag => (
                  <View key={tag} style={[styles.tag, { borderColor: colors.badgeBorder, backgroundColor: colors.badgeBG }]}>
                    <Text style={[type.label, { color: colors.badgeTitle }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
            {!!description && <Text style={[type.bodyS, styles.description, { color: colors.subtitle }]}>{description}</Text>}
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.brand} />
              <Text style={[type.body, styles.centerText, { color: colors.title }]}>{t('loadingRecipe')}</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={[type.body, styles.centerText, { color: colors.title }]}>{t('recipeLoadError')}</Text>
              <Button label={t('tryAgain')} onPress={() => loadDetails()} style={styles.retry} />
            </View>
          ) : (
            <>
              <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
                  {t('ingredients')}
                </Text>
                <CoachTarget id="serv">
                <TouchableOpacity
                  activeOpacity={isPro ? 1 : opacity.pressed}
                  disabled={isPro}
                  onPress={() => openPaywall('serv')}
                  accessible={!isPro}
                  accessibilityRole="button"
                  accessibilityLabel={t('servings')}
                  style={[styles.servings, !isPro && styles.locked]}
                >
                  <View style={styles.servingsLabel} accessible={false}>
                    <Text style={[type.titleS, { color: colors.title }]}>{t('servings')}</Text>
                    {!isPro && lockIcon(colors.title)}
                  </View>
                  <Stepper
                    value={servings}
                    min={MIN_SERVINGS}
                    max={MAX_SERVINGS}
                    onChange={setServings}
                    accessibilityLabel={t('servings')}
                    decrementLabel={t('a11yFewer')}
                    incrementLabel={t('a11yMore')}
                    locked={!isPro}
                    onLockedPress={() => openPaywall('serv')}
                    dimWhenLocked={false}
                  />
                </TouchableOpacity>
                </CoachTarget>
                <View style={styles.lines}>
                  {lines.map((line, i) => (
                    <View key={i} style={styles.line}>
                      <View style={[styles.bullet, { backgroundColor: colors.brand }]} />
                      <Text style={[type.body, styles.lineText, { color: colors.title }]}>{line}</Text>
                    </View>
                  ))}
                  {lines.length === 0 && <Text style={[type.bodyS, { color: colors.subtitle }]}>{t('noIngredients')}</Text>}
                </View>
              </View>

              <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
                  {t('steps')}
                </Text>
                <View style={styles.lines}>
                  {steps.length === 0 && <Text style={[type.bodyS, { color: colors.subtitle }]}>{t('noSteps')}</Text>}
                  {steps.map((step, i) => (
                    <View key={i} style={styles.step}>
                      <View style={[styles.stepNumber, { backgroundColor: colors.brand }]}>
                        <Text style={[type.pill, { color: colors.onBrand }]}>{i + 1}</Text>
                      </View>
                      <Text style={[type.body, styles.lineText, { color: colors.title }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.buttons}>
                <Button
                  label={isFav ? t('savedFav') : t('addFav')}
                  variant={isFav ? 'outline' : 'filled'}
                  icon={c => <HeartIcon size={sizes.icon.l} color={c} focused={isFav} />}
                  onPress={() => toggleFavorite(recipe)}
                />
                <Button
                  label={t('shareRecipe')}
                  variant="outline"
                  icon={c => <ShareIcon size={sizes.icon.m} color={c} />}
                  onPress={handleShare}
                />
                <CoachTarget id="shop">
                <Button
                  label={t('addShop')}
                  variant="outline"
                  icon={c => <ListIcon size={sizes.icon.m} color={c} />}
                  trailing={isPro ? undefined : lockIcon}
                  locked={!isPro}
                  onPress={handleAddToList}
                />
                </CoachTarget>
                <CoachTarget id="card">
                <Button
                  label={t('shareCard')}
                  variant="outline"
                  icon={c => <ShareIcon size={sizes.icon.m} color={c} />}
                  trailing={isPro ? undefined : lockIcon}
                  locked={!isPro}
                  onPress={handleShareCard}
                />
                </CoachTarget>
                {isOwnRecipe && (
                  <View style={styles.ownRow}>
                    <Button
                      label={t('edit')}
                      variant="outline"
                      style={styles.ownButton}
                      onPress={() => navigation.navigate(SCREENS.EDIT_RECIPE, { recipe })}
                    />
                    <Button label={t('del')} variant="outline" tone="danger" style={styles.ownButton} onPress={handleDelete} />
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <ShareCardSheet
        visible={cardOpen}
        onClose={() => setCardOpen(false)}
        content={{
          photo: cardPhoto,
          title: shown.title,
          // Three tags fit one line on the card, as on the list cards.
          tags: tagLabels(tags.slice(0, 3), t).join(' · ') + (recipe.packId ? ' · 0.0%' : ''),
          line: cardIngredientLine(parts, factor, lang),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxl * 2,
  },
  photo: {
    height: sizes.recipePhoto,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  floatRow: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  float: {
    width: sizes.roundButton,
    height: sizes.roundButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.m,
    gap: spacing.m,
  },
  card: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    padding: spacing.m,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
    marginTop: spacing.sm,
  },
  tag: {
    height: sizes.tagBadge,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: sizes.hairline,
    justifyContent: 'center',
  },
  description: {
    marginTop: spacing.sm,
  },
  servings: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locked: {
    opacity: opacity.locked,
  },
  lines: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bullet: {
    width: sizes.bullet,
    height: sizes.bullet,
    borderRadius: radius.pill,
    marginTop: spacing.s,
  },
  lineText: {
    flex: 1,
    minWidth: 0,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumber: {
    width: sizes.stepNumber,
    height: sizes.stepNumber,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: sizes.hairline,
  },
  buttons: {
    gap: spacing.sm,
  },
  ownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ownButton: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  centerText: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  retry: {
    marginTop: spacing.l,
    alignSelf: 'stretch',
  },
});
