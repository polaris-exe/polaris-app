import { describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiClientError } from './api-client';
import { toUserMessage } from './api-error-message';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('ApiClient', () => {
  it('joins base URL and path, sends bearer token and JSON body', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { ok: true }));
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
      tokenProvider: () => 'access-1',
    });

    await client.post('/discussions?limit=20', { title: 'x' });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://api.example.com/discussions?limit=20');
    const headers = new Headers(init.headers);
    expect(headers.get('authorization')).toBe('Bearer access-1');
    expect(headers.get('content-type')).toBe('application/json');
    expect(init.body).toBe('{"title":"x"}');
  });

  it('refreshes once on 401 and replays the request (single-flight)', async () => {
    let token = 'expired';
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const auth = new Headers(init?.headers).get('authorization');
      return auth === 'Bearer fresh'
        ? jsonResponse(200, { ok: true })
        : jsonResponse(401, {});
    });
    const sessionRefresher = vi.fn(async () => {
      token = 'fresh';
      return token;
    });
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl,
      tokenProvider: () => token,
      sessionRefresher,
    });

    await Promise.all([client.get('/me'), client.get('/discussions')]);

    expect(sessionRefresher).toHaveBeenCalledTimes(1);
  });

  it('parses the backend error envelope', async () => {
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () =>
        jsonResponse(409, {
          error: {
            code: 'conflict',
            message: 'Email is already registered.',
            path: '/auth/register',
            request_id: 'req-1',
            status_code: 409,
          },
        }),
    });

    const error = await captureError(client.post('/auth/register', {}));
    expect(error).toBeInstanceOf(ApiClientError);
    expect(error.statusCode).toBe(409);
    expect(toUserMessage(error, { 409: 'Email đã được đăng ký.' })).toBe(
      'Email đã được đăng ký.',
    );
  });

  it('maps fetch failures to a network error', async () => {
    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      fetchImpl: async () => {
        throw new TypeError('Network request failed');
      },
    });

    const error = await captureError(client.get('/me'));
    expect(error.kind).toBe('network');
    expect(toUserMessage(error)).toMatch(/Không kết nối/u);
  });
});

async function captureError(promise: Promise<unknown>): Promise<ApiClientError> {
  try {
    await promise;
  } catch (error) {
    return error as ApiClientError;
  }
  throw new Error('Expected the request to fail');
}
