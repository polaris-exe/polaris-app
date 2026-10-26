import type {
  DiscussionCategory,
  DiscussionSort,
  DiscussionVoteDirection,
  UserRole,
} from '@/contracts';

export const CATEGORY_LABELS: Record<DiscussionCategory, string> = {
  announcements: 'Thông báo',
  general: 'Thảo luận chung',
  study: 'Học tập',
  showcase: 'Khoe dự án',
};

// 'answers' is omitted: the backend has no answers API yet, so every
// discussion has answers_count = 0 and that sort would be meaningless.
export const SORT_OPTIONS: readonly { value: DiscussionSort; label: string }[] =
  [
    { value: 'recent', label: 'Mới nhất' },
    { value: 'votes', label: 'Nhiều vote' },
  ];

/**
 * Categories a user may post in. The backend does not restrict
 * announcements by role, so the app keeps them to staff.
 */
export function creatableCategories(role: UserRole): DiscussionCategory[] {
  const base: DiscussionCategory[] = ['general', 'study', 'showcase'];
  return role === 'student' ? base : ['announcements', ...base];
}

/** Pressing the active arrow clears the vote; otherwise switch to it. */
export function nextVoteDirection(
  current: 'up' | 'down' | null,
  pressed: 'up' | 'down',
): DiscussionVoteDirection {
  return current === pressed ? 'none' : pressed;
}

/** Local optimistic vote result, replaced by the server response. */
export function applyVote(
  votes: number,
  current: 'up' | 'down' | null,
  direction: DiscussionVoteDirection,
): { votes: number; my_vote: 'up' | 'down' | null } {
  const weight = (vote: 'up' | 'down' | null) =>
    vote === 'up' ? 1 : vote === 'down' ? -1 : 0;
  const next = direction === 'none' ? null : direction;
  return { votes: votes - weight(current) + weight(next), my_vote: next };
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.floor((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const date = new Date(iso);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Limits mirror polaris-be CreateDiscussionBody.
export const DISCUSSION_LIMITS = {
  titleMin: 4,
  titleMax: 200,
  contentMin: 10,
  contentMax: 10_000,
  tagsMax: 8,
  tagLengthMax: 32,
} as const;

/** "go, Redis ,#cache" → ['go', 'redis', 'cache'] (deduped, lowercase). */
export function parseTagsInput(input: string): string[] {
  const tags = input
    .split(/[,\s]+/u)
    .map((tag) => tag.replace(/^#/u, '').trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(tags)];
}

export interface DiscussionDraftErrors {
  title?: string;
  content?: string;
  tags?: string;
}

export function validateDiscussionDraft(draft: {
  readonly title: string;
  readonly content: string;
  readonly tags: readonly string[];
}): DiscussionDraftErrors {
  const errors: DiscussionDraftErrors = {};
  const title = draft.title.trim();
  const content = draft.content.trim();
  const L = DISCUSSION_LIMITS;

  if (title.length < L.titleMin || title.length > L.titleMax) {
    errors.title = `Tiêu đề cần từ ${L.titleMin} đến ${L.titleMax} ký tự.`;
  }
  if (content.length < L.contentMin || content.length > L.contentMax) {
    errors.content = `Nội dung cần từ ${L.contentMin} đến ${L.contentMax.toLocaleString('vi-VN')} ký tự.`;
  }
  if (draft.tags.length > L.tagsMax) {
    errors.tags = `Tối đa ${L.tagsMax} tag.`;
  } else if (draft.tags.some((tag) => tag.length > L.tagLengthMax)) {
    errors.tags = `Mỗi tag tối đa ${L.tagLengthMax} ký tự.`;
  }
  return errors;
}
