import type { AuthSessionResponse } from '@/contracts';
import { appEnv } from '@/config/env';
import { tokenStorage } from '@/config/token-storage';
import { parseAuthSessionResponse } from '@/features/auth/parse-auth-session-response';

/**
 * Rotates the session via POST /auth/refresh. Uses raw fetch instead of
 * ApiClient so a 401 here can never recurse into the refresh path.
 *
 * Returns the fresh access token, or null when refresh is impossible —
 * null leaves the original 401 to surface to the caller.
 */
export async function refreshSessionTokens(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${appEnv.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    // Network blip — keep the tokens; the next request retries the refresh.
    return null;
  }

  if (!response.ok) {
    // 401 = refresh token dead (rotated/revoked/expired): drop the session
    // so the app goes logged-out instead of retrying a dead token.
    if (response.status === 401) {
      await tokenStorage.clear();
    }
    return null;
  }

  let payload: AuthSessionResponse;
  try {
    payload = parseAuthSessionResponse(await response.json(), '/auth/refresh');
  } catch {
    // Unexpected body: keep the old tokens and let the original 401 surface.
    return null;
  }
  await tokenStorage.persist(payload.session);
  return payload.session.access_token;
}
