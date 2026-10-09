import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigator } from './StackNavigator';
import { FavouritesScreen } from '../screens/FavouritesScreen';
import { RandomScreen } from '../screens/RandomScreen';
import { AddRecipeScreen } from '../screens/AddRecipeScreen';
import { MyBarScreen } from '../screens/MyBarScreen';
import { GlassIcon } from '../components/icons/barIcons';
import { CoachTarget } from '../onboarding/OnboardingContext';
import { SCREENS } from '../constants/screens';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { HomeIcon, HeartIcon, AddRecipeIcon } from '../components/icons';

const Tab = createBottomTabNavigator();

const TabBarButton = (props: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
    props.onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
    props.onPressOut?.(e);
  };

  return (
    <TouchableOpacity
      {...props}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
        {props.children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const TabNavigator = () => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.badgeBorder,
          height: 80,
          paddingHorizontal: 20,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.brandText,
        tabBarInactiveTintColor: colors.mainBtn,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen
        name={SCREENS.HOME_TAB}
        component={StackNavigator}
        options={{
          tabBarLabel: t('tabHome'),
          tabBarIcon: ({ color, focused }) => (
            <HomeIcon size={24} color={color} focused={focused} />
          )
        }}
      />
      <Tab.Screen
        name={SCREENS.FAVOURITES_TAB}
        component={FavouritesScreen}
        options={{
          tabBarLabel: t('tabFav'),
          tabBarIcon: ({ color, focused }) => (
            <HeartIcon size={24} color={color} focused={focused} />
          )
        }}
      />

      {/* 1.2: My Bar is the third tab, Add Recipe moves to fourth (prototype tab bar). */}
      <Tab.Screen
        name={SCREENS.MY_BAR_TAB}
        component={MyBarScreen}
        options={{
          tabBarLabel: t('tabKitchen'),
          tabBarIcon: ({ color }) => <GlassIcon size={24} color={color} />,
          // The tour's "What's at home?" step points at this tab.
          tabBarButton: props => (
            <CoachTarget id="bartab" style={{ flex: 1 }}>
              <TabBarButton {...props} />
            </CoachTarget>
          ),
        }}
      />
      <Tab.Screen
        name={SCREENS.ADD_RECIPE_TAB}
        component={AddRecipeScreen}
        options={{
          tabBarLabel: t('tabAdd'),
          tabBarIcon: ({ color, focused }) => (
            <AddRecipeIcon size={24} color={color} focused={focused} />
          )
        }}
      />
    </Tab.Navigator>
  );
};
