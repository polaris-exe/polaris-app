import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, radius, spacing } from './theme';

interface ChipProps {
  readonly label: string;
  readonly selected?: boolean;
  readonly onPress?: () => void;
}

/** Selectable pill used for filters and tags. Static when `onPress` is absent. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  selected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  label: { color: colors.fgMuted, fontSize: fontSize.sm },
  selectedLabel: { color: colors.accentStrong, fontWeight: '600' },
});
