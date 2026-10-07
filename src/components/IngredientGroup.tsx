import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { opacity, radius, sizes, spacing } from '../theme/spacing';
import { type } from '../theme/typography';
import { CheckIcon } from './icons';
import { ChevronDownIcon } from './icons/barIcons';

export interface Tile {
  key: string;
  label: string;
  on: boolean;
}

interface IngredientGroupProps {
  icon: (color: string) => React.ReactNode;
  title: string;
  /** "a of b ticked" (brand) when something is ticked, otherwise the count or hint. */
  subtitle: string;
  hasTicks: boolean;
  open: boolean;
  onToggle: () => void;
  tiles: Tile[];
  onTile: (key: string) => void;
}

/** Tiles two to a row (the prototype's 2-column grid). */
function pairs<T>(list: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += 2) out.push(list.slice(i, i + 2));
  return out;
}

/** One collapsible group of the Add ingredients sheet; ticked tiles get a brand border and mint fill. */
export const IngredientGroup = ({ icon, title, subtitle, hasTicks, open, onToggle, tiles, onTile }: IngredientGroupProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.group, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <TouchableOpacity
        activeOpacity={opacity.pressed}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}, ${subtitle}`}
        style={styles.head}
      >
        <View style={[styles.icon, { backgroundColor: hasTicks ? colors.brand : colors.iconBG }]}>
          {icon(hasTicks ? colors.onBrand : colors.brand)}
        </View>
        <View style={styles.titles}>
          <Text style={[type.titleS, { color: colors.title }]}>{title}</Text>
          <Text style={[type.caption, { color: hasTicks ? colors.brand : colors.subtitle }]}>{subtitle}</Text>
        </View>
        <View style={open && styles.flipped}>
          <ChevronDownIcon size={sizes.icon.m} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
      {open && (
        <View style={styles.grid}>
          {pairs(tiles).map(pair => (
            <View key={pair[0].key} style={styles.row}>
              {pair.map(tile => (
                <TouchableOpacity
                  key={tile.key}
                  activeOpacity={opacity.pressed}
                  onPress={() => onTile(tile.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: tile.on }}
                  style={[
                    styles.tile,
                    tile.on
                      ? { borderColor: colors.brand, backgroundColor: colors.tipPanel }
                      : { borderColor: colors.border, backgroundColor: colors.background },
                  ]}
                >
                  {tile.on ? (
                    <View style={[styles.tick, { backgroundColor: colors.brand }]}>
                      <CheckIcon size={sizes.icon.xs} color={colors.onBrand} strokeWidth={sizes.stroke.bold} />
                    </View>
                  ) : (
                    <View style={[styles.tick, styles.tickEmpty, { borderColor: colors.textMuted }]} />
                  )}
                  <Text style={[type.label, styles.tileLabel, { color: colors.title }]}>{tile.label}</Text>
                </TouchableOpacity>
              ))}
              {pair.length === 1 && <View style={styles.cell} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  group: {
    borderWidth: sizes.hairline,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  icon: {
    width: sizes.roundButton,
    height: sizes.roundButton,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    minWidth: 0,
  },
  flipped: {
    transform: [{ rotate: '180deg' }],
  },
  grid: {
    gap: spacing.s,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  cell: {
    flex: 1,
  },
  tile: {
    flex: 1,
    minHeight: sizes.tile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.s,
    borderRadius: radius.control,
    borderWidth: sizes.hairline,
  },
  tick: {
    width: sizes.tickCircle,
    height: sizes.tickCircle,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickEmpty: {
    borderWidth: sizes.outline,
  },
  tileLabel: {
    flex: 1,
    minWidth: 0,
  },
});
