import React, { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocales } from 'expo-localization';
import Constants from 'expo-constants';
import { Header } from '../components/Header';
import { AboutGroup, AboutRow } from '../components/AboutRow';
import { OptionSheet } from '../components/OptionSheet';
import { Button } from '../components/Button';
import { TipCard, TipKind } from '../components/TipCard';
import { GlobeIcon, ThemeIcon } from '../components/icons';
import { ExternalIcon, RestoreIcon, StarIcon } from '../components/icons/barIcons';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePurchases } from '../purchases/PurchasesContext';
import { usePaywall } from '../purchases/usePaywall';
import { useOnboarding } from '../onboarding/OnboardingContext';
import { PACK_PRODUCT_IDS, PRODUCT_IDS } from '../purchases/products';
import { PACKS } from '../data/packs';
import { Language, LanguageSetting, resolveLanguage } from '../i18n';
import { PRIVACY_URL, RATE_URL, SUPPORT_URL } from '../constants/links';
import { DEV_LABELS } from '../constants/devLabels';
import { duration } from '../theme/motion';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';

/** Language names are written in their own language (README: System / English / Українська). */
const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', uk: 'Українська' };
const APP_ICON = require('../../assets/icon.png');
const TIPS: Array<{ kind: TipKind; id: string; label: 'tipSmall' | 'tipMedium' | 'tipLarge' }> = [
  { kind: 'tipSmall', id: PRODUCT_IDS.tipSmall, label: 'tipSmall' },
  { kind: 'tipMedium', id: PRODUCT_IDS.tipMedium, label: 'tipMedium' },
  { kind: 'tipLarge', id: PRODUCT_IDS.tipLarge, label: 'tipLarge' },
];

/**
 * About (README → Screens → About): icon, name, version line, Get Pro (Free only),
 * Language / Theme / Restore / Privacy / Support / Rate, and the tip jar "Drinks for
 * the developer". A long-press on the version line shows the DEV switches in debug builds.
 */
