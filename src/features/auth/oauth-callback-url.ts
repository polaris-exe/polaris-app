// Mirrors the backend's MOBILE_OAUTH_REDIRECT_URL default and `scheme` in
// app.json. If the backend env is changed, change this too.
export const OAUTH_REDIRECT_URL = 'polaris://oauth/callback';

export type OAuthProvider = 'google' | 'github';

export type OAuthCallbackResult =
  | {
      readonly kind: 'tokens';
      readonly access_token: string;
      readonly refresh_token: string;
    }
  | { readonly kind: 'error'; readonly reason: 'cancelled' | 'failed' };

/**
 * Parses `polaris://oauth/callback#access_token=…&refresh_token=…` or
 * `#error=oauth_cancelled|oauth_failed`. Hand-rolled (no URL /
 * URLSearchParams) because React Native's implementations are incomplete.
 */
export function parseOAuthCallbackUrl(url: string): OAuthCallbackResult {
  const hashIndex = url.indexOf('#');
  const params = new Map<string, string>();
  if (hashIndex !== -1) {
    for (const pair of url.slice(hashIndex + 1).split('&')) {
      const [rawKey, rawValue = ''] = pair.split('=');
      if (!rawKey) continue;
      try {
        params.set(decodeURIComponent(rawKey), decodeURIComponent(rawValue));
      } catch {
        // Malformed escape sequence — ignore that pair.
      }
    }
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    return {
      kind: 'tokens',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  return {
    kind: 'error',
    reason: params.get('error') === 'oauth_cancelled' ? 'cancelled' : 'failed',
  };
}

/** Backend entry point; `client=mobile` makes it redirect back to the app. */
export function buildOAuthStartUrl(
  apiBaseUrl: string,
  provider: OAuthProvider,
): string {
  return `${apiBaseUrl}/auth/oauth/${provider}?client=mobile`;
}
