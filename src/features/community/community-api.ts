import type {
  CreateDiscussionDto,
  DiscussionBookmarkResponse,
  DiscussionDetailResponse,
  DiscussionListResponse,
  DiscussionMetaResponse,
  DiscussionVoteDirection,
  DiscussionVoteResponse,
  ProjectCatalogEntry,
} from '@/contracts';
import { apiClient } from '@/api/default-api-client';

import { buildDiscussionQuery, type DiscussionPageParams } from './discussion-query';

export async function apiListDiscussions(
  params: DiscussionPageParams,
): Promise<DiscussionListResponse> {
  const result = await apiClient.get(
    `/discussions?${buildDiscussionQuery(params)}`,
  );
  return result as DiscussionListResponse;
}

export async function apiGetDiscussion(
  id: string,
): Promise<DiscussionDetailResponse> {
  const result = await apiClient.get(`/discussions/${encodeURIComponent(id)}`);
  return result as DiscussionDetailResponse;
}

export async function apiCreateDiscussion(
  dto: CreateDiscussionDto,
): Promise<DiscussionDetailResponse> {
  const result = await apiClient.post('/discussions', dto);
  return result as DiscussionDetailResponse;
}

export async function apiVoteDiscussion(
  id: string,
  direction: DiscussionVoteDirection,
): Promise<DiscussionVoteResponse> {
  const result = await apiClient.post(
    `/discussions/${encodeURIComponent(id)}/vote`,
    { direction },
  );
  return result as DiscussionVoteResponse;
}

export async function apiToggleDiscussionBookmark(
  id: string,
): Promise<DiscussionBookmarkResponse> {
  const result = await apiClient.post(
    `/discussions/${encodeURIComponent(id)}/bookmark`,
    {},
  );
  return result as DiscussionBookmarkResponse;
}

export async function apiGetDiscussionMeta(): Promise<DiscussionMetaResponse> {
  const result = await apiClient.get('/discussions/meta');
  return result as DiscussionMetaResponse;
}

/** Project catalog — used only to let a question be linked to a project. */
export async function apiListProjects(): Promise<
  readonly ProjectCatalogEntry[]
> {
  const result = await apiClient.get('/projects');
  return result as readonly ProjectCatalogEntry[];
}
