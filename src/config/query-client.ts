import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

import { ApiClientError } from '@/api/api-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Client errors (4xx) won't fix themselves on retry.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiClientError &&
          error.statusCode !== null &&
          error.statusCode < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// React Native has no window focus event: refetch stale queries when the
// app returns to the foreground instead.
AppState.addEventListener('change', (status) => {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
});
