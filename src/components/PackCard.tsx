import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { packCover } from '../data/packPhotos';
import { CheckIcon, LockIcon } from './icons';

interface PackCardProps {
  packId: string;
  title: string;
  subtitle: string;
  locked: boolean;
  /** StoreKit price, or null (store unreachable): the pill then shows only the lock. */
  price: string | null;
  unlockedLabel: string;
  onPress: () => void;
}

/** Collection card on Home: 160 wide, cover 130 high, lock + price or "Unlocked". */
export const PackCard = ({ packId, title, subtitle, locked, price, unlockedLabel, onPress }: PackCardProps) => {
  const { colors } = useTheme();
  const status = locked ? price ?? '' : unlockedLabel;

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, status].filter(Boolean).join(', ')}
      style={styles.card}
    >
      <View style={[styles.cover, { backgroundColor: colors.iconBG }]}>
        <Image source={packCover(packId)} style={styles.image} resizeMode="cover" />
        {locked ? (
          <View style={[styles.pill, { backgroundColor: colors.brand }]}>
            <LockIcon size={sizes.icon.s} color={colors.onBrand} strokeWidth={sizes.stroke.regular} />
            {!!price && <Text style={[type.caption, styles.pillText, { color: colors.onBrand }]}>{price}</Text>}
          </View>
        ) : (
          <View style={[styles.pill, { backgroundColor: colors.unlockedPillBg }]}>
            <CheckIcon size={sizes.icon.s} color={colors.unlockedPillText} strokeWidth={sizes.stroke.bold} />
            <Text style={[type.caption, styles.pillText, { color: colors.unlockedPillText }]}>{unlockedLabel}</Text>
          </View>
        )}
      </View>
      <Text style={[type.titleS, styles.title, { color: colors.title }]}>{title}</Text>
      <Text style={[type.caption, styles.subtitle, { color: colors.subtitle }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: sizes.packCard,
  },
  cover: {
    height: sizes.packCover,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pill: {
    position: 'absolute',
    top: spacing.s,
    left: spacing.s,
    height: sizes.pillLock,
    paddingHorizontal: spacing.s,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pillText: {
    fontWeight: type.button.fontWeight,
  },
  title: {
    marginTop: spacing.s,
  },
  subtitle: {
    marginTop: spacing.xs,
    fontWeight: type.body.fontWeight,
  },
});
