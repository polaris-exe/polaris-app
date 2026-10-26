import { parseApiBaseUrl } from './parse-api-base-url';

// Expo inlines EXPO_PUBLIC_* at bundle time, so this must stay a direct
// `process.env.EXPO_PUBLIC_…` member access (no destructuring/dynamic keys).
export const appEnv = {
  apiBaseUrl: parseApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL, {
    production: !__DEV__,
  }),
  requestIdHeader: 'x-request-id',
} as const;
