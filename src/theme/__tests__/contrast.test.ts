import { darkColors, lightColors } from '../colors';

/** WCAG 2.2 contrast ratio of two #RRGGBB colours. */
function ratio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('text contrast (4.5:1)', () => {
  it.each([
    ['light', lightColors],
    ['dark', darkColors],
  ])('%s: brandText and subtitle on background and surface', (_name, c) => {
    for (const fg of [c.brandText, c.subtitle]) {
      for (const bg of [c.background, c.surface]) {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('light brandText is teal-700, dark brandText is the brand colour', () => {
    expect(lightColors.brandText).toBe('#00796B');
    expect(darkColors.brandText).toBe(darkColors.brand);
  });
});
