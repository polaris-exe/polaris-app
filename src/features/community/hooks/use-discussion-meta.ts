import { useQuery } from '@tanstack/react-query';

import { apiGetDiscussionMeta } from '../community-api';
import { communityKeys } from '../community-query-keys';

/** Popular tags, shown as quick filters above the feed. */
export function usePopularTags() {
  return useQuery({
    queryKey: communityKeys.meta(),
    queryFn: apiGetDiscussionMeta,
    staleTime: 5 * 60_000,
    select: (meta) => meta.tags.map((tag) => tag.name),
  });
}
