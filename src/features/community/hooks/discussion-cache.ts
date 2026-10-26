import type { InfiniteData, QueryClient } from '@tanstack/react-query';

import type { DiscussionListResponse, DiscussionResponse } from '@/contracts';

import { communityKeys } from '../community-query-keys';

type DiscussionPatch = Partial<
  Pick<DiscussionResponse, 'votes' | 'my_vote' | 'is_bookmarked'>
>;

/**
 * Applies a patch to one discussion everywhere it is cached — the detail
 * query and every loaded feed page — so vote/bookmark changes show up
 * immediately on both screens without refetching.
 */
export function patchDiscussionInCache(
  queryClient: QueryClient,
  id: string,
  patch: DiscussionPatch,
): void {
  queryClient.setQueryData<DiscussionResponse>(
    communityKeys.detail(id),
    (prev) => (prev ? { ...prev, ...patch } : prev),
  );

  queryClient.setQueriesData<InfiniteData<DiscussionListResponse>>(
    { queryKey: communityKeys.lists() },
    (prev) =>
      prev && {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          discussions: page.discussions.map((discussion) =>
            discussion.id === id ? { ...discussion, ...patch } : discussion,
          ),
        })),
      },
  );
}
