export type ApiErrorKind = 'http' | 'invalid-response' | 'network';
export type ApiPath = `/${string}`;

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly fetchImpl?: typeof fetch;
  readonly requestIdFactory?: () => string | undefined;
  readonly requestIdHeader?: string;
  readonly tokenProvider?: () => string | null | undefined;
  /**
   * Called once (single-flight) when an authorized request gets a 401.
   * Must return the fresh access token, or null when no valid refresh
   * token exists — the caller then sees the original 401.
   */
  readonly sessionRefresher?: () => Promise<string | null>;
}

export interface ApiRequestOptions {
  readonly body?: BodyInit | null;
  readonly headers?: HeadersInit;
  readonly method?: string;
  readonly requestId?: string;
  readonly signal?: AbortSignal;
  /** Internal: marks the single retry after a session refresh. */
  readonly isAuthRetry?: boolean;
}

export interface ApiClientErrorDetails {
  readonly cause?: unknown;
  readonly code: string;
  readonly kind: ApiErrorKind;
  readonly message: string;
  readonly path: string;
  readonly requestId?: string | null;
  readonly statusCode?: number | null;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly kind: ApiErrorKind;
  readonly path: string;
  readonly requestId: string | null;
  readonly statusCode: number | null;

  constructor(details: ApiClientErrorDetails) {
    super(details.message, { cause: details.cause });
    this.name = 'ApiClientError';
    this.code = details.code;
    this.kind = details.kind;
    this.path = details.path;
    this.requestId = details.requestId ?? null;
    this.statusCode = details.statusCode ?? null;
  }
}

interface ApiErrorEnvelope {
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly requestId: string;
  readonly statusCode: number;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly requestIdFactory: () => string | undefined;
  private readonly requestIdHeader: string;
  private readonly tokenProvider?: () => string | null | undefined;
  private readonly sessionRefresher?: () => Promise<string | null>;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchImpl = config.fetchImpl ?? getDefaultFetch();
    this.requestIdFactory = config.requestIdFactory ?? createRequestId;
    this.requestIdHeader = config.requestIdHeader ?? 'x-request-id';
    this.tokenProvider = config.tokenProvider;
    this.sessionRefresher = config.sessionRefresher;
  }

  async get(path: ApiPath, options: ApiRequestOptions = {}): Promise<unknown> {
    return this.requestJson(path, { ...options, method: 'GET' });
  }

  async post(
    path: ApiPath,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<unknown> {
    const isBodyInit =
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof URLSearchParams ||
      body instanceof FormData ||
      typeof body === 'string';

    const formattedBody = isBodyInit
      ? (body as BodyInit)
      : body !== undefined
        ? JSON.stringify(body)
        : undefined;

    const headers: HeadersInit = {
      ...options.headers,
    };

    if (body !== undefined && !isBodyInit) {
      (headers as Record<string, string>)['content-type'] = 'application/json';
    }

    return this.requestJson(path, {
      ...options,
      body: formattedBody,
      headers,
      method: 'POST',
    });
  }

  async requestJson(
    path: ApiPath,
    options: ApiRequestOptions = {},
  ): Promise<unknown> {
    const requestId = options.requestId ?? this.requestIdFactory();
    const url = buildUrl(this.baseUrl, path);
    const headers = new Headers(options.headers);

    headers.set('accept', 'application/json');

    if (requestId) {
      headers.set(this.requestIdHeader, requestId);
    }

    const token = this.tokenProvider?.();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    try {
      const response = await this.fetchImpl(url, {
        body: options.body,
        headers,
        method: options.method ?? 'GET',
        signal: options.signal,
      });

      // Expired access token: rotate via the refresh token once, then
      // replay the request. Single-flight so concurrent 401s share one
      // rotation — a second refresh with the old token would trip the
      // backend's reuse detection and burn the whole session family.
      if (
        response.status === 401 &&
        token &&
        this.sessionRefresher &&
        !options.isAuthRetry &&
        path !== '/auth/refresh'
      ) {
        const nextToken = await this.runSessionRefresh();
        if (nextToken) {
          return this.requestJson(path, { ...options, isAuthRetry: true });
        }
      }

      if (!response.ok) {
        throw await this.toHttpError(response, path);
      }

      return parseJsonResponse(response, path);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new ApiClientError({
        cause: error,
        code: 'network_error',
        kind: 'network',
        message: 'API unavailable. Check that the Polaris API is reachable.',
        path,
        requestId: requestId ?? null,
      });
    }
  }

  private runSessionRefresh(): Promise<string | null> {
    if (!this.refreshPromise) {
      const refresher = this.sessionRefresher;
      if (!refresher) {
        return Promise.resolve(null);
      }
      this.refreshPromise = Promise.resolve()
        .then(() => refresher())
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }

  private async toHttpError(
    response: Response,
    fallbackPath: ApiPath,
  ): Promise<ApiClientError> {
    const payload = await readJsonPayload(response);
    const envelope = parseApiErrorEnvelope(payload);
    const responseRequestId = response.headers.get(this.requestIdHeader);

    return new ApiClientError({
      code: envelope?.code ?? `http_${response.status}`,
      kind: 'http',
      message:
        envelope?.message ||
        response.statusText ||
        `Request failed with status ${response.status}.`,
      path: envelope?.path ?? fallbackPath,
      requestId: envelope?.requestId ?? responseRequestId,
      statusCode: envelope?.statusCode ?? response.status,
    });
  }
}

async function parseJsonResponse(
  response: Response,
  path: ApiPath,
): Promise<unknown> {
  const text = await response.text();

  if (text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new ApiClientError({
      cause: error,
      code: 'invalid_json',
      kind: 'invalid-response',
      message: 'The API returned invalid JSON.',
      path,
      statusCode: response.status,
    });
  }
}

async function readJsonPayload(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function parseApiErrorEnvelope(payload: unknown): ApiErrorEnvelope | null {
  if (!isObjectRecord(payload) || !isObjectRecord(payload.error)) {
    return null;
  }

  const { code, message, path, request_id: requestId } = payload.error;
  const statusCode = payload.error.status_code;

  if (
    typeof code !== 'string' ||
    typeof message !== 'string' ||
    typeof path !== 'string' ||
    typeof requestId !== 'string' ||
    typeof statusCode !== 'number'
  ) {
    return null;
  }

  return { code, message, path, requestId, statusCode };
}

// Plain concatenation instead of `new URL()`: React Native's URL support is
// partial, and baseUrl is already normalized (no trailing slash).
function buildUrl(baseUrl: string, path: ApiPath): string {
  return `${baseUrl}${path}`;
}

// Hermes may expose `crypto` without `randomUUID`, so guard both.
function createRequestId(): string | undefined {
  return globalThis.crypto?.randomUUID?.();
}

function getDefaultFetch(): typeof fetch {
  if (typeof globalThis.fetch !== 'function') {
    throw new ApiClientError({
      code: 'fetch_unavailable',
      kind: 'network',
      message: 'Môi trường này không hỗ trợ fetch.',
      path: '/',
    });
  }

  return globalThis.fetch.bind(globalThis);
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
