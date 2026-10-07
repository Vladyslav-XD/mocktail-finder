import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { SearchIcon } from './icons';
import { spacing } from '../theme/spacing';
import { useTheme } from '../context/ThemeContext';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export const SearchBar = ({ value, onChangeText, placeholder }: SearchBarProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.badgeBorder }]}>
      <SearchIcon size={20} color={colors.mainBtn} />
      <TextInput
        style={[styles.input, { color: colors.title }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.searchPlaceholder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: spacing.m,
    fontSize: 16,
  },
});
