import * as Updates from 'expo-updates';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { shouldCheckForUpdate } from './update-check-throttle';

const MIN_CHECK_INTERVAL_MS = 30 * 60_000;

/**
 * expo-updates already checks on cold start (checkAutomatically: ON_LOAD).
 * People rarely kill the app, so also check when it returns to the
 * foreground — at most every 30 minutes — and download in the background.
 * A downloaded update surfaces through `useUpdates().isUpdatePending`.
 *
 * No-op in dev / Expo Go, where the Updates API is unavailable.
 */
export function useForegroundUpdateCheck(): void {
  const lastCheckRef = useRef<number | null>(null);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      const now = Date.now();
      if (!shouldCheckForUpdate(lastCheckRef.current, now, MIN_CHECK_INTERVAL_MS)) {
        return;
      }
      lastCheckRef.current = now;
      void checkAndFetch();
    });

    return () => subscription.remove();
  }, []);
}

async function checkAndFetch(): Promise<void> {
  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
    }
  } catch {
    // Offline or server hiccup — the next foreground / launch retries.
  }
}
