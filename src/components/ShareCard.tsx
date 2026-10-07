import React, { forwardRef } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '../theme/typography';
import { shareCardCanvas as C, shareCardColors as K, shareCardMetrics as M } from '../theme/shareCard';
import { LOGO_GLASS_PATH, LOGO_VIEWBOX } from './AnimatedMartiniIcon';
import { APP_STORE_URL } from '../utils/recipeText';

export interface ShareCardContent {
  photo: ImageSourcePropType | null;
  title: string;
  /** "Iced · Citrus", plus " · 0.0%" for collection drinks. */
  tags: string;
  /** One line of ingredients, at the servings shown on the recipe. */
  line: string;
}

/** Footer text; the App Store address without the scheme, as on the card design. */
const FOOTER = `Mocktail Finder · ${APP_STORE_URL.replace(/^https?:\/\//, '')}`;

/**
 * The 1080 × 1350 card, drawn at `scale` (1 = one point per card pixel). The share
 * sheet draws it once small for the preview and once at 1 / PixelRatio off-screen,
 * so the captured PNG is exactly 1080 × 1350 px on every iPhone.
 */
export const ShareCard = forwardRef<View, ShareCardContent & { scale: number }>(
  ({ photo, title, tags, line, scale }, ref) => {
    const s = (v: number) => v * scale;
    return (
      <View ref={ref} collapsable={false} style={{ width: s(C.width), height: s(C.height), backgroundColor: K.background }}>
        {photo ? (
          <Image source={photo} style={{ width: s(C.width), height: s(C.photoHeight) }} resizeMode="cover" />
        ) : (
          <LinearGradient colors={K.noPhoto} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: s(C.width), height: s(C.photoHeight) }} />
        )}
        <View style={{ paddingTop: s(M.padTop), paddingHorizontal: s(M.padSide) }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: fonts.brand,
              fontSize: s(M.title.fontSize),
              lineHeight: s(M.title.lineHeight),
              letterSpacing: s(M.title.letterSpacing),
              color: K.title,
            }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontSize: s(M.tags.fontSize), lineHeight: s(M.tags.lineHeight), marginTop: s(M.tags.marginTop), color: K.tags, fontWeight: '500' }}
          >
            {tags}
          </Text>
          <Text
            numberOfLines={2}
            style={{ fontSize: s(M.line.fontSize), lineHeight: s(M.line.lineHeight), marginTop: s(M.line.marginTop), color: K.text }}
          >
            {line}
          </Text>
          <View style={[styles.footer, { marginTop: s(M.footer.marginTop), gap: s(M.footer.gap) }]}>
            <Svg width={s(M.logo.width)} height={s(M.logo.height)} viewBox={LOGO_VIEWBOX}>
              <Path d={LOGO_GLASS_PATH} fill={K.logo} />
            </Svg>
            <Text
              numberOfLines={1}
              style={{ fontFamily: fonts.brand, fontSize: s(M.footer.fontSize), lineHeight: s(M.footer.lineHeight), color: K.title, flexShrink: 1 }}
            >
              {FOOTER}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
