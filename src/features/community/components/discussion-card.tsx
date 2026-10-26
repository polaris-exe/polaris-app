import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DiscussionResponse } from '@/contracts';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

import { CATEGORY_LABELS, formatRelativeTime } from '../community-format';
import { BookmarkButton } from './bookmark-button';
import { DiscussionMenuButton } from './discussion-menu-button';
import { VoteControl } from './vote-control';

interface DiscussionCardProps {
  readonly discussion: DiscussionResponse;
  readonly onOpen: (discussion: DiscussionResponse) => void;
  readonly onVote: (discussion: DiscussionResponse, pressed: 'up' | 'down') => void;
  readonly onToggleBookmark: (discussion: DiscussionResponse) => void;
  readonly onTagPress: (tag: string) => void;
  /** Report/block menu; omitted on the viewer's own posts. */
  readonly onOpenMenu?: (discussion: DiscussionResponse) => void;
}

export const DiscussionCard = memo(function DiscussionCard({
  discussion,
  onOpen,
  onVote,
  onToggleBookmark,
  onTagPress,
  onOpenMenu,
}: DiscussionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(discussion)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <VoteControl
        votes={discussion.votes}
        myVote={discussion.my_vote}
        onVote={(pressed) => onVote(discussion, pressed)}
      />

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>
            {CATEGORY_LABELS[discussion.category]}
          </Text>
          {discussion.project_title ? (
            <Text style={styles.project} numberOfLines={1}>
              · {discussion.project_title}
            </Text>
          ) : null}
          {discussion.is_resolved ? (
            <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {discussion.title}
        </Text>
        {discussion.excerpt ? (
          <Text style={styles.excerpt} numberOfLines={2}>
            {discussion.excerpt}
          </Text>
        ) : null}

        {discussion.tags.length > 0 ? (
          <View style={styles.tags}>
            {discussion.tags.slice(0, 4).map((tag) => (
              <Pressable key={tag} hitSlop={4} onPress={() => onTagPress(tag)}>
                <Text style={styles.tag}>#{tag}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>
            {discussion.author.display_name} ·{' '}
            {formatRelativeTime(discussion.created_at)}
          </Text>
          <View style={styles.footerRight}>
            <Ionicons name="eye-outline" size={14} color={colors.fgSubtle} />
            <Text style={styles.footerText}>{discussion.views_count}</Text>
            <BookmarkButton
              bookmarked={discussion.is_bookmarked}
              onPress={() => onToggleBookmark(discussion)}
            />
            {onOpenMenu ? (
              <View style={styles.menu}>
                <DiscussionMenuButton onPress={() => onOpenMenu(discussion)} />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surface2 },
  body: { flex: 1, gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  category: {
    color: colors.accentStrong,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  project: { color: colors.fgMuted, fontSize: fontSize.xs, flexShrink: 1 },
  title: {
    color: colors.fg,
    fontSize: fontSize.md,
    fontWeight: '600',
    lineHeight: 22,
  },
  excerpt: { color: colors.fgMuted, fontSize: fontSize.sm, lineHeight: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { color: colors.info, fontSize: fontSize.xs },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  menu: { marginLeft: spacing.sm },
  footerText: { color: colors.fgSubtle, fontSize: fontSize.xs, flexShrink: 1 },
});
