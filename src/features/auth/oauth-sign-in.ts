import * as WebBrowser from 'expo-web-browser';

import { ApiClientError } from '@/api/api-client';
import { appEnv } from '@/config/env';

import {
  buildOAuthStartUrl,
  OAUTH_REDIRECT_URL,
  parseOAuthCallbackUrl,
  type OAuthProvider,
} from './oauth-callback-url';

export type OAuthSignInOutcome =
  | { readonly kind: 'tokens'; readonly access_token: string; readonly refresh_token: string }
  | { readonly kind: 'cancelled' };

/**
 * Runs the provider login in an in-app auth browser (ASWebAuthenticationSession
 * on iOS, Custom Tabs on Android). The backend finishes the OAuth handshake
 * and redirects to `polaris://oauth/callback#tokens`, which closes the browser
 * and resolves here. Throws on backend-reported failure.
 */
export async function runOAuthSignIn(
  provider: OAuthProvider,
): Promise<OAuthSignInOutcome> {
  const result = await WebBrowser.openAuthSessionAsync(
    buildOAuthStartUrl(appEnv.apiBaseUrl, provider),
    OAUTH_REDIRECT_URL,
  );

  if (result.type !== 'success') {
    // User closed the browser (cancel/dismiss) — not an error.
    return { kind: 'cancelled' };
  }

  const parsed = parseOAuthCallbackUrl(result.url);
  if (parsed.kind === 'tokens') {
    return parsed;
  }
  if (parsed.reason === 'cancelled') {
    return { kind: 'cancelled' };
  }
  throw new ApiClientError({
    code: 'oauth_failed',
    kind: 'invalid-response',
    message: `${provider} sign-in failed.`,
    path: `/auth/oauth/${provider}`,
  });
}
