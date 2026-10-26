import type { AuthSessionResponse } from '@/contracts';
import { ApiClientError } from '@/api/api-client';

/**
 * Result of POST /auth/register. Production has email verification enabled
 * (not yet in polaris-be/contracts on git): it answers
 * `{ email, verification_required: true }` instead of a session.
 */
export type RegisterResult =
  | { readonly kind: 'session'; readonly response: AuthSessionResponse }
  | { readonly kind: 'verification_required'; readonly email: string };

export function parseRegisterResponse(
  payload: unknown,
  fallbackEmail: string,
): RegisterResult {
  if (isRecord(payload) && payload.verification_required === true) {
    return {
      kind: 'verification_required',
      email: typeof payload.email === 'string' ? payload.email : fallbackEmail,
    };
  }
  return {
    kind: 'session',
    response: parseAuthSessionResponse(payload, '/auth/register'),
  };
}

/**
 * Guards the login/register/refresh payload before tokens are stored. A
 * response without `session.access_token` would otherwise crash deep in
 * token storage with an unreadable TypeError; this turns it into an
 * `invalid-response` error that names the keys the server actually sent.
 */
export function parseAuthSessionResponse(
  payload: unknown,
  path: string,
): AuthSessionResponse {
  const record = isRecord(payload) ? payload : null;
  const session = record && isRecord(record.session) ? record.session : null;

  if (
    record &&
    isRecord(record.user) &&
    session &&
    typeof session.access_token === 'string' &&
    typeof session.refresh_token === 'string'
  ) {
    return payload as AuthSessionResponse;
  }

  const keys = record ? Object.keys(record).join(', ') || '(empty)' : typeof payload;
  throw new ApiClientError({
    code: 'invalid_auth_response',
    kind: 'invalid-response',
    message: `Auth response is missing session tokens (received: ${keys}).`,
    path,
  });
}

/** True when the backend refused login because the email is unverified. */
export function isEmailNotVerifiedError(error: unknown): boolean {
  return (
    error instanceof ApiClientError &&
    error.kind === 'http' &&
    /verif/iu.test(`${error.code} ${error.message}`)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
