import { describe, expect, it } from 'vitest';

import { ApiClientError } from '@/api/api-client';

import {
  isEmailNotVerifiedError,
  parseAuthSessionResponse,
  parseRegisterResponse,
} from './parse-auth-session-response';

describe('parseRegisterResponse', () => {
  it('detects the email-verification flow', () => {
    expect(
      parseRegisterResponse(
        { email: 'a@b.vn', verification_required: true },
        'fallback@b.vn',
      ),
    ).toEqual({ kind: 'verification_required', email: 'a@b.vn' });
  });

  it('passes a session response through', () => {
    const payload = {
      user: { id: 'u1' },
      session: { access_token: 'a'.repeat(20), refresh_token: 'r'.repeat(20) },
    };
    expect(parseRegisterResponse(payload, 'a@b.vn')).toEqual({
      kind: 'session',
      response: payload,
    });
  });
});

describe('isEmailNotVerifiedError', () => {
  it('matches verification-related HTTP errors only', () => {
    const http = (code: string, message: string) =>
      new ApiClientError({ code, kind: 'http', message, path: '/auth/login', statusCode: 403 });
    expect(isEmailNotVerifiedError(http('email_not_verified', 'x'))).toBe(true);
    expect(isEmailNotVerifiedError(http('forbidden', 'Email is not verified.'))).toBe(true);
    expect(isEmailNotVerifiedError(http('forbidden', 'Account disabled.'))).toBe(false);
  });
});

describe('parseAuthSessionResponse', () => {
  it('accepts a full session payload', () => {
    const payload = {
      user: { id: 'u1' },
      session: { access_token: 'a'.repeat(20), refresh_token: 'r'.repeat(20) },
    };
    expect(parseAuthSessionResponse(payload, '/auth/login')).toBe(payload);
  });

  it('reports the keys the server sent when session is missing', () => {
    let error: unknown;
    try {
      parseAuthSessionResponse({ user: { id: 'u1' }, message: 'verify' }, '/auth/register');
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(ApiClientError);
    expect((error as ApiClientError).kind).toBe('invalid-response');
    expect((error as ApiClientError).message).toContain('user, message');
  });
});
