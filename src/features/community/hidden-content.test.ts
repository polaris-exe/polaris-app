import { describe, expect, it } from 'vitest';

import {
  EMPTY_HIDDEN_CONTENT,
  isDiscussionHidden,
  parseHiddenContent,
  withBlockedAuthor,
  withoutBlockedAuthor,
  withReportedDiscussion,
} from './hidden-content';

const alice = { user_id: 'u-alice', display_name: 'Alice' };
const bob = { user_id: 'u-bob', display_name: 'Bob' };

describe('parseHiddenContent', () => {
  it('starts empty when nothing is stored or the value is corrupt', () => {
    expect(parseHiddenContent(null)).toEqual(EMPTY_HIDDEN_CONTENT);
    expect(parseHiddenContent('not json')).toEqual(EMPTY_HIDDEN_CONTENT);
    expect(parseHiddenContent('42')).toEqual(EMPTY_HIDDEN_CONTENT);
  });

  it('round-trips stored content and drops malformed entries', () => {
    const raw = JSON.stringify({
      reportedDiscussionIds: ['d1', 7, 'd2'],
      blockedAuthors: [alice, { user_id: 'u-x' }, 'bob'],
    });
    expect(parseHiddenContent(raw)).toEqual({
      reportedDiscussionIds: ['d1', 'd2'],
      blockedAuthors: [alice],
    });
  });
});

describe('isDiscussionHidden', () => {
  const hidden = withBlockedAuthor(
    withReportedDiscussion(EMPTY_HIDDEN_CONTENT, 'd1'),
    alice,
  );

  it('hides reported posts and every post by a blocked author', () => {
    expect(isDiscussionHidden({ id: 'd1', author: bob }, hidden)).toBe(true);
    expect(isDiscussionHidden({ id: 'd9', author: alice }, hidden)).toBe(true);
    expect(isDiscussionHidden({ id: 'd9', author: bob }, hidden)).toBe(false);
  });
});

describe('hidden content updates', () => {
  it('ignores duplicate reports and blocks', () => {
    const reported = withReportedDiscussion(EMPTY_HIDDEN_CONTENT, 'd1');
    expect(withReportedDiscussion(reported, 'd1')).toBe(reported);

    const blocked = withBlockedAuthor(EMPTY_HIDDEN_CONTENT, alice);
    expect(withBlockedAuthor(blocked, { ...alice, display_name: 'A' })).toBe(blocked);
  });

  it('unblocks only the given author', () => {
    const blocked = withBlockedAuthor(withBlockedAuthor(EMPTY_HIDDEN_CONTENT, alice), bob);
    expect(withoutBlockedAuthor(blocked, alice.user_id).blockedAuthors).toEqual([bob]);
  });
});
