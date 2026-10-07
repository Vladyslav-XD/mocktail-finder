import type { TextStyle } from 'react-native';

/**
 * Font families available in the app.
 * Sora (OFL-licensed) is loaded in App.tsx via expo-font before the splash finishes,
 * so these names are safe to use anywhere after the splash.
 */
export const fonts = {
  /** Brand wordmark ("Mocktail Finder" in the header). */
  brand: 'Sora_700Bold',
  brandMedium: 'Sora_600SemiBold',
} as const;

/**
 * The 1.2 type scale (README → Design tokens → Type). System font everywhere;
 * Sora only for the wordmark and the share-card title. Spread a style and add
 * the colour: `[type.body, { color: colors.title }]`.
 */
export const type = {
  titleL: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  titleM: { fontSize: 18, lineHeight: 22, fontWeight: '700' },
  titleS: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  bodyS: { fontSize: 14, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  button: { fontSize: 16, lineHeight: 22, fontWeight: '600' },
  /** Small pill text ("New", "Pro"). */
  pill: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
  wordmark: { fontFamily: fonts.brand, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  /** Share card, drawn at 1080 px wide. */
  cardTitle: { fontFamily: fonts.brand, fontSize: 76, lineHeight: 90 },
} as const satisfies Record<string, TextStyle>;
