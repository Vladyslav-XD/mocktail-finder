import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
// Per-weight imports so only the two weights we use are bundled (not all eight).
import { Sora_600SemiBold } from '@expo-google-fonts/sora/600SemiBold';
import { Sora_700Bold } from '@expo-google-fonts/sora/700Bold';
import { TabNavigator } from './src/navigation/TabNavigator';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ThemeProvider, ThemeMode, loadThemeMode } from './src/context/ThemeContext';
import { store, hydrateStore } from './src/store/store';
import { loadDetailsCache } from './src/api/detailsCache';
import { SplashScreen } from './src/screens/SplashScreen';
import { ToastOutlet, ToastProvider } from './src/components/Toast';

export default function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [storeReady, setStoreReady] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  // Brand font for the wordmark. If loading fails we still start (system font fallback)
  // rather than leaving the user on the splash forever.
  const [fontsLoaded, fontError] = useFonts({ Sora_600SemiBold, Sora_700Bold });
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    let cancelled = false;
    // Favourites, user recipes, the drink-details cache and the saved theme are all
    // read while the splash plays, so the app opens in its final state.
    Promise.all([hydrateStore(), loadDetailsCache(), loadThemeMode()])
      .then(([, , savedMode]) => {
        if (!cancelled) setThemeMode(savedMode);
      })
      .finally(() => {
        if (!cancelled) setStoreReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSplashFinish = useCallback(() => setSplashVisible(false), []);

  return (
    <SafeAreaProvider style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="light" />
        {splashVisible ? (
          <SplashScreen ready={storeReady && fontsReady} onFinish={handleSplashFinish} />
        ) : (
          <Provider store={store}>
            <ThemeProvider initialMode={themeMode}>
              <ToastProvider>
                <FavoritesProvider>
                  <NavigationContainer>
                    <TabNavigator />
                  </NavigationContainer>
                </FavoritesProvider>
                <ToastOutlet />
              </ToastProvider>
            </ThemeProvider>
          </Provider>
        )}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
