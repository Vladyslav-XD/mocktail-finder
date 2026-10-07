import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocales } from 'expo-localization';
import { Header } from '../components/Header';
import { AboutGroup, AboutRow } from '../components/AboutRow';
import { OptionSheet } from '../components/OptionSheet';
import { GlobeIcon, ThemeIcon } from '../components/icons';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Language, LanguageSetting, resolveLanguage } from '../i18n';
import { sizes, spacing } from '../theme/spacing';

/** Language names are written in their own language (README: System / English / Українська). */
const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', uk: 'Українська' };

/**
 * About (README → Screens → About). Task 5 brings it in with Language and Theme so
 * the theme, gone from the header, stays reachable; the rest of the screen (icon,
 * version, Get Pro, Restore, links, tip jar, DEV switches) follows in task 8.
 */
export const AboutScreen = () => {
  const navigation = useNavigation();
  const { colors, mode, setMode } = useTheme();
  const { t, setting, setSetting } = useLanguage();
  const locales = useLocales();
  const [sheet, setSheet] = useState<'language' | 'theme' | null>(null);

  const deviceLanguage = resolveLanguage('system', locales[0]?.languageCode);
  const languageValue = setting === 'system' ? t('system') : LANGUAGE_NAMES[setting];
  const themeValue = mode === 'system' ? t('system') : mode === 'dark' ? t('dark') : t('light');
  const close = () => setSheet(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('about')} onBack={() => navigation.goBack()} showMore={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <AboutGroup>
          <AboutRow
            icon={c => <GlobeIcon size={sizes.icon.l} color={c} />}
            label={t('language')}
            value={languageValue}
            onPress={() => setSheet('language')}
          />
          <AboutRow
            icon={c => <ThemeIcon size={sizes.icon.l} color={c} />}
            label={t('theme')}
            value={themeValue}
            onPress={() => setSheet('theme')}
            last
          />
        </AboutGroup>
      </ScrollView>

      <OptionSheet<LanguageSetting>
        visible={sheet === 'language'}
        title={t('language')}
        hint={t('langHint')}
        options={[
          { value: 'system', label: `${t('system')} (${LANGUAGE_NAMES[deviceLanguage]})` },
          { value: 'en', label: LANGUAGE_NAMES.en },
          { value: 'uk', label: LANGUAGE_NAMES.uk },
        ]}
        selected={setting}
        onSelect={setSetting}
        onClose={close}
        closeLabel={t('a11yClose')}
      />
      <OptionSheet<ThemeMode>
        visible={sheet === 'theme'}
        title={t('theme')}
        hint={t('themeHint')}
        options={[
          { value: 'system', label: t('system') },
          { value: 'light', label: t('light') },
          { value: 'dark', label: t('dark') },
        ]}
        selected={mode}
        onSelect={setMode}
        onClose={close}
        closeLabel={t('a11yClose')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.m,
    paddingBottom: spacing.xxl,
  },
});
