export class AppEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppEnvError';
  }
}

const DEFAULT_API_BASE_URL = 'http://localhost:3000';

/**
 * Validates EXPO_PUBLIC_API_BASE_URL and strips trailing slashes. Kept free of
 * `new URL()` because React Native's URL implementation is incomplete.
 */
export function parseApiBaseUrl(
  value: string | undefined,
  options: { readonly production: boolean },
): string {
  const raw = value?.trim() || DEFAULT_API_BASE_URL;
  const match = /^(https?):\/\/([^/?#:]+)(:\d+)?(\/[^?#]*)?$/iu.exec(raw);
  if (!match) {
    throw new AppEnvError(
      'EXPO_PUBLIC_API_BASE_URL must be an http(s) URL without query or hash.',
    );
  }

  const host = match[2]!.toLowerCase();
  // A release build that forgot the env var would silently call the
  // device's own localhost — fail loudly instead.
  if (options.production && (host === 'localhost' || host === '127.0.0.1')) {
    throw new AppEnvError(
      'EXPO_PUBLIC_API_BASE_URL must point at the deployed API in release builds.',
    );
  }

  return raw.replace(/\/+$/u, '');
}
