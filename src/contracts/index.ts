// AUTO-SYNCED from polaris-be/packages/contracts/src/index.ts.
// Do not edit by hand — run `pnpm sync:contracts` instead.

export const USER_ROLES = ['student', 'instructor', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'disabled'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_PLANS = ['free', 'pro', 'pro_max'] as const;
export type UserPlan = (typeof USER_PLANS)[number];

export interface AuthUserProfile {
  readonly id: string;
  readonly email: string;
  readonly display_name: string;
  readonly role: UserRole;
  readonly plan: UserPlan;
  readonly plan_expires_at?: string | null;
  readonly status: UserStatus;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AuthSessionPayload {
  readonly access_token: string;
  readonly token_type: 'Bearer';
  readonly expires_at: string;
  readonly refresh_token: string;
  readonly refresh_expires_at: string;
}

export interface AuthSessionResponse {
  readonly user: AuthUserProfile;
  readonly session: AuthSessionPayload;
}

export interface CurrentUserResponse {
  readonly user: AuthUserProfile;
}

export interface UpdatePlanRequest {
  readonly plan: UserPlan;
}

// A progressively-revealed hint attached to a curriculum stage. Lower tiers are
// gentle nudges; higher tiers get progressively more concrete (up to a
// near-solution). Surfaced in the learner workspace behind an explicit reveal.
export interface StageHint {
  readonly tier: 1 | 2 | 3;
  readonly title: string;
  readonly body: string;
}

export interface ProjectStageApiExample {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly endpoint: string;
  readonly request_body?: string;
  readonly response_200?: string;
}

export interface ProjectStageStarterFile {
  readonly filename: string;
  readonly purpose: string;
}

export interface ProjectStageArchitectureHint {
  readonly label: string;
  readonly description: string;
  readonly icon?: string;
}

export interface ProjectStageSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
}

export interface ProjectStage {
  readonly order: number;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly objectives: readonly string[];
  readonly status: 'draft' | 'published';
  readonly type?: 'theory' | 'coding';
  readonly chapter?: string;
  readonly active_test_suite_version_id?: string | null;
  readonly hints?: readonly StageHint[];
  readonly api_example?: ProjectStageApiExample;
  readonly starter_files?: readonly ProjectStageStarterFile[];
  readonly architecture_hints?: readonly ProjectStageArchitectureHint[];
  readonly sections?: readonly ProjectStageSection[];
  readonly lesson_md?: string;
}

// The catalog only exposes template metadata. The internal repository_url is
// an infra detail (a Gitea migration source), never sent to clients.
export interface StarterTemplate {
  readonly language: string;
  readonly branch?: string;
}

export interface ProjectCatalogEntry {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced';
  readonly status: 'draft' | 'published';
  // True when the caller's plan does not include this project. Locked entries
  // keep stage skeletons (titles/objectives) but omit paid content fields
  // (lesson_md, hints).
  readonly locked: boolean;
  readonly starter_templates: readonly StarterTemplate[];
  readonly stages: readonly ProjectStage[];
  readonly created_at: string;
  readonly updated_at: string;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface ProjectEnrollment {
  readonly id: string;
  readonly user_id: string;
  readonly project_id: string;
  readonly project_slug: string;
  readonly current_stage_slug: string;
  readonly status: EnrollmentStatus;
  readonly started_at: string;
  readonly completed_at: string | null;
  readonly updated_at: string;
}

export interface EnrollmentResponse {
  readonly enrollment: ProjectEnrollment;
}

export interface EnrollmentsListResponse {
  readonly enrollments: readonly ProjectEnrollment[];
}

export interface ProjectSubmission {
  readonly id: string;
  readonly user_id: string;
  readonly project_id: string;
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly source_type: 'git' | 'archive';
  readonly git_url: string | null;
  readonly commit_sha: string | null;
  readonly artifact_uri: string;
  readonly status: 'pending' | 'running' | 'success' | 'failed';
  readonly error_message: string | null;
  readonly created_at: string;
}

export type RunnerJobStatus =
  | 'queued'
  | 'preparing'
  | 'running'
  | 'processing_results'
  | 'passed'
  | 'failed'
  | 'platform_error'
  | 'timed_out'
  | 'canceled';

export interface SubmissionStatusResponse {
  readonly status: RunnerJobStatus;
  readonly updated_at: string;
  readonly error_message: string | null;
  readonly timing: {
    readonly queued_at?: string;
    readonly preparing_at?: string;
    readonly running_at?: string;
    readonly processing_results_at?: string;
    readonly finished_at?: string;
  };
}

export interface CreateGitSubmissionDto {
  readonly git_url?: string;
  readonly commit_sha?: string;
}

export interface SubmissionResponse {
  readonly submission: ProjectSubmission;
}

export interface SubmissionsListResponse {
  readonly submissions: readonly ProjectSubmission[];
  readonly page?: number;
  readonly page_size?: number;
  readonly total?: number;
}

export interface TestSuiteTestCase {
  readonly id: string;
  readonly name: string;
  readonly visibility: 'visible' | 'hidden';
  readonly description?: string;
}

export interface CreateTestSuiteTestCaseDto {
  readonly id: string;
  readonly name: string;
  readonly visibility: 'visible' | 'hidden';
  readonly description?: string;
}

export interface CreateTestSuiteVersionDto {
  readonly version: string;
  readonly runner_image: string;
  readonly runtime: string;
  readonly runtime_version: string;
  readonly tests: readonly CreateTestSuiteTestCaseDto[];
}

export interface TestSuiteVersionResponse {
  readonly id: string;
  readonly project_id: string;
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly version: string;
  readonly runner_image: string;
  readonly runtime: string;
  readonly runtime_version: string;
  readonly checksum: string | null;
  readonly tests: readonly TestSuiteTestCase[];
  readonly status: 'draft' | 'published';
  readonly artifact_key: string | null;
  readonly published_at: string | null;
  readonly created_at: string;
}

export interface TestSuiteVersionsListResponse {
  readonly versions: readonly TestSuiteVersionResponse[];
}

export interface HttpCallSummaryResponse {
  readonly method: string;
  readonly path: string;
  readonly status: number; // 0 = the request never produced a response
  readonly duration_ms: number;
  readonly request_body?: string;
  readonly body_excerpt?: string;
}

export interface HttpTraceEntryResponse extends HttpCallSummaryResponse {
  readonly seq: number;
  readonly error?: string;
}

export interface EndpointLatencyStatResponse {
  readonly endpoint: string;
  readonly requests: number;
  readonly p50_ms: number;
  readonly p95_ms: number;
  readonly max_ms: number;
}

export interface TestCaseResultResponse {
  readonly test_case_id: string;
  readonly name: string;
  readonly status: 'passed' | 'failed' | 'skipped';
  readonly duration_ms: number;
  readonly message: string | null;
  readonly visibility: 'visible' | 'hidden';
  // The HTTP request this assertion was checking, when the harness traced one.
  readonly http?: HttpCallSummaryResponse;
}

export interface FeedbackFindingResponse {
  readonly severity: 'info' | 'warning' | 'error';
  readonly category: string;
  readonly title: string;
  readonly explanation: string;
  readonly recommendation: string;
}

export interface ResultSummaryResponse {
  readonly id: string;
  readonly submission_id: string;
  readonly enrollment_id: string;
  readonly project_id: string;
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly status: 'passed' | 'failed' | 'timed_out' | 'platform_error';
  readonly score: number;
  readonly tests_total: number;
  readonly tests_passed: number;
  readonly tests_failed: number;
  readonly duration_ms: number;
  readonly memory_mb: number | null;
  readonly test_results: readonly TestCaseResultResponse[];
  readonly feedback_findings: readonly FeedbackFindingResponse[];
  // Populated for results graded after these fields existed; older results
  // report the null/empty defaults.
  readonly error_kind: 'oom_killed' | null;
  readonly cpu_pct: number | null;
  readonly latency_stats: readonly EndpointLatencyStatResponse[];
  readonly http_log: readonly HttpTraceEntryResponse[];
  readonly stderr_log: string | null;
  readonly logs_key: string | null;
  readonly sanitized_logs: string;
  readonly created_at: string;
}

export type AnalyticsEventType =
  | 'project_enrolled'
  | 'submission_created'
  | 'runner_started'
  | 'result_completed'
  | 'stage_completed'
  | 'project_completed';

export interface AnalyticsEventResponse {
  readonly id: string;
  readonly user_id: string;
  readonly enrollment_id: string | null;
  readonly project_id: string | null;
  readonly project_slug: string | null;
  readonly stage_slug: string | null;
  readonly submission_id: string | null;
  readonly event_type: AnalyticsEventType;
  readonly metadata: Record<string, unknown> | null;
  readonly occurred_at: string;
}

export interface AnalyticsCompletionFunnelResponse {
  readonly project_slug: string;
  readonly enrolled: number;
  readonly completed: number;
  readonly completion_rate: number;
}

export interface AnalyticsStageFunnelEntry {
  readonly stage_slug: string;
  readonly started: number;
  readonly completed: number;
}

export interface AnalyticsStageFunnelResponse {
  readonly project_slug: string;
  readonly stages: readonly AnalyticsStageFunnelEntry[];
}

export interface AnalyticsFeedbackLatencyResponse {
  readonly project_slug: string;
  readonly samples: number;
  readonly median_ms: number | null;
  readonly p95_ms: number | null;
}

export interface AnalyticsPlatformErrorRateResponse {
  readonly project_slug: string;
  readonly results: number;
  readonly platform_errors: number;
  readonly platform_error_rate: number;
}

export interface AnalyticsRetentionResponse {
  readonly window_days: number;
  readonly active_users: number;
  readonly returning_users: number;
}

export type FeedbackTrigger =
  'failed_submission' | 'stage_completed' | 'project_completed';

export interface CreateFeedbackDto {
  readonly enrollment_id?: string;
  readonly project_slug?: string;
  readonly stage_slug?: string;
  readonly submission_id?: string;
  readonly trigger: FeedbackTrigger;
  readonly rating: number;
  readonly comment?: string;
}

export interface FeedbackResponse {
  readonly id: string;
  readonly user_id: string;
  readonly enrollment_id: string | null;
  readonly project_slug: string | null;
  readonly stage_slug: string | null;
  readonly submission_id: string | null;
  readonly trigger: FeedbackTrigger;
  readonly rating: number;
  readonly comment: string | null;
  readonly created_at: string;
}

export interface FeedbackListResponse {
  readonly feedback: readonly FeedbackResponse[];
}

export interface AuditEventResponse {
  readonly id: string;
  readonly event_type: string;
  readonly actor_user_id: string | null;
  readonly target_user_id: string | null;
  readonly success: boolean;
  readonly reason: string | null;
  readonly created_at: string;
}

export interface AuditEventListResponse {
  readonly events: readonly AuditEventResponse[];
}

export type AdminAdjustAction = 'set_stage' | 'reopen' | 'complete';

export interface AdminAdjustEnrollmentDto {
  readonly action: AdminAdjustAction;
  readonly stage_slug?: string;
}

export interface ForgotPasswordResponse {
  readonly reset_token: string | null;
}

export interface AccountExportProgressEvent {
  readonly enrollment_id: string;
  readonly event_type: string;
  readonly stage_slug: string | null;
  readonly created_at: string;
}

export interface AccountExportResponse {
  readonly user: AuthUserProfile;
  readonly enrollments: readonly ProjectEnrollment[];
  readonly progress_events: readonly AccountExportProgressEvent[];
  readonly submissions: readonly ProjectSubmission[];
  readonly results: readonly ResultSummaryResponse[];
  readonly feedback: readonly FeedbackResponse[];
}

export interface AnalyticsStreakResponse {
  readonly current_streak_days: number;
  readonly longest_streak_days: number;
  readonly active_days: number;
}

export interface HeatmapDayResponse {
  readonly date: string;
  readonly count: number;
  readonly submissions: number;
  readonly passed: number;
  readonly completions: number;
}

export interface ActivityHeatmapResponse {
  readonly user_id: string;
  readonly days_from: string;
  readonly days_to: string;
  readonly days: readonly HeatmapDayResponse[];
  readonly total: number;
  readonly active_days: number;
}

export type NotificationType = 'result_ready';

export interface NotificationResponse {
  readonly id: string;
  readonly user_id: string;
  readonly type: NotificationType;
  readonly submission_id: string | null;
  readonly project_slug: string | null;
  readonly stage_slug: string | null;
  readonly status: string | null;
  readonly read_at: string | null;
  readonly created_at: string;
}

export interface NotificationListResponse {
  readonly notifications: readonly NotificationResponse[];
  readonly unread_count: number;
}

export interface BenchmarkBucketResponse {
  readonly min: number;
  readonly max: number;
  readonly count: number;
}

export interface BenchmarkDistributionResponse {
  readonly min: number | null;
  readonly max: number | null;
  readonly my_bucket_index: number | null;
  readonly buckets: readonly BenchmarkBucketResponse[];
}

export interface BenchmarkRankResponse {
  readonly submission_id: string;
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly runtime_ms: number;
  readonly memory_mb: number | null;
  readonly rank: number;
  readonly total: number;
  readonly beats_pct: number;
  readonly p50_ms: number | null;
  readonly p95_ms: number | null;
  readonly best_ms: number | null;
  readonly memory_rank: number | null;
  readonly memory_total: number | null;
  readonly memory_beats_pct: number | null;
  readonly memory_p50_mb: number | null;
  readonly runtime_distribution: BenchmarkDistributionResponse;
  readonly memory_distribution: BenchmarkDistributionResponse | null;
}

export interface StageBenchmarkStatsResponse {
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly samples: number;
  readonly best_ms: number | null;
  readonly p50_ms: number | null;
  readonly p95_ms: number | null;
}

export interface LeaderboardEntryResponse {
  readonly rank: number;
  readonly user_id: string;
  readonly display_name: string;
  readonly submission_id: string;
  readonly runtime_ms: number;
  readonly memory_mb: number | null;
  readonly created_at: string;
  readonly is_me: boolean;
}

export interface StageLeaderboardResponse {
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly total_users: number;
  readonly entries: readonly LeaderboardEntryResponse[];
  readonly my_rank: number | null;
  readonly my_runtime_ms: number | null;
}

export const REVIEW_VERDICTS = [
  'approved',
  'changes_requested',
  'commented',
] as const;
export type ReviewVerdict = (typeof REVIEW_VERDICTS)[number];

export interface SubmissionReviewResponse {
  readonly id: string;
  readonly submission_id: string;
  readonly reviewer_id: string;
  readonly reviewer_role: Extract<UserRole, 'instructor' | 'admin'>;
  readonly verdict: ReviewVerdict;
  readonly comment: string;
  readonly created_at: string;
}

export interface ReviewListResponse {
  readonly reviews: readonly SubmissionReviewResponse[];
}

export interface CreateReviewDto {
  readonly verdict: ReviewVerdict;
  readonly comment: string;
}

export type AchievementCode =
  | 'first_submission'
  | 'first_pass'
  | 'first_try_pass'
  | 'projects_completed_1'
  | 'projects_completed_3'
  | 'streak_7';

// A badge in the catalogue, annotated with whether the current user holds it.
export interface AchievementResponse {
  readonly code: AchievementCode;
  readonly title: string;
  readonly description: string;
  readonly earned: boolean;
  // ISO timestamp when the badge was awarded, or null if not yet earned.
  readonly earned_at: string | null;
}

export interface AchievementsListResponse {
  readonly achievements: readonly AchievementResponse[];
  readonly earned_count: number;
  readonly total_count: number;
}

export const DISCUSSION_CATEGORIES = [
  'announcements',
  'general',
  'study',
  'showcase',
] as const;
export type DiscussionCategory = (typeof DISCUSSION_CATEGORIES)[number];

export const DISCUSSION_SORTS = ['recent', 'votes', 'answers'] as const;
export type DiscussionSort = (typeof DISCUSSION_SORTS)[number];

export interface DiscussionAuthorResponse {
  readonly user_id: string;
  readonly display_name: string;
}

export interface DiscussionResponse {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly excerpt: string;
  readonly tags: readonly string[];
  readonly author: DiscussionAuthorResponse;
  readonly project_slug: string | null;
  readonly project_title: string | null;
  readonly votes: number;
  readonly my_vote: 'up' | 'down' | null;
  readonly answers_count: number;
  readonly views_count: number;
  readonly is_resolved: boolean;
  readonly is_bookmarked: boolean;
  readonly category: DiscussionCategory;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface DiscussionListResponse {
  readonly discussions: readonly DiscussionResponse[];
  readonly total: number;
}

export interface DiscussionDetailResponse {
  readonly discussion: DiscussionResponse;
}

export interface CreateDiscussionDto {
  readonly title: string;
  readonly content: string;
  readonly project_slug?: string;
  readonly category?: DiscussionCategory;
  readonly tags?: readonly string[];
}

export type DiscussionVoteDirection = 'up' | 'down' | 'none';

export interface DiscussionVoteDto {
  readonly direction: DiscussionVoteDirection;
}

export interface DiscussionVoteResponse {
  readonly discussion_id: string;
  readonly votes: number;
  readonly my_vote: 'up' | 'down' | null;
}

export interface DiscussionBookmarkResponse {
  readonly discussion_id: string;
  readonly is_bookmarked: boolean;
}

export interface DiscussionTagInfo {
  readonly name: string;
  readonly count: number;
}

export interface DiscussionContributor {
  readonly user_id: string;
  readonly display_name: string;
  readonly posts: number;
}

export interface DiscussionMetaResponse {
  readonly tags: readonly DiscussionTagInfo[];
  readonly contributors: readonly DiscussionContributor[];
}

export interface AdminLearnerResponse {
  readonly id: string;
  readonly email: string;
  readonly display_name: string;
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly created_at: string;
  readonly enrollments_count: number;
  readonly completed_enrollments_count: number;
  readonly active_project_slug: string | null;
}

export interface AdminLearnerListResponse {
  readonly learners: readonly AdminLearnerResponse[];
  readonly total: number;
}

export interface AdminUpdateUserStatusDto {
  readonly status: UserStatus;
}

export interface AdminUserStatusResponse {
  readonly user: AuthUserProfile;
}

export interface AdminProjectResponse {
  readonly slug: string;
  readonly title: string;
  readonly status: 'draft' | 'published';
  readonly stages_count: number;
  readonly active_students: number;
  readonly success_rate: number;
}

export interface AdminProjectListResponse {
  readonly projects: readonly AdminProjectResponse[];
}

export interface AdminUpdateProjectStatusDto {
  readonly status: 'draft' | 'published';
}

export interface AdminSubmissionEntry {
  readonly id: string;
  readonly user_id: string;
  readonly user_email: string;
  readonly user_display_name: string;
  readonly project_slug: string;
  readonly stage_slug: string;
  readonly status: ProjectSubmission['status'];
  readonly commit_sha: string | null;
  readonly duration_ms: number | null;
  readonly created_at: string;
}

export interface AdminSubmissionListResponse {
  readonly submissions: readonly AdminSubmissionEntry[];
}

export interface AdminOverviewResponse {
  readonly learners: {
    readonly total: number;
    readonly active: number;
    readonly suspended: number;
  };
  readonly submissions: {
    readonly total: number;
    readonly today: number;
    readonly passed: number;
    readonly pass_rate: number;
  };
  readonly sandboxes: {
    readonly active: number;
    readonly prewarm: number;
  };
  readonly queue: {
    readonly queued: number;
    readonly running: number;
  };
}

export interface AdminSandboxInstance {
  readonly id: string;
  readonly status: 'queued' | 'grading' | 'idle';
  readonly project_slug: string | null;
  readonly stage_slug: string | null;
  readonly user_id: string | null;
  readonly started_at: string;
  readonly duration_ms: number | null;
}

export interface AdminSandboxResponse {
  readonly prewarm_count: number;
  readonly instances: readonly AdminSandboxInstance[];
}

export interface AdminSystemSettings {
  readonly sandbox_timeout_sec: number;
  readonly max_containers: number;
  readonly prewarm_count: number;
  readonly email_alerts: boolean;
  readonly maintenance_mode: boolean;
  readonly updated_at: string | null;
}

export interface AdminSettingsResponse {
  readonly settings: AdminSystemSettings;
}

export interface UpdateAdminSettingsDto {
  readonly sandbox_timeout_sec?: number;
  readonly max_containers?: number;
  readonly prewarm_count?: number;
  readonly email_alerts?: boolean;
  readonly maintenance_mode?: boolean;
}

export interface RepoTreeEntryResponse {
  readonly path: string;
  readonly type: 'blob' | 'tree';
  readonly size?: number;
  readonly sha: string;
}

export interface RepoTreeResponse {
  readonly repo_full_name: string;
  readonly branch: string;
  readonly entries: readonly RepoTreeEntryResponse[];
}

export interface RepoFileResponse {
  readonly path: string;
  readonly content: string;
  readonly sha: string;
  readonly size: number;
}

export interface RepoCommitFileDto {
  readonly path: string;
  readonly content: string;
  readonly sha?: string;
  readonly action?: 'create' | 'update' | 'delete';
}

export interface RepoCommitRequestDto {
  readonly files: readonly RepoCommitFileDto[];
  readonly message?: string;
}

export interface RepoCommitResponse {
  readonly commit_sha: string;
  readonly files_changed: number;
}

export const BILLING_CYCLES = ['monthly', 'yearly'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PAID_PLANS = ['pro', 'pro_max'] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export const PAYMENT_ORDER_STATUSES = [
  'pending',
  'paid',
  'cancelled',
  'expired',
  'failed',
] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export interface CreateCheckoutRequest {
  readonly plan: PaidPlan;
  readonly billing_cycle: BillingCycle;
}

export interface CheckoutResponse {
  readonly order_code: number;
  readonly checkout_url: string;
  readonly amount_vnd: number;
}

export interface PaymentOrderResponse {
  readonly order_code: number;
  readonly plan: PaidPlan;
  readonly billing_cycle: BillingCycle;
  readonly amount_vnd: number;
  readonly status: PaymentOrderStatus;
  readonly created_at: string;
  readonly paid_at: string | null;
}

export interface BillingWebhookResponse {
  readonly status: 'processed' | 'ignored';
  readonly reason: string;
}
