import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/typography';
import { MoonIcon, SunIcon, ArrowLeftIcon } from './icons';
import { AnimatedMartiniIcon } from './AnimatedMartiniIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back arrow on the left. Only screens pushed on top of another one pass this. */
  onBack?: () => void;
}

export const Header = ({ title, subtitle, onBack }: HeaderProps) => {
  const { theme, mode, toggleTheme, useSystemTheme, colors } = useTheme();
  const { t } = useLanguage();

  const gradientColors = theme === 'light'
    ? ['#00BBA7', '#0092B8'] as const
    : ['#00786F', '#005F78'] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerBackground}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {onBack ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBack}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11yBack')}
                >
                  <ArrowLeftIcon size={22} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <View style={{ marginRight: 8, marginTop: -22 }}>
                  <AnimatedMartiniIcon size={24} color="#FFFFFF" disablePulsing />
                </View>
              )}
              <Text style={[styles.headerTitle, { color: '#FFFFFF', marginBottom: 0, marginTop: 4 }]}>{title}</Text>
            </View>
            {!!subtitle && (
              <Text style={[styles.headerSubtitle, { color: '#FFFFFF' }]}>{subtitle}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
            onLongPress={useSystemTheme}
            accessibilityRole="button"
            accessibilityLabel={t(theme === 'light' ? 'a11yThemeToDark' : 'a11yThemeToLight')}
            accessibilityHint={t('a11yThemeHint')}
          >
            {theme === 'light' ? <MoonIcon size={20} color="#FFFFFF" /> : <SunIcon size={20} color="#FFFFFF" />}
            {/* A dot means "following the system"; it disappears once the user picks a theme. */}
            {mode === 'system' && <View style={styles.systemDot} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    overflow: 'hidden',
    paddingBottom: spacing.l,
  },
  headerContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  headerTitle: {
    // Brand wordmark in Sora. Weight lives in the font file itself, so no fontWeight here —
    // on iOS a fontWeight with a custom family can silently fall back to the system font.
    fontFamily: fonts.brand,
    fontSize: 28,
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.s,
  },
  themeToggle: {
    padding: spacing.s,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  systemDot: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  themeToggleText: {
    fontSize: 24,
  },
});
