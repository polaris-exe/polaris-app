import type { DiscussionFilters } from './discussion-query';

export const communityKeys = {
  all: ['community'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: (filters: DiscussionFilters) =>
    [...communityKeys.lists(), filters] as const,
  detail: (id: string) => [...communityKeys.all, 'detail', id] as const,
  meta: () => [...communityKeys.all, 'meta'] as const,
  projects: () => ['projects', 'catalog'] as const,
};
