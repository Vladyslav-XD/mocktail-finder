/** Spacing scale 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 (README → Design tokens). */
export const spacing = {
  xs: 4,
  s: 8,
  sm: 12,
  m: 16,
  ml: 20,
  l: 24,
  xl: 32,
  xxl: 48,
  /** Side padding of every screen. */
  screen: 24,
};

/** Corner radii. */
export const radius = {
  /** Buttons and inputs. */
  control: 12,
  /** Chips and anything fully rounded. */
  pill: 999,
  card: 16,
  /** Top corners of a bottom sheet. */
  sheet: 20,
  /** Bordered option list inside a sheet, feature rows. */
  group: 14,
  checkbox: 6,
  grabber: 9,
  appIcon64: 14,
  appIcon56: 13,
};

/** Fixed sizes of controls, so screens never type a raw number. */
export const sizes = {
  button: 48,
  buttonCompact: 44,
  input: 48,
  chip: 36,
  chipRemovable: 32,
  tagBadge: 34,
  pill: 20,
  pillLock: 24,
  packCard: 160,
  recipePhoto: 300,
  appIcon: 64,
  appIconSmall: 56,
  collectionCover: 170,
  tipCard: 106,
  skeletonPrice: 48,
  skeletonHeight: 14,
  stepNumber: 20,
  /** Tick circle on an ingredient tile. */
  tickCircle: 20,
  /** Ingredient tile, bar search field. */
  tile: 44,
  packCover: 130,
  /** Header logo (the martini glass), drawn 24 × 48. */
  logo: 24,
  /** Lifts the glass so its foot sits on the wordmark baseline (Sora 28/34 descender). */
  logoBaseline: 6,
  roundButton: 36,
  stepperButton: 36,
  segment: 34,
  segmentInset: 3,
  checkbox: 22,
  checkRow: 48,
  swipeAction: 88,
  optionRow: 50,
  lockCircle: 48,
  featureIcon: 44,
  emptyIcon: 56,
  emptyIconLarge: 64,
  /** Empty-state text column (prototype max-width). */
  emptyTextWidth: 260,
  grabberWidth: 36,
  grabberHeight: 5,
  bullet: 6,
  hairline: 1,
  outline: 1.5,
  coachRing: 3,
  icon: { xs: 12, s: 14, m: 18, l: 20, xl: 22, xxl: 26 },
  /** Icon stroke weights: outline icons, and bold marks (ticks, ×) at small sizes. */
  stroke: { regular: 2, bold: 3 },
  /** Gap kept between a sheet's top edge and the top of the screen. */
  sheetTopGap: 110,
  /** Toast sits this far above the bottom edge (clears the tab bar). */
  toastBottom: 104,
};

/** Opacity steps. */
export const opacity = {
  pressed: 0.8,
  /** Free user looking at a Pro control. */
  locked: 0.5,
  disabled: 0.5,
};

/** Shadow presets; colour comes from `colors.shadow`. */
export const shadows = {
  toast: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6 },
  segment: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.14, shadowRadius: 3, elevation: 1 },
};
