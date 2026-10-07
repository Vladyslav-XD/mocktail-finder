import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme/colors';
import { loadJson, saveJson, STORAGE_KEYS } from '../storage/storage';

type ThemeType = 'light' | 'dark';
/** What the user chose. 'system' follows iOS Appearance; the other two are explicit. */
export type ThemeMode = 'system' | ThemeType;

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

/**
 * Reads the saved choice. App.tsx awaits this with the other hydration calls, so
 * the first frame is already in the right theme instead of flashing the wrong one.
 */
export async function loadThemeMode(): Promise<ThemeMode> {
  const saved = await loadJson<ThemeMode>(STORAGE_KEYS.theme, 'system');
  return isThemeMode(saved) ? saved : 'system';
}

interface ThemeContextType {
  /** The theme actually in use, after 'system' is resolved. */
  theme: ThemeType;
  mode: ThemeMode;
  /** About → Theme: System follows the iPhone; Light and Dark are explicit. Saved at once. */
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  mode: 'system',
  setMode: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({
  children,
  initialMode = 'system',
}: {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}) => {
  const systemTheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const theme: ThemeType = mode === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : mode;

  // Writing is fire-and-forget: saveJson swallows its own errors, and a failed
  // write must not block the theme from changing on screen.
  const choose = useCallback((next: ThemeMode) => {
    setMode(next);
    saveJson(STORAGE_KEYS.theme, next);
  }, []);

  const currentColors = theme === 'light' ? lightColors : darkColors;

  const value = useMemo(
    () => ({ theme, mode, setMode: choose, colors: currentColors }),
    [theme, mode, choose, currentColors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
