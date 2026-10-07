import { NO_DEV_OVERRIDES, ownedFromTransactions, withDevOverrides } from '../ownership';
import { PACK_PRODUCT_IDS, PRODUCT_IDS } from '../products';
import { errorKind } from '../storeKit';

const tx = (productId: string, extra: object = {}) => ({ productId, purchaseState: 'purchased' as const, ...extra });

describe('ownedFromTransactions', () => {
  it('keeps purchased non-consumables once', () => {
    expect(ownedFromTransactions([tx(PRODUCT_IDS.pro), tx(PRODUCT_IDS.pro), tx(PACK_PRODUCT_IDS['party-brunch'])])).toEqual([
      PRODUCT_IDS.pro,
      PACK_PRODUCT_IDS['party-brunch'],
    ]);
  });

  it('Ask to Buy stays locked until it arrives as purchased', () => {
    expect(ownedFromTransactions([{ productId: PRODUCT_IDS.pro, purchaseState: 'pending' }])).toEqual([]);
  });

  it('a refunded or revoked purchase locks again', () => {
    expect(ownedFromTransactions([tx(PRODUCT_IDS.everything, { revocationDateIOS: 1_760_000_000_000 })])).toEqual([]);
  });

  it('tips and unknown products are never owned', () => {
    expect(ownedFromTransactions([tx(PRODUCT_IDS.tipMedium), tx('com.other.app.thing')])).toEqual([]);
  });
});

describe('withDevOverrides', () => {
  it('adds what the switches say and never removes a real purchase', () => {
    const real = [PRODUCT_IDS.pro];
    expect(withDevOverrides(real, NO_DEV_OVERRIDES, PRODUCT_IDS)).toEqual(real);
    expect(
      withDevOverrides(real, { ...NO_DEV_OVERRIDES, everything: true, packs: [PACK_PRODUCT_IDS['dry-january']] }, PRODUCT_IDS)
    ).toEqual([PRODUCT_IDS.pro, PRODUCT_IDS.everything, PACK_PRODUCT_IDS['dry-january']]);
  });
});

describe('errorKind', () => {
  it('cancel is silent, Ask to Buy is pending, anything else failed', () => {
    expect(errorKind({ code: 'user-cancelled' })).toBe('cancelled');
    expect(errorKind({ code: 'deferred-payment' })).toBe('pending');
    expect(errorKind({ code: 'pending' })).toBe('pending');
    expect(errorKind({ code: 'network-error' })).toBe('failed');
    expect(errorKind({})).toBe('failed');
  });
});

describe('isStoreSupported', () => {
  const load = (environment: string) => {
    let fn: () => boolean = () => true;
    jest.isolateModules(() => {
      jest.doMock('expo-constants', () => ({
        __esModule: true,
        default: { executionEnvironment: environment },
        ExecutionEnvironment: { Bare: 'bare', Standalone: 'standalone', StoreClient: 'storeClient' },
      }));
      fn = require('../storeKit').isStoreSupported;
    });
    return fn;
  };

  it('is off in Expo Go, so the app shows "store unreachable" instead of crashing', () => {
    expect(load('storeClient')()).toBe(false);
  });

  it('is on in a development or App Store build on iOS', () => {
    expect(load('bare')()).toBe(true);
    expect(load('standalone')()).toBe(true);
  });
});
