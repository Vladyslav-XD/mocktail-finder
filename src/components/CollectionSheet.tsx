import React, { useEffect, useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { usePurchases } from '../purchases/PurchasesContext';
import { PRODUCT_IDS } from '../purchases/products';
import { PACKS } from '../data/packs';
import { packCover, packPhoto } from '../data/packPhotos';
import { packRecipeId } from '../data/packs';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { LockIcon } from './icons';

interface CollectionSheetProps {
  packId: string | null;
  onClose: () => void;
}

const THUMBS = 4;

/**
 * Locked collection (README → Screens → Collection sheet): cover, title, description,
 * four thumbnails, "Unlock collection · €2.99", "Everything · €12.99" (hidden when
 * owned), hint, Restore. Closes itself once the collection unlocks.
 */
export const CollectionSheet = ({ packId, onClose }: CollectionSheetProps) => {
  const { colors } = useTheme();
  const { t, lang } = useLanguage();
  const { price, purchasing, buy, restore, ownsEverything, unlockedPacks } = usePurchases();
  const pack = PACKS.find(p => p.id === packId);
  const unlocked = !!pack && unlockedPacks.includes(pack.id);

  const wasLocked = useRef(false);
  useEffect(() => {
    if (pack && !unlocked) wasLocked.current = true;
    if (pack && unlocked && wasLocked.current) {
      wasLocked.current = false;
      onClose();
    }
  }, [pack, unlocked, onClose]);

  const packPrice = pack ? price(pack.productId) : null;
  const everythingPrice = price(PRODUCT_IDS.everything);

  return (
    <BottomSheet visible={!!pack && !unlocked} onClose={onClose} closeLabel={t('a11yClose')}>
      {pack && (
        <>
          <Image source={packCover(pack.id)} style={styles.cover} resizeMode="cover" />
          <Text accessibilityRole="header" style={[type.titleL, styles.title, { color: colors.title }]}>
            {lang === 'uk' ? pack.title_uk : pack.title}
          </Text>
          <Text style={[type.body, styles.description, { color: colors.subtitle }]}>
            {lang === 'uk' ? pack.description_uk : pack.description}
          </Text>
          <View style={styles.thumbs}>
            {pack.recipes.slice(0, THUMBS).map(r => (
              <Image key={r.id} source={packPhoto(packRecipeId(pack.id, r.id))} style={styles.thumb} resizeMode="cover" />
            ))}
          </View>
          <Button
            label={packPrice ? `${t('unlockColl')} · ${packPrice}` : t('unavailable')}
            icon={c => <LockIcon size={sizes.icon.m} color={c} />}
            busy={purchasing === pack.productId}
            disabled={!packPrice || (!!purchasing && purchasing !== pack.productId)}
            onPress={() => buy(pack.productId)}
            style={styles.unlock}
          />
          {!ownsEverything && (
            <Button
              label={everythingPrice ? `${t('everything')} · ${everythingPrice}` : t('unavailable')}
              variant="outline"
              busy={purchasing === PRODUCT_IDS.everything}
              disabled={!everythingPrice || (!!purchasing && purchasing !== PRODUCT_IDS.everything)}
              onPress={() => buy(PRODUCT_IDS.everything)}
              style={styles.everything}
            />
          )}
          <Text style={[type.caption, styles.hint, { color: colors.subtitle }]}>{t('collHint')}</Text>
          <TouchableOpacity onPress={restore} activeOpacity={opacity.pressed} accessibilityRole="button" style={styles.restore}>
            <Text style={[type.button, { color: colors.brand }]}>{t('restore')}</Text>
          </TouchableOpacity>
        </>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: sizes.collectionCover,
    borderRadius: radius.card,
  },
  title: {
    marginTop: spacing.m,
  },
  description: {
    marginTop: spacing.s,
  },
  thumbs: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.m,
  },
  thumb: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.control,
  },
  unlock: {
    marginTop: spacing.m,
  },
  everything: {
    marginTop: spacing.sm,
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
});
