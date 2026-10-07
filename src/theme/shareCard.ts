/**
 * The share card (README → Screens → Share card): a 1080 × 1350 PNG that looks the
 * same in light and dark mode. Metrics are in card pixels; components multiply them
 * by the scale they draw at.
 */
export const shareCardCanvas = { width: 1080, height: 1350, photoHeight: 820 };

export const shareCardMetrics = {
  padTop: 52,
  padSide: 64,
  title: { fontSize: 76, lineHeight: 90, letterSpacing: -1 },
  tags: { fontSize: 34, lineHeight: 44, marginTop: 18 },
  line: { fontSize: 32, lineHeight: 46, marginTop: 22 },
  footer: { fontSize: 30, lineHeight: 40, marginTop: 30, gap: 14 },
  logo: { width: 25, height: 49 },
};

export const shareCardColors = {
  background: '#FFFFFF',
  title: '#101828',
  tags: '#009689',
  text: '#6A7282',
  logo: '#009689',
  noPhoto: ['#CCFBF1', '#BAE6FD'] as const,
};

/** The dark preview screen around the card. */
export const sharePreviewColors = {
  backdrop: 'rgba(11, 13, 16, 0.94)',
  text: '#FFFFFF',
  muted: 'rgba(255, 255, 255, 0.6)',
  closeFill: 'rgba(255, 255, 255, 0.14)',
  button: '#14B8A6',
};

/** Preview width on screen (prototype: 345 pt) and its corner radius. */
export const sharePreviewSize = { width: 345, radius: 14 };
