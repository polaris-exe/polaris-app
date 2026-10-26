import { appEnv } from '@/config/env';
import { tokenStorage } from '@/config/token-storage';

import { ApiClient } from './api-client';
import { refreshSessionTokens } from './session-refresh';

// The single app-wide client. Keeping one instance matters: its refresh is
// single-flight, and a second concurrent refresh with the same token would
// trip the backend's reuse detection and log the user out.
export const apiClient = new ApiClient({
  baseUrl: appEnv.apiBaseUrl,
  requestIdHeader: appEnv.requestIdHeader,
  tokenProvider: () => tokenStorage.getAccessToken(),
  // Access tokens live 15 minutes; the refresher rotates them on 401.
  sessionRefresher: refreshSessionTokens,
});
