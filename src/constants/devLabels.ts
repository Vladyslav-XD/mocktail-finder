/**
 * DEV switches (About → long-press the version line, `__DEV__` builds only). Never
 * shown in TestFlight or the App Store, so they stay English; the two that the copy
 * doc has (simPro, simPack) come from the dictionary instead.
 */
export const DEV_LABELS = {
  title: 'DEV',
  everything: 'Simulate Everything',
  pack: (title: string) => `Simulate ${title}`,
  storeDown: 'Store unreachable',
};
