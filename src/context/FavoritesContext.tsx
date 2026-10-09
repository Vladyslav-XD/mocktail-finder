import React, { createContext, useState, useContext, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { Recipe } from '../data/mockData';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';
import { withDetails } from '../api/recipes';
import { migrateRecipe, savedRecipes } from '../store/store';

/** Placeholder subtitle written by builds before tags existed (case varied between builds). */
const isLegacySubtitle = (subtitle?: string) =>
  (subtitle || '').trim().toLowerCase() === 'non-alcoholic mocktail';

interface FavoritesContextType {
  favorites: Recipe[];
  toggleFavorite: (recipe: Recipe) => void;
  /** Refreshes the saved copy of a recipe that was edited; no-op if it is not a favourite. */
  updateFavorite: (recipe: Recipe) => void;
  isFavorite: (id: string) => boolean;
  /** true once favorites have been read from device storage */
  hydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadJson<unknown>(STORAGE_KEYS.favorites, []).then(saved => {
      if (!mounted.current) return;
      if (Array.isArray(saved)) {
        // Older favourites carry a placeholder subtitle; fill in tags from the details cache.
        setFavorites(
          savedRecipes(saved).map(recipe =>
            withDetails(migrateRecipe(isLegacySubtitle(recipe.subtitle) ? { ...recipe, subtitle: '' } : recipe))
          )
        );
      }
      setHydrated(true);
    });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.favorites, favorites);
  }, [favorites, hydrated]);

  const toggleFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === recipe.id);
      return exists ? prev.filter(fav => fav.id !== recipe.id) : [...prev, { ...recipe, isFavorite: true }];
    });
  }, []);

  const updateFavorite = useCallback((recipe: Recipe) => {
    setFavorites(prev =>
      prev.map(fav => (fav.id === recipe.id ? { ...recipe, isFavorite: true } : fav))
    );
  }, []);

  const isFavorite = useCallback((id: string) => favorites.some(fav => fav.id === id), [favorites]);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, updateFavorite, isFavorite, hydrated }),
    [favorites, toggleFavorite, updateFavorite, isFavorite, hydrated]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
