import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { CheckIcon } from './icons';

interface CheckRowProps {
  label: string;
  /** Shown on the right, e.g. "100 ml + 60 ml". */
  amount?: string;
  checked: boolean;
  onToggle: () => void;
  onDelete: () => void;
  /** Text of the red swipe action, from the dictionary ("Delete"). */
  deleteLabel: string;
}

/**
 * Shopping-list row. Tap ticks it (box fills, name dims); swipe left reveals a red
 * Delete. VoiceOver gets the same delete as a custom action, since it cannot swipe.
 */
export const CheckRow = ({ label, amount, checked, onToggle, onDelete, deleteLabel }: CheckRowProps) => {
  const { colors } = useTheme();
  const swipeable = useRef<Swipeable>(null);

  const renderDelete = () => (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      accessibilityRole="button"
      onPress={() => {
        swipeable.current?.close();
        onDelete();
      }}
      style={[styles.delete, { backgroundColor: colors.error }]}
    >
      <Text style={[type.button, { color: colors.onGradient }]}>{deleteLabel}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.frame, { borderColor: colors.border, backgroundColor: colors.error }]}>
      <Swipeable
        ref={swipeable}
        renderRightActions={renderDelete}
        rightThreshold={sizes.swipeAction / 2}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          activeOpacity={opacity.pressed}
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={amount ? `${label}, ${amount}` : label}
          accessibilityActions={[{ name: 'delete', label: deleteLabel }]}
          onAccessibilityAction={(e) => e.nativeEvent.actionName === 'delete' && onDelete()}
          style={[styles.row, { backgroundColor: colors.surface }]}
        >
          {checked ? (
            <View style={[styles.box, { backgroundColor: colors.brand }]}>
              <CheckIcon size={sizes.icon.s} color={colors.onBrand} strokeWidth={sizes.stroke.bold} />
            </View>
          ) : (
            <View style={[styles.box, styles.boxEmpty, { borderColor: colors.textMuted }]} />
          )}
          <Text
            numberOfLines={1}
            style={[type.body, styles.label, { color: checked ? colors.textMuted : colors.title }]}
          >
            {label}
          </Text>
          {!!amount && <Text style={[type.bodyS, { color: colors.subtitle }]}>{amount}</Text>}
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    height: sizes.checkRow,
    borderWidth: sizes.hairline,
    borderRadius: radius.control,
    overflow: 'hidden',
  },
  row: {
    height: sizes.checkRow - 2 * sizes.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.m,
  },
  box: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: radius.checkbox,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxEmpty: {
    borderWidth: sizes.outline,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  delete: {
    width: sizes.swipeAction,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
