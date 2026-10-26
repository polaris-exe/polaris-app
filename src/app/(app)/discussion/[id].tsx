import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { toUserMessage } from '@/api/api-error-message';
import { useAuth } from '@/features/auth/auth-context';
import { CATEGORY_LABELS, formatRelativeTime } from '@/features/community/community-format';
import { BookmarkButton } from '@/features/community/components/bookmark-button';
import { DiscussionMarkdown } from '@/features/community/components/discussion-markdown';
import { DiscussionMenuButton } from '@/features/community/components/discussion-menu-button';
import { VoteControl } from '@/features/community/components/vote-control';
import { useHiddenContent } from '@/features/community/hidden-content-context';
import { useDiscussionActions } from '@/features/community/hooks/use-discussion-actions';
import { useDiscussionDetail } from '@/features/community/hooks/use-discussion-detail';
import { useDiscussionMenu } from '@/features/community/hooks/use-discussion-menu';
import { Chip } from '@/ui/chip';
import { LoadingState, MessageState } from '@/ui/screen-states';
import { colors, fontSize, radius, spacing } from '@/ui/theme';

export default function DiscussionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const query = useDiscussionDetail(id);
  const { vote, toggleBookmark } = useDiscussionActions();
  const { isHidden } = useHiddenContent();
  const openMenu = useDiscussionMenu();
  const discussion = query.data;

  if (!discussion) {
    return query.isError ? (
      <MessageState
        title="Không mở được thảo luận"
        message={toUserMessage(query.error, {
          404: 'Thảo luận không tồn tại hoặc đã bị xoá.',
        })}
        actionLabel="Thử lại"
        onAction={() => void query.refetch()}
      />
    ) : (
      <LoadingState />
    );
  }

  if (isHidden(discussion)) {
    return (
      <MessageState
        title="Bạn đã ẩn bài viết này"
        message="Bài viết bị ẩn vì bạn đã báo cáo nó hoặc chặn tác giả."
        actionLabel="Quay lại"
        onAction={() => router.back()}
      />
    );
  }

  const isOwnPost = discussion.author.user_id === user?.id;

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerActions}>
              <BookmarkButton
                bookmarked={discussion.is_bookmarked}
                onPress={() => toggleBookmark(discussion)}
              />
              {isOwnPost ? null : (
                <DiscussionMenuButton
                  onPress={() => openMenu(discussion, () => router.back())}
                />
              )}
            </View>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => void query.refetch()}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.metaRow}>
          <Text style={styles.category}>
            {CATEGORY_LABELS[discussion.category]}
          </Text>
          {discussion.project_title ? (
            <Text style={styles.muted}>· {discussion.project_title}</Text>
          ) : null}
          {discussion.is_resolved ? (
            <Text style={styles.resolved}>Đã giải quyết</Text>
          ) : null}
        </View>

        <Text style={styles.title}>{discussion.title}</Text>

        <Text style={styles.muted}>
          {discussion.author.display_name} ·{' '}
          {formatRelativeTime(discussion.created_at)} ·{' '}
          {discussion.views_count} lượt xem
        </Text>

        {discussion.tags.length > 0 ? (
          <View style={styles.tags}>
            {discussion.tags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} />
            ))}
          </View>
        ) : null}

        <View style={styles.body}>
          <DiscussionMarkdown value={discussion.content} />
        </View>

        <View style={styles.actions}>
          <VoteControl
            horizontal
            votes={discussion.votes}
            myVote={discussion.my_vote}
            onVote={(pressed) => vote(discussion, pressed)}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  category: { color: colors.accentStrong, fontSize: fontSize.sm, fontWeight: '600' },
  resolved: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '600',
    backgroundColor: colors.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  title: { color: colors.fg, fontSize: fontSize.xl, fontWeight: '700', lineHeight: 30 },
  muted: { color: colors.fgMuted, fontSize: fontSize.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  body: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
});
