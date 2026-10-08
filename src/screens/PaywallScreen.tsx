import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePurchases } from '../purchases/PurchasesContext';
import { PRODUCT_IDS } from '../purchases/products';
import type { PaywallFeature } from '../purchases/usePaywall';
import { FeatureRow } from '../components/FeatureRow';
import { XIcon } from '../components/icons';
import { BulletListIcon, GlassIcon, ImageIcon, UsersIcon } from '../components/icons/barIcons';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { duration } from '../theme/motion';
import { PRIVACY_URL } from '../constants/links';

type ParamList = { Paywall: { feature?: PaywallFeature } | undefined };

const APP_ICON = require('../../assets/icon.png');

/**
 * Paywall (README → Screens → Paywall, States → Paywall). Opens only when invited
 * (usePaywall). Prices come only from StoreKit; a 0.6 s skeleton while they load; the
 * feature that brought the user here is highlighted and listed first.
 */
export const PaywallScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamList, 'Paywall'>>();
  const feature = route.params?.feature;
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const { t } = useLanguage();
  const { available, loading, price, isPro, ownsEverything, purchasing, buy, restore } = usePurchases();

  // The skeleton stays at least 0.6 s, so prices never flicker in.
  const [minWaitDone, setMinWaitDone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinWaitDone(true), duration.priceSkeleton);
    return () => clearTimeout(id);
  }, []);
  const skeleton = available && (loading || !minWaitDone);

  // A purchase made here closes the paywall once it unlocks.
  const startedFree = useRef(!isPro);
  useEffect(() => {
    if (startedFree.current && isPro) navigation.goBack();
  }, [isPro, navigation]);

  const rows: Array<{ key: PaywallFeature; title: string; sub: string; icon: (c: string) => React.ReactNode }> = [
    { key: 'mybar', title: t('f1t'), sub: t('f1s'), icon: c => <GlassIcon size={sizes.icon.l} color={c} /> },
    { key: 'shop', title: t('f2t'), sub: t('f2s'), icon: c => <BulletListIcon size={sizes.icon.l} color={c} /> },
    { key: 'serv', title: t('f3t'), sub: t('f3s'), icon: c => <UsersIcon size={sizes.icon.l} color={c} /> },
    { key: 'card', title: t('f4t'), sub: t('f4s'), icon: c => <ImageIcon size={sizes.icon.l} color={c} /> },
  ];
  const ordered = feature ? [...rows.filter(r => r.key === feature), ...rows.filter(r => r.key !== feature)] : rows;

  const proPrice = price(PRODUCT_IDS.pro);
  const everythingPrice = price(PRODUCT_IDS.everything);
  const proLabel = isPro ? t('youHavePro') : proPrice ? `${t('getPro')} · ${proPrice}` : t('unavailable');
  const everythingLabel = everythingPrice ? `${t('everything')} · ${everythingPrice}` : t('unavailable');

  return (
    // The top inset sits outside the scroll view, so scrolled text never runs under the status bar.
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} accessibilityViewIsModal>
      {/* Plain background, no gradient: the bar needs dark text in light mode. */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: spacing.s, paddingBottom: insets.bottom + spacing.xl }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={opacity.pressed}
          accessibilityRole="button"
          accessibilityLabel={t('a11yClose')}
          style={[styles.close, { backgroundColor: colors.iconBG }]}
        >
          <XIcon size={sizes.icon.l} color={colors.title} />
        </TouchableOpacity>

        <Image source={APP_ICON} style={styles.icon} accessibilityIgnoresInvertColors />
        <Text accessibilityRole="header" style={[type.titleL, styles.title, { color: colors.title }]}>
          {t('obProT')}
        </Text>
        <Text style={[type.body, styles.subtitle, { color: colors.subtitle }]}>{t('pwSub')}</Text>

        <View style={styles.rows}>
          {ordered.map(r => (
            <FeatureRow key={r.key} icon={r.icon} title={r.title} subtitle={r.sub} highlighted={r.key === feature} />
          ))}
        </View>

        {!available && (
          <View style={[styles.down, { backgroundColor: colors.iconBG }]}>
            <Text style={[type.bodyS, { color: colors.categoryTitle }]}>{t('storeDown')}</Text>
          </View>
        )}

        <PriceButton
          variant="filled"
          label={proLabel}
          skeletonLabel={t('getPro')}
          skeleton={skeleton && !isPro}
          busy={purchasing === PRODUCT_IDS.pro}
          disabled={isPro || !proPrice || !!purchasing}
          onPress={() => buy(PRODUCT_IDS.pro)}
          style={styles.firstButton}
        />
        {!ownsEverything && (
          <PriceButton
            variant="outline"
            label={everythingLabel}
            skeletonLabel={t('everything')}
            skeleton={skeleton}
            busy={purchasing === PRODUCT_IDS.everything}
            disabled={!everythingPrice || !!purchasing}
            onPress={() => buy(PRODUCT_IDS.everything)}
            style={styles.secondButton}
          />
        )}
        <Text style={[type.caption, styles.hint, { color: colors.subtitle }]}>{t('pwHint')}</Text>
        <TouchableOpacity onPress={restore} activeOpacity={opacity.pressed} accessibilityRole="button" style={styles.restore}>
          <Text style={[type.button, { color: colors.brand }]}>{t('restore')}</Text>
        </TouchableOpacity>
        <Text style={[type.caption, styles.note, { color: colors.subtitle }]}>
          {t('pricesNote')}{' '}
          <Text accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL)} style={styles.link}>
            {t('privacy')}
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
};

