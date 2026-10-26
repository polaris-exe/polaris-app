import { describe, expect, it } from 'vitest';

import { AppEnvError, parseApiBaseUrl } from './parse-api-base-url';

describe('parseApiBaseUrl', () => {
  it('defaults to localhost in development', () => {
    expect(parseApiBaseUrl(undefined, { production: false })).toBe(
      'http://localhost:3000',
    );
  });

  it('strips trailing slashes', () => {
    expect(
      parseApiBaseUrl('https://api.polaris.dev/v1//', { production: true }),
    ).toBe('https://api.polaris.dev/v1');
  });

  it('rejects non-http schemes and query strings', () => {
    expect(() => parseApiBaseUrl('ftp://x.dev', { production: false })).toThrow(
      AppEnvError,
    );
    expect(() =>
      parseApiBaseUrl('https://x.dev?a=1', { production: false }),
    ).toThrow(AppEnvError);
  });

  it('rejects localhost in release builds', () => {
    expect(() =>
      parseApiBaseUrl('http://127.0.0.1:3000', { production: true }),
    ).toThrow(AppEnvError);
  });
});
