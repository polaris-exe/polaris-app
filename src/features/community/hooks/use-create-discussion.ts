import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateDiscussionDto } from '@/contracts';

import { apiCreateDiscussion, apiListProjects } from '../community-api';
import { communityKeys } from '../community-query-keys';

export function useCreateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDiscussionDto) => apiCreateDiscussion(dto),
    onSuccess: ({ discussion }) => {
      queryClient.setQueryData(communityKeys.detail(discussion.id), discussion);
      void queryClient.invalidateQueries({ queryKey: communityKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: communityKeys.meta() });
    },
  });
}

/** Published projects a question can be linked to. */
export function useProjectOptions() {
  return useQuery({
    queryKey: communityKeys.projects(),
    queryFn: apiListProjects,
    staleTime: 10 * 60_000,
    select: (projects) =>
      projects
        .filter((project) => project.status === 'published')
        .map((project) => ({ slug: project.slug, title: project.title })),
  });
}
