import { createNavigationContainerRef } from '@react-navigation/native';

/** Lets code outside a screen (the paywall provider) navigate. */
export const navigationRef = createNavigationContainerRef<any>();
