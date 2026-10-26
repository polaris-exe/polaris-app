import { useInfiniteQuery } from '@tanstack/react-query';

import { apiListDiscussions } from '../community-api';
import { communityKeys } from '../community-query-keys';
import type { DiscussionFilters } from '../discussion-query';

const PAGE_SIZE = 20;

/** Paginated feed (limit/offset) for infinite scroll. */
export function useDiscussionFeed(filters: DiscussionFilters) {
  const query = useInfiniteQuery({
    queryKey: communityKeys.list(filters),
    queryFn: ({ pageParam }) =>
      apiListDiscussions({ ...filters, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (count, page) => count + page.discussions.length,
        0,
      );
      // Stop on a short page too, in case `total` drifts while paging.
      return lastPage.discussions.length < PAGE_SIZE || loaded >= lastPage.total
        ? undefined
        : loaded;
    },
  });

  const discussions = query.data?.pages.flatMap((page) => page.discussions) ?? [];
  return { ...query, discussions };
}
