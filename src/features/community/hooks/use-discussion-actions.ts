import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { DiscussionResponse } from '@/contracts';

import {
  apiToggleDiscussionBookmark,
  apiVoteDiscussion,
} from '../community-api';
import { communityKeys } from '../community-query-keys';
import { applyVote, nextVoteDirection } from '../community-format';
import { patchDiscussionInCache } from './discussion-cache';

type VoteSnapshot = Pick<DiscussionResponse, 'votes' | 'my_vote'>;

/**
 * Vote and bookmark with optimistic updates, shared by the feed card and the
 * detail screen. On failure the previous values are restored.
 */
export function useDiscussionActions() {
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: (vars: {
      discussion: DiscussionResponse;
      pressed: 'up' | 'down';
    }) =>
      apiVoteDiscussion(
        vars.discussion.id,
        nextVoteDirection(vars.discussion.my_vote, vars.pressed),
      ),
    onMutate: ({ discussion, pressed }): VoteSnapshot => {
      const direction = nextVoteDirection(discussion.my_vote, pressed);
      patchDiscussionInCache(
        queryClient,
        discussion.id,
        applyVote(discussion.votes, discussion.my_vote, direction),
      );
      return { votes: discussion.votes, my_vote: discussion.my_vote };
    },
    onError: (_error, { discussion }, previous) => {
      if (previous) patchDiscussionInCache(queryClient, discussion.id, previous);
    },
    onSuccess: (result) => {
      patchDiscussionInCache(queryClient, result.discussion_id, {
        votes: result.votes,
        my_vote: result.my_vote,
      });
      // Feeds sorted by votes may need a new order.
      void queryClient.invalidateQueries({
        queryKey: communityKeys.lists(),
        refetchType: 'none',
      });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (discussion: DiscussionResponse) =>
      apiToggleDiscussionBookmark(discussion.id),
    onMutate: (discussion) => {
      patchDiscussionInCache(queryClient, discussion.id, {
        is_bookmarked: !discussion.is_bookmarked,
      });
      return discussion.is_bookmarked;
    },
    onError: (_error, discussion, previous) => {
      if (previous !== undefined) {
        patchDiscussionInCache(queryClient, discussion.id, {
          is_bookmarked: previous,
        });
      }
    },
    onSuccess: (result) => {
      patchDiscussionInCache(queryClient, result.discussion_id, {
        is_bookmarked: result.is_bookmarked,
      });
      // The "Đã lưu" feed must gain/lose this item on next view.
      void queryClient.invalidateQueries({
        queryKey: communityKeys.lists(),
        refetchType: 'none',
      });
    },
  });

  return {
    vote: (discussion: DiscussionResponse, pressed: 'up' | 'down') =>
      voteMutation.mutate({ discussion, pressed }),
    toggleBookmark: (discussion: DiscussionResponse) =>
      bookmarkMutation.mutate(discussion),
    voteError: voteMutation.error,
    bookmarkError: bookmarkMutation.error,
  };
}
