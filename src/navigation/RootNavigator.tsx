import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { AboutScreen } from '../screens/AboutScreen';
import { SCREENS } from '../constants/screens';
import { duration, easing } from '../theme/motion';

const Stack = createStackNavigator();

/** Push: 340 ms on the shared easing (README → Design tokens → Motion). */
const push = { animation: 'timing' as const, config: { duration: duration.push, easing } };

/**
 * Above the tabs: screens that cover the whole app (About now; the paywall joins in
 * task 8). The tabs keep their own stacks underneath.
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
  </Stack.Navigator>
);
