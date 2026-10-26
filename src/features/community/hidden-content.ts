import type { DiscussionAuthorResponse, DiscussionResponse } from '@/contracts';

/**
 * Community content this account chose not to see. It lives on the device
 * only: reporting a post or blocking its author hides it from the feed
 * without telling the server.
 */
export interface HiddenContent {
  readonly reportedDiscussionIds: readonly string[];
  readonly blockedAuthors: readonly DiscussionAuthorResponse[];
}

export const EMPTY_HIDDEN_CONTENT: HiddenContent = {
  reportedDiscussionIds: [],
  blockedAuthors: [],
};

/** Missing or corrupt storage starts from empty instead of crashing. */
export function parseHiddenContent(raw: string | null): HiddenContent {
  if (!raw) return EMPTY_HIDDEN_CONTENT;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return EMPTY_HIDDEN_CONTENT;
  }
  if (!isRecord(value)) return EMPTY_HIDDEN_CONTENT;

  return {
    reportedDiscussionIds: Array.isArray(value.reportedDiscussionIds)
      ? value.reportedDiscussionIds.filter(
          (id): id is string => typeof id === 'string',
        )
      : [],
    blockedAuthors: Array.isArray(value.blockedAuthors)
      ? value.blockedAuthors.filter(isAuthor)
      : [],
  };
}

export function isDiscussionHidden(
  discussion: Pick<DiscussionResponse, 'id' | 'author'>,
  hidden: HiddenContent,
): boolean {
  return (
    hidden.reportedDiscussionIds.includes(discussion.id) ||
    hidden.blockedAuthors.some(
      (author) => author.user_id === discussion.author.user_id,
    )
  );
}

export function withReportedDiscussion(
  hidden: HiddenContent,
  discussionId: string,
): HiddenContent {
  if (hidden.reportedDiscussionIds.includes(discussionId)) return hidden;
  return {
    ...hidden,
    reportedDiscussionIds: [...hidden.reportedDiscussionIds, discussionId],
  };
}

export function withBlockedAuthor(
  hidden: HiddenContent,
  author: DiscussionAuthorResponse,
): HiddenContent {
  if (hidden.blockedAuthors.some((blocked) => blocked.user_id === author.user_id)) {
    return hidden;
  }
  return {
    ...hidden,
    blockedAuthors: [
      ...hidden.blockedAuthors,
      { user_id: author.user_id, display_name: author.display_name },
    ],
  };
}

export function withoutBlockedAuthor(
  hidden: HiddenContent,
  userId: string,
): HiddenContent {
  return {
    ...hidden,
    blockedAuthors: hidden.blockedAuthors.filter(
      (author) => author.user_id !== userId,
    ),
  };
}

function isAuthor(value: unknown): value is DiscussionAuthorResponse {
  return (
    isRecord(value) &&
    typeof value.user_id === 'string' &&
    typeof value.display_name === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
