import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { BottomSheet } from './BottomSheet';
import { CheckIcon } from './icons';

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionSheetProps<T extends string> {
  visible: boolean;
  title: string;
  hint?: string;
  options: Option<T>[];
  selected: T;
  /** Called with the choice; the sheet closes itself right after. */
  onSelect: (value: T) => void;
  onClose: () => void;
  /** VoiceOver label of the grabber ("Close"). */
  closeLabel: string;
}

/** One-choice sheet used by About → Language and About → Theme. */
export function OptionSheet<T extends string>({
  visible,
  title,
  hint,
  options,
  selected,
  onSelect,
  onClose,
  closeLabel,
}: OptionSheetProps<T>) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={closeLabel}>
      <Text accessibilityRole="header" style={[type.titleM, { color: colors.title }]}>
        {title}
      </Text>
      {!!hint && <Text style={[type.bodyS, styles.hint, { color: colors.subtitle }]}>{hint}</Text>}
      <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {options.map((option, index) => {
          const isSelected = option.value === selected;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={opacity.pressed}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              style={[
                styles.row,
                index > 0 && { borderTopWidth: sizes.hairline, borderTopColor: colors.border },
              ]}
            >
              <Text style={[type.body, { color: colors.title }]}>{option.label}</Text>
              {isSelected && <CheckIcon size={sizes.icon.l} color={colors.brand} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: spacing.s,
  },
  list: {
    marginTop: spacing.m,
    borderWidth: sizes.hairline,
    borderRadius: radius.group,
    overflow: 'hidden',
  },
  row: {
    height: sizes.optionRow,
    paddingHorizontal: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
