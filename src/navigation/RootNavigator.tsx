import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { AboutScreen } from '../screens/AboutScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SCREENS } from '../constants/screens';
import { duration, easing } from '../theme/motion';

const Stack = createStackNavigator();

/** Push 340 ms, paywall 400 ms, both on the shared easing (README → Design tokens → Motion). */
const push = { animation: 'timing' as const, config: { duration: duration.push, easing } };
const paywall = { animation: 'timing' as const, config: { duration: duration.paywall, easing } };

/**
 * Above the tabs: screens that cover the whole app — About (pushed) and the paywall
 * (modal). The tabs keep their own stacks underneath.
 */
export const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      transitionSpec: { open: push, close: push },
    }}
  >
    <Stack.Screen name={SCREENS.MAIN_TABS} component={TabNavigator} />
    <Stack.Screen name={SCREENS.ABOUT} component={AboutScreen} />
    <Stack.Screen
      name={SCREENS.PAYWALL}
      component={PaywallScreen}
      options={{
        presentation: 'modal',
        gestureDirection: 'vertical',
        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        transitionSpec: { open: paywall, close: paywall },
      }}
    />
  </Stack.Navigator>
);
