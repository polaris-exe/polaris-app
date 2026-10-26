import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import type { DiscussionResponse } from '@/contracts';
import { toUserMessage } from '@/api/api-error-message';
import { useAuth } from '@/features/auth/auth-context';
import { DiscussionCard } from '@/features/community/components/discussion-card';
import { FeedFilters } from '@/features/community/components/feed-filters';
import type { DiscussionFilters } from '@/features/community/discussion-query';
import { useHiddenContent } from '@/features/community/hidden-content-context';
import { useDiscussionActions } from '@/features/community/hooks/use-discussion-actions';
import { useDiscussionFeed } from '@/features/community/hooks/use-discussion-feed';
import { useDiscussionMenu } from '@/features/community/hooks/use-discussion-menu';
import { usePopularTags } from '@/features/community/hooks/use-discussion-meta';
import { LoadingState, MessageState } from '@/ui/screen-states';
import { colors, radius, spacing } from '@/ui/theme';

export default function CommunityFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState<DiscussionFilters>({ sort: 'recent' });
  const feed = useDiscussionFeed(filters);
  const popularTags = usePopularTags();
  const { vote, toggleBookmark } = useDiscussionActions();
  const { isHidden } = useHiddenContent();
  const openMenu = useDiscussionMenu();
  const discussions = feed.discussions.filter((discussion) => !isHidden(discussion));

  const openDiscussion = useCallback(
    (discussion: DiscussionResponse) =>
      router.push({ pathname: '/discussion/[id]', params: { id: discussion.id } }),
    [router],
  );
  const filterByTag = useCallback(
    (tag: string) => setFilters((prev) => ({ ...prev, tag })),
    [],
  );

  const header = (
    <FeedFilters
      filters={filters}
      popularTags={(popularTags.data ?? []).slice(0, 10)}
      onChange={setFilters}
    />
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={discussions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DiscussionCard
            discussion={item}
            onOpen={openDiscussion}
            onVote={vote}
            onToggleBookmark={toggleBookmark}
            onTagPress={filterByTag}
            onOpenMenu={item.author.user_id === user?.id ? undefined : openMenu}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          feed.isPending ? (
            <LoadingState />
          ) : feed.isError ? (
            <MessageState
              title="Không tải được thảo luận"
              message={toUserMessage(feed.error)}
              actionLabel="Thử lại"
              onAction={() => void feed.refetch()}
            />
          ) : (
            <MessageState
              title={filters.bookmarked ? 'Chưa lưu bài nào' : 'Chưa có thảo luận'}
              message={
                filters.bookmarked
                  ? 'Nhấn biểu tượng lưu trên bài viết để xem lại ở đây.'
                  : 'Hãy là người đầu tiên đặt câu hỏi.'
              }
            />
          )
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <ActivityIndicator color={colors.accent} style={styles.footer} />
          ) : undefined
        }
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) {
            void feed.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching && !feed.isFetchingNextPage}
            onRefresh={() => {
              void feed.refetch();
              void popularTags.refetch();
            }}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Đặt câu hỏi"
        onPress={() => router.push('/discussion/new')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={28} color={colors.accentFg} />
      </Pressable>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { paddingTop: spacing.md, paddingBottom: 96, flexGrow: 1 },
  separator: { height: spacing.md },
  footer: { marginVertical: spacing.lg },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPressed: { opacity: 0.85 },
});
