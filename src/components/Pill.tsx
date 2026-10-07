import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';

/** Small brand pill next to a title or in a coach bubble: "New", "Pro". */
export const Pill = ({ label }: { label: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors.brand }]}>
      <Text style={[type.pill, { color: colors.onBrand }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    height: sizes.pill,
    paddingHorizontal: spacing.s,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
});
