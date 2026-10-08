/**
 * Colour tokens (Figma collection App/Colors + the 1.2 handoff, README → Design tokens).
 * UI code reads these through `useTheme().colors`; no hex or rgba literal belongs in a screen.
 *
 * The first block keeps the 1.1 names the existing screens use. The second block is
 * the handoff's vocabulary: the 1.1 tokens the app had not named yet, then the ones
 * new in 1.2. Where both blocks hold the same value (brand = activeBadgeBG) the 1.1
 * name goes away as each screen is rebuilt.
 */
export type ThemeColors = {
  categoryTitle: string;
  badgeBG: string;
  badgeTitle: string;
  badgeBorder: string;
  activeBadgeBG: string;
  favoriteHeart: string;
  description: string;
  text: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  mainBtn: string;
  background: string;
  iconBG: string;
  surface: string;
  error: string;

  // 1.1 tokens named in the handoff
  border: string;
  textMuted: string;
  brand: string;
  onBrand: string;
  scrim: string;
  /** Two stops, top-left → bottom-right (135°). */
  headerGradient: readonly [string, string];
  headerSubtitle: string;
  /** Text and icons drawn on the header gradient or on the error colour. */
  onGradient: string;
  mint50: string;
  mint500: string;

  // New in 1.2
  tipPanel: string;
  toastBg: string;
  toastText: string;
  floatButton: string;
  tabbarBg: string;
  sheetBg: string;
  coachDim: string;
  /** Drawn 3 px wide (see `sizes.coachRing`). */
  coachRing: string;
  /** Translucent fill for round buttons on the header gradient. */
  onGradientFill: string;
  /** Base colour of every shadow; opacity lives in `shadows`. */
  shadow: string;
  /** "Unlocked" pill on a pack cover: the same in both themes (prototype). */
  unlockedPillBg: string;
  unlockedPillText: string;
  /** Price skeleton inside a filled brand button while products load. */
  skeletonOnBrand: string;
};

export const lightColors: ThemeColors = {
  categoryTitle: '#364153',
  badgeBG: '#ffffff',
  badgeTitle: '#364153',
  badgeBorder: '#E5E7EB',
  activeBadgeBG: '#009689',
  favoriteHeart: '#FB2C36',

  description: '#F0FDFA',
  text: '#ffffff',
  title: '#101828',
  subtitle: '#6A7282',

  searchPlaceholder: 'rgba(10, 10, 10, 0.5)',
  mainBtn: '#99A1AF',

  background: '#ffffff',
  iconBG: '#F3F4F6',
  surface: '#ffffff',
  error: '#DC2626',

  border: '#E5E7EB',
  textMuted: '#99A1AF',
  brand: '#009689',
  onBrand: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.45)',
  headerGradient: ['#00BBA7', '#0092B8'],
  headerSubtitle: '#F0FDFA',
  onGradient: '#FFFFFF',
  mint50: '#F0FDFA',
  mint500: '#14B8A6',

  tipPanel: '#F0FDFA',
  toastBg: '#101828',
  toastText: '#FFFFFF',
  floatButton: '#FFFFFF',
  tabbarBg: '#FFFFFF',
  sheetBg: '#FFFFFF',
  coachDim: 'rgba(8, 12, 20, 0.62)',
  coachRing: '#009689',
  onGradientFill: 'rgba(255, 255, 255, 0.2)',
  shadow: '#101828',
  unlockedPillBg: '#FFFFFF',
  unlockedPillText: '#009689',
  skeletonOnBrand: 'rgba(255, 255, 255, 0.38)',
};

export const darkColors: ThemeColors = {
  categoryTitle: '#E5E7EB',
  badgeBG: '#1F2937',
  badgeTitle: '#E5E7EB',
  badgeBorder: '#374151',
  activeBadgeBG: '#14B8A6',
  favoriteHeart: '#FB2C36',

  description: '#111827',
  text: '#111827',
  title: '#F9FAFB',
  subtitle: '#9CA3AF',

  searchPlaceholder: 'rgba(255, 255, 255, 0.5)',
  mainBtn: '#9CA3AF',

  background: '#111827',
  iconBG: '#374151',
  surface: '#1F2937',
  error: '#EF4444',

  border: '#374151',
  textMuted: '#9CA3AF',
  brand: '#14B8A6',
  onBrand: '#FFFFFF',
  scrim: 'rgba(0, 0, 0, 0.45)',
  headerGradient: ['#00786F', '#005F78'],
  headerSubtitle: '#F0FDFA',
  onGradient: '#FFFFFF',
  mint50: '#F0FDFA',
  mint500: '#14B8A6',

  tipPanel: 'rgba(20, 184, 166, 0.14)',
  toastBg: '#F9FAFB',
  toastText: '#101828',
  floatButton: '#1F2937',
  tabbarBg: '#1F2937',
  sheetBg: '#1F2937',
  coachDim: 'rgba(8, 12, 20, 0.62)',
  coachRing: '#14B8A6',
  onGradientFill: 'rgba(255, 255, 255, 0.2)',
  shadow: '#000000',
  unlockedPillBg: '#FFFFFF',
  unlockedPillText: '#009689',
  skeletonOnBrand: 'rgba(255, 255, 255, 0.38)',
};

export const colors = lightColors;
