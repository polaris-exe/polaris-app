import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { DiscussionListResponse, DiscussionResponse } from '@/contracts';

import { apiGetDiscussion } from '../community-api';
import { communityKeys } from '../community-query-keys';

/**
 * Discussion detail. Seeds from the feed cache so the screen renders
 * instantly when opened from a card, then refetches (which also bumps the
 * server-side view count).
 */
export function useDiscussionDetail(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: communityKeys.detail(id),
    queryFn: async () => (await apiGetDiscussion(id)).discussion,
    placeholderData: () => findInFeeds(queryClient, id),
  });
}

function findInFeeds(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): DiscussionResponse | undefined {
  const feeds = queryClient.getQueriesData<{
    pages: DiscussionListResponse[];
  }>({ queryKey: communityKeys.lists() });

  for (const [, data] of feeds) {
    for (const page of data?.pages ?? []) {
      const match = page.discussions.find((discussion) => discussion.id === id);
      if (match) return match;
    }
  }
  return undefined;
}
