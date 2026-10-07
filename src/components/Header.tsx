import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { SCREENS } from '../constants/screens';
import { ArrowLeftIcon, DotsIcon } from './icons';
import { AnimatedMartiniIcon } from './AnimatedMartiniIcon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  /** Shows a back arrow instead of the logo. Only screens pushed on top of another one pass this. */
  onBack?: () => void;
  /** The "…" button that opens About. On by default; About itself turns it off. */
  showMore?: boolean;
}

/**
 * Gradient header (README → Screens → Home; "Prototype wins" #4): logo with its foot
 * on the wordmark baseline, the title in Sora, and only "…" on the right — the theme
 * moved to About → Theme.
 */
export const Header = ({ title, subtitle, onBack, showMore = true }: HeaderProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();

  return (
    <LinearGradient colors={colors.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <SafeAreaView edges={['top']} style={styles.content}>
        <View style={styles.row}>
          {onBack ? (
            <TouchableOpacity
              style={[styles.round, { backgroundColor: colors.onGradientFill }]}
              onPress={onBack}
              activeOpacity={opacity.pressed}
              accessibilityRole="button"
              accessibilityLabel={t('a11yBack')}
            >
              <ArrowLeftIcon size={sizes.icon.l} color={colors.onGradient} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logo} accessible={false}>
              <AnimatedMartiniIcon size={sizes.logo} color={colors.onGradient} disablePulsing />
            </View>
          )}
          <Text
            accessibilityRole="header"
            numberOfLines={1}
            style={[type.wordmark, styles.title, { color: colors.onGradient }]}
          >
            {title}
          </Text>
          {showMore && (
            <TouchableOpacity
              style={[styles.round, { backgroundColor: colors.onGradientFill }]}
              onPress={() => navigation.navigate(SCREENS.ABOUT)}
              activeOpacity={opacity.pressed}
              accessibilityRole="button"
              accessibilityLabel={t('about')}
            >
              <DotsIcon size={sizes.icon.l} color={colors.onGradient} />
            </TouchableOpacity>
          )}
        </View>
        {!!subtitle && <Text style={[type.body, styles.subtitle, { color: colors.headerSubtitle }]}>{subtitle}</Text>}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.s,
    paddingBottom: spacing.ml,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  logo: {
    // The glass's foot on the wordmark baseline, not on the bottom of its line box.
    marginBottom: sizes.logoBaseline,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  round: {
    width: sizes.roundButton,
    height: sizes.roundButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
});
