import { deriveEntitlements } from '../entitlements';
import { PACK_PRODUCT_IDS, PRODUCT_IDS } from '../products';
import { PACKS } from '../../data/packs';

describe('deriveEntitlements', () => {
  it('Free: nothing owned', () => {
    expect(deriveEntitlements([])).toEqual({ isPro: false, ownsEverything: false, unlockedPacks: [] });
  });

  it('Pro alone gives the tools, no collection', () => {
    expect(deriveEntitlements([PRODUCT_IDS.pro])).toEqual({ isPro: true, ownsEverything: false, unlockedPacks: [] });
  });

  it('one collection opens only that collection, not Pro', () => {
    expect(deriveEntitlements([PACK_PRODUCT_IDS['winter-warmers']])).toEqual({
      isPro: false,
      ownsEverything: false,
      unlockedPacks: ['winter-warmers'],
    });
  });

  it('Everything = Pro + every collection', () => {
    const e = deriveEntitlements([PRODUCT_IDS.everything]);
    expect(e.isPro).toBe(true);
    expect(e.ownsEverything).toBe(true);
    expect(e.unlockedPacks).toEqual(PACKS.map(p => p.id));
  });

  it('tips and unknown ids unlock nothing', () => {
    expect(deriveEntitlements([PRODUCT_IDS.tipSmall, PRODUCT_IDS.tipLarge, 'com.example.other'])).toEqual({
      isPro: false,
      ownsEverything: false,
      unlockedPacks: [],
    });
  });

  it('the six collection product ids are the ones fixed in TASKS.md', () => {
    expect(Object.values(PACK_PRODUCT_IDS).sort()).toEqual(
      ['dryjanuary', 'eveningclassics', 'winterwarmers', 'summergarden', 'tropicalescape', 'partybrunch']
        .map(x => `com.filonexperiencedesign.mocktailfinder.pack.${x}`)
        .sort()
    );
  });
});