interface PriceButtonProps {
  variant: 'filled' | 'outline';
  label: string;
  skeletonLabel: string;
  skeleton: boolean;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
  style?: object;
}

/** A buy button: "Get Pro · €5.99", a skeleton for the price while loading, or a spinner while buying. */
const PriceButton = ({ variant, label, skeletonLabel, skeleton, busy, disabled, onPress, style }: PriceButtonProps) => {
  const { colors } = useTheme();
  const filled = variant === 'filled';
  const fg = filled ? colors.onBrand : colors.brand;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || skeleton || busy}
      activeOpacity={opacity.pressed}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || skeleton, busy }}
      accessibilityLabel={skeleton ? skeletonLabel : label}
      style={[
        styles.button,
        filled ? { backgroundColor: colors.brand } : [styles.outline, { borderColor: colors.brand }],
        disabled && !busy && !skeleton && styles.dim,
        style,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : skeleton ? (
        <>
          <Text style={[type.button, { color: fg }]}>{skeletonLabel} ·</Text>
          <View style={[styles.skeleton, { backgroundColor: filled ? colors.skeletonOnBrand : colors.iconBG }]} />
        </>
      ) : (
        <Text numberOfLines={1} style={[type.button, { color: fg }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
  },
  close: {
    alignSelf: 'flex-end',
    width: sizes.roundButton,
    height: sizes.roundButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: sizes.appIconSmall,
    height: sizes.appIconSmall,
    borderRadius: radius.appIcon56,
  },
  title: {
    marginTop: spacing.m,
  },
  subtitle: {
    marginTop: spacing.s,
  },
  rows: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  down: {
    marginTop: spacing.ml,
    borderRadius: radius.control,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.m,
  },
  button: {
    height: sizes.button,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
  },
  outline: {
    borderWidth: sizes.outline,
  },
  dim: {
    opacity: opacity.disabled,
  },
  firstButton: {
    marginTop: spacing.ml,
  },
  secondButton: {
    marginTop: spacing.sm,
  },
  skeleton: {
    width: sizes.skeletonPrice,
    height: sizes.skeletonHeight,
    borderRadius: radius.checkbox,
  },
  hint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontWeight: type.body.fontWeight,
  },
  restore: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    padding: spacing.s,
  },
  note: {
    marginTop: spacing.m,
    textAlign: 'center',
    fontWeight: type.body.fontWeight,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