export const AboutScreen = () => {
  const navigation = useNavigation();
  const { colors, mode, setMode } = useTheme();
  const { t, setting, setSetting } = useLanguage();
  const { isPro, price, purchasing, thankedTips, tip, restore, dev } = usePurchases();
  const { openPaywall } = usePaywall();
  const onboarding = useOnboarding();
  const locales = useLocales();
  const [sheet, setSheet] = useState<'language' | 'theme' | null>(null);
  const [devOpen, setDevOpen] = useState(false);

  const deviceLanguage = resolveLanguage('system', locales[0]?.languageCode);
  const languageValue = setting === 'system' ? t('system') : LANGUAGE_NAMES[setting];
  const themeValue = mode === 'system' ? t('system') : mode === 'dark' ? t('dark') : t('light');
  const close = () => setSheet(null);

  // "Version 1.2.0 (6) · Pro unlocked". The build number is the binary's own
  // CFBundleVersion (EAS sets it); Expo Go has none, so the brackets are left out.
  const version = Constants.expoConfig?.version ?? '';
  const build = Constants.platform?.ios?.buildNumber;
  const versionLine = `${t('version')} ${version}${build ? ` (${build})` : ''} · ${isPro ? t('proUnlocked') : t('free')}`;
  const proPrice = price(PRODUCT_IDS.pro);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('about')} onBack={() => navigation.goBack()} showMore={false} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.app}>
          <Image source={APP_ICON} style={styles.icon} accessibilityIgnoresInvertColors />
          <View style={styles.appText}>
            <Text style={[type.titleM, { color: colors.title }]}>Mocktail Finder</Text>
            <Pressable
              onLongPress={() => dev && setDevOpen(open => !open)}
              delayLongPress={duration.devLongPress}
              accessibilityRole="text"
            >
              <Text style={[type.bodyS, styles.version, { color: colors.subtitle }]}>{versionLine}</Text>
            </Pressable>
          </View>
        </View>

        {dev && devOpen && (
          <View style={[styles.dev, { borderColor: colors.border }]}>
            <Text style={[type.pill, { color: colors.textMuted }]}>{DEV_LABELS.title}</Text>
            <DevSwitch label={t('simPro')} value={dev.pro} onChange={v => dev.set({ pro: v })} />
            <DevSwitch label={DEV_LABELS.everything} value={dev.everything} onChange={v => dev.set({ everything: v })} />
            {PACKS.map(p => {
              const id = PACK_PRODUCT_IDS[p.id];
              const on = dev.packs.includes(id);
              return (
                <DevSwitch
                  key={p.id}
                  label={p.id === 'dry-january' ? t('simPack') : DEV_LABELS.pack(p.title)}
                  value={on}
                  onChange={v => dev.set({ packs: v ? [...dev.packs, id] : dev.packs.filter(x => x !== id) })}
                />
              );
            })}
            <DevSwitch label={DEV_LABELS.storeDown} value={dev.storeDown} onChange={v => dev.set({ storeDown: v })} />
            {/* Clears the tour state and seen hints, then starts the tour again. */}
            <Button label={DEV_LABELS.tourNew} variant="text" compact onPress={() => onboarding?.devReset('new')} />
            <Button label={DEV_LABELS.tourUpdate} variant="text" compact onPress={() => onboarding?.devReset('upd')} />
          </View>
        )}

        {!isPro && (
          <Button
            label={proPrice ? `${t('getPro')} · ${proPrice}` : t('getPro')}
            onPress={() => openPaywall()}
            style={styles.getPro}
          />
        )}

        <View style={styles.group}>
          <AboutGroup>
            <AboutRow icon={c => <GlobeIcon size={sizes.icon.l} color={c} />} label={t('language')} value={languageValue} onPress={() => setSheet('language')} />
            <AboutRow icon={c => <ThemeIcon size={sizes.icon.l} color={c} />} label={t('theme')} value={themeValue} onPress={() => setSheet('theme')} />
            <AboutRow icon={c => <RestoreIcon size={sizes.icon.l} color={c} />} label={t('restore')} onPress={restore} muted />
            <AboutRow icon={c => <ExternalIcon size={sizes.icon.l} color={c} />} label={t('privacy')} onPress={() => Linking.openURL(PRIVACY_URL)} />
            <AboutRow icon={c => <ExternalIcon size={sizes.icon.l} color={c} />} label={t('support')} onPress={() => Linking.openURL(SUPPORT_URL)} />
            <AboutRow icon={c => <StarIcon size={sizes.icon.l} color={c} />} label={t('rate')} onPress={() => Linking.openURL(RATE_URL)} last />
          </AboutGroup>
        </View>

        <View style={[styles.tips, { backgroundColor: colors.tipPanel }]}>
          <Text accessibilityRole="header" style={[type.titleS, { color: colors.categoryTitle }]}>
            {t('tipTitle')}
          </Text>
          <Text style={[type.bodyS, styles.tipText, { color: colors.subtitle }]}>{t('tipText')}</Text>
          <View style={styles.tipRow}>
            {TIPS.map(tp => (
              <TipCard
                key={tp.kind}
                kind={tp.kind}
                label={t(tp.label)}
                price={price(tp.id)}
                busy={purchasing === tp.id}
                thanked={thankedTips.includes(tp.id)}
                thanksLabel={t('thanks')}
                onPress={() => tip(tp.id)}
              />
            ))}
          </View>
          <Text style={[type.caption, styles.tipNote, { color: colors.subtitle }]}>{t('tipNote')}</Text>
        </View>
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

const DevSwitch = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.devRow}>
      <Text style={[type.body, styles.devLabel, { color: colors.title }]}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.brand, false: colors.border }} />
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
  app: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  icon: {
    width: sizes.appIcon,
    height: sizes.appIcon,
    borderRadius: radius.appIcon64,
  },
  appText: {
    flex: 1,
    minWidth: 0,
  },
  version: {
    marginTop: spacing.xs,
  },
  dev: {
    marginTop: spacing.sm,
    borderWidth: sizes.hairline,
    borderStyle: 'dashed',
    borderRadius: radius.control,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  devRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: sizes.buttonCompact,
  },
  devLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  getPro: {
    marginTop: spacing.m,
  },
  group: {
    marginTop: spacing.m,
  },
  tips: {
    marginTop: spacing.l,
    borderRadius: radius.sheet,
    padding: spacing.m,
  },
  tipText: {
    marginTop: spacing.s,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.m,
    alignItems: 'flex-start',
  },
  tipNote: {
    marginTop: spacing.sm,
    fontWeight: type.body.fontWeight,
  },
});
