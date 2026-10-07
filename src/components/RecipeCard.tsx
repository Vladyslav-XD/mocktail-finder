import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HeartIcon } from './icons';
import { spacing } from '../theme/spacing';
import { useTheme } from '../context/ThemeContext';
import { resolveImageUri } from '../utils/recipePhotos';

interface RecipeCardProps {
  title: string;
  subtitle: string;
  /** My Bar "Missing: …" is drawn in the error colour. */
  subtitleColor?: string;
  imageUrl: string | any;
  isFavorite: boolean;
  onFavoritePress: () => void;
  onPress?: () => void;
}

const RecipeCardComponent = ({ title, subtitle, subtitleColor, imageUrl, isFavorite, onFavoritePress, onPress }: RecipeCardProps) => {
  const { colors } = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, [opacity])
  );

  const handleFavPressIn = () => {
    Animated.spring(favScale, {
      toValue: 0.8,
      useNativeDriver: true,
      speed: 40,
      bounciness: 12,
    }).start();
  };

  const handleFavPressOut = () => {
    Animated.spring(favScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 12,
    }).start();
  };

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]} onPress={onPress} activeOpacity={0.9}>
      <Animated.Image 
        source={typeof imageUrl === 'string' ? { uri: resolveImageUri(imageUrl) } : imageUrl}
        style={[styles.image, { opacity }]} 
      />
      <Animated.View style={[styles.favoriteButton, { backgroundColor: colors.badgeBG, transform: [{ scale: favScale }] }]}>
        <TouchableOpacity 
          style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} 
          onPress={onFavoritePress} 
          onPressIn={handleFavPressIn}
          onPressOut={handleFavPressOut}
          activeOpacity={1}
        >
          <HeartIcon 
            size={18} 
            color={isFavorite ? colors.favoriteHeart : colors.mainBtn} 
            focused={isFavorite} 
          />
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: subtitleColor ?? colors.subtitle }]}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const RecipeCard = React.memo(RecipeCardComponent);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.l,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: spacing.m,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    // Keeps the card height stable while a subtitle is still loading.
    minHeight: 18,
  },
});
