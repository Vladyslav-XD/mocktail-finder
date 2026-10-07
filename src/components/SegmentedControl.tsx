import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, shadows, sizes } from '../theme/spacing';
import { type } from '../theme/typography';

export interface Segment<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (key: T) => void;
}

/** Pill track with a raised thumb on the active segment (My Bar: What I have | Shopping list). */
export function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: colors.iconBG }]}>
      {segments.map((segment) => {
        const active = segment.key === value;
        return (
          <TouchableOpacity
            key={segment.key}
            activeOpacity={opacity.pressed}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(segment.key)}
            style={[
              styles.segment,
              active && [shadows.segment, { backgroundColor: colors.background, shadowColor: colors.shadow }],
            ]}
          >
            <Text
              numberOfLines={1}
              style={[type.label, styles.label, { color: active ? colors.title : colors.subtitle }]}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: sizes.segmentInset,
    borderRadius: radius.pill,
  },
  segment: {
    flex: 1,
    height: sizes.segment,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: type.button.fontWeight,
  },
});
