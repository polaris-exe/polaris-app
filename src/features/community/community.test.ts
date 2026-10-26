import { describe, expect, it } from 'vitest';

import { buildDiscussionQuery } from './discussion-query';
import {
  applyVote,
  creatableCategories,
  formatRelativeTime,
  nextVoteDirection,
  parseTagsInput,
  validateDiscussionDraft,
} from './community-format';

describe('buildDiscussionQuery', () => {
  it('omits empty filters and encodes values', () => {
    expect(
      buildDiscussionQuery({ search: '  rate limit & co ', limit: 20, offset: 40 }),
    ).toBe('search=rate%20limit%20%26%20co&limit=20&offset=40');
  });

  it('includes category, tag, sort and bookmarked', () => {
    expect(
      buildDiscussionQuery({
        category: 'study',
        tag: 'go',
        sort: 'votes',
        bookmarked: true,
        limit: 20,
        offset: 0,
      }),
    ).toBe('category=study&tag=go&sort=votes&bookmarked=true&limit=20&offset=0');
  });
});

describe('voting', () => {
  it('toggles off when pressing the active direction', () => {
    expect(nextVoteDirection('up', 'up')).toBe('none');
    expect(nextVoteDirection('up', 'down')).toBe('down');
    expect(nextVoteDirection(null, 'up')).toBe('up');
  });

  it('computes optimistic vote totals', () => {
    expect(applyVote(5, null, 'up')).toEqual({ votes: 6, my_vote: 'up' });
    expect(applyVote(5, 'up', 'down')).toEqual({ votes: 3, my_vote: 'down' });
    expect(applyVote(5, 'down', 'none')).toEqual({ votes: 6, my_vote: null });
  });
});

describe('creatableCategories', () => {
  it('keeps announcements to staff', () => {
    expect(creatableCategories('student')).not.toContain('announcements');
    expect(creatableCategories('admin')).toContain('announcements');
  });
});

describe('parseTagsInput', () => {
  it('splits, strips #, lowercases and dedupes', () => {
    expect(parseTagsInput('go, Redis ,#cache go')).toEqual([
      'go',
      'redis',
      'cache',
    ]);
  });
});

describe('validateDiscussionDraft', () => {
  it('enforces backend limits', () => {
    const errors = validateDiscussionDraft({
      title: 'abc',
      content: 'short',
      tags: Array.from({ length: 9 }, (_, i) => `t${i}`),
    });
    expect(errors.title).toBeDefined();
    expect(errors.content).toBeDefined();
    expect(errors.tags).toBeDefined();
  });

  it('accepts a valid draft', () => {
    expect(
      validateDiscussionDraft({
        title: 'Lỗi Redis timeout',
        content: 'Mình bị timeout khi gọi Redis ở stage 3.',
        tags: ['redis'],
      }),
    ).toEqual({});
  });
});

describe('formatRelativeTime', () => {
  const now = Date.parse('2026-10-26T10:00:00Z');
  it('formats minutes, hours and days', () => {
    expect(formatRelativeTime('2026-10-26T09:59:40Z', now)).toBe('vừa xong');
    expect(formatRelativeTime('2026-10-26T09:15:00Z', now)).toBe('45 phút trước');
    expect(formatRelativeTime('2026-10-26T07:00:00Z', now)).toBe('3 giờ trước');
    expect(formatRelativeTime('2026-10-20T10:00:00Z', now)).toBe('6 ngày trước');
  });
});
