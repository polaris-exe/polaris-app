import type { DiscussionCategory, DiscussionSort } from '@/contracts';

export interface DiscussionFilters {
  readonly category?: DiscussionCategory;
  readonly tag?: string;
  readonly search?: string;
  readonly sort?: DiscussionSort;
  readonly bookmarked?: boolean;
}

export interface DiscussionPageParams extends DiscussionFilters {
  readonly limit: number;
  readonly offset: number;
}

/**
 * Builds the GET /discussions query string by hand — React Native's
 * URLSearchParams is incomplete. Empty filters are omitted.
 */
export function buildDiscussionQuery(params: DiscussionPageParams): string {
  const entries: [string, string][] = [];
  if (params.category) entries.push(['category', params.category]);
  if (params.tag) entries.push(['tag', params.tag]);
  const search = params.search?.trim();
  if (search) entries.push(['search', search]);
  if (params.sort) entries.push(['sort', params.sort]);
  if (params.bookmarked) entries.push(['bookmarked', 'true']);
  entries.push(['limit', String(params.limit)]);
  entries.push(['offset', String(params.offset)]);

  return entries
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}
