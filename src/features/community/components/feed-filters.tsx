import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { DISCUSSION_CATEGORIES } from '@/contracts';
import { Chip } from '@/ui/chip';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

import { CATEGORY_LABELS, SORT_OPTIONS } from '../community-format';
import type { DiscussionFilters } from '../discussion-query';

const SEARCH_DEBOUNCE_MS = 400;

interface FeedFiltersProps {
  readonly filters: DiscussionFilters;
  readonly popularTags: readonly string[];
  readonly onChange: (next: DiscussionFilters) => void;
}

/** Search box + category / saved / sort / tag chips above the feed. */
export function FeedFilters({ filters, popularTags, onChange }: FeedFiltersProps) {
  const [searchText, setSearchText] = useState(filters.search ?? '');

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if ((filters.search ?? '') !== searchText.trim()) {
        onChange({ ...filters, search: searchText.trim() || undefined });
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchText, filters, onChange]);

  const tags = filters.tag && !popularTags.includes(filters.tag)
    ? [filters.tag, ...popularTags]
    : popularTags;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.fgSubtle} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Tìm câu hỏi, nội dung, tag…"
          placeholderTextColor={colors.fgSubtle}
          selectionColor={colors.accent}
          style={styles.searchInput}
          returnKeyType="search"
          autoCapitalize="none"
          clearButtonMode="while-editing"
          accessibilityLabel="Tìm kiếm thảo luận"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Chip
          label="Tất cả"
          selected={!filters.category && !filters.bookmarked}
          onPress={() => onChange({ ...filters, category: undefined, bookmarked: undefined })}
        />
        <Chip
          label="Đã lưu"
          selected={Boolean(filters.bookmarked)}
          onPress={() => onChange({ ...filters, category: undefined, bookmarked: true })}
        />
        {DISCUSSION_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={CATEGORY_LABELS[category]}
            selected={filters.category === category}
            onPress={() => onChange({ ...filters, category, bookmarked: undefined })}
          />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {SORT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={(filters.sort ?? 'recent') === option.value}
            onPress={() => onChange({ ...filters, sort: option.value })}
          />
        ))}
        {tags.length > 0 ? <View style={styles.divider} /> : null}
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={`#${tag}`}
            selected={filters.tag === tag}
            onPress={() =>
              onChange({ ...filters, tag: filters.tag === tag ? undefined : tag })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm, paddingBottom: spacing.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.fg,
    fontSize: fontSize.md,
  },
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' },
  divider: { width: 1, height: 20, backgroundColor: colors.border },
});
