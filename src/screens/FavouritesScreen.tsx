import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { HeartIcon } from '../components/icons';
import { RecipeCard } from '../components/RecipeCard';
import { recipeImageSource } from '../utils/recipeImage';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { Header } from '../components/Header';
import { SCREENS } from '../constants/screens';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { withDetails } from '../api/recipes';
import { useLanguage } from '../context/LanguageContext';
import { localizeRecipe } from '../i18n/localizeRecipe';

export const FavouritesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { favorites, toggleFavorite } = useFavorites();
  // Re-merge cached details so a favourite saved before its details arrived still gets a subtitle.
  const savedRecipes = favorites.map(recipe => withDetails(recipe));
  const { colors } = useTheme();
  const { lang, t, plural } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title={t('favTitle')}
      />

      {savedRecipes.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          <Text style={[styles.listCount, { color: colors.subtitle }]}>
            {savedRecipes.length} {plural('saved', savedRecipes.length)}
          </Text>
          {savedRecipes.map(recipe => {
            const shown = localizeRecipe(recipe, lang, t);
            return (
            <RecipeCard
              key={recipe.id}
              title={shown.title}
              subtitle={shown.subtitle}
              imageUrl={recipeImageSource(recipe.id, recipe.imageUrl)}
              isFavorite={true}
              onFavoritePress={() => toggleFavorite(recipe)}
              onPress={() => navigation.navigate(SCREENS.HOME_TAB, { 
                screen: SCREENS.RECIPE_DETAILS, 
                params: { recipe } 
              })}
            />
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContent}>
          {/* Handoff: an icon and one line, no title and no button. */}
          <View style={[styles.iconContainer, { backgroundColor: colors.iconBG }]}>
            <HeartIcon size={sizes.icon.xxl} color={colors.favoriteHeart} />
          </View>
          <Text style={[type.body, styles.emptyText, { color: colors.subtitle }]}>{t('favEmpty')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
  },
  listContent: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: 100,
  },
  listCount: {
    fontSize: 14,
    marginBottom: spacing.m,
    marginLeft: 4,
  },
  iconContainer: {
    width: sizes.emptyIconLarge,
    height: sizes.emptyIconLarge,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
});
