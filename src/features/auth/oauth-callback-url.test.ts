import { describe, expect, it } from 'vitest';

import { buildOAuthStartUrl, parseOAuthCallbackUrl } from './oauth-callback-url';

describe('parseOAuthCallbackUrl', () => {
  it('extracts tokens from the fragment', () => {
    expect(
      parseOAuthCallbackUrl(
        'polaris://oauth/callback#access_token=acc%2B1&refresh_token=ref-2',
      ),
    ).toEqual({ kind: 'tokens', access_token: 'acc+1', refresh_token: 'ref-2' });
  });

  it('maps backend error codes', () => {
    expect(
      parseOAuthCallbackUrl('polaris://oauth/callback#error=oauth_cancelled'),
    ).toEqual({ kind: 'error', reason: 'cancelled' });
    expect(
      parseOAuthCallbackUrl('polaris://oauth/callback#error=oauth_failed'),
    ).toEqual({ kind: 'error', reason: 'failed' });
  });

  it('treats missing or partial tokens as failure', () => {
    expect(parseOAuthCallbackUrl('polaris://oauth/callback')).toEqual({
      kind: 'error',
      reason: 'failed',
    });
    expect(
      parseOAuthCallbackUrl('polaris://oauth/callback#access_token=only'),
    ).toEqual({ kind: 'error', reason: 'failed' });
  });
});

describe('buildOAuthStartUrl', () => {
  it('asks the backend for the mobile redirect', () => {
    expect(buildOAuthStartUrl('https://api.polarislab.asia', 'google')).toBe(
      'https://api.polarislab.asia/auth/oauth/google?client=mobile',
    );
  });
});
